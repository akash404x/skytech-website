import { NextResponse } from 'next/server';
import { fetchRazorpayOrder, verifyRazorpaySignature } from '@/lib/razorpay';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createVerifiedOrder, validateCheckoutItems, validateShippingAddress } from '@/lib/server-checkout';
import type { CartItem, ShippingAddress } from '@/lib/types';

export const runtime = 'nodejs';

interface VerifyPaymentBody {
  items: Pick<CartItem, 'productId' | 'quantity'>[];
  shippingAddress: ShippingAddress;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as VerifyPaymentBody;

    console.log('Verify-payment request received:', {
      userId: profile.uid,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
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

    if (
      razorpayOrder.id !== body.razorpayOrderId ||
      razorpayOrder.amount !== Math.round(checkout.total * 100) ||
      razorpayOrder.currency !== checkout.currency
    ) {
      return NextResponse.json({ error: 'Payment amount does not match cart total' }, { status: 400 });
    }

    const order = await createVerifiedOrder({
      user: profile,
      checkout,
      shippingAddress: body.shippingAddress,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
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
