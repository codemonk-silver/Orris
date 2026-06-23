/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, Eye, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../../../types';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: WishlistTab Component
 * ============================================================================
 * What is this component's purpose?
 * Displays pieces saved in the client's local wishlisted state index.
 * Allows instant check of specifications (Atelier Reserve specs), live out-of-stock
 * guards, and quick "Acquire" operations appending to checkout baskets.
 * ============================================================================
 */

interface WishlistTabProps {
  wishlistedProducts: Product[];
  onViewProduct?: (p: Product) => void;
  onToggleWishlist?: (id: string) => void;
  onAddToCart?: (product: Product, quantity: number, size?: string, color?: string) => void;
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout') => void;
  formatPrice: (price: number) => string;
}

export default function WishlistTab({
  wishlistedProducts = [],
  onViewProduct,
  onToggleWishlist,
  onAddToCart,
  setView,
  formatPrice
}: WishlistTabProps) {
  return (
    <>
      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
          {wishlistedProducts.map((p) => (
            <div key={p.id} className="bg-white border border-[#E5E5E5] p-3.5 flex flex-col justify-between hover:bg-[#FAFAFA] rounded-none transition-all duration-300">
              <div className="flex gap-4">
                <div 
                  className="relative w-16 aspect-[3/4] flex-shrink-0 bg-neutral-50 cursor-pointer overflow-hidden border border-[#E5E5E5] group"
                  onClick={() => onViewProduct && onViewProduct(p)}
                >
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                  {p.images[1] && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none">
                      <img src={p.images[1]} alt={`${p.name} Alternate`} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="truncate flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[8px] font-mono text-[#737373] uppercase tracking-widest block mb-1 font-bold">Atelier Reserve</span>
                    <h4 
                      onClick={() => onViewProduct && onViewProduct(p)}
                      className="text-xs font-black text-neutral-900 group-hover:text-black uppercase tracking-tight truncate cursor-pointer hover:underline font-sans"
                    >
                      {p.name}
                    </h4>
                    <span className="text-xs font-bold font-mono text-neutral-900 mt-1 block">{formatPrice(p.price)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${p.inventory > 0 ? (p.inventory <= 5 ? 'bg-amber-500 animate-pulse' : 'bg-green-500') : 'bg-red-500'}`} />
                    <span className="text-[8.5px] font-mono uppercase text-neutral-500 font-bold">
                      {p.inventory > 0 ? (p.inventory <= 5 ? 'Limited Stock' : 'In Stock') : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-1.5">
                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(p.id)}
                  className="text-neutral-400 hover:text-red-500 hover:bg-neutral-50 p-2 border border-[#E5E5E5] transition-colors rounded-none cursor-pointer"
                  title="Remove from saved pieces"
                  id={`wishlist-remove-${p.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                <div className="flex items-center gap-1.5 flex-grow justify-end">
                  {onViewProduct && (
                    <button
                      onClick={() => onViewProduct(p)}
                      className="px-2.5 py-1.5 text-[8.5px] font-mono uppercase border border-[#E5E5E5] bg-white hover:bg-neutral-50 transition-colors text-neutral-700 cursor-pointer flex items-center gap-1"
                      id={`wishlist-view-specs-${p.id}`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Specs</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      if (onAddToCart) {
                        const size = p.sizes[0] || 'Standard';
                        const color = p.colors[0] || 'Default';
                        onAddToCart(p, 1, size, color);
                      }
                    }}
                    disabled={p.inventory === 0}
                    className="px-3 py-1.5 text-[8.5px] font-mono uppercase bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-colors disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400 flex items-center gap-1 cursor-pointer font-bold"
                    id={`wishlist-add-cart-${p.id}`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>Acquire</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-neutral-50 border border-dashed border-neutral-200 rounded-none text-sans">
          <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <span className="text-xs font-mono text-neutral-500 block max-w-sm mx-auto leading-relaxed font-normal">
            Your curated wishlist is empty. Save luxury pieces from the digital ateliers with the Heart indicator.
          </span>
          <button 
            onClick={() => setView('shop')}
            className="mt-5 px-6 py-2 bg-black text-[#C9A96E] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#C9A96E] hover:text-black transition-colors cursor-pointer"
            id="wishlist-browse-shop-btn"
          >
            Browse digital Editions
          </button>
        </div>
      )}
    </>
  );
}
