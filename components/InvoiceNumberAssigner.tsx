'use server';

import { adminDb } from '@/lib/firebase-admin';
import { generateInvoiceNumber } from '@/lib/invoice-utils';

export async function InvoiceNumberAssigner() {
  console.log('=== INVOICE NUMBER ASSIGNMENT START ===');
  console.log('Invoice Number Assigner: Starting to assign invoice numbers to existing orders');

  try {
    // Fetch all orders
    const snapshot = await adminDb.collection('orders').get();
    console.log('Invoice Number Assigner: Total orders found:', snapshot.docs.length);

    let assigned = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const doc of snapshot.docs) {
      const orderData = doc.data();
      const orderId = doc.id;

      // Check if invoice number is missing
      if (!orderData.invoiceNumber) {
        try {
          const invoiceNumber = generateInvoiceNumber();
          await adminDb.collection('orders').doc(orderId).update({
            invoiceNumber,
            invoiceGeneratedAt: new Date(),
          });
          assigned++;
          console.log('Invoice Number Assigner: Assigned invoice number to order', orderId, '-', invoiceNumber);
        } catch (error) {
          const errorMsg = `Order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.error('Invoice Number Assigner: Failed to assign invoice number to order', orderId, error);
        }
      } else {
        skipped++;
        console.log('Invoice Number Assigner: Order already has invoice number, skipping', orderId);
      }
    }

    console.log('=== INVOICE NUMBER ASSIGNMENT COMPLETED ===');
    console.log('Invoice Number Assigner: Total orders scanned:', snapshot.docs.length);
    console.log('Invoice Number Assigner: Assigned:', assigned);
    console.log('Invoice Number Assigner: Skipped:', skipped);
    if (errors.length > 0) {
      console.error('Invoice Number Assigner: Errors:', errors);
    }
    console.log('=====================================');
  } catch (error) {
    console.error('=== INVOICE NUMBER ASSIGNMENT FAILED ===');
    console.error('Invoice Number Assigner: Error details:', error);
    console.error('Invoice Number Assigner: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Invoice Number Assigner: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('======================================');
  }

  return null;
}
