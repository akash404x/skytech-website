'use client';

import { useState } from 'react';
import Link from 'next/link';
import InvoiceTemplate from './InvoiceTemplate';
import { domToPng } from 'modern-screenshot';
import jsPDF from 'jspdf';
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

      const element = document.getElementById('invoice-template');
      if (!element) {
        throw new Error('Invoice template not found');
      }

      // Capture invoice using modern-screenshot with high quality
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#020617',
      });

      // Create image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // PDF dimensions
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Convert pixels to mm (96 DPI: 1mm = 3.7795px)
      const pxToMm = 0.264583;
      const imgWidthMm = img.width * pxToMm;
      const imgHeightMm = img.height * pxToMm;

      // Calculate scale to match PDF width exactly
      const scale = pdfWidth / imgWidthMm;
      const scaledWidth = pdfWidth;
      const scaledHeight = imgHeightMm * scale;

      // Position at top-left with no margin
      const imgX = 0;
      const imgY = 0;

      // Add image to PDF
      pdf.addImage(dataUrl, 'PNG', imgX, imgY, scaledWidth, scaledHeight);

      // Save PDF
      pdf.save(`Invoice-${order.orderNumber}.pdf`);
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
      const element = document.getElementById('invoice-template');
      if (!element) {
        throw new Error('Invoice template not found');
      }

      // Create a print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Unable to open print window');
      }

      // Copy the invoice content to the print window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <style>
            @page { margin: 0; size: A4; }
            body { margin: 0; padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${element.outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();

      // Wait for the content to load, then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      printWindow.onerror = () => {
        throw new Error('Failed to load print window');
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to print invoice';
      setError(errorMessage);
      console.error('Print error:', err);
    }
  };

  return (
    <div className={className}>
      <style jsx global>{`
        @media print {
          .invoice-toolbar {
            display: none !important;
          }
          .invoice-error {
            display: none !important;
          }
        }
      `}</style>

      {/* Action Toolbar */}
      <div className="flex gap-4 mb-6 invoice-toolbar print:hidden">
        <Link
          href="/orders"
          className="flex items-center gap-2 px-6 py-2 bg-[#1E293B] text-white rounded font-semibold hover:bg-[#334155] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Orders</span>
        </Link>

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

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm invoice-error print:hidden">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Invoice Template */}
      <div id="invoice-template" style={{ display: 'inline-block' }}>
        <InvoiceTemplate order={order} />
      </div>
    </div>
  );
}
