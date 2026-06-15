import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminStorage } from './firebase-admin';
import { getProductPrice } from './cart';
import { mapProduct } from './firestore-mappers';
import { generateInvoiceNumber } from './invoice-utils';
import { sendEmail, getOrderStatusEmailTemplate } from './email-service';
import { markCouponAsUsed, validateCoupon } from './coupon-service';
import type { CartItem, OrderItem, ShippingAddress, UserProfile } from './types';

export interface ValidatedCheckout {
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
}

export function validateShippingAddress(address: ShippingAddress) {
  const requiredFields: Array<keyof ShippingAddress> = [
    'fullName',
    'phone',
    'line1',
    'city',
    'state',
    'postalCode',
    'country',
  ];

  for (const field of requiredFields) {
    if (!address[field]?.trim()) {
      throw new Response(`Missing shipping field: ${field}`, { status: 400 });
    }
  }
}

export async function validateCheckoutItems(items: Pick<CartItem, 'productId' | 'quantity'>[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Response('Cart is empty', { status: 400 });
  }

  const checkedItems: OrderItem[] = [];

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Response('Invalid cart item', { status: 400 });
    }

    const productDoc = await adminDb.collection('products').doc(item.productId).get();
    if (!productDoc.exists) {
      throw new Response('One or more products are no longer available', { status: 400 });
    }

    const product = mapProduct(productDoc.id, productDoc.data() ?? {});
    if (product.status !== 'active' || product.stock < item.quantity) {
      throw new Response(`${product.name} is not available in the requested quantity`, {
        status: 400,
      });
    }

    const unitPrice = getProductPrice(product);
    checkedItems.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.images[0] ?? '',
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = checkedItems.reduce((total, item) => total + item.lineTotal, 0);

  return {
    items: checkedItems,
    subtotal,
    total: subtotal,
    currency: 'INR',
  } satisfies ValidatedCheckout;
}

