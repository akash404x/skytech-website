import type { Order } from '@/lib/types';

interface ReceiptTemplateProps {
  order: Order;
}

export default function ReceiptTemplate({ order }: ReceiptTemplateProps) {
  // Calculate totals (display only)
  const subtotal = order.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const gst = order.gstAmount || 0;
  const shipping = order.shippingFee || 0;
  const delivery = order.deliveryCharge || 0;
  const wallet = order.walletUsed || 0;
  const discount = order.discount || 0;
  const grandTotal = subtotal + gst + shipping + delivery - wallet - discount;

  // Format dates (display only)
  const receiptDate = order.receiptGeneratedAt || order.createdAt;
  const receiptDateStr = new Date(receiptDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paymentDate = new Date(receiptDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cgst = gst / 2;
  const sgst = gst / 2;

  const paymentMethod = order.payment?.razorpayPaymentId?.includes('WALLET') ? 'Wallet' : 'Razorpay';
  const paymentId = order.payment?.razorpayPaymentId || 'N/A';

  return (
    <div className="relative overflow-hidden" style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      maxHeight: '297mm',
      background: 'linear-gradient(180deg, #000000 0%, #020617 30%, #0a0e1a 70%, #020617 100%)',
      padding: '32px'
    }}>
      {/* Radial Glow Behind Header - Stronger */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 40%, transparent 70%)',
        opacity: '0.8'
      }}></div>

      {/* Circuit Line Decorations - Top Left */}
      <div className="circuit-decoration absolute top-0 left-0 w-64 h-64 pointer-events-none">
        <svg viewBox="0 0 256 256" className="w-full h-full" style={{ width: '256px', height: '256px' }}>
          <defs>
            <filter id="glow-tl">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="node-glow-tl" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <g opacity="0.18">
            <path d="M0 0 L128 0 L128 12 L12 12 L12 128 L0 128 Z" fill="#10B981" />
            <path d="M24 24 L104 24 L104 30 L30 30 L30 104 L24 104 Z" fill="#10B981" opacity="0.7" />
            <path d="M48 48 L80 48 L80 54 L54 54 L54 80 L48 80 Z" fill="#10B981" opacity="0.5" />
            <path d="M12 64 L48 64 L48 70 L18 70 L18 88" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <path d="M64 12 L64 40 L70 40 L70 24" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <path d="M88 88 L112 88 L112 94 L92 94 L92 112" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="12" r="12" fill="url(#node-glow-tl)" filter="url(#glow-tl)" />
            <circle cx="12" cy="12" r="6" fill="#10B981" />
            <circle cx="116" cy="12" r="8" fill="url(#node-glow-tl)" filter="url(#glow-tl)" />
            <circle cx="116" cy="12" r="4" fill="#10B981" />
            <circle cx="12" cy="116" r="8" fill="url(#node-glow-tl)" filter="url(#glow-tl)" />
            <circle cx="12" cy="116" r="4" fill="#10B981" />
            <circle cx="64" cy="64" r="10" fill="url(#node-glow-tl)" filter="url(#glow-tl)" />
            <circle cx="64" cy="64" r="5" fill="#10B981" />
          </g>
        </svg>
      </div>

      {/* Circuit Line Decorations - Top Right */}
      <div className="circuit-decoration absolute top-0 right-0 w-80 h-80 pointer-events-none">
        <svg viewBox="0 0 320 320" className="w-full h-full" style={{ width: '320px', height: '320px' }}>
          <defs>
            <filter id="glow-tr">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="node-glow-tr" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <g opacity="0.18">
            <path d="M320 0 L160 0 L160 12 L308 12 L308 160 L320 160 Z" fill="#10B981" />
            <path d="M296 24 L184 24 L184 30 L288 30 L288 136 L296 136 Z" fill="#10B981" opacity="0.7" />
            <path d="M272 48 L208 48 L208 54 L264 54 L264 112 L272 112 Z" fill="#10B981" opacity="0.5" />
            <path d="M308 80 L264 80 L264 86 L296 86 L296 104" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <path d="M240 12 L240 48 L248 48 L248 24" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <circle cx="308" cy="12" r="12" fill="url(#node-glow-tr)" filter="url(#glow-tr)" />
            <circle cx="308" cy="12" r="6" fill="#10B981" />
            <circle cx="172" cy="12" r="8" fill="url(#node-glow-tr)" filter="url(#glow-tr)" />
            <circle cx="172" cy="12" r="4" fill="#10B981" />
            <circle cx="240" cy="80" r="10" fill="url(#node-glow-tr)" filter="url(#glow-tr)" />
            <circle cx="240" cy="80" r="5" fill="#10B981" />
          </g>
        </svg>
      </div>

      {/* Circuit Line Decorations - Bottom Left */}
      <div className="circuit-decoration absolute bottom-0 left-0 w-64 h-64 pointer-events-none">
        <svg viewBox="0 0 256 256" className="w-full h-full" style={{ width: '256px', height: '256px' }}>
          <defs>
            <filter id="glow-bl">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="node-glow-bl" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <g opacity="0.18">
            <path d="M0 256 L128 256 L128 244 L12 244 L12 128 L0 128 Z" fill="#10B981" />
            <path d="M24 232 L104 232 L104 226 L30 226 L30 152 L24 152 Z" fill="#10B981" opacity="0.7" />
            <path d="M48 208 L80 208 L80 202 L54 202 L54 176 L48 176 Z" fill="#10B981" opacity="0.5" />
            <path d="M12 192 L48 192 L48 186 L18 186 L18 168" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <path d="M64 244 L64 216 L70 216 L70 232" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="244" r="12" fill="url(#node-glow-bl)" filter="url(#glow-bl)" />
            <circle cx="12" cy="244" r="6" fill="#10B981" />
            <circle cx="116" cy="244" r="8" fill="url(#node-glow-bl)" filter="url(#glow-bl)" />
            <circle cx="116" cy="244" r="4" fill="#10B981" />
            <circle cx="64" cy="192" r="10" fill="url(#node-glow-bl)" filter="url(#glow-bl)" />
            <circle cx="64" cy="192" r="5" fill="#10B981" />
          </g>
        </svg>
      </div>

      {/* Circuit Line Decorations - Bottom Right */}
      <div className="circuit-decoration absolute bottom-0 right-0 w-64 h-64 pointer-events-none">
        <svg viewBox="0 0 256 256" className="w-full h-full" style={{ width: '256px', height: '256px' }}>
          <defs>
            <filter id="glow-br">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <radialGradient id="node-glow-br" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <g opacity="0.18">
            <path d="M256 256 L128 256 L128 244 L244 244 L244 128 L256 128 Z" fill="#10B981" />
            <path d="M232 232 L152 232 L152 226 L226 226 L226 152 L232 152 Z" fill="#10B981" opacity="0.7" />
            <path d="M208 208 L176 208 L176 202 L202 202 L202 176 L208 176 Z" fill="#10B981" opacity="0.5" />
            <path d="M244 192 L208 192 L208 186 L238 186 L238 168" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <path d="M192 244 L192 216 L186 216 L186 232" stroke="#10B981" strokeWidth="1.2" fill="none" />
            <circle cx="244" cy="244" r="12" fill="url(#node-glow-br)" filter="url(#glow-br)" />
            <circle cx="244" cy="244" r="6" fill="#10B981" />
            <circle cx="140" cy="244" r="8" fill="url(#node-glow-br)" filter="url(#glow-br)" />
            <circle cx="140" cy="244" r="4" fill="#10B981" />
            <circle cx="192" cy="192" r="10" fill="url(#node-glow-br)" filter="url(#glow-br)" />
            <circle cx="192" cy="192" r="5" fill="#10B981" />
          </g>
        </svg>
      </div>

      {/* Top Header Section */}
      <div className="relative z-10 receipt-header p-6 border-b border-[#1e3a5f]" style={{ background: '#0f172a', borderRadius: '8px', marginBottom: '16px' }}>
          <div className="flex justify-between items-start">
            {/* Company Branding - Left */}
            <div className="flex items-start gap-4 relative">
              {/* Logo Glow Background */}
              <div className="absolute -inset-6 pointer-events-none" style={{
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
                filter: 'blur(30px)'
              }}></div>
              
              {/* Logo */}
              <div className="flex-shrink-0 relative z-10" style={{ width: '130px' }}>
                <img 
                  src="/assets/logo/logo.png" 
                  alt="SkyTech Logo" 
                  className="w-full h-auto"
                  style={{ 
                    width: '130px',
                    filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))'
                  }}
                />
              </div>

              {/* Company Info */}
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide" style={{
                  textShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
                }}>SKY TECH</h1>
                <p className="text-[#10B981] text-sm font-medium mt-1" style={{
                  textShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
                }}>Innovate. Integrate. Elevate.</p>
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '16px', height: '16px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>Prayagraj, Uttar Pradesh, India</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '16px', height: '16px' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>+915334357055</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '16px', height: '16px' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <span>contact@theskytechnology.in</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '16px', height: '16px' }}>
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <span>theskytechnology.in</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Title & Details - Right */}
            <div className="text-right relative">
              {/* RECEIPT Title Ambient Light */}
              <div className="absolute -inset-12 pointer-events-none" style={{
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.2) 0%, transparent 60%)',
                filter: 'blur(35px)'
              }}></div>
              
              <h2 className="text-7xl font-bold text-white tracking-wider mb-3 relative z-10" style={{
                textShadow: '0 0 40px rgba(16, 185, 129, 0.7), 0 0 80px rgba(16, 185, 129, 0.4)'
              }}>RECEIPT</h2>
              
              {/* Receipt Details Card */}
              <div className="receipt-info bg-[#1e293b] border border-[#10B981]/30 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Receipt #</span>
                  <span className="text-[#10B981] font-bold text-sm">{order.receiptNumber || order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Order #</span>
                  <span className="text-white font-medium text-xs">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Receipt Date</span>
                  <span className="text-white font-medium text-xs">{receiptDateStr}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="billing-shipping-section p-6 border-b border-[#1e3a5f]">
          <div className="grid grid-cols-2 gap-6">
            {/* Bill To Card */}
            <div className="billing-section bg-[#1e293b] border border-[#10B981]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '20px', height: '20px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h3 className="text-[#10B981] font-bold text-base">BILL TO</h3>
              </div>
              <div className="space-y-1">
                <p className="text-white font-semibold text-sm">{order.customerName}</p>
                <p className="text-gray-400 text-xs">{order.userEmail}</p>
                {order.customerPhone && <p className="text-gray-400 text-xs">{order.customerPhone}</p>}
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="payment-section bg-[#1e293b] border border-[#10B981]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '20px', height: '20px' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <h3 className="text-[#10B981] font-bold text-base">PAYMENT DETAILS</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Payment Method</span>
                  <span className="text-white font-medium text-xs">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Payment Date</span>
                  <span className="text-white font-medium text-xs">{paymentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Payment ID</span>
                  <span className="text-white font-medium text-xs">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Status</span>
                  <span className="text-[#10B981] font-bold text-xs">PAID</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="receipt-table p-6 border-b border-[#1e3a5f]">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_100px_100px] gap-3 mb-3 pb-3 border-b-2 border-[#10B981]/30">
            <div className="text-[#10B981] font-bold text-xs">#</div>
            <div className="text-[#10B981] font-bold text-xs">DESCRIPTION</div>
            <div className="text-[#10B981] font-bold text-xs text-center">TYPE</div>
            <div className="text-[#10B981] font-bold text-xs text-center">QTY</div>
            <div className="text-[#10B981] font-bold text-xs text-right">UNIT PRICE</div>
            <div className="text-[#10B981] font-bold text-xs text-right">AMOUNT</div>
          </div>

          {/* Table Rows */}
          {order.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-[40px_1fr_80px_80px_100px_100px] gap-3 py-3 border-b border-[#1e3a5f]/50 text-xs"
            >
              <div className="text-gray-400 flex items-center">{index + 1}</div>
              <div className="text-white">
                <div className="flex items-start gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981] flex-shrink-0" style={{ width: '20px', height: '20px' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.category}</p>
                  </div>
                </div>
              </div>
              <div className="text-gray-400 text-center flex items-center justify-center">Product</div>
              <div className="text-white text-center flex items-center justify-center">{item.quantity}</div>
              <div className="text-white text-right flex items-center justify-end">₹{item.unitPrice.toFixed(2)}</div>
              <div className="text-[#10B981] font-bold text-right flex items-center justify-end">₹{(item.unitPrice * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Bottom Section: Notes and Summary */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Notes Section - Left */}
            <div className="receipt-notes bg-[#1e293b] border border-[#10B981]/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#10B981]" style={{ width: '20px', height: '20px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3 className="text-[#10B981] font-bold text-base">IMPORTANT NOTE</h3>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-2">
                ⚠️ This is a Payment Receipt, not a Tax Invoice.
              </p>
              <p className="text-gray-400 text-xs leading-relaxed mb-2">
                This document confirms that payment has been received.
              </p>
              <p className="text-[#10B981] text-xs leading-relaxed font-semibold">
                Your Tax Invoice will be generated after your order is confirmed by our team.
              </p>
            </div>

            {/* Summary Total Card - Right */}
            <div className="receipt-totals bg-[#1e293b] border border-[#10B981]/20 rounded-lg p-4">
              <div className="space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {/* CGST */}
                {gst > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">CGST (9%)</span>
                    <span className="text-white font-medium">₹{cgst.toFixed(2)}</span>
                  </div>
                )}

                {/* SGST */}
                {gst > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">SGST (9%)</span>
                    <span className="text-white font-medium">₹{sgst.toFixed(2)}</span>
                  </div>
                )}

                {/* Shipping */}
                {shipping > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Shipping</span>
                    <span className="text-white font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                )}

                {/* Delivery */}
                {delivery > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Delivery</span>
                    <span className="text-white font-medium">₹{delivery.toFixed(2)}</span>
                  </div>
                )}

                {/* Wallet Used */}
                {wallet > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Wallet Used</span>
                    <span className="text-red-400 font-medium">-₹{wallet.toFixed(2)}</span>
                  </div>
                )}

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Discount</span>
                    <span className="text-green-400 font-medium">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-[#10B981]/30">
                  <span className="text-[#10B981] font-bold text-lg">TOTAL</span>
                  <span className="text-[#10B981] font-bold text-xl">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="receipt-signature mt-6 flex justify-end">
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-2">Authorized By</p>
              <img
                src="/signature.png"
                alt="Authorized Signature"
                style={{
                  width: '160px',
                  height: 'auto',
                  objectFit: 'contain',
                  margin: '10px auto',
                  display: 'block'
                }}
              />
              <p className="text-white font-semibold text-sm mt-1">Sky Tech</p>
            </div>
          </div>
        </div>
    </div>
  );
}
