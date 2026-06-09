import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/coupon-service';

export const runtime = 'nodejs';

interface ValidateCouponBody {
  code: string;
  orderAmount: number;
}

export async function POST(request: Request) {
  console.log('=== COUPON VALIDATION START ===');
  try {
    const body = (await request.json()) as ValidateCouponBody;
    console.log('Request body:', body);
    console.log('Coupon code (raw):', body.code);
    console.log('Coupon code (trimmed):', body.code?.trim());
    console.log('Order amount:', body.orderAmount);

    if (!body.code || !body.orderAmount) {
      console.log('Validation failed: Missing code or order amount');
      return NextResponse.json({ error: 'Missing code or order amount' }, { status: 400 });
    }

    const trimmedCode = body.code.trim();
    console.log('Calling validateCoupon with code:', trimmedCode, 'and amount:', body.orderAmount);

    const result = await validateCoupon(trimmedCode, body.orderAmount);
    console.log('Validation result:', result);

    console.log('=== COUPON VALIDATION END ===');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Validate coupon failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.log('=== COUPON VALIDATION END (ERROR) ===');
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to validate coupon' }, { status: 500 });
  }
}
