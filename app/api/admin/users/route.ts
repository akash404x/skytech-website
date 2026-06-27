import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getAuthenticatedUser } from '@/lib/server-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const snapshot = await adminDb.collection('users')
      .orderBy('createdAt', 'desc')
      .limit(1000)
      .get();

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
