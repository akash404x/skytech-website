import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { createCoupon, getCoupons, getCouponStats, createBulkCoupons, generateBulkCodes } from '@/lib/coupon-service';
import type { CouponDiscountType } from '@/lib/types';

export const runtime = 'nodejs';

interface CreateCouponBody {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
  maxUses?: number;
}

interface BulkCreateCouponBody {
  prefix: string;
  count: number;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: string;
  maxUses?: number;
}

// GET - List all coupons (admin only)
export async function GET(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'used' | 'expired' | null;

    const coupons = await getCoupons(status || undefined);
    const stats = await getCouponStats();

    return NextResponse.json({ coupons, stats });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get coupons failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get coupons' }, { status: 500 });
  }
}

// POST - Create a single coupon (admin only)
export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as CreateCouponBody;

    if (!body.code || !body.discountType || !body.discountValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (body.discountValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    if (body.discountType === 'percentage' && body.discountValue > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
    }

    const couponId = await createCoupon({
      code: body.code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderAmount: body.minOrderAmount,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      maxUses: body.maxUses,
    });

    return NextResponse.json({ success: true, couponId });
  } catch (error) {
    console.error('Create coupon failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create coupon' }, { status: 500 });
  }
}
