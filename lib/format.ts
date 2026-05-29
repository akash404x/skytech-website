import type { DateValue, OrderStatus } from './types';

export function formatCurrency(value: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: DateValue) {
  const date = toDate(value);
  if (!date) return 'Not available';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toDate(value: DateValue): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if ('toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  if ('seconds' in value && typeof value.seconds === 'number') {
    return new Date(value.seconds * 1000);
  }
  return null;
}

export function orderStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    cancellation_requested: 'Cancellation Requested',
    cancellation_rejected: 'Cancellation Rejected',
  };

  return labels[status];
}

export function statusBadgeClass(status: OrderStatus) {
  const classes: Record<OrderStatus, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-amber-100 text-amber-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    cancellation_requested: 'bg-yellow-100 text-yellow-700',
    cancellation_rejected: 'bg-orange-100 text-orange-700',
  };

  return classes[status];
}
