import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { GSTSettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { enabled, percentage } = body as GSTSettings;

    if (typeof enabled !== 'boolean' || typeof percentage !== 'number') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }

    await adminDb.collection('settings').doc('gst').set({
      enabled,
      percentage,
      updatedAt: new Date(),
    }, { merge: true });

    console.log('GST settings updated:', { enabled, percentage });

    return NextResponse.json({
      success: true,
      message: 'GST settings updated successfully',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update GST settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update GST settings' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const doc = await adminDb.collection('settings').doc('gst').get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'GST settings not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: doc.data(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get GST settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get GST settings' }, { status: 500 });
  }
}
