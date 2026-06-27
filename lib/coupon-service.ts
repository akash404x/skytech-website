import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { toDate } from './format';
import type { Coupon, CouponDiscountType, CouponStatus, DateValue } from './types';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
}

export interface CreateCouponInput {
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: Date;
  maxUses?: number;
}

/**
 * Validate a coupon code for use
 * Checks: existence, status, expiry, minimum order amount, and whether already used
 */
export async function validateCoupon(
  code: string,
  orderAmount: number,
  userId?: string
): Promise<CouponValidationResult> {
  console.log('=== VALIDATE COUPON START ===');
  console.log('Input code:', code);
  console.log('Order amount:', orderAmount);
  console.log('User ID:', userId);
  console.log('Firestore project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  try {
    // Normalize code to uppercase
    const normalizedCode = code.toUpperCase().trim();
    console.log('Normalized code:', normalizedCode);

    // Query for coupon by code
    console.log('Querying Firestore for coupon...');
    const snapshot = await adminDb
      .collection('coupons')
      .where('code', '==', normalizedCode)
      .limit(1)
      .get();

    console.log('Query result count:', snapshot.size);

    if (snapshot.empty) {
      console.log('Coupon not found in database');
      return { valid: false, error: 'Invalid coupon code' };
    }

    const couponDoc = snapshot.docs[0];
    const coupon = mapCoupon(couponDoc.id, couponDoc.data());
    console.log('Coupon found:', coupon);

    // Check if coupon is active
    if (coupon.status !== 'active') {
      console.log('Coupon not active. Status:', coupon.status);
      if (coupon.status === 'used') {
        return { valid: false, error: 'This coupon has already been used' };
      }
      if (coupon.status === 'expired') {
        return { valid: false, error: 'This coupon has expired' };
      }
      return { valid: false, error: 'Coupon is not active' };
    }
    console.log('Coupon is active');

    // Check expiry date
    if (coupon.expiryDate) {
      console.log('Checking expiry date...');
      const expiryDate = toDate(coupon.expiryDate);
      console.log('Expiry date:', expiryDate);
      console.log('Current date:', new Date());

      if (expiryDate < new Date()) {
        console.log('Coupon has expired');
        // Auto-expire if past expiry date
        await adminDb.collection('coupons').doc(coupon.id).update({
          status: 'expired',
          updatedAt: FieldValue.serverTimestamp(),
        });
        return { valid: false, error: 'This coupon has expired' };
      }
      console.log('Coupon not expired');
    } else {
      console.log('No expiry date set');
    }

    // Check minimum order amount
    console.log('Checking minimum order amount...');
    console.log('Required min order:', coupon.minOrderAmount);
    console.log('Current order amount:', orderAmount);
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      console.log('Minimum order amount not met');
      return {
        valid: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
      };
    }
    console.log('Minimum order amount met');

    // Check max uses
    console.log('Checking max uses...');
    console.log('Max uses:', coupon.maxUses);
    console.log('Used count:', coupon.usedCount);
    if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
      console.log('Max uses reached');
      return { valid: false, error: 'This coupon has reached its maximum usage limit' };
    }
    console.log('Max uses not reached');

    // Check if user has already used this coupon
    if (userId && coupon.usedBy) {
      console.log('Checking if user already used coupon...');
      console.log('Used by:', coupon.usedBy);
      console.log('User ID:', userId);
      // For single-use coupons, check if this specific user used it
      if ((coupon.status as string) === 'used' && coupon.usedBy === userId) {
        console.log('User already used this coupon');
        return { valid: false, error: 'You have already used this coupon' };
      }
      console.log('User has not used this coupon');
    }

    // Calculate discount amount
    console.log('Calculating discount...');
    let discountAmount = 0;
    if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
      console.log('Fixed discount:', discountAmount);
    } else {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      console.log('Percentage discount:', discountAmount);
    }

    // Ensure discount doesn't exceed order amount
    discountAmount = Math.min(discountAmount, orderAmount);
    console.log('Final discount amount:', discountAmount);

    const result = {
      valid: true,
      coupon,
      discountAmount,
    };
    console.log('=== VALIDATE COUPON END (SUCCESS) ===');
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error validating coupon:', error);
    console.log('=== VALIDATE COUPON END (ERROR) ===');
    return { valid: false, error: 'Failed to validate coupon' };
  }
}

