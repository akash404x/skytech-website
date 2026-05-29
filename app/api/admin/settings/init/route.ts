import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import type { GSTSettings, ShippingSettings, DeliverySettings } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Initialize GST Settings
    const gstRef = adminDb.doc('settings/gst');
    const gstDoc = await gstRef.get();
    
    if (!gstDoc.exists) {
      const defaultGST: GSTSettings = {
        enabled: true,
        percentage: 18,
      };
      await gstRef.set(defaultGST);
      console.log('GST settings initialized:', defaultGST);
    }

    // Initialize Shipping Settings
    const shippingRef = adminDb.doc('settings/shipping');
    const shippingDoc = await shippingRef.get();
    
    if (!shippingDoc.exists) {
      const defaultShipping: ShippingSettings = {
        shippingFee: 80,
        freeShippingAbove: 999,
      };
      await shippingRef.set(defaultShipping);
      console.log('Shipping settings initialized:', defaultShipping);
    }

    // Initialize Delivery Settings
    const deliveryRef = adminDb.doc('settings/delivery');
    const deliveryDoc = await deliveryRef.get();
    
    if (!deliveryDoc.exists) {
      const defaultDelivery: DeliverySettings = {
        enabled: true,
        charge: 20,
      };
      await deliveryRef.set(defaultDelivery);
      console.log('Delivery settings initialized:', defaultDelivery);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings initialized successfully',
      gst: (await gstRef.get()).data(),
      shipping: (await shippingRef.get()).data(),
      delivery: (await deliveryRef.get()).data(),
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Initialize settings failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to initialize settings' }, { status: 500 });
  }
}
