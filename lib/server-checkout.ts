import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { getProductPrice } from './cart';
import { mapProduct } from './firestore-mappers';
import type { CartItem, OrderItem, ShippingAddress, UserProfile } from './types';

export interface ValidatedCheckout {
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
}

export function validateShippingAddress(address: ShippingAddress) {
  const requiredFields: Array<keyof ShippingAddress> = [
    'fullName',
    'phone',
    'line1',
    'city',
    'state',
    'postalCode',
    'country',
  ];

  for (const field of requiredFields) {
    if (!address[field]?.trim()) {
      throw new Response(`Missing shipping field: ${field}`, { status: 400 });
    }
  }
}

export async function validateCheckoutItems(items: Pick<CartItem, 'productId' | 'quantity'>[]) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Response('Cart is empty', { status: 400 });
  }

  const checkedItems: OrderItem[] = [];

  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new Response('Invalid cart item', { status: 400 });
    }

    const productDoc = await adminDb.collection('products').doc(item.productId).get();
    if (!productDoc.exists) {
      throw new Response('One or more products are no longer available', { status: 400 });
    }

    const product = mapProduct(productDoc.id, productDoc.data() ?? {});
    if (product.status !== 'active' || product.stock < item.quantity) {
      throw new Response(`${product.name} is not available in the requested quantity`, {
        status: 400,
      });
    }

    const unitPrice = getProductPrice(product);
    checkedItems.push({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: product.images[0] ?? '',
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const subtotal = checkedItems.reduce((total, item) => total + item.lineTotal, 0);

  return {
    items: checkedItems,
    subtotal,
    total: subtotal,
    currency: 'INR',
  } satisfies ValidatedCheckout;
}

export async function createVerifiedOrder(input: {
  user: UserProfile;
  checkout: ValidatedCheckout;
  shippingAddress: ShippingAddress;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}) {
  const orderRef = adminDb.collection('orders').doc();
  const paymentRef = adminDb.collection('payments').doc(input.razorpayPaymentId);
  const userRef = adminDb.collection('users').doc(input.user.uid);
  const cartRef = adminDb.collection('carts').doc(input.user.uid);
  const now = FieldValue.serverTimestamp();
  const timelineDate = new Date();
  const orderNumber = `SKY-${Date.now().toString(36).toUpperCase()}-${orderRef.id.slice(0, 4).toUpperCase()}`;

  await adminDb.runTransaction(async (transaction) => {
    for (const item of input.checkout.items) {
      const productRef = adminDb.collection('products').doc(item.productId);
      const productDoc = await transaction.get(productRef);
      const product = mapProduct(productDoc.id, productDoc.data() ?? {});

      if (!productDoc.exists || product.status !== 'active' || product.stock < item.quantity) {
        throw new Error(`${item.name} is no longer available`);
      }

      transaction.update(productRef, {
        stock: FieldValue.increment(-item.quantity),
        updatedAt: now,
      });
    }

    transaction.set(orderRef, {
      orderNumber,
      userId: input.user.uid,
      userEmail: input.user.email,
      customerName: input.shippingAddress.fullName || input.user.displayName,
      items: input.checkout.items,
      subtotal: input.checkout.subtotal,
      total: input.checkout.total,
      currency: input.checkout.currency,
      status: 'paid',
      shippingAddress: input.shippingAddress,
      payment: {
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        amount: input.checkout.total,
        currency: input.checkout.currency,
        status: 'captured',
      },
      timeline: [
        {
          status: 'paid',
          label: 'Payment verified',
          description: 'Payment was verified and the order was created.',
          createdAt: timelineDate,
        },
      ],
      createdAt: now,
      updatedAt: now,
    });

    transaction.set(paymentRef, {
      userId: input.user.uid,
      userEmail: input.user.email,
      orderId: orderRef.id,
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      amount: input.checkout.total,
      currency: input.checkout.currency,
      status: 'captured',
      createdAt: now,
    });

    transaction.set(
      userRef,
      {
        orderCount: FieldValue.increment(1),
        totalSpent: FieldValue.increment(input.checkout.total),
        updatedAt: now,
      },
      { merge: true },
    );

    transaction.set(
      cartRef,
      {
        items: [],
        updatedAt: now,
      },
      { merge: true },
    );
  });

  return {
    id: orderRef.id,
    orderNumber,
  };
}