/**
 * Create a new coupon
 */
export async function createCoupon(input: CreateCouponInput): Promise<string> {
  const couponRef = adminDb.collection('coupons').doc();
  const now = FieldValue.serverTimestamp();

  const couponData: Record<string, unknown> = {
    code: input.code.toUpperCase().trim(),
    discountType: input.discountType,
    discountValue: input.discountValue,
    status: 'active',
    usedCount: 0,
    usedBy: null,
    usedOrderId: null,
    usedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  // Only include optional fields if they have values
  if (input.minOrderAmount !== undefined) {
    couponData.minOrderAmount = input.minOrderAmount;
  }
  if (input.expiryDate !== undefined) {
    couponData.expiryDate = input.expiryDate;
  }
  if (input.maxUses !== undefined) {
    couponData.maxUses = input.maxUses;
  }

  await couponRef.set(couponData);

  return couponRef.id;
}

/**
 * Create multiple coupons in bulk
 */
export async function createBulkCoupons(
  inputs: CreateCouponInput[]
): Promise<{ success: string[]; failed: { code: string; error: string }[] }> {
  const results = {
    success: [] as string[],
    failed: [] as { code: string; error: string }[],
  };

  for (const input of inputs) {
    try {
      const couponId = await createCoupon(input);
      results.success.push(input.code);
    } catch (error) {
      results.failed.push({
        code: input.code,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Mark a coupon as used after successful payment
 * Uses transaction to prevent race conditions
 */
export async function markCouponAsUsed(
  couponId: string,
  userId: string,
  userEmail: string,
  orderId: string
): Promise<void> {
  await adminDb.runTransaction(async (transaction) => {
    const couponRef = adminDb.collection('coupons').doc(couponId);
    const couponDoc = await transaction.get(couponRef);

    if (!couponDoc.exists) {
      throw new Error('Coupon not found');
    }

    const coupon = couponDoc.data();
    if (!coupon) {
      throw new Error('Coupon data is invalid');
    }

    // Double-check status to prevent race conditions
    if (coupon.status !== 'active') {
      throw new Error('Coupon is not active');
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new Error('Coupon has reached its maximum usage limit');
    }

    // Update coupon status and increment used count
    transaction.update(couponRef, {
      status: 'used',
      usedCount: FieldValue.increment(1),
      usedBy: userEmail,
      usedOrderId: orderId,
      usedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

/**
 * Get all coupons with optional status filter
 */
export async function getCoupons(status?: CouponStatus): Promise<Coupon[]> {
  console.log('=== GET COUPONS START ===');
  console.log('Firestore project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Collection path: coupons');
  console.log('Status filter:', status);

  try {
    // First try without orderBy to avoid index requirement
    const collectionRef = adminDb.collection('coupons');
    let query: any = collectionRef;

    if (status) {
      console.log('Applying status filter:', status);
      query = collectionRef.where('status', '==', status);
    }

    console.log('Executing Firestore query...');
    const snapshot = await query.get();
    console.log('Query successful. Total coupons fetched:', snapshot.size);
    console.log('Raw document IDs:', snapshot.docs.map((doc: any) => doc.id));

    const coupons = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      console.log(`Document ${doc.id}:`, data);
      return mapCoupon(doc.id, data);
    });

    // Sort in memory instead of using orderBy
    coupons.sort((a: Coupon, b: Coupon) => {
      const aTime = convertDateToTime(a.createdAt);
      const bTime = convertDateToTime(b.createdAt);
      return bTime - aTime;
    });

    console.log('Mapped coupons count:', coupons.length);
    console.log('=== GET COUPONS END ===');
    return coupons;
  } catch (error) {
    console.error('Error in getCoupons:', error);
    throw error;
  }
}

/**
 * Helper function to convert DateValue to timestamp
 */
function convertDateToTime(dateValue: DateValue | undefined): number {
  if (!dateValue) return 0;
  try {
    return toDate(dateValue).getTime();
  } catch (error) {
    console.error('Error converting date to time:', error, dateValue);
    return 0;
  }
}

/**
 * Get a single coupon by ID
 */
export async function getCouponById(id: string): Promise<Coupon | null> {
  const doc = await adminDb.collection('coupons').doc(id).get();
  if (!doc.exists) return null;
  return mapCoupon(doc.id, doc.data());
}

/**
 * Update a coupon
 */
export async function updateCoupon(
  id: string,
  updates: Partial<Omit<Coupon, 'id' | 'createdAt'>>
): Promise<void> {
  // Filter out undefined values
  const filteredUpdates: Record<string, unknown> = {
    updatedAt: FieldValue.serverTimestamp(),
  };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      filteredUpdates[key] = value;
    }
  }

  await adminDb.collection('coupons').doc(id).update(filteredUpdates);
}

/**
 * Delete a coupon
 */
export async function deleteCoupon(id: string): Promise<void> {
  await adminDb.collection('coupons').doc(id).delete();
}

/**
 * Map Firestore document to Coupon type
 */
export function mapCoupon(id: string, data: Record<string, unknown> | undefined): Coupon {
  if (!data) {
    throw new Error('Coupon data is undefined');
  }

  return {
    id,
    code: data.code as string,
    discountType: data.discountType as CouponDiscountType,
    discountValue: data.discountValue as number,
    minOrderAmount: (data.minOrderAmount as number) || undefined,
    expiryDate: data.expiryDate as DateValue | undefined,
    status: data.status as CouponStatus,
    maxUses: (data.maxUses as number) || undefined,
    usedCount: (data.usedCount as number) || 0,
    usedBy: (data.usedBy as string) || undefined,
    usedOrderId: (data.usedOrderId as string) || undefined,
    usedAt: data.usedAt as DateValue | undefined,
    createdAt: data.createdAt as DateValue | undefined,
    updatedAt: data.updatedAt as DateValue | undefined,
  };
}

/**
 * Generate bulk coupon codes with a prefix
 * Example: generateBulkCodes('SKY100', 4) -> ['SKY100A', 'SKY100B', 'SKY100C', 'SKY100D']
 */
export function generateBulkCodes(prefix: string, count: number): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < count; i++) {
    let suffix = '';
    let num = i;
    
    // Convert number to base-26 letters
    do {
      suffix = chars[num % 26] + suffix;
      num = Math.floor(num / 26);
    } while (num > 0);
    
    codes.push(`${prefix}${suffix}`);
  }

  return codes;
}

/**
 * Get coupon statistics
 */
export async function getCouponStats(): Promise<{
  total: number;
  active: number;
  used: number;
  expired: number;
}> {
  console.log('=== GET COUPON STATS START ===');
  console.log('Firestore project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  console.log('Collection path: coupons');

  try {
    // First try to get all coupons without any filters to see if collection exists
    console.log('Fetching all coupons (no filters)...');
    const allCoupons = await adminDb.collection('coupons').get();
    console.log('Total documents in collection:', allCoupons.size);

    // Log first few documents to see their structure
    allCoupons.docs.slice(0, 3).forEach(doc => {
      console.log(`Document ${doc.id}:`, doc.data());
    });

    const [totalSnapshot, activeSnapshot, usedSnapshot, expiredSnapshot] = await Promise.all([
      adminDb.collection('coupons').get(),
      adminDb.collection('coupons').where('status', '==', 'active').get(),
      adminDb.collection('coupons').where('status', '==', 'used').get(),
      adminDb.collection('coupons').where('status', '==', 'expired').get(),
    ]);

    const stats = {
      total: totalSnapshot.size,
      active: activeSnapshot.size,
      used: usedSnapshot.size,
      expired: expiredSnapshot.size,
    };

    console.log('Stats:', stats);
    console.log('=== GET COUPON STATS END ===');
    return stats;
  } catch (error) {
    console.error('Error in getCouponStats:', error);
    throw error;
  }
}
