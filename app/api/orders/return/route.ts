import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface ReturnOrderBody {
  orderId: string;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as ReturnOrderBody;

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

    // Security: User can only return their own orders
    if (orderData.userId !== profile.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Business rule: Can only return delivered orders
    if (orderData.status !== 'delivered') {
      return NextResponse.json({ error: 'Can only return delivered orders' }, { status: 400 });
    }

    // Business rule: Cannot return if already has return request
    if (orderData.returnRequest) {
      return NextResponse.json({ error: 'Order already has a return request' }, { status: 400 });
    }

    // Business rule: Only orders < ₹500 can be returned (others get replacement)
    if (orderData.total >= 500) {
      return NextResponse.json({ error: 'Orders ₹500 and above are eligible for replacement, not return' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    // Create return request
    const returnRequest = {
      orderId: body.orderId,
      orderNumber: orderData.orderNumber,
      userId: profile.uid,
      userEmail: profile.email,
      reason: body.reason,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
    };

    // Update order with return request
    await orderRef.update({
      returnRequest,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, message: 'Return request submitted' });
  } catch (error) {
    console.error('Return order failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit return request' }, { status: 500 });
  }
}
