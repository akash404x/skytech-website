import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !amount) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 });
    }

    // Verify Razorpay signature
    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update wallet balance and transaction status in a transaction
    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(profile.uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      // Update user wallet balance
      transaction.update(userRef, {
        walletBalance: currentBalance + amount,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Find and update the pending transaction
      const transactionsQuery = adminDb
        .collection('walletTransactions')
        .where('userId', '==', profile.uid)
        .where('paymentId', '==', razorpayOrderId)
        .where('status', '==', 'pending')
        .limit(1);

      const transactionsSnap = await transaction.get(transactionsQuery);

      if (!transactionsSnap.empty) {
        const transactionDoc = transactionsSnap.docs[0];
        transaction.update(transactionDoc.ref, {
          status: 'completed',
          paymentId: razorpayPaymentId,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Money added to wallet successfully' });
  } catch (error) {
    console.error('Verify wallet add money payment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment verification failed' }, { status: 500 });
  }
}
