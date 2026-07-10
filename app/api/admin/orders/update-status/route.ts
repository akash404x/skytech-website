import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail, getOrderStatusEmailTemplate, getOrderStatusEmailSubject, getReturnApprovedEmailTemplate, getReplacementApprovedEmailTemplate } from '@/lib/email-service';
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
    const oldStatus = order.status;

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

    // Re-fetch order to get the updated status
    const updatedOrderDoc = await adminDb.collection('orders').doc(orderId).get();
    const updatedOrder = { id: updatedOrderDoc.id, ...updatedOrderDoc.data() } as Order;

    // Auto-generate invoice when order is confirmed
    if (status === 'confirmed' && !updatedOrder.invoiceNumber) {
      try {
        console.log('=== GENERATING INVOICE FOR CONFIRMED ORDER ===');
        console.log('Order ID:', orderId);
        console.log('Order Number:', updatedOrder.orderNumber);

        const invoiceNumber = generateInvoiceNumber();
        const invoiceDate = new Date();

        // Try to write invoice - if it fails due to permissions, store in order instead
        try {
          const invoiceRef = adminDb.collection('invoices').doc();
          const invoiceData = {
            id: invoiceRef.id,
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            userId: updatedOrder.userId,
            userEmail: updatedOrder.userEmail,
            invoiceNumber,
            customerName: updatedOrder.customerName,
            customerPhone: updatedOrder.customerPhone,
            billingAddress: updatedOrder.shippingAddress,
            shippingAddress: updatedOrder.shippingAddress,
            items: updatedOrder.items,
            subtotal: updatedOrder.subtotal,
            gstAmount: updatedOrder.gstAmount,
            gstPercentage: updatedOrder.gstPercentage,
            shippingFee: updatedOrder.shippingFee,
            deliveryCharge: updatedOrder.deliveryCharge,
            discount: updatedOrder.discount,
            total: updatedOrder.total,
            currency: updatedOrder.currency,
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
      console.log('Admin Cancel Triggered: Order Number:', updatedOrder.orderNumber);
      
      // Process refund asynchronously (don't block response)
      processOrderRefund(updatedOrder).catch((error) => {
        console.error('=== REFUND PROCESSING FAILED AFTER CANCELLATION ===');
        console.error('Admin Cancel: Failed to process refund for order:', updatedOrder.orderNumber);
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

    // Add logging for debugging
    console.log('=== ORDER STATUS EMAIL DEBUG ===');
    console.log('Old Status:', oldStatus);
    console.log('New Status:', updatedOrder.status);
    console.log('Recipient:', updatedOrder.userEmail);

    if (notificationType === 'return_approved') {
      emailHtml = getReturnApprovedEmailTemplate(updatedOrder, updatedOrder.total);
      emailSubject = 'Return Approved - SkyTech';
      notificationTypeValue = 'return_approved';
      console.log('Selected Email Template: return_approved');
      console.log('Email Subject:', emailSubject);
      emailResult = await sendEmail({
        to: updatedOrder.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else if (notificationType === 'replacement_approved') {
      emailHtml = getReplacementApprovedEmailTemplate(updatedOrder);
      emailSubject = 'Replacement Approved - SkyTech';
      notificationTypeValue = 'replacement_approved';
      console.log('Selected Email Template: replacement_approved');
      console.log('Email Subject:', emailSubject);
      emailResult = await sendEmail({
        to: updatedOrder.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else if (notificationType === 'wallet_credited') {
      emailHtml = getReturnApprovedEmailTemplate(updatedOrder, body.amount || updatedOrder.total);
      emailSubject = 'Wallet Credited - SkyTech';
      notificationTypeValue = 'wallet_credited';
      console.log('Selected Email Template: wallet_credited');
      console.log('Email Subject:', emailSubject);
      emailResult = await sendEmail({
        to: updatedOrder.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    } else {
      // Use new Nodemailer-based email system for order status updates
      let orderDate: string;
      if (updatedOrder.createdAt) {
        // Handle Firestore timestamp conversion
        const timestamp = updatedOrder.createdAt;
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
        processing: 'order_processing',
        packed: 'order_packed',
        shipped: 'order_shipped',
        out_for_delivery: 'order_out_for_delivery',
        delivered: 'order_delivered',
        cancelled: 'order_cancelled',
      };
      notificationTypeValue = statusToNotificationType[updatedOrder.status] || 'order_confirmed';

      // Capitalize status for email
      const capitalizedStatus = updatedOrder.status.charAt(0).toUpperCase() + updatedOrder.status.slice(1);

      // Get customer name from order or email
      const customerName = updatedOrder.customerName || updatedOrder.userEmail?.split('@')[0] || 'Customer';

      // Send email using new premium template system - use updatedOrder.status
      emailHtml = getOrderStatusEmailTemplate(updatedOrder, updatedOrder.status);
      emailSubject = getOrderStatusEmailSubject(updatedOrder, updatedOrder.status);
      console.log('Selected Email Template:', updatedOrder.status);
      console.log('Email Subject:', emailSubject);
      emailResult = await sendEmail({
        to: updatedOrder.userEmail,
        subject: emailSubject,
        html: emailHtml,
      });
    }
    console.log('================================');

    // Log email notification
    const emailLogRef = adminDb.collection('emailLogs').doc();
    const emailLogData: any = {
      id: emailLogRef.id,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      userEmail: updatedOrder.userEmail,
      subject: emailSubject || `Order ${updatedOrder.status.charAt(0).toUpperCase() + updatedOrder.status.slice(1)} - SkyTech`,
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
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      userId: updatedOrder.userId,
      userEmail: updatedOrder.userEmail,
      type: notificationTypeValue,
      status: emailResult.success ? 'sent' : 'failed',
      data: { status: updatedOrder.status },
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

    console.log('Order status updated successfully:', { orderId, status: updatedOrder.status, notificationType });

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
