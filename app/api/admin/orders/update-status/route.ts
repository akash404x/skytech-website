import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getOrderStatusEmailTemplate, getReturnApprovedEmailTemplate, getReplacementApprovedEmailTemplate } from '@/lib/email-service';
import { processOrderRefund } from '@/lib/refund-service';
import type { Order, NotificationType } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, notificationType } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    // Fetch order from Firestore
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = { id: orderDoc.id, ...orderDoc.data() } as Order;

    // Update order status
    await adminDb.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date(),
    });

    // Add timeline event
    const timelineEvent = {
      status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      description: `Order status updated to ${status}`,
      createdAt: new Date(),
    };

    await adminDb.collection('orders').doc(orderId).update({
      timeline: [...(order.timeline || []), timelineEvent],
    });

    // Process refund if order is cancelled
    if (status === 'cancelled') {
      console.log('=== ADMIN ORDER CANCELLATION ===');
      console.log('Admin Cancel Triggered: Order ID:', orderId);
      console.log('Admin Cancel Triggered: Order Number:', order.orderNumber);
      
      // Process refund asynchronously (don't block response)
      processOrderRefund(order).catch((error) => {
        console.error('=== REFUND PROCESSING FAILED AFTER CANCELLATION ===');
        console.error('Admin Cancel: Failed to process refund for order:', order.orderNumber);
        console.error('Admin Cancel: Error details:', error);
        console.error('Admin Cancel: Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('========================================');
      });
    }

    // Send email notification
    let emailHtml = '';
    let emailSubject = '';
    let notificationTypeValue: NotificationType = 'order_confirmed';

    if (notificationType === 'return_approved') {
      emailHtml = getReturnApprovedEmailTemplate(order, order.total);
      emailSubject = 'Return Approved - SkyTech';
      notificationTypeValue = 'return_approved';
    } else if (notificationType === 'replacement_approved') {
      emailHtml = getReplacementApprovedEmailTemplate(order);
      emailSubject = 'Replacement Approved - SkyTech';
      notificationTypeValue = 'replacement_approved';
    } else if (notificationType === 'wallet_credited') {
      emailHtml = getReturnApprovedEmailTemplate(order, body.amount || order.total);
      emailSubject = 'Wallet Credited - SkyTech';
      notificationTypeValue = 'wallet_credited';
    } else {
      emailHtml = getOrderStatusEmailTemplate(order, status);
      emailSubject = `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - SkyTech`;
      
      // Map status to notification type
      const statusToNotificationType: Record<string, NotificationType> = {
        pending: 'order_placed',
        confirmed: 'order_confirmed',
        packed: 'order_packed',
        shipped: 'order_shipped',
        delivered: 'order_delivered',
        cancelled: 'order_cancelled',
      };
      notificationTypeValue = statusToNotificationType[status] || 'order_confirmed';
    }

    // Send email
    const emailResult = await sendEmail({
      to: order.userEmail,
      subject: emailSubject,
      html: emailHtml,
    });

    // Log email notification
    const emailLogRef = adminDb.collection('emailLogs').doc();
    await emailLogRef.set({
      id: emailLogRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      subject: emailSubject,
      template: notificationTypeValue,
      status: emailResult.success ? 'sent' : 'failed',
      error: emailResult.error,
      sentAt: emailResult.success ? new Date() : null,
      createdAt: new Date(),
    });

    // Log notification
    const notificationLogRef = adminDb.collection('notifications').doc();
    const notificationData: any = {
      id: notificationLogRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      type: notificationTypeValue,
      status: emailResult.success ? 'sent' : 'failed',
      data: { status },
      error: emailResult.error,
      sentAt: emailResult.success ? new Date() : null,
      createdAt: new Date(),
    };
    if (notificationType !== undefined) {
      notificationData.data.notificationType = notificationType;
    }
    await notificationLogRef.set(notificationData);

    console.log('Order status updated successfully:', { orderId, status, notificationType });

    return NextResponse.json({
      success: true,
      message: 'Order status updated and email sent',
      status,
      emailSent: emailResult.success,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update order status failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order status' }, { status: 500 });
  }
}
