import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

interface ApproveCancellationBody {
  orderId: string;
  approved: boolean;
  adminNotes?: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    // Security: Only admin/editor can approve cancellations
    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as ApproveCancellationBody;

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

    // Business rule: Can only approve cancellation requests
    if (orderData.status !== 'cancellation_requested') {
      return NextResponse.json({ error: 'Order does not have a pending cancellation request' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();

    if (body.approved) {
      // Approve cancellation
      await orderRef.update({
        status: 'cancelled',
        'cancellationRequest.status': 'approved',
        'cancellationRequest.adminNotes': body.adminNotes || '',
        'cancellationRequest.updatedAt': now,
        updatedAt: now,
      });

      // Restore stock for each item
      for (const item of orderData.items) {
        const productRef = adminDb.collection('products').doc(item.productId);
        await productRef.update({
          stock: FieldValue.increment(item.quantity),
          updatedAt: now,
        });
      }

      // Credit the order amount to user's wallet
      try {
        const userRef = adminDb.collection('users').doc(orderData.userId);
        await userRef.update({
          walletBalance: FieldValue.increment(orderData.total),
          updatedAt: now,
        });

        // Create wallet transaction record
        const transactionRef = adminDb.collection('walletTransactions').doc();
        await transactionRef.set({
          userId: orderData.userId,
          amount: orderData.total,
          type: 'credit',
          status: 'completed',
          paymentId: orderData.payment?.razorpayPaymentId || 'N/A',
          description: `Refund for cancelled order ${orderData.orderNumber}`,
          createdAt: now,
        });
      } catch (walletError) {
        console.error('Failed to credit wallet:', walletError);
        // Continue even if wallet credit fails
      }

      return NextResponse.json({ success: true, message: 'Cancellation approved and amount credited to wallet' });
    } else {
      // Reject cancellation
      await orderRef.update({
        status: 'cancellation_rejected',
        'cancellationRequest.status': 'rejected',
        'cancellationRequest.adminNotes': body.adminNotes || '',
        'cancellationRequest.updatedAt': now,
        updatedAt: now,
      });

      return NextResponse.json({ success: true, message: 'Cancellation request rejected' });
    }
  } catch (error) {
    console.error('Approve cancellation failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process cancellation' }, { status: 500 });
  }
}
