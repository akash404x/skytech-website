'use client';

import Link from 'next/link';

interface InvoiceDownloadButtonProps {
  orderNumber: string;
  invoiceNumber?: string;
  orderId?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  text?: string;
}

export default function InvoiceDownloadButton({
  orderNumber,
  invoiceNumber,
  orderId,
  variant = 'secondary',
  size = 'md',
  showIcon = true,
  text = 'View Invoice',
}: InvoiceDownloadButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    primary: 'bg-[#38BDF8] text-[#0F172A] hover:bg-[#0EA5E9]',
    secondary: 'bg-[#1E293B] text-white hover:bg-[#334155]',
    text: 'text-[#38BDF8] hover:text-[#0EA5E9]',
  };

  const href = `/invoice-preview/${encodeURIComponent(orderNumber)}`;

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded font-semibold transition-colors ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {showIcon && (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span>{text}</span>
    </Link>
  );
}
