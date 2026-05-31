import { adminDb } from './firebase-admin';

async function debugInvoiceFlow() {
  console.log('=== DEBUGGING INVOICE FLOW ===\n');

  try {
    // Get latest 5 orders
    const ordersSnapshot = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(5).get();

    console.log(`Total orders found: ${ordersSnapshot.size}`);
    console.log('=====================================\n');

    ordersSnapshot.docs.forEach((doc, index) => {
      const order = doc.data();
      console.log(`--- Order ${index + 1} ---`);
      console.log(`Document ID: ${doc.id}`);
      console.log(`orderNumber: ${order.orderNumber}`);
      console.log(`invoiceNumber: ${order.invoiceNumber || 'N/A'}`);
      console.log('=====================================\n');
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
}

debugInvoiceFlow();
