import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface CancelOrderBody {
  orderId: string;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as CancelOrderBody;

    if (!body.orderId || !body.reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the order
    const orderRef = adminDb.collection('orders').doc(body.orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderSnap.data();

    if (!orderData) {
      return NextResponse.json({ error: 'Order data not found' }, { status: 404 });
    }

    // Security: User can only cancel their own orders
    if (orderData.userId !== profile.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Business rule: Can only cancel before shipment
    if (orderData.status === 'shipped' || orderData.status === 'delivered') {
      return NextResponse.json({ error: 'Cannot cancel shipped or delivered orders' }, { status: 400 });
    }

    // Business rule: Cannot cancel if already cancelled or has pending cancellation
    if (orderData.status === 'cancelled' || orderData.status === 'cancellation_requested') {
      return NextResponse.json({ error: 'Order already has a cancellation request or is cancelled' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    // Create cancellation request
    const cancellationRequest = {
      orderId: body.orderId,
      orderNumber: orderData.orderNumber,
      userId: profile.uid,
      userEmail: profile.email,
      reason: body.reason,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
    };

    // Update order with cancellation request
    await orderRef.update({
      status: 'cancellation_requested',
      cancellationRequest,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, message: 'Cancellation request submitted' });
  } catch (error) {
    console.error('Cancel order failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to cancel order' }, { status: 500 });
  }
}
