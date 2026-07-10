export type UserRole = 'user' | 'editor' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type ProductStatus = 'active' | 'inactive';
export type ServiceStatus = 'active' | 'inactive';
export type WorkStatus = 'active' | 'inactive' | 'draft';
export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'cancellation_requested' | 'cancellation_rejected';
export type PaymentStatus = 'captured' | 'failed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type CancellationStatus = 'requested' | 'approved' | 'rejected';
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'completed';
export type ReplacementStatus = 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'completed';
export type WalletTransactionType = 'credit' | 'debit';
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed';
export type EmailStatus = 'pending' | 'sent' | 'failed';
export type NotificationType = 'order_placed' | 'order_confirmed' | 'order_packed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'return_approved' | 'replacement_approved' | 'wallet_credited';
export type CouponDiscountType = 'fixed' | 'percentage';
export type CouponStatus = 'active' | 'used' | 'expired';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'product' | 'service' | 'work';
export type ApprovalAction = 'create' | 'update' | 'delete';

export type DateValue =
  | Date
  | string
  | number
  | {
      seconds: number;
      nanoseconds?: number;
    }
  | {
      toDate: () => Date;
    }
  | null
  | undefined;

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  images: string[];
  rating: number;
  featured: boolean;
  status: ProductStatus;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string | null;
  category: string;
  buttonText?: string;
  buttonLink?: string;
  featured: boolean;
  status: ServiceStatus;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface CartItem {
  productId: string;
  name: string;
  category: string;
  image: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem extends CartItem {
  unitPrice: number;
  lineTotal: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  description: string;
  createdAt: DateValue;
}

export interface OrderPaymentSummary {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

export interface CancellationRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  reason: string;
  status: CancellationStatus;
  adminNotes?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  reason: string;
  status: ReturnStatus;
  adminNotes?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface ReplacementRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  reason: string;
  status: ReplacementStatus;
  adminNotes?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  orderId?: string;
  paymentId?: string;
  description: string;
  createdAt?: DateValue;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  gstAmount?: number;
  gstPercentage?: number;
  shippingFee?: number;
  deliveryCharge?: number;
  discount?: number;
  walletUsed?: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  payment: OrderPaymentSummary;
  timeline: OrderTimelineEvent[];
  cancellationRequest?: CancellationRequest;
  returnRequest?: ReturnRequest;
  replacementRequest?: ReplacementRequest;
  refundProcessed?: boolean;
  refundAmount?: number;
  refundProcessedAt?: DateValue;
  invoiceNumber?: string;
  invoiceUrl?: string;
  invoiceGeneratedAt?: DateValue;
  receiptNumber?: string;
  receiptUrl?: string;
  receiptGeneratedAt?: DateValue;
  createdAt?: DateValue;
  updatedAt?: DateValue;
  // Coupon-related fields
  couponCode?: string | null;
  discountAmount?: number;
  couponApplied?: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt?: DateValue;
}

export type ChatStatus = 'open' | 'resolved' | 'closed';

export interface Chat {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  lastSender: 'admin' | 'user';
  lastMessageAt?: DateValue;
  updatedAt?: DateValue;
  status: ChatStatus;
  unreadCount: number;
  unreadForUser: number;
  createdAt?: DateValue;
}

export interface ChatMessage {
  id: string;
  sender: 'admin' | 'user';
  text: string;
  attachmentUrl?: string;
  timestamp?: DateValue;
  seen: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  orderCount: number;
  totalSpent: number;
  walletBalance: number;
  createdAt?: DateValue;
  lastLogin?: DateValue;
}

export interface WorkMedia {
  type: 'image' | 'video';
  url: string;
}

export interface WorkLink {
  text: string;
  url: string;
}

export interface Work {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  technologiesUsed: string[];
  media: WorkMedia[];
  thumbnail: string | null;
  links: WorkLink[];
  clientName: string | null;
  completionDate: DateValue | null;
  featured: boolean;
  status: WorkStatus;
  createdAt?: DateValue;
  updatedAt?: DateValue;
  // Legacy fields for backward compatibility
  images?: string[];
  githubLink?: string | null;
  liveDemoLink?: string | null;
}

export interface GSTSettings {
  enabled: boolean;
  percentage: number;
}

export interface ShippingSettings {
  shippingFee: number;
  freeShippingAbove: number;
}

export interface DeliverySettings {
  enabled: boolean;
  charge: number;
}

export interface EmailLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  userEmail: string;
  subject: string;
  template: string;
  status: EmailStatus;
  error?: string;
  sentAt?: DateValue;
  createdAt?: DateValue;
}

export interface NotificationLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId?: string;
  userEmail: string;
  type: NotificationType;
  status: EmailStatus;
  data?: Record<string, unknown>;
  error?: string;
  sentAt?: DateValue;
  createdAt?: DateValue;
}

export interface Review {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  name: string;
  designation: string;
  profileImage?: string;
  productId?: string;
  productName?: string;
  orderId?: string;
  orderNumber?: string;
  rating: number;
  content: string;
  review?: string;
  reviewType: 'general' | 'product';
  verifiedPurchase: boolean;
  status: ReviewStatus;
  approvedBy?: string;
  approvedAt?: DateValue;
  adminNotes?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  expiryDate?: DateValue;
  status: CouponStatus;
  maxUses?: number;
  usedCount?: number;
  usedBy?: string;
  usedOrderId?: string;
  usedAt?: DateValue;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface PaymentReceipt {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  receiptNumber: string;
  transactionId: string;
  paymentId: string;
  customerName: string;
  customerPhone?: string;
  billingAddress: ShippingAddress;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentDate: DateValue;
  amount: number;
  tax: number;
  grandTotal: number;
  currency: string;
  status: 'paid';
  pdfUrl?: string;
  createdAt?: DateValue;
  // Payment summary fields to match receipt preview
  subtotal: number;
  cgst: number;
  sgst: number;
  shippingFee: number;
  deliveryCharge: number;
  walletUsed: number;
  items: OrderItem[];
}

export interface Invoice {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  billingAddress: ShippingAddress;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  gstAmount?: number;
  gstPercentage?: number;
  shippingFee?: number;
  deliveryCharge?: number;
  discount?: number;
  total: number;
  currency: string;
  invoiceDate: DateValue;
  dueDate?: DateValue;
  status: 'generated' | 'sent';
  pdfUrl?: string;
  createdAt?: DateValue;
  updatedAt?: DateValue;
}

export interface ApprovalRequest {
  id: string;
  type: ApprovalType;
  action: ApprovalAction;
  documentId: string | null;
  newData: Record<string, unknown>;
  oldData: Record<string, unknown>;
  requestedBy: {
    uid: string;
    name: string;
    email: string;
  };
  status: ApprovalStatus;
  createdAt?: DateValue;
  approvedBy?: string | null;
  approvedAt?: DateValue | null;
  rejectedReason?: string | null;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp?: DateValue;
}
