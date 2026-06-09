import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { validateCheckoutItems } from '@/lib/server-checkout';
import type { CartItem } from '@/lib/types';

export const runtime = 'nodejs';

interface CreatePaymentOrderBody {
  items: Pick<CartItem, 'productId' | 'quantity'>[];
  amount: number;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as CreatePaymentOrderBody;

    console.log('Create-order request received:', {
      userId: profile.uid,
      userEmail: profile.email,
      itemsCount: body.items?.length ?? 0,
      amount: body.amount,
    });

    const checkout = await validateCheckoutItems(body.items);
    const receipt = `skytech_${Date.now()}_${profile.uid.slice(0, 8)}`;
    
    // Use the actual payable amount after coupon and wallet deductions
    const payableAmount = body.amount || checkout.total;
    
    const razorpayOrder = await createRazorpayOrder({
      amount: payableAmount,
      currency: checkout.currency,
      receipt,
      notes: {
        userId: profile.uid,
        userEmail: profile.email,
      },
    });

    console.log('Razorpay order created successfully:', {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });

    return NextResponse.json({
      success: true,
      keyId: razorpayOrder.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subtotal: checkout.subtotal,
      total: checkout.total,
      items: checkout.items,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Create Razorpay order failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create payment order' }, { status: 500 });
  }
}
