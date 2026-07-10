import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getOrderStatusEmailTemplate, getOrderStatusEmailSubject } from '@/lib/email-service';
import type { Order, NotificationType } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, trackingNumber, courierName } = body;

    if (!orderId || !trackingNumber || !courierName) {
      return NextResponse.json({ error: 'Order ID, tracking number, and courier name are required' }, { status: 400 });
    }

    // Fetch order from Firestore
    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = { id: orderDoc.id, ...orderDoc.data() } as Order;

    // Generate tracking URL based on courier
    let trackingUrl = '';
    if (courierName === 'India Post Speed Post') {
      trackingUrl = 'https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx';
    } else if (courierName === 'Delhivery') {
      trackingUrl = `https://www.delhivery.com/track/${trackingNumber}`;
    } else if (courierName === 'DTDC') {
      trackingUrl = `https://www.dtdc.in/tracking/track.asp?d=${trackingNumber}`;
    } else if (courierName === 'Blue Dart') {
      trackingUrl = `https://www.bluedart.com/webtracking/tracking_input?track=${trackingNumber}`;
    } else {
      trackingUrl = '#';
    }

    // Update order with tracking information
    await adminDb.collection('orders').doc(orderId).update({
      trackingNumber,
      courierName,
      trackingUrl,
      shippedAt: new Date(),
      status: 'shipped',
      updatedAt: new Date(),
    });

    // Add timeline event
    const timelineEvent = {
      status: 'shipped',
      label: 'Shipped',
      description: `Order shipped via ${courierName}. Tracking: ${trackingNumber}`,
      createdAt: new Date(),
    };

    await adminDb.collection('orders').doc(orderId).update({
      timeline: [...(order.timeline || []), timelineEvent],
    });

    // Send email notification
    const emailHtml = getOrderStatusEmailTemplate(order, 'shipped');
    const emailSubject = getOrderStatusEmailSubject(order, 'shipped');
    const notificationTypeValue: NotificationType = 'order_shipped';

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
    await notificationLogRef.set({
      id: notificationLogRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      type: notificationTypeValue,
      status: emailResult.success ? 'sent' : 'failed',
      data: { trackingNumber, courierName, trackingUrl },
      error: emailResult.error,
      sentAt: emailResult.success ? new Date() : null,
      createdAt: new Date(),
    });

    console.log('Order tracking updated successfully:', { orderId, trackingNumber, courierName });

    return NextResponse.json({
      success: true,
      message: 'Order tracking updated and email sent',
      trackingNumber,
      courierName,
      trackingUrl,
      emailSent: emailResult.success,
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Update order tracking failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update order tracking' }, { status: 500 });
  }
}
