import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getReplacementApprovedEmailTemplate } from '@/lib/email-service';

export const runtime = 'nodejs';

interface ApproveReplacementBody {
  orderId: string;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json() as ApproveReplacementBody;
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const orderRef = adminDb.collection('orders').doc(orderId);

    await adminDb.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data();
      if (!orderData) {
        throw new Error('Order data not found');
      }

      if (!orderData.replacementRequest || orderData.replacementRequest.status !== 'requested') {
        throw new Error('No pending replacement request found');
      }

      const now = FieldValue.serverTimestamp();

      // Update replacement request status
      transaction.update(orderRef, {
        'replacementRequest.status': 'approved',
        'replacementRequest.updatedAt': now,
        updatedAt: now,
      });
    });

    // Fetch updated order for email
    const orderDoc = await orderRef.get();
    const order = { id: orderDoc.id, ...orderDoc.data() };

    // Send email notification
    const emailHtml = getReplacementApprovedEmailTemplate(order);
    await sendEmail({
      to: order.userEmail,
      subject: 'Replacement Approved - SkyTech',
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
      type: 'replacement_approved',
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date(),
    });

    console.log('Replacement approved:', { orderId });

    return NextResponse.json({
      success: true,
      message: 'Replacement approved',
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Approve replacement failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to approve replacement' }, { status: 500 });
  }
}
