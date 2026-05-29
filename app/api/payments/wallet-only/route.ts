import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { validateCheckoutItems } from '@/lib/server-checkout';
import type { CartItem, ShippingAddress } from '@/lib/types';

export const runtime = 'nodejs';

interface WalletOnlyBody {
  items: Pick<CartItem, 'productId' | 'quantity'>[];
  shippingAddress: ShippingAddress;
  walletAmount: number;
  gstAmount?: number;
  gstPercentage?: number;
  shippingFee?: number;
  deliveryCharge?: number;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);
    const body = (await request.json()) as WalletOnlyBody;

    if (!body.items || !body.shippingAddress || body.walletAmount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const checkout = await validateCheckoutItems(body.items);

    if (checkout.total !== body.walletAmount) {
      return NextResponse.json({ error: 'Wallet amount does not match order total' }, { status: 400 });
    }

    const now = FieldValue.serverTimestamp();
    const timelineDate = new Date();
    const orderRef = adminDb.collection('orders').doc();
    const userRef = adminDb.collection('users').doc(profile.uid);
    const cartRef = adminDb.collection('carts').doc(profile.uid);
    const orderNumber = `SKY-${Date.now().toString(36).toUpperCase()}-${orderRef.id.slice(0, 4).toUpperCase()}`;

    await adminDb.runTransaction(async (transaction) => {
      // Check user wallet balance
      const userDoc = await transaction.get(userRef);
      const userData = userDoc.data();
      const currentBalance = userData?.walletBalance || 0;

      if (currentBalance < body.walletAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Update product stock
      for (const item of checkout.items) {
        const productRef = adminDb.collection('products').doc(item.productId);
        const productDoc = await transaction.get(productRef);
        const product = productDoc.data();

        if (!productDoc.exists || product?.stock < item.quantity) {
          throw new Error(`${item.name} is no longer available`);
        }

        transaction.update(productRef, {
          stock: FieldValue.increment(-item.quantity),
          updatedAt: now,
        });
      }

      // Deduct wallet balance
      transaction.update(userRef, {
        walletBalance: FieldValue.increment(-body.walletAmount),
        updatedAt: now,
      });

      // Create wallet transaction
      const walletTransactionRef = adminDb.collection('walletTransactions').doc();
      transaction.set(walletTransactionRef, {
        userId: profile.uid,
        amount: body.walletAmount,
        type: 'debit',
        orderId: orderRef.id,
        description: `Payment for order ${orderNumber}`,
        createdAt: now,
      });

      // Create order
      transaction.set(orderRef, {
        orderNumber,
        userId: profile.uid,
        userEmail: profile.email,
        customerName: body.shippingAddress.fullName || profile.displayName,
        customerPhone: body.shippingAddress.phone,
        items: checkout.items,
        subtotal: checkout.subtotal,
        gstAmount: body.gstAmount,
        gstPercentage: body.gstPercentage,
        shippingFee: body.shippingFee,
        deliveryCharge: body.deliveryCharge,
        walletUsed: body.walletAmount,
        total: checkout.total,
        currency: checkout.currency,
        status: 'pending',
        shippingAddress: body.shippingAddress,
        payment: {
          razorpayOrderId: '',
          razorpayPaymentId: `WALLET-${orderRef.id}`,
          amount: checkout.total,
          currency: checkout.currency,
          status: 'captured',
        },
        timeline: [
          {
            status: 'pending',
            label: 'Order Placed',
            description: 'Payment was made using wallet balance.',
            createdAt: timelineDate,
          },
        ],
        createdAt: now,
        updatedAt: now,
      });

      // Clear cart
      transaction.set(
        cartRef,
        {
          items: [],
          updatedAt: now,
        },
        { merge: true },
      );

      // Update user stats
      transaction.set(
        userRef,
        {
          orderCount: FieldValue.increment(1),
          totalSpent: FieldValue.increment(checkout.total),
          updatedAt: now,
        },
        { merge: true },
      );
    });

    return NextResponse.json({
      success: true,
      order: {
        id: orderRef.id,
        orderNumber,
      },
    });
  } catch (error) {
    console.error('Wallet-only payment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process wallet payment' }, { status: 500 });
  }
}
