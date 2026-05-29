import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { DeliverySettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled, charge } = body as DeliverySettings;

    if (typeof enabled !== 'boolean' || typeof charge !== 'number') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    await adminDb.collection('settings').doc('delivery').set({
      enabled,
      charge,
      updatedAt: new Date(),
    }, { merge: true });

    console.log('Delivery settings updated:', { enabled, charge });

    return NextResponse.json({
      success: true,
      message: 'Delivery settings updated successfully',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update delivery settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update delivery settings' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const doc = await adminDb.collection('settings').doc('delivery').get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Delivery settings not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get delivery settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get delivery settings' }, { status: 500 });
  }
}
