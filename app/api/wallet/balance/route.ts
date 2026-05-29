import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    // Get user wallet balance
    const userRef = adminDb.collection('users').doc(profile.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();

    if (!userData) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 });
    }

    const walletBalance = userData.walletBalance || 0;

    return NextResponse.json({ walletBalance });
  } catch (error) {
    console.error('Get wallet balance failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to fetch wallet balance' }, { status: 500 });
  }
}
