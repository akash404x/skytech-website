import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getReturnApprovedEmailTemplate } from '@/lib/email-service';
import type { Order } from '@/lib/types';

export const runtime = 'nodejs';

interface ApproveReturnBody {
  orderId: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json() as ApproveReturnBody;
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);
    const userRef = adminDb.collection('users').doc(profile.uid);

    await adminDb.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data();
      if (!orderData) {
        throw new Error('Order data not found');
      }

      if (!orderData.returnRequest || orderData.returnRequest.status !== 'requested') {
        throw new Error('No pending return request found');
      }

      const now = FieldValue.serverTimestamp();

      // Credit wallet
      transaction.update(userRef, {
        walletBalance: FieldValue.increment(orderData.total),
        updatedAt: now,
      });

      // Create wallet transaction
      const walletTransactionRef = adminDb.collection('walletTransactions').doc();
      transaction.set(walletTransactionRef, {
        userId: orderData.userId,
        amount: orderData.total,
        type: 'credit',
        status: 'completed',
        orderId: orderData.id,
        description: `Refund for return - Order ${orderData.orderNumber}`,
        createdAt: now,
      });

      // Update return request status
      transaction.update(orderRef, {
        'returnRequest.status': 'approved',
        'returnRequest.updatedAt': now,
        updatedAt: now,
      });
    });

    // Fetch updated order for email
    const orderDoc = await orderRef.get();
    const order = { id: orderDoc.id, ...orderDoc.data() } as Order;

    // Send email notification
    const emailHtml = getReturnApprovedEmailTemplate(order, order.total);
    await sendEmail({
      to: order.userEmail,
      subject: 'Return Approved - SkyTech',
      html: emailHtml,
    });

    // Log notification
    const notificationLogRef = adminDb.collection('notifications').doc();
    await notificationLogRef.set({
      id: notificationLogRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      type: 'return_approved',
      status: 'sent',
      data: { amount: order.total },
      sentAt: new Date(),
      createdAt: new Date(),
    });

    console.log('Return approved and wallet credited:', { orderId, amount: order.total });

    return NextResponse.json({
      success: true,
      message: 'Return approved and wallet credited',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Approve return failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to approve return' }, { status: 500 });
  }
}
