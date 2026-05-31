'use client';

import { useState } from 'react';
import InvoiceTemplate from './InvoiceTemplate';
import { downloadPDFFromHTML, printHTML } from '@/lib/pdf-utils';
import type { Order } from '@/lib/types';

interface InvoiceViewerProps {
  order: Order;
  showActions?: boolean;
  className?: string;
}

export default function InvoiceViewer({
  order,
  showActions = true,
  className = '',
}: InvoiceViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      await downloadPDFFromHTML('invoice-template', {
        filename: `Invoice-${order.orderNumber}`,
        invoiceNumber: order.invoiceNumber || 'Draft',
        scale: 2,
        quality: 0.95,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download invoice';
      setError(errorMessage);
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      setError(null);
      printHTML('invoice-template');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print invoice';
      setError(errorMessage);
      console.error('Print error:', err);
    }
  };

  return (
    <div className={className}>
      {/* Action Buttons */}
      {showActions && (
        <div className="flex gap-4 mb-6 print:hidden">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-6 py-2 bg-[#38BDF8] text-[#0F172A] rounded font-semibold hover:bg-[#0EA5E9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-[#1E293B] text-white rounded font-semibold hover:bg-[#334155] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <span>Print</span>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm print:hidden">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Invoice Template */}
      <div id="invoice-template" className="bg-white">
        <InvoiceTemplate order={order} />
      </div>
    </div>
  );
}
