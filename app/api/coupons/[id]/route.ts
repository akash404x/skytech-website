import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getCouponById, updateCoupon, deleteCoupon } from '@/lib/coupon-service';
import type { CouponDiscountType, CouponStatus } from '@/lib/types';

export const runtime = 'nodejs';

interface UpdateCouponBody {
  code?: string;
  discountType?: CouponDiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  expiryDate?: string | Date;
  maxUses?: number;
  status?: CouponStatus;
}

// GET - Get a single coupon by ID (admin only)
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const params = await context.params;
    const coupon = await getCouponById(params.id);

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Get coupon failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to get coupon' }, { status: 500 });
  }
}

// PUT - Update a coupon (admin only)
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = (await request.json()) as UpdateCouponBody;

    if (body.discountValue !== undefined && body.discountValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 });
    }

    if (body.discountType === 'percentage' && body.discountValue !== undefined && body.discountValue > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%' }, { status: 400 });
    }

    const updates: Partial<UpdateCouponBody> = {};
    if (body.code !== undefined) updates.code = body.code;
    if (body.discountType !== undefined) updates.discountType = body.discountType;
    if (body.discountValue !== undefined) updates.discountValue = body.discountValue;
    if (body.minOrderAmount !== undefined) updates.minOrderAmount = body.minOrderAmount;
    if (body.expiryDate !== undefined) updates.expiryDate = body.expiryDate ? new Date(body.expiryDate) : undefined;
    if (body.maxUses !== undefined) updates.maxUses = body.maxUses;
    if (body.status !== undefined) updates.status = body.status;

    const params = await context.params;
    await updateCoupon(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update coupon failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update coupon' }, { status: 500 });
  }
}

// DELETE - Delete a coupon (admin only)
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const params = await context.params;
    await deleteCoupon(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete coupon failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete coupon' }, { status: 500 });
  }
}
