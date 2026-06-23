/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Eye, Mail, X, RefreshCw, Printer, Download } from 'lucide-react';
import { Order, OrderStatus } from '../../../types';
import { useAppStore } from '../../../store/useAppStore';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: OrdersTab Component
 * ============================================================================
 * What is this component's purpose?
 * Provides central command over client transactions, shipping, and routing.
 * Features an elegant Inspection Panel that shows real-time status tracks
 * and exports raw payloads (JSON) directly using client-side Blobs.
 *
 * Localized States:
 * Includes local search queries and full modal overlays, keeping Parent files
 * tidy of transient visual toggles!
 * ============================================================================
 */

interface OrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  triggerNotification: (message: string) => void;
}

export default function OrdersTab({
  orders,
  onUpdateOrderStatus,
  triggerNotification
}: OrdersTabProps) {
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // New Administrative filters state
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Interactive private notes state
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Lock body scrolling when selectedOrder inspection overlay is active
  React.useEffect(() => {
    if (selectedOrder) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      // Load stored internal curator note
      const savedNote = localStorage.getItem(`orris-order-notes-${selectedOrder.id}`) || '';
      setOrderNotes(savedNote);

      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [selectedOrder]);

  const handleSaveNotes = () => {
    if (selectedOrder) {
      localStorage.setItem(`orris-order-notes-${selectedOrder.id}`, orderNotes);
      triggerNotification(`SUCCESS: Curator notes saved for ${selectedOrder.id}`);
    }
  };

  // Update order's payment status using the central setOrders capability
  const handleUpdatePaymentStatus = (orderId: string, paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, paymentStatus } : o);
    useAppStore.getState().setOrders(updated);
    triggerNotification(`SUCCESS: Settled ${orderId} billing status to ${paymentStatus}`);
    
    // Also sync the inspect modal if matches
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus });
    }
  };

  // Bulk billing ledger spreadsheet generator
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'Order ID,Date,Name,Email,Total,Payment Status,Fulfillment Status,Address Coordinates,Items count\n';
    orders.forEach(o => {
      const escapedName = `"${o.customerName.replace(/"/g, '""')}"`;
      const escapedEmail = `"${o.customerEmail.replace(/"/g, '""')}"`;
      const zip = o.shippingAddress?.postalCode || '';
      const fullAddress = `"${[
        o.shippingAddress?.line1 || '',
        o.shippingAddress?.city || '',
        o.shippingAddress?.state || '',
        zip,
        o.shippingAddress?.country || ''
      ].filter(Boolean).join(', ').replace(/"/g, '""')}"`;
      
      const row = `${o.id},${new Date(o.createdAt).toLocaleDateString()},${escapedName},${escapedEmail},${o.total},${o.paymentStatus},${o.status},${fullAddress},${o.items.length}\n`;
      csvContent += row;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orris-ledger-report-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification("SUCCESS: All billing records exported in CSV format.");
  };

  // Elegant print receipt renderer
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>INVOICE - ${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #111; line-height: 1.5; background-color: #fff; }
            .header { border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px; text-align: center; }
            .title { font-size: 21px; font-weight: bold; letter-spacing: 3px; }
            .subtitle { font-size: 10px; margin-top: 5px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 11px; }
            .section-title { font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 4px; margin-top: 30px; margin-bottom: 12px; font-size: 13px; letter-spacing: 1px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 8px 4px; font-size: 11px; }
            th { border-bottom: 1px solid #111; text-transform: uppercase; font-weight: bold; }
            td { border-bottom: 1px dashed #ddd; }
            .totals { text-align: right; margin-top: 25px; font-weight: bold; font-size: 13px; border-top: 1px solid #111; padding-top: 10px; }
            .footer-note { margin-top: 60px; font-size: 9px; text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">O R R I S  A T E L I E R</div>
            <div class="subtitle">Official Invoice Record Segment • Paris • Tokyo • New York</div>
          </div>
          <div class="meta">
            <div>
              <strong>ORDER ID:</strong> ${order.id}<br/>
              <strong>DATE:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br/>
              <strong>FULFILLMENT:</strong> ${order.status}<br/>
              <strong>PAYMENT STATUS:</strong> ${order.paymentStatus}
            </div>
            <div>
              <strong>DELIVER TO:</strong><br/>
              ${order.customerName}<br/>
              ${order.customerEmail}<br/>
              ${order.shippingAddress?.line1 || ''}<br/>
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}<br/>
              ${order.shippingAddress?.country || ''}
            </div>
          </div>
          <div class="section-title">SPECIFICATION of PURCHASE LOTS</div>
          <table>
            <thead>
              <tr>
                <th>Item Specification</th>
                <th>Size</th>
                <th>Color</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                   <td>${item.size || 'Default'}</td>
                   <td>${item.color || 'Default'}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">$${item.productPrice}.00</td>
                  <td style="text-align: right;">$${item.productPrice * item.quantity}.00</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            AGGREGATE CHARGES: $${order.total}.00 USD
          </div>
          <div class="footer-note">
            This checkout segment constitutes confirmation of transaction. Direct enquiries to support@orris-atelier.com
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compile orders matching search parameters & multi filters
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase());
        
      const matchesFulfillment = fulfillmentFilter === 'ALL' || o.status === fulfillmentFilter;
      const matchesPayment = paymentFilter === 'ALL' || o.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesFulfillment && matchesPayment;
    });
  }, [orders, orderSearch, fulfillmentFilter, paymentFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col xl:flex-row justify-between xl:items-baseline gap-4 border-b border-neutral-200 pb-5 text-left">
        <div>
          <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Fulfillment desk</span>
          <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-[#0F0F0F]">Orders Ledger & Warehouses</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-neutral-200"
            title="Download Billing ledger in CSV spread format"
            id="order-export-ledger-csv-btn"
          >
            <Download className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Export Ledger CSV</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <input 
              type="text" 
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Query name or emails..."
              className="pl-8 pr-4 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded"
              id="admin-order-search"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3.5 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded cursor-pointer"
            id="admin-order-fulfillment-filter"
          >
            <option value="ALL">All Fulfillments</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3.5 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded cursor-pointer"
            id="admin-order-payment-filter"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-neutral-100 p-6 rounded shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-white">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] font-mono uppercase tracking-widest text-[#737373] bg-neutral-50">
                <th className="p-3">Order ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Consignee Customer</th>
                <th className="p-3">Lots Details</th>
                <th className="p-3">Settlement</th>
                <th className="p-3 text-center">Fulfillment States</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                  <td className="p-3 font-mono font-bold text-neutral-900">{ord.id}</td>
                  <td className="p-3 font-mono text-zinc-400">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-neutral-900 block">{ord.customerName}</span>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">{ord.customerEmail}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-1 max-w-[200px] truncate font-mono text-[10px]">
                      {ord.items.map((it, idx) => (
                        <span key={idx}>• {it.quantity}x {it.productName} ({it.size || 'Unconf'})</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 font-mono">
                    <span className="font-serif font-semibold text-neutral-900 block">${ord.total}.00</span>
                    <select
                      value={ord.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value as any)}
                      className={`mt-1 bg-white border outline-none font-mono text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        ord.paymentStatus === 'PAID' ? 'text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50' :
                        ord.paymentStatus === 'REFUNDED' ? 'text-neutral-500 border-neutral-200 bg-neutral-50 hover:bg-neutral-100' :
                        'text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                      }`}
                      id={`order-payment-control-${ord.id}`}
                    >
                      <option value="UNPAID">UNPAID</option>
                      <option value="PAID">PAID</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <div className="relative inline-block w-40">
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className={`w-full appearance-none pr-8 pl-3 py-1.5 outline-none font-mono font-semibold text-[10px] border rounded text-center cursor-pointer ${
                          ord.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border-emerald-250' :
                          ord.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-850 border-indigo-250' :
                          ord.status === 'PROCESSING' ? 'bg-amber-50 text-amber-850 border-amber-250' :
                          'bg-neutral-100 text-neutral-600 border-neutral-255'
                        }`}
                        id={`order-status-control-${ord.id}`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 inline-flex shadow-sm"
                      title="Inspect Order line items and full coordinates details"
                      id={`inspect-order-btn-${ord.id}`}
                    >
                      <Eye className="w-3 h-3 text-[#C9A96E]" />
                      <span>Inspect</span>
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          const { resendOrderEmail } = useAppStore.getState();
                          const result = await resendOrderEmail(ord.id);
                          if (result.success) {
                            triggerNotification(`Acquisition receipt dispatched successfully to <${ord.customerEmail}>`);
                          }
                        } catch (e) {
                          console.error('Error triggering resend:', e);
                        }
                      }}
                      className="bg-neutral-900 hover:bg-[#C9A96E] hover:text-black hover:border-[#C9A96E] border border-neutral-800 text-[#C9A96E] text-[9px] uppercase tracking-wider font-mono font-bold px-2 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1 inline-flex shadow-sm"
                      title="Resend receipt email via SMTP network"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Notify Client</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Elegant Order Inspection Overlay Modal Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#E5E5E5] p-6 max-w-2xl w-full shadow-2xl relative rounded-none flex flex-col max-h-[90vh]"
              id="order-inspect-drawer-container"
            >
              {/* Header */}
              <div className="text-left flex justify-between items-start border-b border-neutral-100 pb-4 mb-4">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A96E] font-bold block mb-1">Lot Fulfillment Digest</span>
                  <h3 className="text-sm font-bold text-neutral-900 font-mono">Invoice Reference ID: {selectedOrder.id}</h3>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Dispatched: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="text-neutral-400 hover:text-black border border-transparent hover:border-neutral-200 p-1 transition-all cursor-pointer"
                  id="order-inspect-drawer-close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-5 flex-grow pr-1 text-left">
                {/* Interactive Visual Fulfillment Tracker Bar */}
                <div className="bg-neutral-50 border border-neutral-150 p-4">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#A3A3A3] block mb-3 font-bold">Consignment Dispatch Status</span>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-[8%] right-[8%] top-1/2 -translate-y-1/2 h-[2px] bg-neutral-200 z-0">
                      <div 
                        className="h-full bg-[#C9A96E] transition-all duration-500" 
                        style={{ 
                          width: selectedOrder.status === 'DELIVERED' ? '100%' : 
                                 selectedOrder.status === 'SHIPPED' ? '66%' : 
                                 selectedOrder.status === 'PROCESSING' ? '33%' : '0%' 
                        }}
                      />
                    </div>

                    {[
                      { key: 'PENDING', label: 'Payment Checked' },
                      { key: 'PROCESSING', label: 'In Pack' },
                      { key: 'SHIPPED', label: 'In Transit' },
                      { key: 'DELIVERED', label: 'Consigned' }
                    ].map((step, idx) => {
                      const isPastOrCurrent = 
                        step.key === selectedOrder.status ||
                        (selectedOrder.status === 'DELIVERED') ||
                        (selectedOrder.status === 'SHIPPED' && step.key !== 'DELIVERED') ||
                        (selectedOrder.status === 'PROCESSING' && step.key === 'PENDING');
                      return (
                        <div key={step.key} className="flex flex-col items-center relative z-10 animate-fade-in">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono text-[8.5px] font-extrabold ${
                            isPastOrCurrent ? 'bg-[#0F0F0F] text-[#C9A96E] border-black' : 'bg-white text-neutral-400 border-neutral-200'
                          }`}>
                            {idx + 1}
                          </div>
                          <span className={`text-[8px] font-mono uppercase tracking-wide mt-1.5 font-bold ${
                            isPastOrCurrent ? 'text-neutral-900 border-b border-[#C9A96E]/40' : 'text-neutral-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Consignee Profile Card info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-neutral-150 p-4 shadow-sm">
                    <span className="text-[8px] font-mono uppercase tracking-widest text-[#737373] block mb-2 font-bold font-sans">Consignee Customer Profile</span>
                    <span className="text-xs font-bold text-neutral-900 block">{selectedOrder.customerName}</span>
                    <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">{selectedOrder.customerEmail}</span>
                    <span className="text-[10px] text-neutral-500 block mt-3">Address Coordinates:</span>
                    <p className="text-[10px] text-neutral-800 leading-relaxed max-w-xs uppercase font-mono mt-0.5 bg-neutral-50 p-2 border border-neutral-100">
                      {selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}, {selectedOrder.shippingAddress?.country}
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-150 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-[#737373] block mb-2 font-bold font-sans">Settlement audit ledger</span>
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-neutral-400">Status Check</span>
                        <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 uppercase rounded">
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline text-xs mt-2.5">
                        <span className="text-neutral-400">Gateway Channel</span>
                        <span className="font-mono text-[9px] text-[#737373] uppercase font-bold">Stripe Live Secure Gateway</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-neutral-200 pt-2.5 mt-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[9px] uppercase font-bold font-mono tracking-wider text-neutral-900">Aggregate Total</span>
                        <span className="text-sm font-bold text-neutral-950 font-serif">${selectedOrder.total}.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items ledger list */}
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#737373] block mb-2 font-bold font-sans">Specification of Items ledger</span>
                  <div className="border border-neutral-200 divide-y divide-neutral-100">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex gap-4 p-3 hover:bg-neutral-50/50">
                        {item.productImage && (
                          <img src={item.productImage} alt={item.productName} className="w-10 h-12 object-cover border border-neutral-200 shadow-sm shrink-0" />
                        )}
                        <div className="flex-grow flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-neutral-900 block uppercase tracking-wide text-[11px]">{item.productName}</span>
                            <div className="flex gap-3 text-[9px] font-mono text-neutral-400 uppercase mt-0.5">
                              <span>Size: <b className="text-neutral-700">{item.size || 'Default'}</b></span>
                              <span>Color: <b className="text-neutral-700">{item.color || 'Default'}</b></span>
                            </div>
                          </div>
                          <div className="text-right font-mono text-[10px] font-bold">
                            <span>{item.quantity}x</span>
                            <span className="text-neutral-400 ml-1">@</span>
                            <span className="text-neutral-800 ml-1">${item.productPrice}.00</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curator Notes widget section */}
                <div className="bg-amber-50/40 border border-amber-200/60 p-4 rounded-sm">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-amber-800 block mb-1.5 font-bold">Internal Curator Notes (Private Office)</span>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Enter dispatch tracking links, shipping carriers, direct client instructions, or specific notes..."
                    className="w-full h-16 max-h-24 p-2 border border-amber-200 outline-none focus:border-amber-400 text-[11px] font-mono bg-white text-neutral-850"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-[#C9A96E] text-[#C9A96E] hover:text-neutral-900 font-mono text-[9px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                    >
                      Save Curator Notes
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Tools */}
              <div className="border-t border-neutral-150 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0">
                <button 
                  type="button"
                  onClick={async () => {
                    try {
                      const { resendOrderEmail } = useAppStore.getState();
                      const result = await resendOrderEmail(selectedOrder.id);
                      if (result.success) {
                        triggerNotification(`Receipt dispatched to client <${selectedOrder.customerEmail}> successfully.`);
                      }
                    } catch (e) {
                      console.error('[DRAWER EMAIL SEND ERR]', e);
                    }
                  }}
                  className="py-2.5 bg-neutral-950 font-mono text-[8.5px] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-extrabold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Mail Receipt</span>
                </button>

                <button 
                  type="button"
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="py-2.5 bg-neutral-100 hover:bg-neutral-200 font-mono text-[8.5px] text-neutral-800 font-extrabold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer border border-neutral-300"
                >
                  <Printer className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Print Invoice</span>
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    const dossierJson = JSON.stringify(selectedOrder, null, 2);
                    const blob = new Blob([dossierJson], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dossier-invoice-${selectedOrder.id}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    triggerNotification(`Exported transaction dossier payload: ${selectedOrder.id}`);
                  }}
                  className="py-2.5 bg-white border border-neutral-200 text-neutral-800 hover:border-black font-mono text-[8.5px] font-extrabold uppercase tracking-widest transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Payload JSON</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
