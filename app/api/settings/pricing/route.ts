import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { GSTSettings, ShippingSettings, DeliverySettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Fetch all pricing settings
    const [gstDoc, shippingDoc, deliveryDoc] = await Promise.all([
      adminDb.collection('settings').doc('gst').get(),
      adminDb.collection('settings').doc('shipping').get(),
      adminDb.collection('settings').doc('delivery').get(),
    ]);

    const gstSettings = gstDoc.exists ? (gstDoc.data() as GSTSettings) : { enabled: true, percentage: 18 };
    const shippingSettings = shippingDoc.exists ? (shippingDoc.data() as ShippingSettings) : { shippingFee: 80, freeShippingAbove: 999 };
    const deliverySettings = deliveryDoc.exists ? (deliveryDoc.data() as DeliverySettings) : { enabled: true, charge: 20 };

    return NextResponse.json({
      success: true,
      data: {
        gst: gstSettings,
        shipping: shippingSettings,
        delivery: deliverySettings,
      },
    });
  } catch (error) {
    console.error('Get pricing settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get pricing settings' }, { status: 500 });
  }
}
