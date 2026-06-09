import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { validateCheckoutItems } from '@/lib/server-checkout';
import { sendEmail, getOrderStatusEmailTemplate } from '@/lib/email-service';
import { generateInvoiceNumber } from '@/lib/invoice-utils';
import { markCouponAsUsed } from '@/lib/coupon-service';
import type { CartItem, ShippingAddress } from '@/lib/types';

export const runtime = 'nodejs';

interface WalletOnlyBody {
  items: Pick<CartItem, 'productId' | 'quantity'>[];
  shippingAddress: ShippingAddress;
  walletAmount: number;
  couponCode?: string;
  discountAmount?: number;
  gstAmount?: number;
  gstPercentage?: number;
  shippingFee?: number;
  deliveryCharge?: number;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as WalletOnlyBody;

    if (!body.items || !body.shippingAddress || body.walletAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkout = await validateCheckoutItems(body.items);

    // Calculate amount after coupon discount
    const amountAfterCoupon = checkout.total - (body.discountAmount || 0);

    console.log('=== WALLET-ONLY PAYMENT VALIDATION ===');
    console.log('Checkout total:', checkout.total);
    console.log('Discount amount:', body.discountAmount);
    console.log('Amount after coupon:', amountAfterCoupon);
    console.log('Wallet deduction requested:', body.walletAmount);

    // The wallet deduction should not exceed the amount after coupon
    if (body.walletAmount > amountAfterCoupon) {
      console.log('ERROR: Wallet deduction exceeds amount after coupon');
      return NextResponse.json({ error: 'Wallet deduction cannot exceed payable amount after coupon' }, { status: 400 });
    }

    // Ensure wallet deduction is not negative
    if (body.walletAmount < 0) {
      console.log('ERROR: Wallet deduction is negative');
      return NextResponse.json({ error: 'Wallet deduction cannot be negative' }, { status: 400 });
    }

    console.log('Validation passed');

    const now = FieldValue.serverTimestamp();
    const timelineDate = new Date();
    const orderRef = adminDb.collection('orders').doc();
    const userRef = adminDb.collection('users').doc(profile.uid);
    const cartRef = adminDb.collection('carts').doc(profile.uid);
    const orderNumber = `SKY-${Date.now().toString(36).toUpperCase()}-${orderRef.id.slice(0, 4).toUpperCase()}`;

    await adminDb.runTransaction(async (transaction) => {
      // Check user wallet balance
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      if (currentBalance < body.walletAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Update product stock
      for (const item of checkout.items) {
        const productRef = adminDb.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);
        const product = productDoc.data();

        if (!productDoc.exists || product?.stock < item.quantity) {
          throw new Error(`${item.name} is no longer available`);
        }

        transaction.update(productRef, {
          stock: FieldValue.increment(-item.quantity),
          updatedAt: now,
        });
      }

      // Deduct wallet balance
      transaction.update(userRef, {
        walletBalance: FieldValue.increment(-body.walletAmount),
        updatedAt: now,
      });

      // Create wallet transaction
      const walletTransactionRef = adminDb.collection('walletTransactions').doc();
      transaction.set(walletTransactionRef, {
        userId: profile.uid,
        amount: body.walletAmount,
        type: 'debit',
        orderId: orderRef.id,
        description: `Payment for order ${orderNumber}`,
        createdAt: now,
      });

      // Create order
      transaction.set(orderRef, {
        orderNumber,
        userId: profile.uid,
        userEmail: profile.email,
        customerName: body.shippingAddress.fullName || profile.displayName,
        customerPhone: body.shippingAddress.phone,
        items: checkout.items,
        subtotal: checkout.subtotal,
        gstAmount: body.gstAmount,
        gstPercentage: body.gstPercentage,
        shippingFee: body.shippingFee,
        deliveryCharge: body.deliveryCharge,
        walletUsed: body.walletAmount,
        discount: body.discountAmount,
        couponCode: body.couponCode,
        total: checkout.total,
        currency: checkout.currency,
        status: 'pending',
        shippingAddress: body.shippingAddress,
        payment: {
          razorpayOrderId: '',
          razorpayPaymentId: `WALLET-${orderRef.id}`,
          amount: checkout.total,
          currency: checkout.currency,
          status: 'captured',
        },
        timeline: [
          {
            status: 'pending',
            label: 'Order Placed',
            description: 'Payment was made using wallet balance.',
            createdAt: timelineDate,
          },
        ],
        createdAt: now,
        updatedAt: now,
      });

      // Clear cart
      transaction.set(
        cartRef,
        {
          items: [],
          updatedAt: now,
        },
        { merge: true },
      );

      // Update user stats
      transaction.set(
        userRef,
        {
          orderCount: FieldValue.increment(1),
          totalSpent: FieldValue.increment(checkout.total),
          updatedAt: now,
        },
        { merge: true },
      );
    });

    // Mark coupon as used if applicable
    if (body.couponCode) {
      try {
        // Get coupon by code
        const couponSnapshot = await adminDb
          .collection('coupons')
          .where('code', '==', body.couponCode.toUpperCase())
          .limit(1)
          .get();

        if (!couponSnapshot.empty) {
          const couponId = couponSnapshot.docs[0].id;
          await markCouponAsUsed(couponId, profile.uid, profile.email, orderRef.id);
          console.log('Coupon marked as used:', { couponCode: body.couponCode, couponId, orderId: orderRef.id });
        }
      } catch (error) {
        console.error('Error marking coupon as used:', error);
        // Don't fail the order if coupon marking fails
      }
    }

    // Generate invoice number and send confirmation email
    try {
      console.log('=== WALLET ORDER: GENERATING INVOICE AND SENDING EMAIL ===');
      console.log('Order ID:', orderRef.id);
      console.log('Order Number:', orderNumber);
      console.log('Customer Email:', profile.email);
      console.log('Customer Name:', body.shippingAddress.fullName || profile.displayName);

      const invoiceNumber = generateInvoiceNumber();
      await adminDb.collection('orders').doc(orderRef.id).update({
        invoiceNumber,
        invoiceGeneratedAt: new Date(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Create order object for email template
      const order = {
        id: orderRef.id,
        orderNumber,
        userId: profile.uid,
        userEmail: profile.email,
        customerName: body.shippingAddress.fullName || profile.displayName,
        customerPhone: body.shippingAddress.phone,
        items: checkout.items,
        subtotal: checkout.subtotal,
        gstAmount: body.gstAmount,
        gstPercentage: body.gstPercentage,
        shippingFee: body.shippingFee,
        deliveryCharge: body.deliveryCharge,
        walletUsed: body.walletAmount,
        total: checkout.total,
        currency: checkout.currency,
        status: 'pending' as const,
        shippingAddress: body.shippingAddress,
        payment: {
          razorpayOrderId: '',
          razorpayPaymentId: `WALLET-${orderRef.id}`,
          amount: checkout.total,
          currency: checkout.currency,
          status: 'captured' as const,
        },
        timeline: [
          {
            status: 'pending' as const,
            label: 'Order Placed',
            description: 'Payment was made using wallet balance.',
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceNumber,
      };

      // Send confirmation email
      const emailHtml = getOrderStatusEmailTemplate(order, 'pending');
      const emailResult = await sendEmail({
        to: order.userEmail,
        subject: 'Order Pending Once Confirmed You Will Be Notified and The Order Staus You will Be Able To See In The Website - Sky Tech',
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log('✅ Wallet order confirmation email sent successfully:', { orderId: orderRef.id, userEmail: order.userEmail });
      } else {
        console.error('❌ Failed to send wallet order confirmation email:', emailResult.error);
      }
      console.log('=======================================================');
    } catch (emailError) {
      console.error('❌ Failed to send wallet order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: orderRef.id,
        orderNumber,
      },
    });
  } catch (error) {
    console.error('Wallet-only payment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process wallet payment' }, { status: 500 });
  }
}