export async function createVerifiedOrder(input: {
  user: UserProfile;
  checkout: ValidatedCheckout;
  shippingAddress: ShippingAddress;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  gstAmount?: number;
  gstPercentage?: number;
  shippingFee?: number;
  deliveryCharge?: number;
  walletUsed?: number;
  couponCode?: string;
  discountAmount?: number;
}) {
  // Validate required values to prevent undefined Firestore errors
  if (!input.user?.uid) {
    throw new Response('User ID is required', { status: 400 });
  }
  if (!input.checkout?.subtotal || input.checkout.subtotal < 0) {
    throw new Response('Invalid subtotal', { status: 400 });
  }
  if (!input.checkout?.total || input.checkout.total < 0) {
    throw new Response('Invalid total', { status: 400 });
  }
  if (!input.razorpayOrderId) {
    throw new Response('Razorpay order ID is required', { status: 400 });
  }
  if (!input.razorpayPaymentId) {
    throw new Response('Razorpay payment ID is required', { status: 400 });
  }

  // Validate coupon code if provided
  if (input.couponCode) {
    try {
      const couponValidation = await validateCoupon(input.couponCode, input.checkout.total, input.user.uid);
      if (!couponValidation.valid) {
        throw new Response('Invalid or expired coupon code', { status: 400 });
      }
    } catch (error) {
      throw new Response('Coupon validation failed', { status: 400 });
    }
  }
  const orderRef = adminDb.collection('orders').doc();
  const paymentRef = adminDb.collection('payments').doc(input.razorpayPaymentId);
  const userRef = adminDb.collection('users').doc(input.user.uid);
  const cartRef = adminDb.collection('carts').doc(input.user.uid);
  const now = FieldValue.serverTimestamp();
  const timelineDate = new Date();
  const orderNumber = `SKY-${Date.now().toString(36).toUpperCase()}-${orderRef.id.slice(0, 4).toUpperCase()}`;

  await adminDb.runTransaction(async (transaction) => {
    for (const item of input.checkout.items) {
      const productRef = adminDb.collection('products').doc(item.productId);
      const productDoc = await transaction.get(productRef);
      const product = mapProduct(productDoc.id, productDoc.data() ?? {});

      if (!productDoc.exists || product.status !== 'active' || product.stock < item.quantity) {
        throw new Error(`${item.name} is no longer available`);
      }

      transaction.update(productRef, {
        stock: FieldValue.increment(-item.quantity),
        updatedAt: now,
      });
    }

    transaction.set(orderRef, {
      orderNumber,
      userId: input.user.uid,
      userEmail: input.user.email,
      customerName: input.shippingAddress.fullName || input.user.displayName,
      customerPhone: input.shippingAddress.phone,
      items: input.checkout.items,
      subtotal: input.checkout.subtotal,
      gstAmount: input.gstAmount ?? 0,
      gstPercentage: input.gstPercentage ?? 0,
      shippingFee: input.shippingFee ?? 0,
      deliveryCharge: input.deliveryCharge ?? 0,
      walletUsed: input.walletUsed ?? 0,
      discount: input.discountAmount ?? 0,
      couponCode: input.couponCode ?? null,
      total: input.checkout.total,
      currency: input.checkout.currency,
      status: 'pending',
      shippingAddress: input.shippingAddress,
      payment: {
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        amount: input.checkout.total,
        currency: input.checkout.currency,
        status: 'captured',
      },
      timeline: [
        {
          status: 'pending',
          label: 'Order Placed',
          description: 'Payment was verified and the order was created.',
          createdAt: timelineDate,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(paymentRef, {
      userId: input.user.uid,
      userEmail: input.user.email,
      orderId: orderRef.id,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: input.checkout.total,
      currency: input.checkout.currency,
      status: 'captured',
      createdAt: now,
    });

    transaction.set(
      userRef,
      {
        orderCount: FieldValue.increment(1),
        totalSpent: FieldValue.increment(input.checkout.total),
        updatedAt: now,
      },
      { merge: true },
    );

    transaction.set(
      cartRef,
      {
        items: [],
        updatedAt: now,
      },
      { merge: true },
    );
  });

  // Mark coupon as used if applicable
  if (input.couponCode) {
    try {
      // Get coupon by code
      const couponSnapshot = await adminDb
        .collection('coupons')
        .where('code', '==', input.couponCode.toUpperCase())
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const couponId = couponSnapshot.docs[0].id;
        await markCouponAsUsed(couponId, input.user.uid, input.user.email, orderRef.id);
        console.log('Coupon marked as used:', { couponCode: input.couponCode, couponId, orderId: orderRef.id });
      }
    } catch (error) {
      console.error('Error marking coupon as used:', error);
      // Don't fail the order if coupon marking fails
    }
  }

  // Generate invoice after transaction completes with retry logic
  const maxRetries = 3;
  let invoiceGenerated = false;

  // Print active bucket name for debugging
  try {
    const bucket = adminStorage.bucket();
    console.log('Firebase Storage bucket name:', bucket.name);
    console.log('Storage bucket config:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Using default format');
  } catch (error) {
    console.error('Failed to get Firebase Storage bucket:', error);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const invoiceNumber = generateInvoiceNumber();
      const order = {
        id: orderRef.id,
        orderNumber,
        userId: input.user.uid,
        userEmail: input.user.email,
        customerName: input.shippingAddress.fullName || input.user.displayName,
        customerPhone: input.shippingAddress.phone,
        items: input.checkout.items,
        subtotal: input.checkout.subtotal,
        gstAmount: input.gstAmount,
        gstPercentage: input.gstPercentage,
        shippingFee: input.shippingFee,
        deliveryCharge: input.deliveryCharge,
        walletUsed: input.walletUsed,
        total: input.checkout.total,
        currency: input.checkout.currency,
        status: 'pending' as const,
        shippingAddress: input.shippingAddress,
        payment: {
          razorpayOrderId: input.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          amount: input.checkout.total,
          currency: input.checkout.currency,
          status: 'captured' as const,
        },
        timeline: [
          {
            status: 'pending' as const,
            label: 'Order Placed',
            description: 'Payment was verified and the order was created.',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TODO: Implement server-side PDF generation
      // console.log('Generating invoice PDF for order:', { orderId: orderRef.id, invoiceNumber, attempt });
      // const pdfBytes = await generateInvoicePDF(order);
      // console.log('Invoice PDF generated successfully, size:', pdfBytes.length, 'bytes');

      // // Upload to Firebase Storage
      // const bucket = adminStorage.bucket();
      // const fileName = `invoices/${orderRef.id}/${invoiceNumber}.pdf`;
      // const file = bucket.file(fileName);

      // console.log('Uploading invoice to Firebase Storage:', { bucket: bucket.name, fileName });
      // await file.save(Buffer.from(pdfBytes), {
      //   contentType: 'application/pdf',
      // });
      // console.log('Invoice uploaded successfully to Firebase Storage');

      // // Get download URL
      // const [url] = await file.getSignedUrl({
      //   action: 'read',
      //   expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      // });
      // console.log('Invoice download URL generated:', url.substring(0, 50) + '...');

      // Update order with invoice details
      await adminDb.collection('orders').doc(orderRef.id).update({
        invoiceNumber,
        // invoiceUrl: url,
        invoiceGeneratedAt: new Date(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('Invoice details saved to Firestore:', { orderId: orderRef.id, invoiceNumber, attempt });
      invoiceGenerated = true;

      // Send confirmation email with invoice
      try {
        console.log('=== SENDING ORDER CONFIRMATION EMAIL ===');
        console.log('Order ID:', orderRef.id);
        console.log('Order Number:', order.orderNumber);
        console.log('Customer Email:', order.userEmail);
        console.log('Customer Name:', order.customerName);
        
        const emailHtml = getOrderStatusEmailTemplate(order, 'pending');
        const emailResult = await sendEmail({
          to: order.userEmail,
          subject: 'Order Pending Once Confirmed You Will Be Notified and The Order Staus You will Be Able To See In The Website - Sky Tech',
          html: emailHtml,
        });
        
        if (emailResult.success) {
          console.log('✅ Confirmation email sent successfully:', { orderId: orderRef.id, userEmail: order.userEmail });
        } else {
          console.error('❌ Failed to send confirmation email:', emailResult.error);
        }
        console.log('========================================');
      } catch (emailError) {
        console.error('❌ Failed to send confirmation email:', emailError);
        // Don't fail the order if email fails
      }

      break;
    } catch (error) {
      console.error(`Invoice generation attempt ${attempt} failed:`, error);
      console.error('Error details:', {
        orderId: orderRef.id,
        attempt,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      if (attempt === maxRetries) {
        console.error('Failed to generate invoice after maximum retries:', { orderId: orderRef.id, maxRetries });
        // Don't fail the order creation if invoice generation fails
      } else {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying invoice generation in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    id: orderRef.id,
    orderNumber,
  };
}
