import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createBulkCoupons, generateBulkCodes } from '@/lib/coupon-service';
import type { CouponDiscountType } from '@/lib/types';

export const runtime = 'nodejs';

interface BulkCreateCouponBody {
  prefix: string;
  count: number;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
  maxUses?: number;
}

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as BulkCreateCouponBody;

    if (!body.prefix || !body.count || !body.discountType || !body.discountValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (body.count <= 0 || body.count > 100) {
      return NextResponse.json({ error: 'Count must be between 1 and 100' }, { status: 400 });
    }

    if (body.discountValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    if (body.discountType === 'percentage' && body.discountValue > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
    }

    // Generate coupon codes
    const codes = generateBulkCodes(body.prefix, body.count);

    // Create coupons
    const inputs = codes.map((code) => ({
      code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderAmount: body.minOrderAmount,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      maxUses: body.maxUses,
    }));

    const results = await createBulkCoupons(inputs);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Bulk create coupons failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create bulk coupons' }, { status: 500 });
  }
}
