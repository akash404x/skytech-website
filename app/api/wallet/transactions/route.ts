import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { mapWalletTransaction } from '@/lib/firestore-mappers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    // Get user wallet transactions
    const transactionsQuery = adminDb
      .collection('walletTransactions')
      .where('userId', '==', profile.uid)
      .orderBy('createdAt', 'desc');

    const transactionsSnap = await transactionsQuery.get();

    const transactions = transactionsSnap.docs.map((doc) => mapWalletTransaction(doc.id, doc.data()));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get wallet transactions failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to fetch wallet transactions' }, { status: 500 });
  }
}
