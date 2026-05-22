export type UserRole = 'user' | 'editor' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type ProductStatus = 'active' | 'inactive';
export type ServiceStatus = 'active' | 'inactive';
export type OrderStatus = 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'captured' | 'failed';

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

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  payment: OrderPaymentSummary;
  timeline: OrderTimelineEvent[];
  createdAt?: DateValue;
  updatedAt?: DateValue;
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

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  orderCount: number;
  totalSpent: number;
  createdAt?: DateValue;
  lastLogin?: DateValue;
}
