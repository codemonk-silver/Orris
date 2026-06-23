/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { LayoutGrid, List, SlidersHorizontal, ArrowUpDown, Search, RotateCcw, Eye, ShoppingCart, Heart } from 'lucide-react';
import { Category, Product } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';

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

const ShopProductCard = React.memo<{
  p: Product;
  isAdding: boolean;
  isGridView: boolean;
  wishlist: string[];
  categories: Category[];
  onToggleWishlist?: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}>(function ShopProductCard({ p, isAdding, isGridView, wishlist, categories, onToggleWishlist, onViewProduct, onQuickAdd }) {
  const [primaryLoaded, setPrimaryLoaded] = useState(false);
  const { formatPrice } = useAppStore();
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);

  const hasSecondary = !!p.images[1];
  const isFullyLoaded = primaryLoaded && (!hasSecondary || secondaryLoaded);

  const isWishlisted = wishlist.includes(p.id);

  return (
    <div 
      onClick={() => onViewProduct(p)}
      className={`group cursor-pointer border border-[#E5E5E5] hover:bg-[#FAFAFA] rounded-none transition-all duration-300 ${
        isGridView 
          ? 'p-3.5 flex flex-col justify-between h-full' 
          : 'p-4 flex flex-col sm:flex-row gap-6 items-center'
      }`}
      id={`shop-product-card-${p.id}`}
    >
      {/* Media Aspect container */}
      <div className={`relative bg-neutral-50 overflow-hidden rounded-none border border-[#E5E5E5]/45 ${
        isGridView 
          ? 'aspect-[3/4] mb-4 w-full' 
          : 'aspect-[3/4] w-full sm:w-48 flex-shrink-0'
      }`}>
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
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02]"
        />

        {/* Hover Slide-Over Alternate View */}
        {p.images[1] && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out pointer-events-none">
            <img 
              src={p.images[1]} 
              alt={`${p.name} Alternate`}
              onLoad={() => setSecondaryLoaded(true)}
              onError={() => setSecondaryLoaded(true)}
              className="w-full h-full object-cover animate-in fade-in duration-300"
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
            id={`wishlist-toggle-shop-${p.id}`}
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

        {/* Micro Badge details */}
        {isFullyLoaded && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
            {p.compareAtPrice && p.compareAtPrice > p.price && (
              <span className="bg-red-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none font-mono">
                Save {Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%
              </span>
            )}
            {p.inventory <= 5 && (
              <span className="bg-amber-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-none font-mono">
                Depleting Stock
              </span>
            )}
          </div>
        )}

        {/* Desktop Hover Quick Actions */}
        {isFullyLoaded && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onViewProduct(p); }}
              className="flex-grow bg-white text-[#1a1a1a] border border-[#E5E5E5] hover:bg-neutral-100 transition-all py-2.5 rounded-none text-[9px] uppercase font-black tracking-widest flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              title="Open specification panels"
              id={`shop-view-specs-${p.id}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Spec-sheets</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onQuickAdd(p); }}
              disabled={p.inventory === 0}
              className="px-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-neutral-800 hover:text-white border border-black transition-all rounded-none flex items-center justify-center shadow-sm cursor-pointer"
              title="Acquire with default size & color configuration"
              id={`shop-quick-add-${p.id}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata specs listing */}
      <div className="flex-grow flex flex-col justify-between w-full">
        {!isFullyLoaded ? (
          <div className="flex flex-col gap-1.5 pt-3">
            <motion.div 
              className="h-2.5 bg-neutral-200 w-1/4 rounded-none" 
              variants={skeletonPulseVariants}
              animate="loading"
            />
            <motion.div 
              className="h-3.5 bg-neutral-200 w-3/4 rounded-none" 
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
            className="flex-grow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-[9px] uppercase tracking-widest font-bold font-mono text-[#737373]">
                  {categories.find(c => c.id === p.categoryId)?.name || 'Private Edit'}
                </span>
                <span className="text-xs font-bold font-mono text-neutral-900">{formatPrice(p.price)}</span>
              </div>
              <h3 className="text-xs font-black text-neutral-900 uppercase tracking-tight group-hover:text-black line-clamp-1 transition-all mt-1">
                {p.name}
              </h3>
              {!isGridView && (
                <p className="text-xs text-neutral-500 font-light mt-2 line-clamp-3 leading-relaxed">
                  {p.description}
                </p>
              )}
            </div>

            {/* Stock alerts and feedback */}
            <div className="mt-4 pt-3.5 border-t border-[#E5E5E5] flex items-center justify-between">
              <span className="text-[8px] font-mono text-neutral-400 font-bold uppercase">
                Sizes: {p.sizes.join(', ')}
              </span>
              
              <AnimatePresence mode="wait">
                {isAdding ? (
                  <motion.span 
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[9px] text-emerald-800 font-bold font-mono uppercase bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-none"
                  >
                    Acquired!
                  </motion.span>
                ) : p.inventory === 0 ? (
                  <span className="text-[9px] text-red-500 font-mono uppercase">Sold Out</span>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onQuickAdd(p); }}
                    className="md:hidden text-xs text-[#C9A96E] hover:text-black font-semibold flex items-center gap-1 active:scale-95"
                    id={`shop-mobile-add-btn-${p.id}`}
                  >
                    + Acquire
                  </button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});

interface ShopProps {
  categories: Category[];
  products: Product[];
  currentCategorySlug: string | null;
  setCategorySlug: (slug: string | null) => void;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  wishlist?: string[];
  onToggleWishlist?: (productId: string) => void;
}

export default function Shop({
  categories,
  products,
  currentCategorySlug,
  setCategorySlug,
  onViewProduct,
  onAddToCart,
  wishlist = [],
  onToggleWishlist
}: ShopProps) {
  // Filters state
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(1000);
  const { sort: sortOption, setSort: setSortOption, formatPrice } = useAppStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlySale, setShowOnlySale] = useState<boolean>(false);
  
  // Layout toggles
  const [isGridView, setIsGridView] = useState<boolean>(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Lock body scrolling when mobile catalog filter drawer is active
  React.useEffect(() => {
    if (mobileFiltersOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [mobileFiltersOpen]);

  // Quick addition mini-states
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Extract unique colors and sizes for filter values
  const allFilterSizes = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => p.sizes.forEach(s => list.add(s)));
    return Array.from(list);
  }, [products]);

  const allFilterColors = useMemo(() => {
    const list = new Set<string>();
    products.forEach(p => p.colors.forEach(c => list.add(c)));
    return Array.from(list);
  }, [products]);

  // Aggregate current active category info
  const activeCategory = useMemo(() => {
    return categories.find(c => c.slug === currentCategorySlug) || null;
  }, [categories, currentCategorySlug]);

  // Filter and sort core logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Active checking
        if (!p.isActive) return false;

        // Sale / Discount checking
        if (showOnlySale && (!p.compareAtPrice || p.compareAtPrice <= p.price)) return false;

        // Category matching
        if (currentCategorySlug) {
          const category = categories.find(c => c.slug === currentCategorySlug);
          if (category && p.categoryId !== category.id) return false;
        }

        // Search matching
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        // Price matching
        if (p.price > priceRange) return false;

        // Size matching
        if (selectedSizes.length > 0) {
          const matchSize = p.sizes.some(s => selectedSizes.includes(s));
          if (!matchSize) return false;
        }

        // Color matching
        if (selectedColors.length > 0) {
          const matchColor = p.colors.some(c => selectedColors.includes(c));
          if (!matchColor) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'price-asc') return a.price - b.price;
        if (sortOption === 'price-desc') return b.price - a.price;
        if (sortOption === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOption === 'alphabetical') return a.name.localeCompare(b.name);
        
        // Featured default
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, currentCategorySlug, categories, searchQuery, priceRange, selectedSizes, selectedColors, sortOption, showOnlySale]);

  const toggleSizeFilter = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColorFilter = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleResetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(1000);
    setSearchQuery('');
    setCategorySlug(null);
    setSortOption('featured');
    setShowOnlySale(false);
  };

  // Immediate Quick Purchase on grid option
  const handleQuickAdd = (p: Product) => {
    const size = p.sizes[0] || undefined;
    const color = p.colors[0] || undefined;
    onAddToCart(p, 1, size, color);
    
    // Quick notification banner animation lock
    setAddingProductId(p.id);
    setTimeout(() => {
      setAddingProductId(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 selection:bg-[#C9A96E] selection:text-black animate-in fade-in duration-300">
      
      {/* Category Hero Header Banner */}
      <div className="mb-12 border-b border-[#E5E5E5] pb-10">
        <nav className="text-[10px] font-mono uppercase tracking-widest text-[#737373] mb-4 font-bold">
          <button onClick={() => setCategorySlug(null)} className="hover:text-black">Orris</button>
          <span className="mx-2">/</span>
          <span className="text-neutral-800">{activeCategory ? activeCategory.name : 'All Collections'}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <h1 className="text-3.5xl md:text-5xl lg:text-6xl font-black tracking-tighter text-neutral-900 leading-none uppercase">
              {activeCategory ? activeCategory.name : 'THE ARCHITECTURAL EDIT'}
            </h1>
            <p className="text-xs md:text-sm text-[#737373] font-light max-w-2xl mt-4 leading-relaxed">
              {activeCategory 
                ? activeCategory.description 
                : 'Browse our complete catalog of sensory fragrances, premium tailoring, handcrafted footwear, and automatic chronographs synthesized for the discerning non-conformist.'}
            </p>
          </div>
          {activeCategory && (
            <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden md:col-span-1 rounded-none border border-[#E5E5E5]">
              <img 
                src={activeCategory.image} 
                alt={activeCategory.name}
                className="w-full h-full object-cover grayscale opacity-80"
              />
            </div>
          )}
        </div>
      </div>

      {/* Grid Controller Toolbar */}
      <div className="bg-white border border-[#E5E5E5] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-4 mb-8 text-xs font-bold uppercase tracking-wider rounded-none shadow-none">
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 border border-[#E5E5E5] text-neutral-700 rounded-none active:bg-neutral-50"
            id="mobile-filters-trigger-btn"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <div className="relative flex-grow sm:flex-grow-0">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog details..."
              className="w-full sm:w-64 pl-8 pr-4 py-2 border border-[#E5E5E5] outline-none focus:border-neutral-400 font-mono text-[11px] bg-neutral-50 rounded-none"
              id="shop-search-input"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {(selectedSizes.length > 0 || selectedColors.length > 0 || currentCategorySlug || searchQuery || showOnlySale) && (
            <button 
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[#C9A96E] hover:text-black cursor-pointer uppercase tracking-widest text-[10px]"
              id="shop-clear-filters-btn"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
          <span className="text-neutral-400 font-mono text-[10px]">
            {filteredProducts.length} Piece{filteredProducts.length !== 1 ? 's' : ''} Listed
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-neutral-50 border border-neutral-100 p-0.5 rounded">
              <button 
                onClick={() => setIsGridView(true)}
                className={`p-1.5 rounded transition-colors ${isGridView ? 'bg-white text-black shadow-sm' : 'text-neutral-400'}`}
                title="Grid layout"
                id="layout-grid-btn"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsGridView(false)}
                className={`p-1.5 rounded transition-colors ${!isGridView ? 'bg-white text-black shadow-sm' : 'text-neutral-400'}`}
                title="List layout"
                id="layout-list-btn"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="appearance-none bg-neutral-50 border border-neutral-200 pr-8 pl-4 py-2 outline-none font-mono text-[11px] text-neutral-800 rounded focus:border-neutral-400"
                id="sort-select-box"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
                <option value="alphabetical">Name: A to Z</option>
              </select>
              <ArrowUpDown className="w-3 h-3 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-10 items-start">
        {/* Left Side Filters (Desktop only) */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-40">
          <div className="flex flex-col gap-8 pb-10">
            {/* Categories list */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-neutral-200 pb-3.5 mb-4 text-neutral-900">
                Collections
              </h3>
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => setCategorySlug(null)}
                  className={`text-xs text-left w-full flex justify-between items-center transition-colors ${currentCategorySlug === null ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'}`}
                  id="filter-all-ateliers-btn"
                >
                  <span>All Orris Collections</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({products.length})</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.categoryId === cat.id && p.isActive).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategorySlug(cat.slug)}
                      className={`text-xs text-left w-full flex justify-between items-center transition-colors ${currentCategorySlug === cat.slug ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'}`}
                      id={`filter-cat-${cat.slug}-btn`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exclusive Discounts Toggle */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-neutral-200 pb-3.5 mb-4 text-neutral-900">
                Special Pricing
              </h3>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setShowOnlySale(!showOnlySale)}
                  className={`text-xs text-left w-full flex justify-between items-center transition-colors px-3 py-2 border rounded-none ${
                    showOnlySale 
                      ? 'bg-red-550/10 border-red-500 text-red-600 font-extrabold' 
                      : 'bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-205'
                  }`}
                  id="filter-sale-desktop-btn"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Archive Sales
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded">
                    {products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price && p.isActive).length}
                  </span>
                </button>
              </div>
            </div>

            {/* Price slider */}
            <div>
              <div className="flex justify-between items-center border-b border-neutral-200 pb-3.5 mb-4">
                <h3 className="text-xs uppercase tracking-widest font-semibold text-neutral-900">
                  Max price
                </h3>
                <span className="font-mono text-xs text-neutral-900">{formatPrice(priceRange)}</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#C9A96E]"
                id="price-range-slider"
              />
              <div className="flex justify-between font-mono text-[9px] text-[#A3A3A3] mt-2">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(1000)}</span>
              </div>
            </div>

            {/* Sizes selector filters */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-neutral-200 pb-3.5 mb-4 text-neutral-900">
                Calibrations / Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                {allFilterSizes.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSizeFilter(size)}
                      className={`px-3 py-1.5 border text-[10px] font-mono rounded select-none transition-all uppercase ${
                        active 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                      }`}
                      id={`size-filter-btn-${size}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors filter */}
            <div>
              <h3 className="text-xs uppercase tracking-widest font-semibold border-b border-neutral-200 pb-3.5 mb-4 text-neutral-900">
                Aura Colors
              </h3>
              <div className="flex flex-col gap-2.5">
                {allFilterColors.map((color) => {
                  const active = selectedColors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColorFilter(color)}
                      className={`text-xs text-left w-full flex items-center gap-2.5 transition-colors ${
                        active ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                      }`}
                      id={`color-filter-btn-${color}`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full border border-neutral-300 block ${
                        color.toLowerCase().includes('black') || color.toLowerCase().includes('obsidian') || color.toLowerCase().includes('onyx') || color.toLowerCase().includes('nero') ? 'bg-black' :
                        color.toLowerCase().includes('white') || color.toLowerCase().includes('albino') || color.toLowerCase().includes('chalk') ? 'bg-white' :
                        color.toLowerCase().includes('amber') || color.toLowerCase().includes('gold') ? 'bg-amber-400' :
                        color.toLowerCase().includes('bordeaux') || color.toLowerCase().includes('ruby') ? 'bg-red-800' :
                        color.toLowerCase().includes('green') || color.toLowerCase().includes('sage') || color.toLowerCase().includes('copal') ? 'bg-emerald-800' :
                        color.toLowerCase().includes('silver') || color.toLowerCase().includes('gray') || color.toLowerCase().includes('platinum') ? 'bg-neutral-400' :
                        color.toLowerCase().includes('trousers') || color.toLowerCase().includes('brown') || color.toLowerCase().includes('cognac') || color.toLowerCase().includes('tan') || color.toLowerCase().includes('chestnut') || color.toLowerCase().includes('espresso') ? 'bg-amber-900' :
                        color.toLowerCase().includes('blue') || color.toLowerCase().includes('navy') ? 'bg-indigo-900' : 'bg-neutral-100'
                      }`} />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Multi-Format Grid Area */}
        <main className="flex-grow">
          {filteredProducts.length > 0 ? (
            <div className={
              isGridView 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "flex flex-col gap-6"
            }>
              {filteredProducts.map((p) => (
                <ShopProductCard 
                  key={p.id}
                  p={p}
                  isAdding={addingProductId === p.id}
                  isGridView={isGridView}
                  wishlist={wishlist}
                  categories={categories}
                  onToggleWishlist={onToggleWishlist}
                  onViewProduct={onViewProduct}
                  onQuickAdd={handleQuickAdd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
              <span className="text-sm font-mono text-neutral-400">No pieces match selected filters alignment.</span>
              <button 
                onClick={handleResetFilters}
                className="mt-4 px-6 py-2.5 bg-black text-[#C9A96E] text-xs uppercase tracking-widest font-semibold rounded block mx-auto hover:bg-[#C9A96E] hover:text-black transition-colors"
                id="empty-shop-reset-btn"
              >
                Restore Complete Catalog
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter overlay */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm p-6 overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm uppercase tracking-widest font-bold">Catalog Filters</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="text-neutral-500 hover:text-black p-1"
                id="close-mobile-filters-btn"
              >
                Close
              </button>
            </div>

            {/* Price section */}
            <div className="mb-6">
              <div className="flex justify-between font-mono text-xs mb-2">
                <span>Max price</span>
                <span>{formatPrice(priceRange)}</span>
              </div>
              <input 
                type="range"
                min="0"
                max="1000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#C9A96E]"
                id="mob-price-range-slider"
              />
            </div>

            {/* Ateliers section */}
            <div className="mb-6 border-t border-neutral-100 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Collections</h4>
              <div className="flex flex-col gap-2.5">
                <button 
                  onClick={() => { setCategorySlug(null); setMobileFiltersOpen(false); }}
                  className={`text-xs text-left ${currentCategorySlug === null ? 'font-bold' : 'text-neutral-500'}`}
                  id="mob-filter-all-ateliers-btn"
                >
                  All Orris Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategorySlug(cat.slug); setMobileFiltersOpen(false); }}
                    className={`text-xs text-left ${currentCategorySlug === cat.slug ? 'font-bold text-[#C9A96E]' : 'text-neutral-500'}`}
                    id={`mob-filter-cat-${cat.slug}-btn`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Private Archive Sales Toggle */}
            <div className="mb-6 border-t border-neutral-100 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Special Pricing</h4>
              <button
                onClick={() => { setShowOnlySale(!showOnlySale); setMobileFiltersOpen(false); }}
                className={`text-xs text-left w-full flex justify-between items-center transition-colors px-3 py-2 border rounded-none ${
                    showOnlySale 
                      ? 'bg-red-50 text-red-600 font-extrabold border-red-500' 
                      : 'bg-white text-neutral-500 border-neutral-200'
                }`}
                id="mob-filter-sale-btn"
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Archive Sales
                </span>
                <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded">
                    {products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price && p.isActive).length}
                </span>
              </button>
            </div>

            {/* Sizes section */}
            <div className="mb-6 border-t border-neutral-100 pt-4">
              <h4 className="text-xs uppercase tracking-widest font-bold mb-3">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {allFilterSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => toggleSizeFilter(size)}
                    className={`px-3 py-1.5 border text-[10px] font-mono rounded ${
                      selectedSizes.includes(size) ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-neutral-200'
                    }`}
                    id={`mob-size-filter-btn-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-auto py-3 bg-black text-[#C9A96E] font-bold text-xs uppercase tracking-widest rounded"
              id="apply-mobile-filters-btn"
            >
              Apply Filter Alignments
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
