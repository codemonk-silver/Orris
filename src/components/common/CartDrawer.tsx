/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { X, Trash2, ShieldCheck, Ticket, ArrowRight, Truck } from 'lucide-react';
import { CartItem, Product } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (productId: string, qty: number, size?: string, color?: string) => void;
  onRemoveItem: (productId: string, size?: string, color?: string) => void;
  onCheckoutTrigger: () => void;
  onLoginTrigger: () => void;
  isLoggedIn: boolean;
  onContinueShopping?: () => void;
  onViewProduct?: (product: Product) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onCheckoutTrigger,
  onLoginTrigger,
  isLoggedIn,
  onContinueShopping,
  onViewProduct
}: CartDrawerProps) {
  // Lock body scroll of primary canvas when CartDrawer is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [isOpen]);

  const { 
    promoCode: globalPromoCode, 
    discountPercent, 
    promoSuccess, 
    promoError, 
    setPromoDiscount,
    formatPrice
  } = useAppStore();

  const [promoCode, setPromoCode] = useState(globalPromoCode || '');

  useEffect(() => {
    setPromoCode(globalPromoCode);
  }, [globalPromoCode]);

  const FREE_SHIPPING_LIMIT = 150;

  // Compile cart gross weights
  const grossSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    return Number((grossSubtotal * (discountPercent / 100)).toFixed(2));
  }, [grossSubtotal, discountPercent]);

  const finalSubtotal = useMemo(() => {
    return Math.max(0, grossSubtotal - discountAmount);
  }, [grossSubtotal, discountAmount]);

  const shippingCost = useMemo(() => {
    if (finalSubtotal === 0) return 0;
    return finalSubtotal >= FREE_SHIPPING_LIMIT ? 0 : 25;
  }, [finalSubtotal]);

  const totalSum = useMemo(() => {
    return finalSubtotal + shippingCost;
  }, [finalSubtotal, shippingCost]);

  const rawRemainingForFreeShipping = FREE_SHIPPING_LIMIT - finalSubtotal;
  const remainingForFreeShipping = Math.max(0, rawRemainingForFreeShipping);
  const freeShippingProgress = Math.min(100, (finalSubtotal / FREE_SHIPPING_LIMIT) * 100);

  // Promo checking
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.toUpperCase().trim();
    if (code === '') {
      setPromoDiscount('', 0, '', '');
      return;
    }
    if (code === 'ORRIS15') {
      setPromoDiscount(code, 15, '15% Orris Reserve Coupon Applied!', '');
    } else if (code === 'ATELIERGOLD') {
      setPromoDiscount(code, 30, '30% VIP Sovereign Coupon Applied!', '');
    } else {
      setPromoDiscount(code, 0, '', 'Rejected. This code is invalid or expired.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-neutral-900/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200 selection:bg-[#C9A96E] selection:text-black">
      {/* Background clicking dismisses */}
      <div className="flex-grow" onClick={onClose} />

      {/* Cart Container Drawer */}
      <div className="h-full w-full max-w-md bg-white p-6 md:p-8 flex flex-col justify-between shadow-none relative border-l border-[#E5E5E5] animate-in slide-in-from-right duration-300 overflow-hidden">
        
        {/* Drawer header */}
        <div className="flex flex-col flex-grow overflow-hidden min-h-0">
          <div className="flex justify-between items-center mb-6 border-b border-[#E5E5E5] pb-4 flex-shrink-0">
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-neutral-900 flex items-center gap-2">
              <span>Your Acquisition Bag</span>
              <span className="w-5 h-5 bg-neutral-100 text-[10px] font-black rounded-none flex items-center justify-center text-neutral-700 border border-[#E5E5E5]">
                {cartItems.length}
              </span>
            </h3>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-150 text-neutral-800 hover:text-black rounded-none transition-colors active:scale-95 cursor-pointer text-xs"
              title="Close drawer"
              id="close-cart-drawer-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar and notification */}
          {cartItems.length > 0 && (
            <div className="mb-6 p-4 bg-neutral-50 rounded-none border border-[#E5E5E5] text-xs flex-shrink-0">
              <div className="flex items-center gap-2 text-[#C9A96E] font-black uppercase tracking-[0.2em] text-[9px] mb-2 font-mono">
                <Truck className="w-4 h-4" />
                <span>Shipping Calibration</span>
              </div>
              {remainingForFreeShipping > 0 ? (
                <p className="text-[11px] text-neutral-600 font-bold uppercase">
                  Acquire <span className="text-black font-black font-mono">${remainingForFreeShipping}</span> more to unlock <span className="text-black font-black">Complimentary Ground Express Courier</span>.
                </p>
              ) : (
                <p className="text-[11px] text-emerald-850 font-black uppercase">
                  Sovereign tier unlocked: Ground Express Courier charges waived ($0.00).
                </p>
              )}
              {/* Progress loading strip */}
              <div className="w-full bg-neutral-200 h-1.5 rounded-none mt-3 overflow-hidden">
                <div 
                  className="bg-[#C9A96E] h-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart item catalog lists */}
          <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-250 min-h-0">
            {cartItems.length > 0 ? (
              <div className="flex flex-col gap-4">
                {cartItems.map((item, idx) => {
                  if (!item || !item.product) return null;
                  
                  const pId = item.product.id || 'unknown';
                  const sizeSfx = item.selectedSize ? `-${item.selectedSize.toLowerCase()}` : '';
                  const colorSfx = item.selectedColor ? `-${item.selectedColor.toLowerCase()}` : '';
                  const uniqueSfx = `${pId}${sizeSfx}${colorSfx}-${idx}`;

                  return (
                    <div 
                      key={uniqueSfx}
                      className="p-4 bg-white border border-neutral-200 hover:border-[#C9A96E]/50 rounded flex gap-4 transition-all shadow-sm hover:shadow-md duration-200"
                    >
                      <img 
                        src={item.product.images && item.product.images[0] ? item.product.images[0] : ''} 
                        alt={item.product.name || 'Product'}
                        className="w-20 h-24 object-cover rounded bg-neutral-100 flex-shrink-0 shadow-xs border border-neutral-200/50 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          if (onViewProduct && item.product) {
                            onViewProduct(item.product);
                            onClose();
                          }
                        }}
                      />
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 
                              onClick={() => {
                                if (onViewProduct && item.product) {
                                  onViewProduct(item.product);
                                  onClose();
                                }
                              }}
                              className="text-[13px] font-extrabold text-neutral-900 leading-snug pr-4 transition-colors hover:text-[#C9A96E] cursor-pointer"
                            >
                              {item.product.name}
                            </h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveItem(pId, item.selectedSize, item.selectedColor);
                              }}
                              className="p-1 hover:text-red-500 text-neutral-400 cursor-pointer"
                              title="Purge item slots"
                              id={`remove-cart-item-${uniqueSfx}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          {/* Selected variant details */}
                          <div className="flex flex-wrap gap-2 text-[9.5px] font-mono text-neutral-500 mt-1.5 uppercase">
                            {item.selectedSize && (
                              <span className="px-2 py-0.5 bg-neutral-50 text-neutral-700 font-bold border border-neutral-200/50 rounded-sm">Sz: {item.selectedSize}</span>
                            )}
                            {item.selectedColor && (
                              <span className="px-2 py-0.5 bg-neutral-50 text-neutral-700 font-bold border border-neutral-200/50 rounded-sm">Tone: {item.selectedColor}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-neutral-100">
                          {/* Qty edit buttons */}
                          <div className="flex items-center border border-neutral-200 rounded p-0.5 bg-white">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQty(pId, item.quantity - 1, item.selectedSize, item.selectedColor);
                              }}
                              className="w-5 h-5 text-center flex items-center justify-center font-bold text-xs select-none disabled:text-neutral-300 cursor-pointer"
                              disabled={item.quantity <= 1}
                              id={`qty-dec-${uniqueSfx}`}
                            >
                              &minus;
                            </button>
                            <span className="w-5 text-center font-mono text-[10px] select-none">{item.quantity}</span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateQty(pId, item.quantity + 1, item.selectedSize, item.selectedColor);
                              }}
                              className="w-5 h-5 text-center flex items-center justify-center font-bold text-xs select-none disabled:text-neutral-300 cursor-pointer"
                              disabled={item.quantity >= (item.product.inventory ?? 99)}
                              id={`qty-inc-${uniqueSfx}`}
                            >
                              &#43;
                            </button>
                          </div>

                          <span className="text-[13px] font-black text-neutral-950 font-mono bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded shadow-2xs">
                            {formatPrice((item.product.price ?? 0) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center my-auto">
                <div className="w-16 h-16 rounded-full border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-6 relative bg-gradient-to-b from-neutral-50/50 to-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#C9A96E]/30 animate-[spin_40s_linear_infinite]" />
                </div>

                <h3 className="text-sm font-serif font-light tracking-[0.15em] text-neutral-900 uppercase mb-3">
                  Your Acquisition Bag is Empty
                </h3>
                <p className="text-xs text-neutral-400 font-light max-w-[280px] leading-relaxed mb-8">
                  Our curated portfolios contain limited items, bespoke apparel, and architectural curiosities. Experience our current collection.
                </p>

                <button 
                  onClick={() => {
                    onClose();
                    if (onContinueShopping) {
                      onContinueShopping();
                    }
                  }}
                  className="px-6 py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 font-black text-[10px] uppercase tracking-[0.18em] rounded-none border border-black cursor-pointer shadow-sm w-full"
                  id="continue-shopping-empty-btn"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Totals compiling and checkouts */}
        {cartItems.length > 0 && (
          <div className="border-t border-[#E5E5E5] pt-6 flex-shrink-0">
            
            {/* Promo Code section */}
            <form onSubmit={handleApplyPromo} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="PROMO CODE (e.g. ORRIS15, ATELIERGOLD)"
                className="flex-grow px-3 py-2 border border-[#E5E5E5] uppercase text-[10px] font-mono outline-none focus:border-neutral-400 rounded-none bg-neutral-50/50"
                id="cart-promo-input"
              />
              <button 
                type="submit"
                className="px-4 bg-black text-[#C9A96E] hover:bg-neutral-800 text-[9px] uppercase font-black tracking-widest rounded-none flex items-center gap-1 cursor-pointer"
                id="apply-promo-btn"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
            </form>

            {promoError && (
              <p className="text-[10px] text-red-650 font-mono mb-3 font-bold uppercase">{promoError}</p>
            )}
            {promoSuccess && (
              <p className="text-[10px] text-emerald-850 font-mono mb-3 font-bold uppercase">{promoSuccess}</p>
            )}

            {/* Calculations lines */}
            <div className="flex flex-col gap-2.5 font-mono text-[10px] text-neutral-500 mb-6 font-medium">
              <div className="flex justify-between">
                <span>Gross Catalog Items</span>
                <span className="text-neutral-900 font-bold">{formatPrice(grossSubtotal)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>VIP Reserve Deductions ({discountPercent}%)</span>
                  <span className="font-bold">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Atelier Courier Shipping (Express)</span>
                <span className="text-neutral-900 font-bold">
                  {shippingCost === 0 ? 'COMPLIMENTARY' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold text-neutral-900 border-t border-[#E5E5E5] pt-3">
                <span className="text-[10px] font-mono tracking-widest font-bold uppercase">Aggregate Sovereignty Total</span>
                <span>{formatPrice(totalSum)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button 
                onClick={onCheckoutTrigger}
                className="w-full py-4 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all duration-300 font-black text-xs uppercase tracking-[0.18em] rounded-none flex items-center justify-center gap-1.5 cursor-pointer shadow-none outline-none border border-black"
                id="cart-guest-checkout-btn"
              >
                <span>PROCEED TO CHECKOUT SECURELY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center text-[9px] text-[#737373] uppercase tracking-widest mt-4 flex items-center justify-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>Secured by Stripe End-to-End Encryption</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
