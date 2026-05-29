import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createRazorpayOrder } from '@/lib/razorpay';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number' || amount < 10) {
      return NextResponse.json({ error: 'Invalid amount. Minimum amount is ₹10' }, { status: 400 });
    }

    if (amount > 100000) {
      return NextResponse.json({ error: 'Maximum amount is ₹1,00,000' }, { status: 400 });
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: `wlt_${Date.now()}`,
      notes: {
        userId: profile.uid,
        type: 'wallet_add_money',
      },
    });

    // Create pending wallet transaction
    const transactionRef = adminDb.collection('walletTransactions').doc();
    await transactionRef.set({
      userId: profile.uid,
      amount,
      type: 'credit',
      status: 'pending',
      paymentId: razorpayOrder.id,
      description: 'Adding money to wallet',
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      keyId: razorpayOrder.keyId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Create wallet add money order failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create payment order' }, { status: 500 });
  }
}
