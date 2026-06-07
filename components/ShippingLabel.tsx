import { Printer } from 'lucide-react';
import type { Order } from '@/lib/types';

interface ShippingLabelProps {
  order: Order;
}

export default function ShippingLabel({ order }: ShippingLabelProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('shipping-label-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${order.orderNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .label {
            border: 2px solid #000;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
          }
          .section {
            margin-bottom: 15px;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .section-content {
            font-size: 16px;
            line-height: 1.4;
          }
          .address-line {
            margin: 2px 0;
          }
          .tracking-info {
            background: #f0f0f0;
            padding: 10px;
            border: 1px solid #000;
            margin-top: 20px;
          }
          .tracking-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          .tracking-number {
            font-size: 20px;
            font-weight: bold;
            color: #000;
          }
          @media print {
            body {
              padding: 0;
            }
            .label {
              border: 2px solid #000;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="tech-glass-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Shipping Label</h3>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          <Printer className="h-4 w-4" />
          Print Label
        </button>
      </div>

      <div id="shipping-label-content" className="hidden">
        <div className="label">
          <div className="header">
            <h1>SKYTECH</h1>
            <p>Order: {order.orderNumber}</p>
          </div>

          <div className="section">
            <div className="section-title">Ship To:</div>
            <div className="section-content">
              <div className="address-line" style={{ fontWeight: 'bold', fontSize: '18px' }}>
                {order.shippingAddress.fullName}
              </div>
              <div className="address-line">{order.shippingAddress.houseNo}</div>
              <div className="address-line">{order.shippingAddress.street}</div>
              <div className="address-line">{order.shippingAddress.landmark}</div>
              <div className="address-line">{order.shippingAddress.city}</div>
              <div className="address-line">Post Office: {order.shippingAddress.postOffice}</div>
              <div className="address-line">District: {order.shippingAddress.district}</div>
              <div className="address-line">{order.shippingAddress.state} - {order.shippingAddress.pinCode}</div>
              <div className="address-line" style={{ marginTop: '10px' }}>
                Mobile: {order.shippingAddress.mobile}
              </div>
              {order.shippingAddress.alternateMobile && (
                <div className="address-line">Alt: {order.shippingAddress.alternateMobile}</div>
              )}
            </div>
          </div>

          {order.trackingNumber && (
            <div className="tracking-info">
              <div className="section-title">Tracking Information</div>
              <p>
                <strong>Courier:</strong> {order.courierName}
              </p>
              <p>
                <strong>Tracking Number:</strong>
              </p>
              <p className="tracking-number">{order.trackingNumber}</p>
            </div>
          )}

          <div className="section" style={{ marginTop: '20px', borderTop: '1px solid #000', paddingTop: '10px' }}>
            <div className="section-title">Order Details</div>
            <div className="section-content">
              <p style={{ margin: '5px 0' }}>Items: {order.items.length}</p>
              <p style={{ margin: '5px 0' }}>Total: ₹{order.total.toFixed(2)}</p>
              <p style={{ margin: '5px 0' }}>Status: {order.status.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-cyan-500/30 bg-slate-900/80 p-4">
        <div className="mb-3 text-sm font-semibold text-cyan-300">Preview</div>
        <div className="space-y-2 text-sm text-slate-300">
          <div>
            <span className="font-semibold text-white">Name:</span>
            <p className="mt-1">{order.shippingAddress.fullName}</p>
          </div>
          <div>
            <span className="font-semibold text-white">Address:</span>
            <p className="mt-1">{order.shippingAddress.houseNo}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.landmark}</p>
          </div>
          <div>
            <span className="font-semibold text-white">Post Office:</span>
            <p className="mt-1">{order.shippingAddress.postOffice}</p>
          </div>
          <div>
            <span className="font-semibold text-white">District:</span>
            <p className="mt-1">{order.shippingAddress.district}</p>
          </div>
          <div>
            <span className="font-semibold text-white">State:</span>
            <p className="mt-1">{order.shippingAddress.state}</p>
          </div>
          <div>
            <span className="font-semibold text-white">PIN:</span>
            <p className="mt-1">{order.shippingAddress.pinCode}</p>
          </div>
          <div>
            <span className="font-semibold text-white">Mobile:</span>
            <p className="mt-1">{order.shippingAddress.mobile}</p>
          </div>
          {order.shippingAddress.alternateMobile && (
            <div>
              <span className="font-semibold text-white">Alternate Mobile:</span>
              <p className="mt-1">{order.shippingAddress.alternateMobile}</p>
            </div>
          )}
          {order.trackingNumber && (
            <div className="mt-3 rounded border border-green-500/30 bg-green-500/10 p-3">
              <div className="font-semibold text-green-300">Tracking Information</div>
              <p className="mt-1 text-sm text-slate-300">
                <span className="font-semibold text-white">Courier:</span> {order.courierName}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                <span className="font-semibold text-white">Tracking Number:</span>{' '}
                <span className="font-mono font-bold text-green-400">{order.trackingNumber}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
