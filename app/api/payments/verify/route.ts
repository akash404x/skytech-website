import { NextResponse } from 'next/server';
import { fetchRazorpayOrder, verifyRazorpaySignature } from '@/lib/razorpay';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createVerifiedOrder, validateCheckoutItems, validateShippingAddress } from '@/lib/server-checkout';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import type { CartItem, ShippingAddress } from '@/lib/types';

export const runtime = 'nodejs';

interface VerifyPaymentBody {
  items: Pick<CartItem, 'productId' | 'quantity'>[];
  shippingAddress: ShippingAddress;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  walletAmount?: number;
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
    const body = (await request.json()) as VerifyPaymentBody;

    console.log('Verify-payment request received:', {
      userId: profile.uid,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      walletAmount: body.walletAmount,
    });

    if (!body.razorpayOrderId || !body.razorpayPaymentId || !body.razorpaySignature) {
      return NextResponse.json({ error: 'Missing Razorpay verification data' }, { status: 400 });
    }

    validateShippingAddress(body.shippingAddress);

    const validSignature = verifyRazorpaySignature({
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
    });

    if (!validSignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const checkout = await validateCheckoutItems(body.items);
    const razorpayOrder = await fetchRazorpayOrder(body.razorpayOrderId);

    // Calculate expected amount: total - wallet deduction - coupon discount
    const expectedAmount = Math.round((checkout.total - (body.walletAmount || 0) - (body.discountAmount || 0)) * 100);

    if (
      razorpayOrder.id !== body.razorpayOrderId ||
      razorpayOrder.amount !== expectedAmount ||
      razorpayOrder.currency !== checkout.currency
    ) {
      return NextResponse.json({ error: 'Payment amount does not match expected amount' }, { status: 400 });
    }

    // If wallet was used, deduct from wallet balance
    if (body.walletAmount && body.walletAmount > 0) {
      const now = FieldValue.serverTimestamp();
      const userRef = adminDb.collection('users').doc(profile.uid);

      await adminDb.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        const userData = userDoc.data();
        const currentBalance = userData?.walletBalance || 0;

        if (currentBalance < body.walletAmount!) {
          throw new Error('Insufficient wallet balance');
        }

        transaction.update(userRef, {
          walletBalance: FieldValue.increment(-body.walletAmount!),
          updatedAt: now,
        });

        // Create wallet transaction
        const walletTransactionRef = adminDb.collection('walletTransactions').doc();
        transaction.set(walletTransactionRef, {
          userId: profile.uid,
          amount: body.walletAmount,
          type: 'debit',
          description: `Partial payment for order`,
          createdAt: now,
        });
      });
    }

    const order = await createVerifiedOrder({
      user: profile,
      checkout,
      shippingAddress: body.shippingAddress,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      gstAmount: body.gstAmount,
      gstPercentage: body.gstPercentage,
      shippingFee: body.shippingFee,
      deliveryCharge: body.deliveryCharge,
      walletUsed: body.walletAmount,
      couponCode: body.couponCode,
      discountAmount: body.discountAmount,
    });

    console.log('Payment verified and order created:', { orderId: order.id, orderNumber: order.orderNumber });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Verify Razorpay payment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to verify payment' }, { status: 500 });
  }
}
