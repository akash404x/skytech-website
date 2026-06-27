import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const orderId = searchParams.get('orderId');

    if (!orderNumber && !orderId) {
      return NextResponse.json(
        { error: 'Either orderNumber or orderId is required' },
        { status: 400 }
      );
    }

    let orderDoc;

    // Fetch by orderNumber (preferred) or orderId
    if (orderNumber) {
      const snapshot = await adminDb
        .collection('orders')
        .where('orderNumber', '==', orderNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      orderDoc = snapshot.docs[0];
    } else if (orderId) {
      orderDoc = await adminDb.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    if (!orderDoc) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = orderDoc.data() as any;
    const order: Order = {
      id: orderDoc.id,
      ...orderData,
    };

    // Return order data for client-side PDF generation
    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error fetching receipt data:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch receipt data',
      },
      { status: 500 }
    );
  }
}
