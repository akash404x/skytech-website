import crypto from 'crypto';

const RAZORPAY_API = 'https://api.razorpay.com/v1';

function getCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const missing: string[] = [];
  if (!keyId) missing.push('RAZORPAY_KEY_ID');
  if (!keySecret) missing.push('RAZORPAY_KEY_SECRET');

  console.log('Razorpay credential check:', {
    keyId: Boolean(keyId),
    keySecret: Boolean(keySecret),
  });

  if (missing.length > 0) {
    throw new Error(`Razorpay credentials are not configured: missing ${missing.join(', ')}`);
  }

  return { keyId: keyId as string, keySecret: keySecret as string };
}

function authHeader(keyId: string, keySecret: string) {
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

export async function createRazorpayOrder(input: {
  amount: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}) {
  const { keyId, keySecret } = getCredentials();
  
  // Razorpay minimum amount is ₹1 (100 paise)
  const amountInPaise = Math.round(input.amount * 100);
  const MINIMUM_AMOUNT = 100; // 100 paise = ₹1
  
  if (amountInPaise < MINIMUM_AMOUNT) {
    throw new Error(`Order amount (₹${input.amount.toFixed(2)}) is less than minimum allowed amount (₹1.00). Please add more items to your cart.`);
  }

  const response = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(keyId, keySecret),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Razorpay order creation failed: ${message}`);
  }

  const order = (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };

  return {
    keyId,
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    status: order.status,
  };
}

export async function fetchRazorpayOrder(orderId: string) {
  const { keyId, keySecret } = getCredentials();
  const response = await fetch(`${RAZORPAY_API}/orders/${orderId}`, {
    headers: {
      Authorization: authHeader(keyId, keySecret),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Razorpay order lookup failed: ${message}`);
  }

  return (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export function verifyRazorpaySignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keySecret } = getCredentials();
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest('hex');

  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(input.razorpaySignature);

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
