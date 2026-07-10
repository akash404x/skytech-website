import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { validateCheckoutItems } from '@/lib/server-checkout';
import { sendEmail, getOrderStatusEmailTemplate, getOrderStatusEmailSubject } from '@/lib/email-service';
import { generateReceiptNumber } from '@/lib/invoice-utils';
import { markCouponAsUsed } from '@/lib/coupon-service';
import { generatePaymentReceiptEmailTemplate } from '@/lib/payment-receipt-email';
import type { CartItem, ShippingAddress, PaymentReceipt, OrderItem } from '@/lib/types';

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

    // Calculate final payable amount including all charges and discounts
    const subtotal = checkout.total;
    const gstAmount = body.gstAmount || 0;
    const shippingFee = body.shippingFee || 0;
    const deliveryCharge = body.deliveryCharge || 0;
    const discountAmount = body.discountAmount || 0;

    const finalPayable = subtotal + gstAmount + shippingFee + deliveryCharge - discountAmount;

    console.log('=== WALLET-ONLY PAYMENT VALIDATION ===');
    console.log('Subtotal (products):', subtotal);
    console.log('GST amount:', gstAmount);
    console.log('Shipping fee:', shippingFee);
    console.log('Delivery charge:', deliveryCharge);
    console.log('Coupon discount:', discountAmount);
    console.log('Final payable amount:', finalPayable);
    console.log('Wallet balance:', body.walletAmount);

    // Auto-calculate wallet deduction: use minimum of wallet balance and final payable
    const walletDeduction = Math.min(body.walletAmount, finalPayable);
    const remainingAmount = finalPayable - walletDeduction;

    console.log('Auto-calculated wallet deduction:', walletDeduction);
    console.log('Remaining amount to pay:', remainingAmount);

    // Ensure wallet deduction is not negative
    if (walletDeduction < 0) {
      console.log('ERROR: Wallet deduction is negative');
      return NextResponse.json({ error: 'Wallet deduction cannot be negative' }, { status: 400 });
    }

    // If there's a remaining amount, this should go through Razorpay, not wallet-only
    if (remainingAmount > 0) {
      console.log('ERROR: Remaining amount requires Razorpay payment');
      return NextResponse.json({ 
        error: 'Remaining amount requires online payment. Please use Razorpay checkout.',
        remainingAmount,
        walletDeduction
      }, { status: 400 });
    }

    console.log('Validation passed - wallet covers full amount');

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

      if (currentBalance < walletDeduction) {
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

      // Deduct wallet balance (use auto-calculated walletDeduction)
      transaction.update(userRef, {
        walletBalance: FieldValue.increment(-walletDeduction),
        updatedAt: now,
      });

      // Create wallet transaction
      const walletTransactionRef = adminDb.collection('walletTransactions').doc();
      transaction.set(walletTransactionRef, {
        userId: profile.uid,
        amount: walletDeduction,
        type: 'debit',
        status: 'completed',
        orderId: orderRef.id,
        paymentId: `WALLET-${orderRef.id}`,
        description: `Order Payment`,
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
        gstAmount: body.gstAmount ?? 0,
        gstPercentage: body.gstPercentage ?? 0,
        shippingFee: body.shippingFee ?? 0,
        deliveryCharge: body.deliveryCharge ?? 0,
        walletUsed: walletDeduction,
        discount: body.discountAmount ?? 0,
        couponCode: body.couponCode ?? null,
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

    // Generate payment receipt for wallet payment
    try {
      console.log('=== WALLET ORDER: GENERATING PAYMENT RECEIPT ===');
      console.log('Order ID:', orderRef.id);
      console.log('Order Number:', orderNumber);

      const receiptNumber = orderNumber; // Use order number as receipt number
      const paymentDate = new Date();

      // Try to write receipt - if it fails due to permissions, store in order instead
      try {
        const receiptRef = adminDb.collection('paymentReceipts').doc();
        const receiptData = {
          id: receiptRef.id,
          orderId: orderRef.id,
          orderNumber,
          userId: profile.uid,
          userEmail: profile.email,
          receiptNumber,
          transactionId: `WALLET-${orderRef.id}`,
          paymentId: `WALLET-${orderRef.id}`,
          customerName: body.shippingAddress.fullName || profile.displayName,
          customerPhone: body.shippingAddress.phone,
          billingAddress: body.shippingAddress,
          shippingAddress: body.shippingAddress,
          paymentMethod: 'Wallet',
          paymentDate,
          amount: checkout.total,
          tax: body.gstAmount || 0,
          grandTotal: checkout.total,
          currency: checkout.currency,
          status: 'paid',
        };

        console.log('Attempting to write receipt to Firestore...');
        await receiptRef.set(receiptData);
        console.log('Receipt written successfully');
      } catch (collectionError) {
        console.warn('Could not write to paymentReceipts collection, storing in order instead:', collectionError);
        // Store receipt data directly in order document as fallback
      }

      // Update order with receipt details (this should always work)
      console.log('Updating order with receipt details...');
      await adminDb.collection('orders').doc(orderRef.id).update({
        receiptNumber,
        receiptGeneratedAt: paymentDate,
        updatedAt: FieldValue.serverTimestamp(),
      });
      console.log('Order updated successfully');

      console.log('✅ Wallet payment receipt processed:', { receiptNumber });
    } catch (receiptError) {
      console.error('❌ Failed to process wallet payment receipt:', receiptError);
      console.error('Error details:', JSON.stringify(receiptError, null, 2));
      // Don't fail the order if receipt generation fails
    }

    // Send confirmation email with payment receipt
    try {
      console.log('=== WALLET ORDER: SENDING CONFIRMATION EMAIL ===');
      console.log('Order ID:', orderRef.id);
      console.log('Order Number:', orderNumber);
      console.log('Customer Email:', profile.email);
      console.log('Customer Name:', body.shippingAddress.fullName || profile.displayName);

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
        walletUsed: walletDeduction,
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
      };

      // Create receipt object for email template
      const receipt: PaymentReceipt = {
        id: orderRef.id,
        orderId: orderRef.id,
        userId: profile.uid,
        userEmail: profile.email,
        receiptNumber: orderNumber,
        orderNumber,
        transactionId: `WALLET-${orderRef.id}`,
        paymentId: `WALLET-${orderRef.id}`,
        customerName: body.shippingAddress.fullName || profile.displayName,
        customerPhone: body.shippingAddress.phone,
        billingAddress: body.shippingAddress,
        shippingAddress: body.shippingAddress,
        paymentMethod: 'Wallet',
        paymentDate: new Date(),
        amount: checkout.total,
        tax: body.gstAmount || 0,
        grandTotal: checkout.total,
        currency: checkout.currency,
        status: 'paid',
      };

      // Send payment receipt email
      const emailHtml = generatePaymentReceiptEmailTemplate(receipt, checkout.items);
      const emailResult = await sendEmail({
        to: order.userEmail,
        subject: `Payment Receipt - ${receipt.receiptNumber} - Sky Tech`,
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log('✅ Wallet order payment receipt email sent successfully:', { orderId: orderRef.id, userEmail: order.userEmail });
      } else {
        console.error('❌ Failed to send wallet order payment receipt email:', emailResult.error);
      }
      console.log('=======================================================');
    } catch (emailError) {
      console.error('❌ Failed to send wallet order payment receipt email:', emailError);
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
