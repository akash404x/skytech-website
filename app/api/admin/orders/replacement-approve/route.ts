import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface ApproveReplacementBody {
  orderId: string;
  approved: boolean;
  adminNotes?: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    // Security: Only admin/editor can approve replacements
    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as ApproveReplacementBody;

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

    // Business rule: Can only approve replacement requests
    if (!orderData.replacementRequest || orderData.replacementRequest.status !== 'requested') {
      return NextResponse.json({ error: 'Order does not have a pending replacement request' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    if (body.approved) {
      // Approve replacement - credit wallet with order amount
      await adminDb.runTransaction(async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        const order = orderDoc.data();

        if (!order) throw new Error('Order not found');

        // Update replacement request status
        transaction.update(orderRef, {
          'replacementRequest.status': 'approved',
          'replacementRequest.adminNotes': body.adminNotes || '',
          'replacementRequest.updatedAt': now,
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
          status: 'completed',
          orderId: order.id,
          description: 'Replacement Refund',
          createdAt: now,
        });
      });

      return NextResponse.json({ success: true, message: 'Replacement approved and wallet credited' });
    } else {
      // Reject replacement
      await orderRef.update({
        'replacementRequest.status': 'rejected',
        'replacementRequest.adminNotes': body.adminNotes || '',
        'replacementRequest.updatedAt': now,
        updatedAt: now,
      });

      return NextResponse.json({ success: true, message: 'Replacement request rejected' });
    }
  } catch (error) {
    console.error('Approve replacement failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process replacement' }, { status: 500 });
  }
}
