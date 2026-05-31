import type { Order } from '@/lib/types';
import { toDate } from '@/lib/format';

interface InvoiceTemplateProps {
  order: Order;
}

export default function InvoiceTemplate({ order }: InvoiceTemplateProps) {
  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const gst = order.gstAmount || 0;
  const shipping = order.shippingFee || 0;
  const delivery = order.deliveryCharge || 0;
  const wallet = order.walletUsed || 0;
  const discount = order.discount || 0;
  const grandTotal = subtotal + gst + shipping + delivery - wallet - discount;

  // Format invoice date
  const invoiceDate = order.invoiceGeneratedAt
    ? toDate(order.invoiceGeneratedAt)?.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) || new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  // Format order date
  const orderDate = order.createdAt
    ? toDate(order.createdAt)?.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) || invoiceDate
    : invoiceDate;

  // Calculate GST split
  const cgst = gst / 2;
  const sgst = gst / 2;


  return (
    <div className="min-h-screen bg-[#0F172A] p-0 m-0 overflow-hidden print:p-0 print:m-0">
      {/* Invoice Container - A4 Optimized */}
      <div className="bg-white text-black mx-auto" style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
        {/* Header Section */}
        <div className="px-10 py-8 border-b-2 border-[#0F172A]">
          <div className="flex justify-between items-start mb-6">
            {/* Company Info - Left */}
            <div>
              <div className="bg-[#0F172A] text-white px-4 py-2 rounded inline-block mb-3">
                <h1 className="text-2xl font-bold">SKY TECH</h1>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-black">Sky Tech Solutions</p>
                <p>Electronics, Robotics & Software</p>
                <p>📧 support@theskytechnology.in</p>
                <p>🌐 theskytechnology.in</p>
              </div>
            </div>

            {/* Invoice Info - Right */}
            <div className="text-right">
              <div className="mb-4">
                <h2 className="text-5xl font-bold text-[#0F172A] mb-2">INVOICE</h2>
                <div className="inline-block bg-[#38BDF8] text-[#0F172A] px-4 py-2 rounded font-bold">
                  {order.invoiceNumber || 'N/A'}
                </div>
              </div>
              <div className="text-sm space-y-1 text-gray-600">
                <div>
                  <span className="font-semibold">Invoice Date: </span>
                  <span>{invoiceDate}</span>
                </div>
                <div>
                  <span className="font-semibold">Order #: </span>
                  <span>{order.orderNumber}</span>
                </div>
                <div>
                  <span className="font-semibold">Order Date: </span>
                  <span>{orderDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Section */}
        <div className="px-10 py-8 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-8">
            {/* Bill To */}
            <div>
              <h3 className="font-bold text-black mb-3 pb-2 border-b-2 border-[#0F172A]">BILL TO</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p className="font-semibold text-black">{order.customerName}</p>
                <p>{order.userEmail}</p>
                {order.customerPhone && <p>{order.customerPhone}</p>}
              </div>
            </div>

            {/* Ship To */}
            <div>
              <h3 className="font-bold text-black mb-3 pb-2 border-b-2 border-[#0F172A]">SHIP TO</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p className="font-semibold text-black">{order.customerName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="px-10 py-6 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            {/* Order Number */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">ORDER NUMBER</p>
              <p className="font-bold text-black break-all">{order.orderNumber}</p>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">PAYMENT METHOD</p>
              <p className="font-bold text-black">{order.payment?.razorpayPaymentId ? 'Online Payment' : 'Pending'}</p>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-xs text-gray-500 font-semibold mb-1">ORDER STATUS</p>
              <p className="font-bold text-black capitalize">{order.status}</p>
            </div>

            {/* Grand Total */}
            <div className="bg-[#0F172A] p-4 rounded text-white">
              <p className="text-xs text-gray-300 font-semibold mb-1">TOTAL AMOUNT</p>
              <p className="font-bold text-lg">₹{grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-10 py-8">
          <h3 className="font-bold text-black mb-4 pb-2 border-b-2 border-[#0F172A]">ORDER ITEMS</h3>
          
          {/* Table Header */}
          <div className="grid grid-cols-[40px_3fr_80px_80px_100px_100px] gap-4 mb-3 pb-3 border-b border-gray-300 bg-gray-50 p-3 -mx-3 px-3">
            <div className="text-xs font-bold text-gray-700">#</div>
            <div className="text-xs font-bold text-gray-700">PRODUCT NAME</div>
            <div className="text-xs font-bold text-gray-700 text-center">QTY</div>
            <div className="text-xs font-bold text-gray-700 text-right">UNIT PRICE</div>
            <div className="text-xs font-bold text-gray-700 text-right">DISCOUNT</div>
            <div className="text-xs font-bold text-gray-700 text-right">TOTAL</div>
          </div>

          {/* Table Rows */}
          {order.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_3fr_80px_80px_100px_100px] gap-4 py-3 border-b border-gray-100 text-sm"
            >
              <div className="text-gray-700">{index + 1}</div>
              <div className="text-gray-900 font-medium">{item.name}</div>
              <div className="text-center text-gray-700">{item.quantity}</div>
              <div className="text-right text-gray-700">₹{item.unitPrice.toFixed(2)}</div>
              <div className="text-right text-gray-700">₹{((item.unitPrice * item.quantity) - (item.lineTotal || 0)).toFixed(2)}</div>
              <div className="text-right font-semibold text-black">₹{item.lineTotal.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="px-10 py-8 border-t-2 border-[#0F172A]">
          <div className="flex justify-end mb-6">
            <div className="w-96 space-y-2">
              {/* Subtotal */}
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex justify-between text-sm py-2 text-red-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              {/* GST */}
              {gst > 0 && (
                <>
                  <div className="flex justify-between text-sm py-2">
                    <span className="text-gray-700">CGST (9%):</span>
                    <span className="font-semibold">₹{cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-200">
                    <span className="text-gray-700">SGST (9%):</span>
                    <span className="font-semibold">₹{sgst.toFixed(2)}</span>
                  </div>
                </>
              )}

              {/* Shipping */}
              {shipping > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-700">Shipping:</span>
                  <span className="font-semibold">₹{shipping.toFixed(2)}</span>
                </div>
              )}

              {/* Delivery */}
              {delivery > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-700">Delivery Charge:</span>
                  <span className="font-semibold">₹{delivery.toFixed(2)}</span>
                </div>
              )}

              {/* Wallet Used */}
              {wallet > 0 && (
                <div className="flex justify-between text-sm py-2">
                  <span className="text-gray-700">Wallet Used:</span>
                  <span className="font-semibold text-red-600">-₹{wallet.toFixed(2)}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex justify-between py-3 px-4 bg-[#0F172A] text-white rounded font-bold text-lg mt-4">
                <span>GRAND TOTAL:</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="px-10 py-6 border-t border-gray-200 bg-gray-50">
          <h3 className="font-bold text-black mb-3">NOTES</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Thank you for purchasing from Sky Tech. We appreciate your business and are committed to providing you with excellent products and services. 
            If you have any questions about this invoice, please contact us at support@theskytechnology.in.
          </p>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t-2 border-[#0F172A] flex justify-between items-end">
          {/* Payment Details */}
          <div className="text-sm text-gray-600">
            <p className="font-semibold text-black mb-2">Payment Status</p>
            <p className="capitalize">{order.payment?.status || 'pending'}</p>
            {order.payment?.razorpayPaymentId && (
              <p className="text-xs text-gray-500 mt-1">Payment ID: {order.payment.razorpayPaymentId.substring(0, 20)}...</p>
            )}
          </div>

          {/* Authorization */}
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-8">Authorized By</p>
            <div className="border-t-2 border-[#0F172A] pt-2 w-40">
              <p className="font-bold text-black text-sm">Sky Tech</p>
            </div>
          </div>
        </div>

        {/* Timestamp for reference */}
        <div className="px-10 py-4 bg-gray-100 text-xs text-gray-500 border-t border-gray-200 text-center">
          <p>This is an automatically generated invoice. Invoice ID: {order.invoiceNumber}</p>
        </div>
      </div>
    </div>
  );
}
