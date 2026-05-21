import type {
  AccountStatus,
  Order,
  PaymentTransaction,
  Product,
  ProductStatus,
  Service,
  ServiceStatus,
  UserProfile,
  UserRole,
} from './types';

type DataRecord = Record<string, unknown>;

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function normalizeProductStatus(value: unknown): ProductStatus {
  const status = asString(value).toLowerCase();
  return status === 'inactive' ? 'inactive' : 'active';
}

export function normalizeServiceStatus(value: unknown): ServiceStatus {
  const status = asString(value).toLowerCase();
  return status === 'inactive' ? 'inactive' : 'active';
}

export function normalizeUserRole(value: unknown): UserRole {
  return value === 'admin' || value === 'editor' || value === 'user' ? value : 'user';
}

export function normalizeAccountStatus(value: unknown): AccountStatus {
  return value === 'suspended' ? 'suspended' : 'active';
}

export function mapProduct(id: string, data: DataRecord): Product {
  const rawDiscountPrice = data.discountPrice === null ? 0 : asNumber(data.discountPrice, 0);

  return {
    id,
    name: asString(data.name),
    description: asString(data.description),
    category: asString(data.category, 'Components'),
    price: asNumber(data.price),
    discountPrice: rawDiscountPrice > 0 ? rawDiscountPrice : null,
    stock: asNumber(data.stock),
    images: asStringArray(data.images),
    rating: asNumber(data.rating, 4.5),
    featured: asBoolean(data.featured, false),
    status: normalizeProductStatus(data.status),
    createdAt: data.createdAt as Product['createdAt'],
    updatedAt: data.updatedAt as Product['updatedAt'],
  };
}

export function mapService(id: string, data: DataRecord): Service {
  const imageRaw = asString(data.image);
  const legacyImage = asStringArray(data.images)[0] ?? '';

  return {
    id,
    title: asString(data.title),
    description: asString(data.description),
    icon: asString(data.icon || data.iconKey, 'wrench'),
    image: imageRaw || legacyImage || null,
    category: asString(data.category, 'General'),
    status: normalizeServiceStatus(data.status),
    createdAt: data.createdAt as Service['createdAt'],
    updatedAt: data.updatedAt as Service['updatedAt'],
  };
}

export function mapOrder(id: string, data: DataRecord): Order {
  return {
    id,
    orderNumber: asString(data.orderNumber, id),
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    customerName: asString(data.customerName, 'Customer'),
    items: Array.isArray(data.items) ? (data.items as Order['items']) : [],
    subtotal: asNumber(data.subtotal),
    total: asNumber(data.total),
    currency: asString(data.currency, 'INR'),
    status: (asString(data.status, 'paid') as Order['status']) || 'paid',
    shippingAddress: (data.shippingAddress ?? {}) as Order['shippingAddress'],
    payment: (data.payment ?? {}) as Order['payment'],
    timeline: Array.isArray(data.timeline) ? (data.timeline as Order['timeline']) : [],
    createdAt: data.createdAt as Order['createdAt'],
    updatedAt: data.updatedAt as Order['updatedAt'],
  };
}

export function mapPayment(id: string, data: DataRecord): PaymentTransaction {
  return {
    id,
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    orderId: asString(data.orderId),
    razorpayOrderId: asString(data.razorpayOrderId),
    razorpayPaymentId: asString(data.razorpayPaymentId),
    amount: asNumber(data.amount),
    currency: asString(data.currency, 'INR'),
    status: data.status === 'failed' ? 'failed' : 'captured',
    createdAt: data.createdAt as PaymentTransaction['createdAt'],
  };
}

export function mapUserProfile(id: string, data: DataRecord): UserProfile {
  return {
    uid: asString(data.uid, id),
    email: asString(data.email),
    displayName: asString(data.displayName, 'User'),
    role: normalizeUserRole(data.role),
    status: normalizeAccountStatus(data.status),
    orderCount: asNumber(data.orderCount),
    totalSpent: asNumber(data.totalSpent),
    createdAt: data.createdAt as UserProfile['createdAt'],
    lastLogin: data.lastLogin as UserProfile['lastLogin'],
  };
}
