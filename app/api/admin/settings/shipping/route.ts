import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { ShippingSettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { shippingFee, freeShippingAbove } = body as ShippingSettings;

    if (typeof shippingFee !== 'number' || typeof freeShippingAbove !== 'number') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    await adminDb.collection('settings').doc('shipping').set({
      shippingFee,
      freeShippingAbove,
      updatedAt: new Date(),
    }, { merge: true });

    console.log('Shipping settings updated:', { shippingFee, freeShippingAbove });

    return NextResponse.json({
      success: true,
      message: 'Shipping settings updated successfully',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update shipping settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update shipping settings' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const doc = await adminDb.collection('settings').doc('shipping').get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Shipping settings not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get shipping settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get shipping settings' }, { status: 500 });
  }
}
