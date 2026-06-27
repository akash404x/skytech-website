import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getOrderStatusEmailTemplate, getReturnApprovedEmailTemplate, getReplacementApprovedEmailTemplate } from '@/lib/email-service';
import { sendOrderStatusEmail } from '@/lib/sendOrderEmail';
import { processOrderRefund } from '@/lib/refund-service';
import { generateInvoiceNumber } from '@/lib/invoice-utils';
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

    // Auto-generate invoice when order is confirmed
    if (status === 'confirmed' && !order.invoiceNumber) {
      try {
        console.log('=== GENERATING INVOICE FOR CONFIRMED ORDER ===');
        console.log('Order ID:', orderId);
        console.log('Order Number:', order.orderNumber);

        const invoiceNumber = generateInvoiceNumber();
        const invoiceDate = new Date();

        // Try to write invoice - if it fails due to permissions, store in order instead
        try {
          const invoiceRef = adminDb.collection('invoices').doc();
          const invoiceData = {
            id: invoiceRef.id,
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            userEmail: order.userEmail,
            invoiceNumber,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            billingAddress: order.shippingAddress,
            shippingAddress: order.shippingAddress,
            items: order.items,
            subtotal: order.subtotal,
            gstAmount: order.gstAmount,
            gstPercentage: order.gstPercentage,
            shippingFee: order.shippingFee,
            deliveryCharge: order.deliveryCharge,
            discount: order.discount,
            total: order.total,
            currency: order.currency,
            invoiceDate,
            status: 'generated',
          };

          console.log('Attempting to write invoice to Firestore...');
          await invoiceRef.set(invoiceData);
          console.log('Invoice written successfully');
        } catch (collectionError) {
          console.warn('Could not write to invoices collection, storing in order instead:', collectionError);
          // Store invoice data directly in order document as fallback
        }

        // Update order with invoice details (this should always work)
        console.log('Updating order with invoice details...');
        await adminDb.collection('orders').doc(orderId).update({
          invoiceNumber,
          invoiceGeneratedAt: invoiceDate,
          updatedAt: new Date(),
        });
        console.log('Order updated successfully');

        console.log('✅ Invoice processed:', { invoiceNumber });
      } catch (invoiceError) {
        console.error('❌ Failed to process invoice:', invoiceError);
        console.error('Error details:', JSON.stringify(invoiceError, null, 2));
        // Don't fail the status update if invoice generation fails
      }
    }

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
    let emailResult: { success: boolean; error?: string };

    if (notificationType === 'return_approved') {
      emailHtml = getReturnApprovedEmailTemplate(order, order.total);
      emailSubject = 'Return Approved - SkyTech';
      notificationTypeValue = 'return_approved';
      emailResult = await sendEmail({
        to: order.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else if (notificationType === 'replacement_approved') {
      emailHtml = getReplacementApprovedEmailTemplate(order);
      emailSubject = 'Replacement Approved - SkyTech';
      notificationTypeValue = 'replacement_approved';
      emailResult = await sendEmail({
        to: order.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else if (notificationType === 'wallet_credited') {
      emailHtml = getReturnApprovedEmailTemplate(order, body.amount || order.total);
      emailSubject = 'Wallet Credited - SkyTech';
      notificationTypeValue = 'wallet_credited';
      emailResult = await sendEmail({
        to: order.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else {
      // Use new Nodemailer-based email system for order status updates
      let orderDate: string;
      if (order.createdAt) {
        // Handle Firestore timestamp conversion
        const timestamp = order.createdAt;
        if (typeof timestamp === 'object' && 'toDate' in timestamp) {
          orderDate = timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } else if (typeof timestamp === 'object' && 'seconds' in timestamp) {
          orderDate = new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } else {
          orderDate = new Date(timestamp as string | number).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } else {
        orderDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

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

      // Capitalize status for email
      const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

      // Get customer name from order or email
      const customerName = order.customerName || order.userEmail?.split('@')[0] || 'Customer';

      // Send email using new Nodemailer system
      emailResult = await sendOrderStatusEmail({
        orderId: order.orderNumber,
        customerName,
        customerEmail: order.userEmail,
        status: capitalizedStatus as any,
        orderDate,
      });

      // If new email system fails, fall back to old system
      if (!emailResult.success) {
        console.warn('New email system failed, falling back to old system:', emailResult.error);
        emailHtml = getOrderStatusEmailTemplate(order, status);
        emailSubject = `Order ${capitalizedStatus} - SkyTech`;
        emailResult = await sendEmail({
          to: order.userEmail,
          subject: emailSubject,
          html: emailHtml,
        });
      }
    }

    // Log email notification
    const emailLogRef = adminDb.collection('emailLogs').doc();
    const emailLogData: any = {
      id: emailLogRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      subject: emailSubject || `Order ${status.charAt(0).toUpperCase() + status.slice(1)} - SkyTech`,
      template: notificationTypeValue,
      status: emailResult.success ? 'sent' : 'failed',
      sentAt: emailResult.success ? new Date() : null,
      createdAt: new Date(),
    };
    // Only add error field if it exists
    if (emailResult.error) {
      emailLogData.error = emailResult.error;
    }
    await emailLogRef.set(emailLogData);

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
      sentAt: emailResult.success ? new Date() : null,
      createdAt: new Date(),
    };
    if (notificationType !== undefined) {
      notificationData.data.notificationType = notificationType;
    }
    // Only add error field if it exists
    if (emailResult.error) {
      notificationData.error = emailResult.error;
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
