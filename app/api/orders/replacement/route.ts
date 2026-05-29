import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface ReplacementOrderBody {
  orderId: string;
  reason: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as ReplacementOrderBody;

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

    // Security: User can only replace their own orders
    if (orderData.userId !== profile.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Business rule: Can only replace delivered orders
    if (orderData.status !== 'delivered') {
      return NextResponse.json({ error: 'Can only replace delivered orders' }, { status: 400 });
    }

    // Business rule: Cannot replace if already has replacement request
    if (orderData.replacementRequest) {
      return NextResponse.json({ error: 'Order already has a replacement request' }, { status: 400 });
    }

    // Business rule: Only orders >= ₹500 can be replaced (others get return)
    if (orderData.total < 500) {
      return NextResponse.json({ error: 'Orders below ₹500 are eligible for return, not replacement' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    // Create replacement request
    const replacementRequest = {
      orderId: body.orderId,
      orderNumber: orderData.orderNumber,
      userId: profile.uid,
      userEmail: profile.email,
      reason: body.reason,
      status: 'requested',
      createdAt: now,
      updatedAt: now,
    };

    // Update order with replacement request
    await orderRef.update({
      replacementRequest,
      updatedAt: now,
    });

    return NextResponse.json({ success: true, message: 'Replacement request submitted' });
  } catch (error) {
    console.error('Replacement order failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to submit replacement request' }, { status: 500 });
  }
}
