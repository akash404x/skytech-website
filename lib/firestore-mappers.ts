import type {
  AccountStatus,
  CancellationRequest,
  Chat,
  ChatMessage,
  Order,
  PaymentTransaction,
  Product,
  ProductStatus,
  ReplacementRequest,
  ReturnRequest,
  Service,
  ServiceStatus,
  UserProfile,
  UserRole,
  WalletTransaction,
  Work,
  WorkLink,
  WorkMedia,
  WorkStatus,
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

export function normalizeWorkStatus(value: unknown): WorkStatus {
  const status = asString(value).toLowerCase();
  return status === 'draft' ? 'draft' : status === 'inactive' ? 'inactive' : 'active';
}

export function mapProduct(id: string, data: DataRecord): Product {
  const rawDiscountPrice = data.discountPrice === null ? 0 : asNumber(data.discountPrice, 0);
  const imageUrlRaw = asString(data.imageUrl);
  const legacyImages = asStringArray(data.images);
  const images = imageUrlRaw ? [imageUrlRaw] : legacyImages;

  return {
    id,
    name: asString(data.name),
    description: asString(data.description),
    category: asString(data.category, 'Components'),
    price: asNumber(data.price),
    discountPrice: rawDiscountPrice > 0 ? rawDiscountPrice : null,
    stock: asNumber(data.stock),
    images,
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
    buttonText: asString(data.buttonText),
    buttonLink: asString(data.buttonLink),
    featured: asBoolean(data.featured, false),
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
    cancellationRequest: data.cancellationRequest ? (data.cancellationRequest as Order['cancellationRequest']) : undefined,
    returnRequest: data.returnRequest ? (data.returnRequest as Order['returnRequest']) : undefined,
    replacementRequest: data.replacementRequest ? (data.replacementRequest as Order['replacementRequest']) : undefined,
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

export function mapChat(id: string, data: DataRecord): Chat {
  return {
    id,
    orderId: asString(data.orderId),
    orderNumber: asString(data.orderNumber, id),
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    userName: asString(data.userName, 'Customer'),
    lastMessage: asString(data.lastMessage, ''),
    lastSender: data.lastSender === 'admin' ? 'admin' : 'user',
    lastMessageAt: data.lastMessageAt as Chat['lastMessageAt'],
    updatedAt: data.updatedAt as Chat['updatedAt'],
    status: data.status === 'resolved' ? 'resolved' : data.status === 'closed' ? 'closed' : 'open',
    unreadCount: asNumber(data.unreadCount),
    unreadForUser: asNumber(data.unreadForUser),
    createdAt: data.createdAt as Chat['createdAt'],
  };
}

export function mapChatMessage(id: string, data: DataRecord): ChatMessage {
  const attachmentUrl = asString(data.attachmentUrl);

  return {
    id,
    sender: data.sender === 'admin' ? 'admin' : 'user',
    text: asString(data.text, ''),
    attachmentUrl: attachmentUrl || undefined,
    timestamp: data.timestamp as ChatMessage['timestamp'],
    seen: data.seen === true,
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
    walletBalance: asNumber(data.walletBalance, 0),
    createdAt: data.createdAt as UserProfile['createdAt'],
    lastLogin: data.lastLogin as UserProfile['lastLogin'],
  };
}

export function mapWork(id: string, data: DataRecord): Work {
  const thumbnailRaw = asString(data.thumbnail);
  const legacyThumbnail = asStringArray(data.images)[0] ?? '';

  // Map media array if available
  const media = Array.isArray(data.media) 
    ? data.media.filter((item): item is WorkMedia => 
        typeof item === 'object' && item !== null && 
        (item.type === 'image' || item.type === 'video') && 
        typeof item.url === 'string'
      )
    : [];

  // Map links array if available
  const links = Array.isArray(data.links)
    ? data.links.filter((item): item is WorkLink =>
        typeof item === 'object' && item !== null &&
        typeof item.text === 'string' &&
        typeof item.url === 'string'
      )
    : [];

  return {
    id,
    title: asString(data.title),
    shortDescription: asString(data.shortDescription),
    fullDescription: asString(data.fullDescription),
    category: asString(data.category, 'General'),
    technologiesUsed: Array.isArray(data.technologiesUsed) ? data.technologiesUsed.map(String) : [],
    media,
    thumbnail: thumbnailRaw || legacyThumbnail || null,
    links,
    clientName: asString(data.clientName) || null,
    completionDate: data.completionDate as Work['completionDate'],
    featured: asBoolean(data.featured, false),
    status: normalizeWorkStatus(data.status),
    createdAt: data.createdAt as Work['createdAt'],
    updatedAt: data.updatedAt as Work['updatedAt'],
    // Legacy fields for backward compatibility
    images: asStringArray(data.images),
    githubLink: asString(data.githubLink) || null,
    liveDemoLink: asString(data.liveDemoLink) || null,
  };
}

export function mapCancellationRequest(id: string, data: DataRecord): CancellationRequest {
  return {
    id,
    orderId: asString(data.orderId),
    orderNumber: asString(data.orderNumber),
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    reason: asString(data.reason),
    status: (asString(data.status, 'requested') as CancellationRequest['status']) || 'requested',
    adminNotes: asString(data.adminNotes) || undefined,
    createdAt: data.createdAt as CancellationRequest['createdAt'],
    updatedAt: data.updatedAt as CancellationRequest['updatedAt'],
  };
}

export function mapReturnRequest(id: string, data: DataRecord): ReturnRequest {
  return {
    id,
    orderId: asString(data.orderId),
    orderNumber: asString(data.orderNumber),
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    reason: asString(data.reason),
    status: (asString(data.status, 'requested') as ReturnRequest['status']) || 'requested',
    adminNotes: asString(data.adminNotes) || undefined,
    createdAt: data.createdAt as ReturnRequest['createdAt'],
    updatedAt: data.updatedAt as ReturnRequest['updatedAt'],
  };
}

export function mapReplacementRequest(id: string, data: DataRecord): ReplacementRequest {
  return {
    id,
    orderId: asString(data.orderId),
    orderNumber: asString(data.orderNumber),
    userId: asString(data.userId),
    userEmail: asString(data.userEmail),
    reason: asString(data.reason),
    status: (asString(data.status, 'requested') as ReplacementRequest['status']) || 'requested',
    adminNotes: asString(data.adminNotes) || undefined,
    createdAt: data.createdAt as ReplacementRequest['createdAt'],
    updatedAt: data.updatedAt as ReplacementRequest['updatedAt'],
  };
}

export function mapWalletTransaction(id: string, data: DataRecord): WalletTransaction {
  return {
    id,
    userId: asString(data.userId),
    amount: asNumber(data.amount),
    type: (asString(data.type, 'credit') as WalletTransaction['type']) || 'credit',
    status: (asString(data.status, 'completed') as WalletTransaction['status']) || 'completed',
    orderId: asString(data.orderId) || undefined,
    paymentId: asString(data.paymentId) || undefined,
    description: asString(data.description),
    createdAt: data.createdAt as WalletTransaction['createdAt'],
  };
}
