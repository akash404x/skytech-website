import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface ApproveReturnBody {
  orderId: string;
  approved: boolean;
  adminNotes?: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    // Security: Only admin/editor can approve returns
    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as ApproveReturnBody;

    if (!body.orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
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

    // Business rule: Can only approve return requests
    if (!orderData.returnRequest || orderData.returnRequest.status !== 'requested') {
      return NextResponse.json({ error: 'Order does not have a pending return request' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    if (body.approved) {
      // Approve return - credit wallet with order amount
      await adminDb.runTransaction(async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        const order = orderDoc.data();

        if (!order) throw new Error('Order not found');

        // Update return request status
        transaction.update(orderRef, {
          'returnRequest.status': 'approved',
          'returnRequest.adminNotes': body.adminNotes || '',
          'returnRequest.updatedAt': now,
          updatedAt: now,
        });

        // Credit user wallet
        const userRef = adminDb.collection('users').doc(order.userId);
        const walletTransactionRef = adminDb.collection('walletTransactions').doc();

        transaction.set(
          userRef,
          {
            walletBalance: FieldValue.increment(order.total),
            updatedAt: now,
          },
          { merge: true },
        );

        transaction.set(walletTransactionRef, {
          userId: order.userId,
          amount: order.total,
          type: 'credit',
          orderId: order.id,
          description: `Refund for returned order ${order.orderNumber}`,
          createdAt: now,
        });
      });

      return NextResponse.json({ success: true, message: 'Return approved and wallet credited' });
    } else {
      // Reject return
      await orderRef.update({
        'returnRequest.status': 'rejected',
        'returnRequest.adminNotes': body.adminNotes || '',
        'returnRequest.updatedAt': now,
        updatedAt: now,
      });

      return NextResponse.json({ success: true, message: 'Return request rejected' });
    }
  } catch (error) {
    console.error('Approve return failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process return' }, { status: 500 });
  }
}
