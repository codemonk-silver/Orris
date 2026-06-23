/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { X, Star, ShoppingBag, Truck, Gift, RefreshCw, Send, AlertTriangle, ChevronDown, Shield } from 'lucide-react';
import { Product, Category, Review } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  categories: Category[];
  allProducts: Product[];
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  onUpdateReviews: (productId: string, updatedReviews: Review[]) => void;
  onViewProduct: (product: Product) => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  categories,
  allProducts,
  onAddToCart,
  onUpdateReviews,
  onViewProduct
}: ProductDetailModalProps) {
  // Lock body scroll when product details modal is open
  React.useEffect(() => {
    if (product) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [product]);

  const { formatPrice } = useAppStore();

  const modalWrapperRef = React.useRef<HTMLDivElement>(null);

  // Active Gallery Image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // Selector Options
  const [selectedSize, setSelectedSize] = useState(product ? (product.sizes[0] || '') : '');
  const [selectedColor, setSelectedColor] = useState(product ? (product.colors[0] || '') : '');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Reset and scroll to top when active product changes
  React.useEffect(() => {
    if (product) {
      if (modalWrapperRef.current) {
        modalWrapperRef.current.scrollTop = 0;
      }
      setActiveImageIndex(0);
      setActiveAccordion(null);
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
      setItemQuantity(1);
    }
  }, [product?.id]);

  // Interactive review submission states
  const [formName, setFormName] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Compile related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id && p.isActive)
      .slice(0, 3);
  }, [allProducts, product]);

  // Aggregate current active category info
  const productCategory = useMemo(() => {
    if (!product) return 'Private Edit';
    return categories.find(c => c.id === product.categoryId)?.name || 'Private Edit';
  }, [categories, product]);

  // Aggregate average ratings
  const reviewStats = useMemo(() => {
    if (!product) return { avg: 5.0, count: 0 };
    const list = product.reviews || [];
    if (list.length === 0) return { avg: 5.0, count: 0 };
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return {
      avg: Number((sum / list.length).toFixed(1)),
      count: list.length
    };
  }, [product?.reviews]);

  if (!product) return null;

  // Submit custom review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    const newReview: Review = {
      id: `rev-gen-${Date.now()}`,
      productId: product.id,
      userId: 'user-guest-client',
      userName: formName,
      rating: formRating,
      comment: formComment,
      createdAt: new Date().toISOString()
    };

    const currentReviews = product.reviews || [];
    const updatedReviews = [newReview, ...currentReviews];
    onUpdateReviews(product.id, updatedReviews);

    // Reset fields
    setFormName('');
    setFormRating(5);
    setFormComment('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const handleAcquireClick = () => {
    onAddToCart(product, itemQuantity, selectedSize || undefined, selectedColor || undefined);
    setItemQuantity(1);
    onClose();
  };

  return (
    <div 
      ref={modalWrapperRef}
      className="fixed inset-0 z-[100000] overflow-y-auto bg-neutral-900/40 backdrop-blur-sm flex justify-center items-start py-10 px-4 select-none selection:bg-[#C9A96E] selection:text-black"
    >
      <div className="bg-white w-full max-w-5xl rounded-none shadow-none relative border border-[#E5E5E5] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Controls */}
        <div className="absolute top-5 right-5 z-10">
          <button 
            onClick={onClose}
            className="p-2.5 bg-neutral-150 hover:bg-neutral-200 text-neutral-800 hover:text-black rounded-none border border-[#E5E5E5] shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
            title="Dismiss detail canvas"
            id="close-specs-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Side: Advanced Image Galleries */}
          <div className="p-6 md:p-8 bg-neutral-50/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E5E5]">
            <div className="relative aspect-[3/4] bg-neutral-105 rounded-none overflow-hidden border border-[#E5E5E5]">
              <img 
                src={product.images[activeImageIndex] || product.images[0]} 
                alt={`${product.name} view`}
                className="w-full h-full object-cover transition-all duration-500 transform hover:scale-[1.01]"
                id="specs-main-view-image"
              />
            </div>
            {/* Gallery Selector Thumbs */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 bg-neutral-100 rounded-none overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeImageIndex ? 'border-[#C9A96E]' : 'border-[#E5E5E5] opacity-60 hover:opacity-100'
                    }`}
                    id={`specs-thumb-btn-${idx}`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Credential banners */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#E5E5E5] pt-6 text-center text-[9px] font-mono tracking-widest text-[#737373]">
              <div className="flex flex-col items-center">
                <Truck className="w-4 h-4 text-neutral-400 mb-1" />
                <span>COURIER POST</span>
              </div>
              <div className="flex flex-col items-center border-x border-[#E5E5E5]">
                <Gift className="w-4 h-4 text-neutral-400 mb-1" />
                <span>SIGNATURE WRAP</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw className="w-4 h-4 text-neutral-400 mb-1" />
                <span>EASY RETREAT</span>
              </div>
            </div>
          </div>

          {/* Right Side: Specifications and Customizers */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Breadcrumb line */}
              <div className="text-[10px] tracking-widest uppercase font-mono text-neutral-400 mb-2">
                <span>Orris</span>
                <span className="mx-1.5">/</span>
                <span>{productCategory}</span>
              </div>

              <h2 className="text-2.5xl md:text-3.5xl font-black uppercase tracking-tight text-neutral-900 leading-tight pr-8">
                {product.name}
              </h2>

              <div className="flex items-center gap-2 mt-4 pb-6 border-b border-[#E5E5E5]">
                <span className="text-xl font-bold text-neutral-950 font-mono">{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="text-sm text-neutral-400 line-through font-mono">{formatPrice(product.compareAtPrice)}</span>
                )}
                <div className="flex items-center gap-1.5 ml-4 border-l border-[#E5E5E5] pl-4 text-xs font-mono">
                  <Star className="w-3.5 h-3.5 fill-[#C9A96E] text-[#C9A96E]" />
                  <span className="text-neutral-900 font-bold">{reviewStats.avg}</span>
                  <span className="text-neutral-400 font-light">({reviewStats.count} review{reviewStats.count !== 1 ? 's' : ''})</span>
                </div>
              </div>

              {/* Rich detail specification description */}
              <p className="text-xs text-[#737373] font-light mt-6 leading-relaxed">
                {product.description}
              </p>

              {/* Luxury Craftsmanship Collapsible Accordions */}
              <div className="mt-6 border-t border-[#E5E5E5] pt-2">
                {[
                  {
                    id: 'materials',
                    label: 'Atelier Materials & Composure',
                    content: product.categoryId === 'watches' 
                      ? 'Engineered with a 25-jewel Swiss chronometric caliber, scratch-resistant anti-reflective sapphire watch crystal, and 18-karat Sovereign gold ion electroplating. Formulated to resist up to 50 meters of depth atmospheric variance.'
                      : product.categoryId === 'fragrance'
                      ? 'Blended using rare vintage ambergris extracts, Grasse white rose distillate infusions, and raw premium resin base molecular compounds. Meticulously poured in small, numbered private reserve decanters.'
                      : 'Structured from high-density heavy architectural canvas fibers, combined with active structural breathability, finished with masterfully hand-woven double-lock reinforcement seams.'
                  },
                  {
                    id: 'care',
                    label: 'Maintenance & Care Preservation',
                    content: 'To preserve the pristine tactile and structural calibration of your Orris acquisition, we advise storage in temperate climates within its dedicated satin-lined dust chest. Clean gently using dry optical chamois cloths only. Avoid contact with abrasive textures.'
                  },
                  {
                    id: 'shipping',
                    label: 'Dispatch & Sovereign Logistics',
                    content: 'Each dispatch is safely nested in a high-security signature presentation chest and insured end-to-end. Ground Courier services are processed in Switzerland and US logistics hubs. Requires a secure double-signature on delivery hand-off.'
                  }
                ].map((item) => {
                  const isOpen = activeAccordion === item.id;
                  return (
                    <div key={item.id} className="border-b border-[#E5E5E5]">
                      <button
                        type="button"
                        onClick={() => setActiveAccordion(isOpen ? null : item.id)}
                        className="w-full py-3.5 flex justify-between items-center text-left text-[10px] tracking-wider uppercase font-mono text-neutral-800 hover:text-[#C9A96E] transition-colors focus:outline-none cursor-pointer"
                        id={`accordion-btn-${item.id}`}
                      >
                        <span className="font-bold flex items-center gap-2">
                          <Shield className="w-3.5 h-3.5 text-[#C9A96E]" />
                          {item.label}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C9A96E]' : ''}`} />
                      </button>
                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 pb-4' : 'max-h-0'}`}>
                        <p className="text-[11px] text-[#737373] leading-relaxed font-light pl-5">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sizes section selector */}
              {product.sizes.length > 0 && (
                <div className="mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-2 font-mono">
                    Select Calibration / Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4.5 py-2.5 text-xs font-mono border rounded-none min-w-[50px] transition-all duration-300 cursor-pointer ${
                          sz === selectedSize 
                            ? 'bg-black text-white border-black font-bold' 
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-[#E5E5E5]'
                        }`}
                        id={`size-select-btn-${sz}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color selector section */}
              {product.colors.length > 0 && (
                <div className="mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#737373] block mb-2 font-mono">
                    Aura Tone Choice
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        className={`px-4 py-2 border rounded-none text-xs transition-all duration-300 cursor-pointer ${
                          col === selectedColor 
                            ? 'bg-black text-white border-black font-bold' 
                            : 'bg-white hover:bg-neutral-50 text-neutral-700 border-[#E5E5E5]'
                        }`}
                        id={`color-select-btn-${col}`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic stock visualizer meter */}
              <div className="mt-7 p-3 bg-neutral-55 rounded-none border border-[#E5E5E5] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {product.inventory === 0 ? (
                    <>
                      <div className="w-2.5 h-2.5 bg-red-650 rounded-none animate-ping" />
                      <span className="font-mono text-red-650 font-bold uppercase">Sold Out Complet</span>
                    </>
                  ) : product.inventory <= 5 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="font-black text-amber-850 block text-[11px] uppercase tracking-tight">Extreme Stock Depletion</span>
                        <span className="text-[10px] text-neutral-550 font-mono font-bold">Only {product.inventory} units remain in atelier shelves.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 bg-emerald-600 rounded-none" />
                      <span className="text-neutral-700 font-mono uppercase text-[10px] font-bold">Atelier Shelves: <span className="text-black font-black">{product.inventory}</span> units available.</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Assemble and Acquire interactive cart trigger */}
            <div className="mt-8 border-t border-[#E5E5E5] pt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E5E5E5] rounded-none h-[50px] bg-neutral-50 p-0.5">
                  <button 
                    onClick={() => setItemQuantity(prev => Math.max(1, prev - 1))}
                    disabled={product.inventory === 0 || itemQuantity <= 1}
                    className="w-10 text-center hover:bg-white h-full text-sm font-bold selection:bg-none rounded-none outline-none cursor-pointer"
                    id="specs-qty-dec-btn"
                  >
                    &minus;
                  </button>
                  <span className="w-10 text-center text-xs font-mono font-black">{itemQuantity}</span>
                  <button 
                    onClick={() => setItemQuantity(prev => Math.min(product.inventory, prev + 1))}
                    disabled={product.inventory === 0 || itemQuantity >= product.inventory}
                    className="w-10 text-center hover:bg-white h-full text-sm font-bold selection:bg-none rounded-none outline-none cursor-pointer"
                    id="specs-qty-inc-btn"
                  >
                    &#43;
                  </button>
                </div>

                <button 
                  onClick={handleAcquireClick}
                  disabled={product.inventory === 0}
                  className="flex-grow h-[50px] bg-[#0F0F0F] hover:bg-[#C9A96E] hover:text-black text-[#C9A96E] font-black text-xs uppercase tracking-[0.18em] transition-all duration-300 rounded-none flex items-center justify-center gap-2 cursor-pointer shadow-none disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed border border-black"
                  id="specs-assemble-acquire-btn"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.inventory === 0 ? 'Sold Out' : 'Assemble & Acquire Pack'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews and Submission Portal */}
        <div className="p-6 md:p-8 bg-neutral-50/50 border-t border-[#E5E5E5] grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Reviews List Column */}
          <div className="md:col-span-2">
            <h3 className="text-xs uppercase tracking-[0.2em] font-black text-neutral-900 border-b border-[#E5E5E5] pb-3 mb-4">
              Sensory Feedback logs ({product.reviews?.length || 0})
            </h3>
            
            <div className="flex flex-col gap-5 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-200">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-4 border border-[#E5E5E5] rounded-none">
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className="text-xs font-black text-neutral-900 uppercase tracking-tight block">{rev.userName}</span>
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-neutral-250 fill-neutral-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono font-bold">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] font-light leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-neutral-400 text-xs font-mono font-bold uppercase">
                  No sensory records logged. Submit your evaluation to establish notes.
                </div>
              )}
            </div>
          </div>

          {/* New Review Submission form (Interactive reviews!) */}
          <div className="bg-white p-5 rounded-none border border-[#E5E5E5]/90">
            <h4 className="text-xs uppercase tracking-widest font-black mb-4 text-neutral-900 border-b border-[#E5E5E5] pb-2.5">
              Submit Scent/Spec Evaluation
            </h4>

            {reviewSubmitted ? (
              <div className="py-8 text-center text-emerald-800 bg-emerald-50 rounded-none border border-emerald-100 p-4 animate-pulse">
                <CheckCircle2Icon className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <span className="text-xs font-black uppercase tracking-widest">Feedback Dispatched</span>
                <p className="text-[10px] text-emerald-600 mt-1">Approved for synchronization logs.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-400 block mb-1 font-bold">Your Name</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Baron von Roth"
                    className="w-full px-3 py-2 border border-[#E5E5E5] outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 hover:bg-white rounded-none"
                    id="review-name-input"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-400 block mb-1 font-bold">Scale Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setFormRating(num)}
                        className="p-1 cursor-pointer"
                        id={`review-star-rate-btn-${num}`}
                      >
                        <Star className={`w-5 h-5 transition-all ${num <= formRating ? 'fill-[#C9A96E] text-[#C9A96E] scale-105' : 'text-neutral-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-400 block mb-1 font-bold">Evaluation Comment</label>
                  <textarea 
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    rows={3}
                    required
                    placeholder="Detail weight, smell longevity, metal weave..."
                    className="w-full px-3 py-2 border border-[#E5E5E5] outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 hover:bg-white rounded-none resize-none"
                    id="review-comment-input"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black border border-black font-black text-[9px] uppercase tracking-[0.2em] rounded-none flex items-center justify-center gap-1.5 cursor-pointer shadow-none transition-colors"
                  id="review-dispatch-btn"
                >
                  <Send className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Dispatch evaluation</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Related curations carousel banner */}
        {relatedProducts.length > 0 && (
          <div className="p-6 md:p-8 border-t border-neutral-150">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 mb-6 font-mono">
              Complementary Atelier Suggestions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => {
                    // Update main modal visual
                    setActiveImageIndex(0);
                    setSelectedSize(p.sizes[0] || '');
                    setSelectedColor(p.colors[0] || '');
                    setItemQuantity(1);
                    onViewProduct(p);
                  }}
                  className="cursor-pointer bg-neutral-50 p-3 rounded group hover:bg-white border border-neutral-100 transition-all flex items-center gap-4"
                  id={`complementary-suggestion-${p.id}`}
                >
                  <div className="relative w-14 h-18 flex-shrink-0 overflow-hidden rounded">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    {p.images[1] && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none">
                        <img src={p.images[1]} alt={`${p.name} Alternate`} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-neutral-900 group-hover:underline truncate w-40">{p.name}</h4>
                    <span className="text-[10px] text-[#C9A96E] font-serif font-light block mt-1">{formatPrice(p.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline fallback icon to prevent loading errors
function CheckCircle2Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
