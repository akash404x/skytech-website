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

    // Update wallet balance and transaction status in a transaction with duplicate protection
    await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection('users').doc(profile.uid);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      // Check if this payment has already been processed (duplicate protection)
      const existingTransactionQuery = adminDb
        .collection('walletTransactions')
        .where('userId', '==', profile.uid)
        .where('paymentId', '==', razorpayPaymentId)
        .where('status', '==', 'completed')
        .limit(1);

      const existingTransactionSnap = await transaction.get(existingTransactionQuery);

      // Find and update the pending transaction by razorpayOrderId (stored as paymentId during creation)
      const pendingTransactionQuery = adminDb
        .collection('walletTransactions')
        .where('userId', '==', profile.uid)
        .where('paymentId', '==', razorpayOrderId)
        .where('status', '==', 'pending')
        .limit(1);

      const pendingTransactionSnap = await transaction.get(pendingTransactionQuery);

      // All reads complete - now do all writes
      if (!existingTransactionSnap.empty) {
        // Payment already processed, skip but don't fail
        console.log('Payment already processed, skipping duplicate:', razorpayPaymentId);
        return;
      }

      // Update user wallet balance
      transaction.update(userRef, {
        walletBalance: currentBalance + amount,
        updatedAt: FieldValue.serverTimestamp(),
      });

      if (!pendingTransactionSnap.empty) {
        const transactionDoc = pendingTransactionSnap.docs[0];
        transaction.update(transactionDoc.ref, {
          status: 'completed',
          paymentId: razorpayPaymentId,
          description: 'Wallet Recharge',
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // If pending transaction not found, create a new completed transaction
        const walletTransactionRef = adminDb.collection('walletTransactions').doc();
        transaction.set(walletTransactionRef, {
          userId: profile.uid,
          amount,
          type: 'credit',
          status: 'completed',
          paymentId: razorpayPaymentId,
          description: 'Wallet Recharge',
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Money added to wallet successfully' });
  } catch (error) {
    console.error('Verify wallet add money payment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment verification failed' }, { status: 500 });
  }
}
