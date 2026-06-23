/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Mail } from 'lucide-react';
import { Order } from '../../../types';
import { useAppStore } from '../../../store/useAppStore';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: AcquisitionsTab Component
 * ============================================================================
 * What is this component's purpose?
 * Displays past purchases (Acquisitions) belonging to the authenticated client.
 * Features:
 * - Dynamic invoice lots details and status badges
 * - "Resend Receipt" trigger proxying backend SMTP dispatches
 * - "Focus Tracker" linking order selectors to the visual dispatch tracker
 * ============================================================================
 */

interface AcquisitionsTabProps {
  myOrders: Order[];
  selectedTrackOrderId: string | null;
  handleTrackClick: (orderId: string) => void;
  triggerSecNotification: (message: string) => void;
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout') => void;
}

export default function AcquisitionsTab({
  myOrders = [],
  selectedTrackOrderId,
  handleTrackClick,
  triggerSecNotification,
  setView
}: AcquisitionsTabProps) {
  return (
    <>
      {myOrders.length > 0 ? (
        <div className="flex flex-col gap-5 text-left">
          {myOrders.map((ord) => (
            <div key={ord.id} className="bg-white border border-[#E5E5E5] rounded-none p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2 pb-4 border-b border-[#E5E5E5] mb-4 font-mono text-[10px]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-900 text-xs">ID: {ord.id}</span>
                  <span className="text-neutral-400 font-normal">Ordered: {new Date(ord.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[9px] rounded-none font-bold ${
                    ord.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    ord.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-750 border border-indigo-200' :
                    ord.status === 'PROCESSING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-neutral-50 text-neutral-600 border border-neutral-200'
                  }`}>
                    {ord.status}
                  </span>
                  <span className="bg-neutral-900 text-[#C9A96E] px-2 py-0.5 rounded-none text-[8px] font-bold border border-neutral-800">
                    {ord.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Lot catalog detail rows */}
              <div className="flex flex-col gap-4">
                {ord.items.map((it, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-neutral-50/50 p-2.5 border border-[#E5E5E5]">
                    {it.productImage && (
                      <img src={it.productImage} alt={it.productName} className="w-10 h-14 object-cover rounded-none bg-neutral-150 border border-[#E5E5E5]" />
                    )}
                    <div className="truncate flex-grow">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">{it.productName}</h4>
                      <p className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">
                        Sz: {it.size || 'Standard'} | Qty: {it.quantity}
                      </p>
                    </div>
                    <span className="font-serif font-light text-neutral-800 text-xs">${it.productPrice * it.quantity}.00</span>
                  </div>
                ))}
              </div>

              {/* Lot settlement and Tracker shortcut row */}
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 border-t border-dashed border-[#E5E5E5] pt-4 gap-3 text-[11px]">
                <span className="text-[10px] font-mono uppercase text-neutral-400">Verified Secure Transaction</span>
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto justify-between sm:justify-end font-sans">
                  <span className="text-neutral-800 font-bold font-serif text-xs shrink-0">Order Total: ${ord.total}.00</span>
                  
                  <button
                    onClick={async () => {
                      try {
                        const { resendOrderEmail } = useAppStore.getState();
                        const res = await resendOrderEmail(ord.id);
                        if (res.success) {
                          triggerSecNotification(`Acquisition receipt transmission triggered to <${ord.customerEmail}>.`);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="px-3 py-1.5 text-[9px] uppercase font-mono tracking-wider font-bold border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 duration-200 cursor-pointer flex items-center gap-1.5 inline-flex shrink-0 shadow-sm"
                    title="Send copy to my verified email"
                  >
                    <Mail className="w-3 h-3 text-[#C9A96E]" />
                    <span>Resend Receipt</span>
                  </button>

                  <button
                    onClick={() => handleTrackClick(ord.id)}
                    className={`px-3 py-1.5 text-[9px] uppercase font-mono tracking-wider font-bold border transition-all cursor-pointer shrink-0 ${
                      selectedTrackOrderId === ord.id 
                        ? 'bg-[#C9A96E] text-black border-[#C9A96E] font-black' 
                        : 'bg-black text-[#C9A96E] border-black hover:bg-[#C9A96E] hover:text-black hover:border-[#C9A96E]'
                    }`}
                  >
                    {selectedTrackOrderId === ord.id ? 'Tracking Live ✓' : 'Focus Tracker'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 border border-dashed border-neutral-200 rounded-none text-sans">
          <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto mb-3 animate-pulse" />
          <span className="text-xs font-mono text-neutral-400 block font-normal">No purchase records found in your private email logs.</span>
          <button 
            onClick={() => setView('shop')}
            className="mt-4 px-6 py-2 bg-black text-[#C9A96E] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#C9A96E] hover:text-black transition-colors cursor-pointer"
            id="profile-shop-now-btn"
          >
            Acquire first pieces
          </button>
        </div>
      )}
    </>
  );
}
