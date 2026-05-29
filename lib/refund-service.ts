import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email-service';
import type { Order } from './types';

export async function processOrderRefund(order: Order): Promise<{ success: boolean; error?: string; refundAmount?: number }> {
  try {
    console.log('=== REFUND PROCESSING START ===');
    console.log('Admin Cancel Triggered: Order', order.orderNumber);
    console.log('Refund Started: Order ID:', order.id);
    console.log('Refund Started: User ID:', order.userId);
    console.log('Refund Started: Order total:', order.total);

    // Check if refund already processed
    if (order.refundProcessed) {
      console.log('Refund Failed: Refund already processed for order', order.orderNumber);
      return { success: false, error: 'Refund already processed' };
    }

    // Calculate refund amount (total minus any non-refundable fees if needed)
    // For now, refund the full order total
    const refundAmount = order.total;
    console.log('Refund Amount:', refundAmount);

    // Use Firestore transaction for atomic operations
    await adminDb.runTransaction(async (transaction) => {
      const now = new Date();

      // Get user document
      const userRef = adminDb.collection('users').doc(order.userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;
      const newBalance = currentBalance + refundAmount;

      console.log('Wallet Updated: Current balance:', currentBalance);
      console.log('Wallet Updated: New balance:', newBalance);

      // Update user wallet balance
      transaction.update(userRef, {
        walletBalance: newBalance,
        updatedAt: now,
      });

      // Create wallet transaction
      const walletTransactionRef = adminDb.collection('walletTransactions').doc();
      transaction.set(walletTransactionRef, {
        userId: order.userId,
        userEmail: order.userEmail,
        amount: refundAmount,
        type: 'credit',
        reason: 'Admin Cancelled Order Refund',
        orderId: order.id,
        orderNumber: order.orderNumber,
        createdAt: now,
      });
      console.log('Wallet Transaction Created: ID:', walletTransactionRef.id);

      // Update order with refund details
      const orderRef = adminDb.collection('orders').doc(order.id);
      transaction.update(orderRef, {
        refundProcessed: true,
        refundAmount: refundAmount,
        refundProcessedAt: now,
        updatedAt: now,
      });
      console.log('Order Updated: Refund processed flag set');
    });

    console.log('Refund Success: Order', order.orderNumber, 'refunded ₹', refundAmount);
    console.log('=== REFUND PROCESSING SUCCESS ===');

    // Send refund email
    await sendRefundEmail(order, refundAmount);

    // Add notification
    await addRefundNotification(order, refundAmount);

    return { success: true, refundAmount };
  } catch (error) {
    console.error('=== REFUND PROCESSING FAILED ===');
    console.error('Refund Failed: Order ID:', order.id);
    console.error('Refund Failed: Order Number:', order.orderNumber);
    console.error('Refund Failed: Error details:', error);
    console.error('Refund Failed: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Refund Failed: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('==============================');
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function sendRefundEmail(order: Order, refundAmount: number): Promise<void> {
  try {
    console.log('Refund Email: Sending refund email to', order.userEmail);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled - Refund Added To Wallet</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #020617 0%, #1e293b 100%); color: #22d3ee; padding: 30px; text-align: center; }
          .content { background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .refund-amount { font-size: 24px; font-weight: bold; color: #22d3ee; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled - Refund Added To Wallet</h1>
          </div>
          <div class="content">
            <p>Dear ${order.customerName},</p>
            <p>Your order <strong>${order.orderNumber}</strong> has been cancelled by the admin.</p>
            <p>We have processed a refund of <strong>₹${refundAmount.toFixed(2)}</strong> to your wallet.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${order.orderNumber}</p>
              <p><strong>Refund Amount:</strong> ₹${refundAmount.toFixed(2)}</p>
              <p><strong>Refund Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>The refund amount has been credited to your wallet balance and is available for immediate use on your next purchase.</p>
            <p>You can view your updated wallet balance in your account dashboard.</p>
          </div>
          <div class="footer">
            <p>SkyTech - Arduino, Electronics, Robotics & IoT Solutions</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendEmail({
      to: order.userEmail,
      subject: `Order Cancelled - Refund Added To Wallet - ${order.orderNumber}`,
      html: emailHtml,
    });

    if (emailResult.success) {
      console.log('Refund Email: Email sent successfully to', order.userEmail);
    } else {
      console.error('Refund Email: Failed to send email:', emailResult.error);
    }
  } catch (error) {
    console.error('Refund Email: Error sending email:', error);
  }
}

async function addRefundNotification(order: Order, refundAmount: number): Promise<void> {
  try {
    console.log('Refund Notification: Adding notification for order', order.orderNumber);

    const notificationRef = adminDb.collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      userEmail: order.userEmail,
      type: 'refund_processed',
      status: 'sent',
      data: {
        refundAmount: refundAmount,
        reason: 'Admin Cancelled Order Refund',
      },
      sentAt: new Date(),
      createdAt: new Date(),
    });

    console.log('Refund Notification: Notification added successfully');
  } catch (error) {
    console.error('Refund Notification: Error adding notification:', error);
  }
}

export async function processMissingRefunds(): Promise<{ processed: number; success: number; failed: number; errors: string[] }> {
  try {
    console.log('=== PROCESS MISSING REFUNDS START ===');
    console.log('Process Missing Refunds: Scanning for cancelled orders without refunds');

    // Fetch all cancelled orders
    const snapshot = await adminDb
      .collection('orders')
      .where('status', '==', 'cancelled')
      .get();

    console.log('Process Missing Refunds: Total cancelled orders found:', snapshot.docs.length);

    let processed = 0;
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const doc of snapshot.docs) {
      const order = { id: doc.id, ...doc.data() } as Order;

      // Check if refund is missing
      if (!order.refundProcessed) {
        processed++;
        console.log('Process Missing Refunds: Processing order', order.orderNumber, '(ID:', order.id + ')');

        const result = await processOrderRefund(order);

        if (result.success) {
          success++;
          console.log('Process Missing Refunds: Successfully refunded order', order.orderNumber);
        } else {
          failed++;
          const errorMsg = `Order ${order.orderNumber} (ID: ${order.id}): ${result.error || 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('Process Missing Refunds: Failed to refund order', order.orderNumber, result.error);
        }
      } else {
        console.log('Process Missing Refunds: Order', order.orderNumber, 'already refunded, skipping');
      }
    }

    console.log('=== PROCESS MISSING REFUNDS COMPLETED ===');
    console.log('Process Missing Refunds: Total cancelled orders scanned:', snapshot.docs.length);
    console.log('Process Missing Refunds: Processed:', processed);
    console.log('Process Missing Refunds: Success:', success);
    console.log('Process Missing Refunds: Failed:', failed);
    if (errors.length > 0) {
      console.error('Process Missing Refunds: Errors:', errors);
    }
    console.log('=======================================');

    return { processed, success, failed, errors };
  } catch (error) {
    console.error('=== PROCESS MISSING REFUNDS FAILED ===');
    console.error('Process Missing Refunds: Error details:', error);
    console.error('Process Missing Refunds: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Process Missing Refunds: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('====================================');
    return { processed: 0, success: 0, failed: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
  }
}
