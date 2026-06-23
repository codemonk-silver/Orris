/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CheckCircle2, Award, Sparkles, Flame, ShieldCheck, Heart, X, Mail } from 'lucide-react';
import { Category, Product } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface HomepageProps {
  categories: Category[];
  products: Product[];
  onSelectCategory: (categorySlug: string | null) => void;
  onViewProduct: (product: Product) => void;
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout') => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
}

const skeletonPulseVariants = {
  loading: {
    opacity: [0.35, 0.7, 0.35],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const MemoizedProductCard = React.memo<{
  p: Product;
  onViewProduct: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted: boolean;
}>(function MemoizedProductCard({ p, onViewProduct, onToggleWishlist, isWishlisted }) {
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const { formatPrice } = useAppStore();

  const hasSecondary = !!p.images[1];
  const isFullyLoaded = primaryLoaded && (!hasSecondary || secondaryLoaded);

  return (
    <div 
      onClick={() => onViewProduct(p)}
      className="group cursor-pointer flex flex-col justify-between border border-[#E5E5E5]/40 p-3 hover:bg-[#FAFAFA] transition-colors"
      id={`bestseller-card-${p.id}`}
    >
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-5 rounded-none border border-[#E5E5E5]/50">
        {/* Skeleton pulse loading background */}
        {!isFullyLoaded && (
          <motion.div 
            className="absolute inset-0 bg-neutral-200 z-10"
            variants={skeletonPulseVariants}
            animate="loading"
          />
        )}

        <motion.img 
          src={p.images[0]} 
          alt={p.name}
          onLoad={() => setPrimaryLoaded(true)}
          onError={() => setPrimaryLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isFullyLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />

        {/* Secondary Image Swap on Hover (only rendered once primary is loaded) */}
        {p.images[1] && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out">
            <img 
              src={p.images[1]} 
              alt={`${p.name} detail`}
              onLoad={() => setSecondaryLoaded(true)}
              onError={() => setSecondaryLoaded(true)}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Subtle Darkening Hover Overlay */}
        {isFullyLoaded && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
        )}

        {/* Wishlist Heart Toggle */}
        {onToggleWishlist && isFullyLoaded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#E5E5E5] flex items-center justify-center transition-all duration-305 hover:bg-white hover:scale-110 shadow-sm cursor-pointer"
            title={isWishlisted ? "Remove from wishlist" : "Save to private wishlist"}
            id={`wishlist-toggle-featured-${p.id}`}
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isWishlisted 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-neutral-500 hover:text-red-500'
              }`} 
            />
          </button>
        )}
        
        {/* Quick acquisition tag info */}
        {isFullyLoaded && (
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
            {p.compareAtPrice && p.compareAtPrice > p.price ? (
              <span className="bg-[#B91C1C] text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none font-mono">
                Save {Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 105)}%
              </span>
            ) : p.compareAtPrice ? (
              <span className="bg-[#1F1F1F] text-[#C9A96E] text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none font-mono">
                Special Value
              </span>
            ) : null}
            {p.inventory <= 3 && (
              <span className="bg-amber-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none font-mono">
                Only {p.inventory} Left
              </span>
            )}
          </div>
        )}

        {isFullyLoaded && (
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button 
              className="w-full bg-[#0F0F0F] text-[#C9A96E] font-bold text-[9px] uppercase tracking-widest py-3 hover:bg-white hover:text-black rounded-none shadow-lg cursor-pointer transition-colors"
              onClick={(e) => { e.stopPropagation(); onViewProduct(p); }}
              id={`bestseller-quick-view-${p.id}`}
            >
              Acquire details
            </button>
          </div>
        )}
      </div>

      <div>
        {!isFullyLoaded ? (
          <div className="flex flex-col gap-1.5 mt-1">
            <motion.div 
              className="h-2 bg-neutral-200 w-1/4 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
            <motion.div 
              className="h-3 bg-neutral-200 w-3/4 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
            <motion.div 
              className="h-2.5 bg-neutral-200 w-1/3 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[8px] text-[#737373] uppercase tracking-[0.2em] font-bold font-mono block">
              {p.colors[0] || 'Atelier Private Reserve'}
            </span>
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-tight mt-1 group-hover:text-black line-clamp-1 transition-colors">
              {p.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-neutral-900 font-mono">{formatPrice(p.price)}</span>
              {p.compareAtPrice && (
                <span className="text-xs text-[#737373] line-through font-mono">{formatPrice(p.compareAtPrice)}</span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.p.id === nextProps.p.id &&
    prevProps.p.price === nextProps.p.price &&
    prevProps.p.inventory === nextProps.p.inventory &&
    prevProps.isWishlisted === nextProps.isWishlisted
  );
});

const MemoizedNewArrivalCard = React.memo<{
  p: Product;
  onViewProduct: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isWishlisted: boolean;
  categories: Category[];
}>(function MemoizedNewArrivalCard({ p, onViewProduct, onToggleWishlist, isWishlisted, categories }) {
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const { formatPrice } = useAppStore();

  const hasSecondary = !!p.images[1];
  const isFullyLoaded = primaryLoaded && (!hasSecondary || secondaryLoaded);

  return (
    <div 
      onClick={() => onViewProduct(p)}
      className="cursor-pointer min-w-[280px] w-[280px] bg-white p-4 border border-[#E5E5E5] rounded-none group flex flex-col justify-between hover:bg-[#FAFAFA] transition-colors"
      id={`new-arrival-belt-${p.id}`}
    >
      <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden mb-4 rounded-none border border-[#E5E5E5]/40">
        {!isFullyLoaded && (
          <motion.div 
            className="absolute inset-0 bg-neutral-200 z-10"
            variants={skeletonPulseVariants}
            animate="loading"
          />
        )}

        <motion.img 
          src={p.images[0]} 
          alt={p.name}
          onLoad={() => setPrimaryLoaded(true)}
          onError={() => setPrimaryLoaded(true)}
          initial={{ opacity: 0 }}
          animate={{ opacity: isFullyLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        />

        {p.images[1] && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none">
            <img 
              src={p.images[1]} 
              alt={`${p.name} detail`}
              onLoad={() => setSecondaryLoaded(true)}
              onError={() => setSecondaryLoaded(true)}
              className="w-full h-full object-cover animate-in fade-in duration-300"
            />
          </div>
        )}

        <span className="absolute top-3 left-3 text-[8px] uppercase tracking-widest font-mono px-2 py-0.5 bg-[#0F0F0F] text-[#C9A96E] font-bold z-10">
          Just Arrived
        </span>

        {/* Wishlist Heart Toggle */}
        {onToggleWishlist && isFullyLoaded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-[#E5E5E5] flex items-center justify-center transition-all duration-305 hover:bg-white hover:scale-110 shadow-sm cursor-pointer"
            title={isWishlisted ? "Remove from wishlist" : "Save to private wishlist"}
            id={`wishlist-toggle-new-${p.id}`}
          >
            <Heart 
              className={`w-3.5 h-3.5 transition-colors ${
                isWishlisted 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-neutral-500 hover:text-red-500'
              }`} 
            />
          </button>
        )}
      </div>

      <div>
        {!isFullyLoaded ? (
          <div className="flex flex-col gap-1.5">
            <motion.div 
              className="h-2.5 bg-neutral-200 w-1/3 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
            <motion.div 
              className="h-3 bg-neutral-200 w-2/3 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
            <motion.div 
              className="h-2.5 bg-neutral-200 w-1/4 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[8px] uppercase tracking-[0.2em] font-black text-[#737373] block mb-1">
              {categories.find(c => c.id === p.categoryId)?.name || 'Private Edit'}
            </span>
            <h3 className="text-xs font-black text-neutral-900 group-hover:text-black uppercase tracking-tight line-clamp-1 mt-1 transition-colors">
              {p.name}
            </h3>
            <p className="text-xs text-neutral-900 mt-1 font-bold font-mono">{formatPrice(p.price)}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.p.id === nextProps.p.id &&
    prevProps.isWishlisted === nextProps.isWishlisted &&
    prevProps.categories.length === nextProps.categories.length
  );
});

export default function Homepage({
  categories,
  products,
  onSelectCategory,
  onViewProduct,
  setView,
  wishlist = [],
  onToggleWishlist
}: HomepageProps) {
  const { showToast } = useAppStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Newsletter Session-Popup Modal states
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [popupEmail, setPopupEmail] = useState('');
  const [popupSubscribed, setPopupSubscribed] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('orris-newsletter-popup-dismissed');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowPromoPopup(true);
      }, 2500); // Elegant 2.5s delay
      return () => clearTimeout(timer);
    }
  }, []);

  // Lock body scrolling when newsletter subscriber overlay is open
  useEffect(() => {
    if (showPromoPopup) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [showPromoPopup]);

  const handleClosePopup = () => {
    setShowPromoPopup(false);
    localStorage.setItem('orris-newsletter-popup-dismissed', 'true');
  };

  const handlePopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(popupEmail)) {
      setPopupSubscribed(true);
      localStorage.setItem('orris-newsletter-popup-dismissed', 'true');
      setTimeout(() => {
        setShowPromoPopup(false);
      }, 2000);
    } else {
      showToast('Please enter a valid email address');
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured && p.isActive);
  const newArrivals = products.slice().reverse().filter(p => p.isActive).slice(0, 6);

  // Curate display categories: Apparel, Eyewear, Atelier Jewelry, and Fragrance (four premium portals).
  const displayCategories = React.useMemo(() => {
    const catApparel = categories.find(c => c.slug === 'clothing');
    const catEyewear = categories.find(c => c.slug === 'eyewear');
    const catJewelry = categories.find(c => c.slug === 'jewelry');
    const catPerfume = categories.find(c => c.slug === 'perfumes');
    
    const curated = [];
    if (catApparel) curated.push(catApparel);
    if (catEyewear) curated.push(catEyewear);
    if (catJewelry) curated.push(catJewelry);
    if (catPerfume) curated.push(catPerfume);
    
    if (curated.length >= 4) {
      return curated;
    }
    return categories.slice(0, 4);
  }, [categories]);

  // Preload secondary images for featured products to completely eliminate hover flicker
  useEffect(() => {
    featuredProducts.forEach((p) => {
      if (p.images && p.images[1]) {
        const img = new Image();
        img.src = p.images[1];
      }
    });
  }, [featuredProducts]);

  const handleNewsletterJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(newsletterEmail)) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    } else {
      showToast('Please enter a valid email address');
    }
  };

  // Luxury slide assets
  const HERO_SLIDES = [
    {
      title: 'ORRIS EAU DE PARFUM',
      subtitle: 'AN OLFACTORY MANIFESTO',
      desc: 'Rare black iris handpresses, smoldering sacred wood concretes, and dark reserve cedarwood. A fragrance created for the bold non-conformist.',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1400',
      actionText: 'Acquire Signature Scent',
      catSlug: 'perfumes'
    }
  ];

  const slide = HERO_SLIDES[0];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yCard = useTransform(scrollYProgress, [0, 1], ["0px", "-50px"]);

  return (
    <div className="w-full bg-[#FAFAFA] text-[#1A1A1A] selection:bg-[#C9A96E] selection:text-black">
      
      {/* Editorial Parallax Hero Banner */}
      <section ref={heroRef} className="relative h-[85vh] md:h-[90vh] w-full flex items-end overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <motion.img 
            src={slide.image} 
            alt={slide.title}
            style={{ y: yBg }}
            className="absolute inset-x-0 top-0 w-full h-[120%] object-cover opacity-70 origin-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F]/95 via-[#0F0F0F]/45 to-transparent" />
        </div>
 
        {/* Huge blocky typography overlay background */}
        <motion.h1 
          style={{ y: yText }}
          className="absolute top-10 md:top-16 left-6 md:left-12 text-[100px] sm:text-[140px] lg:text-[160px] leading-[0.8] font-black text-white tracking-tighter mix-blend-overlay opacity-25 select-none uppercase font-sans"
        >
          ESSENCE
        </motion.h1>
 
        {/* Left aligned high-impact content block */}
        <div className="relative text-left px-8 md:px-16 pb-16 md:pb-24 max-w-4xl z-10 select-none">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C9A96E] font-bold mb-4 animate-pulse">
            {slide.subtitle}
          </p>
          <h2 className="text-4xl sm:text-6xl lg:text-7.5xl font-extrabold tracking-tight mb-6 text-white leading-none font-sans uppercase">
            ORRIS EAU <span className="font-serif italic font-light lowercase">de</span> <span className="font-serif italic font-light">PARFUM</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-300 font-light max-w-xl mb-10 leading-relaxed">
            {slide.desc}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <button 
              onClick={() => { onSelectCategory(slide.catSlug); setView('shop'); }}
              className="bg-[#0F0F0F] text-white px-10 py-4.5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#C9A96E] hover:text-black transition-colors rounded-none cursor-pointer duration-300"
              id="hero-buy-perfume-btn"
            >
              {slide.actionText}
            </button>
            <div className="hidden sm:block h-[1px] w-16 bg-white opacity-40"></div>
            <button 
              onClick={() => { onSelectCategory(null); setView('shop'); }}
              className="text-white hover:text-[#C9A96E] font-semibold text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer"
              id="hero-all-collections-btn"
            >
              Browse Collections
            </button>
          </div>
        </div>
 
        {/* Top-Right Glassmorphism Featured Card Overlay from design HTML */}
        <motion.div 
          style={{ y: yCard }}
          className="absolute top-10 right-10 hidden lg:flex flex-col gap-4 items-end z-20"
        >
          <div className="bg-black/40 backdrop-blur-md p-6 border border-white/15 rounded-none max-w-xs transition-all duration-300 hover:border-white/30">
            <div className="text-[#C9A96E] text-[9px] uppercase tracking-[0.2em] font-bold mb-2">Featured Item</div>
            <div className="text-white font-extrabold text-base tracking-tight">ORRIS NOIR EDP</div>
            <div className="text-white/60 text-[11px] font-serif italic mb-3">Smoky Vetiver & Black Oud</div>
            <div className="text-[#C9A96E] font-bold text-sm font-mono">$185.00</div>
          </div>
        </motion.div>

        <div className="absolute bottom-6 right-10 text-[9px] text-neutral-400 font-mono uppercase tracking-widest flex items-center gap-2">
          <span>Scroll down for seasonal edit</span>
          <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full animate-ping" />
        </div>
      </section>

      {/* Trust & Craft Grid Credentials */}
      <section className="border-y border-neutral-100 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <Award className="w-5 h-5 text-[#C9A96E] mb-3" />
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900 mb-1">UNCOMPROMISING QUALITY</span>
            <span className="text-[11px] text-neutral-500 max-w-xs">Strictly premium raw-cuts, artisanal glass blowings, and Swiss time mechanics.</span>
          </div>
          <div className="flex flex-col items-center border-y md:border-y-0 md:border-x border-neutral-100 py-6 md:py-0">
            <Sparkles className="w-5 h-5 text-[#C9A96E] mb-3" />
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900 mb-1">DIRECT FROM ATELIER</span>
            <span className="text-[11px] text-neutral-500 max-w-xs">By bypassing standard luxury markups, we deliver absolute craftsmanship honestly.</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-[#C9A96E] mb-3" />
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-900 mb-1">CLIMATE OPTIMIZED SHIPPING</span>
            <span className="text-[11px] text-neutral-500 max-w-xs">Compensated zero-emission courier transits packed completely in recycled paper.</span>
          </div>
        </div>
      </section>

      {/* Featured Collections Bento Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#E5E5E5]">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-black">Curated Portals</span>
          <h2 className="text-3.5xl md:text-5xl font-black tracking-tighter text-neutral-900 mt-2 uppercase">The Atelier Houses</h2>
          <div className="h-[1px] w-16 bg-[#C9A96E] mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {displayCategories.map((cat, idx) => (
            <div 
              key={cat.id}
              onClick={() => { onSelectCategory(cat.slug); setView('shop'); }}
              className="group relative cursor-pointer overflow-hidden rounded-none border border-[#E5E5E5] bg-neutral-100 aspect-[3/4] transition-colors hover:bg-white md:col-span-1"
              id={`featured-cat-bento-${cat.slug}`}
            >
              <img 
                src={cat.image} 
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#C9A96E] font-bold mb-1.5 inline-block">0{idx + 1} // FEATURED SELECTION</span>
                <h3 className="text-2xl font-black tracking-tight uppercase mb-2">{cat.name}</h3>
                <p className="text-[11px] text-neutral-300 font-light line-clamp-2 mb-4 leading-relaxed">{cat.description}</p>
                <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 group-hover:text-[#C9A96E] transition-colors">
                  Explore Collection <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bestsellers Spotlight Staggered Grid */}
      <section className="py-24 bg-white border-y border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 pb-6 border-b border-[#E5E5E5]">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Iconic Signatures
              </span>
              <h2 className="text-3xl md:text-4.5xl font-black tracking-tighter text-neutral-900 mt-2 uppercase">Bestsellers Grid</h2>
            </div>
            <button 
              onClick={() => { onSelectCategory(null); setView('shop'); }}
              className="text-xs uppercase tracking-[0.2em] font-bold pb-1 border-b border-[#C9A96E] text-neutral-800 hover:text-black transition-colors cursor-pointer"
              id="view-all-bestsellers-btn"
            >
              Browse Complete Edit &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((p) => (
                <MemoizedProductCard 
                  key={p.id}
                  p={p}
                  onViewProduct={onViewProduct}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))
            ) : (
              <p className="text-xs font-mono text-neutral-400 col-span-full">No featured products established yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Exclusive Archive Sale Section */}
      {products.some(p => p.compareAtPrice && p.compareAtPrice > p.price && p.isActive) && (
        <section className="py-24 bg-[#FAFAFA] border-b border-[#E5E5E5]" id="exclusive-discounts-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 pb-6 border-b border-[#E5E5E5]">
              <div>
                <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Limited Time Valuations
                </span>
                <h2 className="text-3xl md:text-4.5xl font-black tracking-tighter text-neutral-900 mt-2 uppercase">Exclusive Private Sales</h2>
              </div>
              <span className="text-xs font-mono text-neutral-500 hidden md:block">Artisanal masterworks, curated with exclusive privileges</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products
                .filter(p => p.compareAtPrice && p.compareAtPrice > p.price && p.isActive)
                .slice(0, 4)
                .map((p) => (
                  <MemoizedProductCard 
                    key={p.id}
                    p={p}
                    onViewProduct={onViewProduct}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.includes(p.id)}
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals Sliding Belt */}
      <section className="py-24 overflow-hidden bg-[#FAFAFA] border-t border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
          <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-black">Just Released</span>
          <h2 className="text-3.5xl md:text-5xl font-black tracking-tighter text-neutral-950 mt-2 uppercase">The New Horizon</h2>
        </div>

        {/* Horizontal sliding belt */}
        <div className="w-full flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-neutral-200 px-6 max-w-7xl mx-auto scroll-smooth">
          {newArrivals.map((p) => (
            <MemoizedNewArrivalCard 
              key={p.id}
              p={p}
              onViewProduct={onViewProduct}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlist.includes(p.id)}
              categories={categories}
            />
          ))}
        </div>
      </section>

      {/* Brand Manifesto Editorial */}
      <section className="relative h-[65vh] w-full flex items-center bg-[#0F0F0F] text-white border-t border-[#E5E5E5]">
        <div className="absolute inset-0 md:left-1/2 w-full md:w-1/2 h-full opacity-40 md:opacity-90">
          <img 
            src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000" 
            alt="Atelier tailoring"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] to-transparent hidden md:block" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 selection:bg-[#C9A96E] selection:text-black">
          <div className="max-w-xl">
            <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-bold">Our Manifesto</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mt-3 mb-6 uppercase">Aesthetic Independence</h2>
            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed mb-6">
              ORRIS was established not to chase transitory high-street fads, but to formulate a permanent, sensory fortress. For those who realize that beauty is not decorative, but structural.
            </p>
            <p className="text-xs md:text-sm text-neutral-400 font-light leading-relaxed mb-10">
              Each garment is shaped from high-density Belgian linens. Each watch movement is calibrated under magnifying loupes in Swiss chalets. Each droplet of Orris Noir contains a private reserve harvest that we curate completely in-house.
            </p>
            <div className="flex gap-8 border-t border-neutral-800 pt-8 mt-4 font-mono">
              <div>
                <p className="text-xl md:text-2xl text-[#C9A96E] font-bold">100%</p>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Direct Sourced</p>
              </div>
              <div className="border-l border-neutral-800 pl-8">
                <p className="text-xl md:text-2xl text-[#C9A96E] font-bold">Zero</p>
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest mt-1">Intermediary markups</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram-style Social Proof Section */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-[#E5E5E5]">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.25em] text-[#C9A96E] uppercase font-bold">@ORRIS_OFFICIEL</span>
          <h2 className="text-3xl font-black tracking-tighter text-neutral-900 mt-2 uppercase">Sartorial Journeys</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500',
            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=500',
            'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=500',
            'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=500',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=500'
          ].map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden bg-neutral-100 group rounded-none border border-[#E5E5E5]">
              <img 
                src={img} 
                alt="Instagram moment"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-[#0F0F0F]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-[10px] uppercase tracking-widest font-mono">View Look</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup Module with Entrances */}
      <section className="pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-none p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -left-16 -top-16 w-32 h-32 bg-[#C9A96E]/5 rounded-full blur-2xl" />
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#C9A96E]/5 rounded-full blur-2xl" />

          <div className="max-w-2xl mx-auto relative z-10">
            <span className="text-[10px] tracking-[0.2em] text-[#C9A96E] uppercase font-bold px-3.5 py-1.5 bg-amber-500/5 rounded-none border border-[#C9A96E]/20">
              Atelier Correspondence
            </span>
            <h2 className="text-3.5xl font-black tracking-tighter text-neutral-900 mt-6 mb-4 uppercase">
              Subscribe to the ORRIS Editions
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-light leading-relaxed mb-8">
              Join our mailing register to receive private campaign access, limited edition product invitations, and deep insights from our olfactory master craftsmen.
            </p>

            <AnimatePresence mode="wait">
              {!newsletterSubscribed ? (
                <motion.form 
                  key="form"
                  onSubmit={handleNewsletterJoin}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your private email address"
                    required
                    className="flex-grow px-5 py-3.5 bg-neutral-50 border border-[#E5E5E5] outline-none focus:border-neutral-450 focus:bg-white text-xs font-mono rounded-none"
                    id="newsletter-email-input"
                  />
                  <button 
                    type="submit"
                    className="px-8 py-3.5 bg-black text-[#C9A96E] font-bold text-xs uppercase tracking-[0.20em] hover:bg-[#C9A96E] hover:text-black transition-colors rounded-none leading-none flex items-center justify-center gap-1 cursor-pointer"
                    id="newsletter-submit-btn"
                  >
                    Register
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 bg-emerald-50 text-emerald-800 rounded-lg max-w-md mx-auto border border-emerald-100 flex flex-col items-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-950">Subscription Approved</p>
                  <p className="text-[11px] text-emerald-700/80 mt-1">We have queued your dispatch in the Orris registry.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Triggered Popup */}
      <AnimatePresence>
        {showPromoPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans" id="newsletter-popup-container">
            {/* Backdrop slide-in/fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClosePopup}
              className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
              id="newsletter-popup-backdrop"
              aria-hidden="true"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-md bg-[#FAFAFA] border border-[#CCCCCC] p-8 md:p-10 text-center z-10 shadow-2xl rounded-none"
              id="newsletter-popup-modal"
            >
              {/* Top luxury badge decoration */}
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#C9A96E] font-extrabold mb-3 font-mono">
                Exclusive Registry
              </div>

              {/* Close Button */}
              <button
                onClick={handleClosePopup}
                className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-black transition-colors border border-transparent hover:border-neutral-200 cursor-pointer"
                aria-label="Close newsletter popup"
                id="newsletter-popup-close-btn"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {!popupSubscribed ? (
                  <motion.div
                    key="popup-form-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] mb-3">
                      ORRIS EDITIONS
                    </h3>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed mb-6">
                      Join our private mailing registers to receive advance luxury allocation notices, olfactory secrets, and private campaign codes.
                    </p>

                    <form onSubmit={handlePopupSubmit} className="flex flex-col gap-3">
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={popupEmail}
                          onChange={(e) => setPopupEmail(e.target.value)}
                          placeholder="Your private email address"
                          className="w-full px-4 py-3.5 bg-white border border-[#E5E5E5] outline-none focus:border-neutral-450 focus:bg-white text-xs font-mono rounded-none"
                          id="newsletter-popup-email-input"
                        />
                        <Mail className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-colors font-bold text-xs uppercase tracking-[0.2em] rounded-none cursor-pointer"
                        id="newsletter-popup-submit-btn"
                      >
                        Subscribe to Atelier
                      </button>
                    </form>

                    <button
                      onClick={handleClosePopup}
                      className="mt-4 text-[9px] font-mono uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer inline-block border-b border-neutral-200 hover:border-neutral-500 pb-0.5"
                      id="newsletter-popup-skip-btn"
                    >
                      No, I prefer regular updates
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="popup-success-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6 flex flex-col items-center"
                    id="newsletter-popup-success"
                  >
                    <div className="w-12 h-12 bg-neutral-900 border border-[#E0E0E0] rounded-none flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-6 h-6 text-[#C9A96E]" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-00 mb-2">
                      Access Granted
                    </h3>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-sm">
                      Credentials saved. You will receive the next luxury curation dispatch shortly.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
