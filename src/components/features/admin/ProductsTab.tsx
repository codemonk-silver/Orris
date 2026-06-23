/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, Plus, Sparkles, Edit, Trash2, Copy } from 'lucide-react';
import { Product, Category } from '../../../types';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: ProductsTab (Lot Inventory CRUD)
 * ============================================================================
 * What is this component's purpose?
 * Self-contained inventory manager. Handles adding/updating/deleting products
 * and dynamically manages search parameters, size collections, and Unsplash URL
 * hot-preset selections.
 *
 * Localized States (Decoupled from Parent):
 * Instead of muddying up the admin panel core, all form inputs (price, inventory,
 * sizes text, color tags) live strictly where they are clicked!
 * ============================================================================
 */

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (id: string) => void;
  triggerNotification: (message: string) => void;
}

export default function ProductsTab({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  triggerNotification
}: ProductsTabProps) {
  // Search and filter parameters state
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields mapped locally
  const [prodFormName, setProdFormName] = useState('');
  const [prodFormPrice, setProdFormPrice] = useState(150);
  const [prodFormComparePrice, setProdFormComparePrice] = useState(0);
  const [prodFormDesc, setProdFormDesc] = useState('');
  const [prodFormInventory, setProdFormInventory] = useState(20);
  const [prodFormCategoryId, setProdFormCategoryId] = useState(categories[0]?.id || '');
  const [prodFormImages, setProdFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600'
  ]);
  const [prodFormSizesText, setProdFormSizesText] = useState('Standard');
  const [prodFormColorsText, setProdFormColorsText] = useState('Black, Silver');
  const [prodFormIsFeatured, setProdFormIsFeatured] = useState(false);

  // Trigger form state for creating a new product
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdFormName('');
    setProdFormPrice(150);
    setProdFormComparePrice(180);
    setProdFormDesc('');
    setProdFormInventory(25);
    setProdFormCategoryId(categories[0]?.id || '');
    setProdFormImages(['https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600']);
    setProdFormSizesText('Standard, M, L');
    setProdFormColorsText('Black, Brass');
    setProdFormIsFeatured(false);
    setShowProductForm(true);
  };

  // Trigger form state for editing an existing product
  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdFormName(p.name);
    setProdFormPrice(p.price);
    setProdFormComparePrice(p.compareAtPrice || 0);
    setProdFormDesc(p.description);
    setProdFormInventory(p.inventory);
    setProdFormCategoryId(p.categoryId);
    setProdFormImages(p.images);
    setProdFormSizesText(p.sizes && p.sizes.length > 0 ? p.sizes.join(', ') : 'Standard');
    setProdFormColorsText(p.colors && p.colors.length > 0 ? p.colors.join(', ') : 'Default');
    setProdFormIsFeatured(p.isFeatured);
    setShowProductForm(true);
  };

  // Validate and submit Product CRUD details
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodFormName.trim()) return;

    // Parse comma-separated fields safely
    const sizes = prodFormSizesText.split(',').map(s => s.trim()).filter(Boolean);
    const colors = prodFormColorsText.split(',').map(c => c.trim()).filter(Boolean);

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: prodFormName,
        price: prodFormPrice,
        compareAtPrice: prodFormComparePrice > 0 ? prodFormComparePrice : undefined,
        description: prodFormDesc,
        inventory: prodFormInventory,
        categoryId: prodFormCategoryId,
        images: prodFormImages,
        sizes: sizes.length > 0 ? sizes : ['Standard'],
        colors: colors.length > 0 ? colors : ['Default'],
        isFeatured: prodFormIsFeatured,
        updatedAt: new Date().toISOString()
      };
      onUpdateProduct(updated);
      triggerNotification(`SUCCESS: Specs and balances for "${prodFormName}" have been rewritten in database.`);
    } else {
      const newlyBorn: Product = {
        id: `prod-gen-${Date.now()}`,
        name: prodFormName,
        slug: prodFormName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: prodFormDesc,
        price: prodFormPrice,
        compareAtPrice: prodFormComparePrice > 0 ? prodFormComparePrice : undefined,
        inventory: prodFormInventory,
        images: prodFormImages,
        categoryId: prodFormCategoryId,
        sizes: sizes.length > 0 ? sizes : ['Standard'],
        colors: colors.length > 0 ? colors : ['Default'],
        isFeatured: prodFormIsFeatured,
        isActive: true,
        reviews: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddProduct(newlyBorn);
      triggerNotification(`SUCCESS: Newly Born Lot "${prodFormName}" has been successfully cast and published.`);
    }
    setShowProductForm(false);
  };

  // Handle Duplicating a Product Template
  const handleDuplicateProduct = (p: Product) => {
    const cloned: Product = {
      ...p,
      id: `prod-gen-${Date.now()}`,
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onAddProduct(cloned);
    triggerNotification(`SUCCESS: Cloned "${p.name}" as a new specimen draft.`);
  };

  // Dynamic products list matching query and category filters
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(prodSearch.toLowerCase());
      const matchesCategory = !prodCategoryFilter || p.categoryId === prodCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, prodSearch, prodCategoryFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4 border-b border-neutral-200 pb-5">
        <div>
          <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Workspace Portfolio</span>
          <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-[#0F0F0F]">Inventory Management (Lot CRUD)</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 animate-fade-in">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Query inventory keys..."
                className="pl-8 pr-4 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded"
                id="admin-prod-search"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={prodCategoryFilter}
              onChange={(e) => setProdCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded cursor-pointer"
              id="admin-prod-category-filter"
            >
              <option value="">All Collections</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleOpenCreateProduct}
            className="px-5 py-2.5 bg-black hover:bg-[#C9A96E] text-[#C9A96E] hover:text-black text-xs font-bold uppercase tracking-widest rounded flex items-center gap-1 cursor-pointer transition-all shadow"
            id="admin-create-product-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Newly Born Lot</span>
          </button>
        </div>
      </div>

      {/* Live Product form block */}
      {showProductForm && (
        <form onSubmit={handleSaveProduct} className="bg-white border border-neutral-200 p-6 rounded-lg gap-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center border-b border-neutral-150 pb-3 mb-2">
            <h3 className="text-xs uppercase font-bold tracking-widest text-[#0F0F0F] font-mono flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
              {editingProduct ? `Refractor Spec specifications id: ${editingProduct.id}` : 'Cast newly born Lot in database'}
            </h3>
            <button 
              type="button" 
              onClick={() => setShowProductForm(false)} 
              className="text-xs text-neutral-400 hover:text-black uppercase tracking-wider font-mono cursor-pointer"
              id="admin-close-prod-form-btn"
            >
              Dismiss Form
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Product Signature Name</label>
              <input 
                type="text" 
                value={prodFormName} 
                onChange={(e) => setProdFormName(e.target.value)}
                required
                placeholder="e.g. Orris Noir Rose Extrait"
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Lot Category House</label>
              <select 
                value={prodFormCategoryId} 
                onChange={(e) => setProdFormCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Inventory Balance</label>
              <input 
                type="number" 
                value={prodFormInventory} 
                onChange={(e) => setProdFormInventory(Number(e.target.value))}
                required
                min={0}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Catalog Sale Price ($ USD)</label>
              <input 
                type="number" 
                value={prodFormPrice} 
                onChange={(e) => setProdFormPrice(Number(e.target.value))}
                required
                min={0}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Compare-At Anchor Price (Zero means none)</label>
              <input 
                type="number" 
                value={prodFormComparePrice} 
                onChange={(e) => setProdFormComparePrice(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none"
              />
            </div>

            <div className="md:col-span-2 text-left">
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Illustration Unsplash URL (Images slots)</label>
              <input 
                type="text" 
                value={prodFormImages[0] || ''} 
                onChange={(e) => setProdFormImages([e.target.value])}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none focus:bg-white"
              />
              
              {/* Visual Image Presets Row */}
              <div className="mt-2 flex flex-wrap gap-2 items-center">
                <span className="text-[8.5px] font-mono uppercase text-neutral-450 mr-1">Hot Presets:</span>
                {[
                  { name: 'Fragrance', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600' },
                  { name: 'Wristwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600' },
                  { name: 'Trench Coat', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600' },
                  { name: 'Wax Candle', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600' },
                  { name: 'Suede Totebag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600' }
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setProdFormImages([preset.url])}
                    className="bg-neutral-100 hover:bg-[#C9A96E]/20 text-[8px] font-mono uppercase px-2 py-1 border border-neutral-200 transition-colors cursor-pointer text-neutral-600 rounded"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Available Sizes (Comma-separated)</label>
              <input 
                type="text" 
                value={prodFormSizesText} 
                onChange={(e) => setProdFormSizesText(e.target.value)}
                placeholder="e.g. Standard, S, M, L"
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none focus:bg-white"
                id="admin-form-sizes-input"
              />
              <div className="flex flex-wrap gap-1 mt-1.5 min-h-[24px]">
                {prodFormSizesText.split(',').map(s => s.trim()).filter(Boolean).map((sz, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-neutral-900 text-neutral-100 font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-neutral-800">
                    <span>{sz}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = prodFormSizesText.split(',').map(s => s.trim()).filter(Boolean);
                        const filtered = list.filter((_, i) => i !== idx);
                        setProdFormSizesText(filtered.join(', '));
                      }}
                      className="hover:text-[#C9A96E] font-bold font-mono transition-colors text-[10px] leading-none focus:outline-none cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Available Colors (Comma-separated)</label>
              <input 
                type="text" 
                value={prodFormColorsText} 
                onChange={(e) => setProdFormColorsText(e.target.value)}
                placeholder="e.g. Charcoal, Gold, Brass"
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none focus:bg-white"
                id="admin-form-colors-input"
              />
              <div className="flex flex-wrap gap-1 mt-1.5 min-h-[24px]">
                {prodFormColorsText.split(',').map(c => c.trim()).filter(Boolean).map((co, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 border border-neutral-200 rounded">
                    <span>{co}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const list = prodFormColorsText.split(',').map(c => c.trim()).filter(Boolean);
                        const filtered = list.filter((_, i) => i !== idx);
                        setProdFormColorsText(filtered.join(', '));
                      }}
                      className="hover:text-red-500 font-bold font-mono transition-colors text-[10px] leading-none focus:outline-none cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 text-left">
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Detailed Spec Manifesto description</label>
              <textarea 
                value={prodFormDesc} 
                onChange={(e) => setProdFormDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none resize-none focus:bg-white"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit"
              className="px-6 py-3.5 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-semibold text-xs uppercase tracking-widest rounded cursor-pointer duration-300"
              id="admin-save-product-submit"
            >
              {editingProduct ? 'Commit changes in database' : 'Publish Lot live in storefront'}
            </button>
            <button 
              type="button" 
              onClick={() => setShowProductForm(false)}
              className="px-6 py-3.5 border border-neutral-200 text-neutral-800 text-xs uppercase tracking-widest font-bold hover:bg-neutral-100 rounded cursor-pointer"
              id="admin-dismiss-prod-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Inventory table listing */}
      <div className="bg-white border border-neutral-150 p-6 rounded shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-white">
            <thead>
              <tr className="border-b border-neutral-200 text-[10px] font-mono uppercase tracking-widest text-[#737373] bg-neutral-50">
                <th className="p-3">Media</th>
                <th className="p-3">Lot Name</th>
                <th className="p-3">Class Category</th>
                <th className="p-3 text-center">Value USD</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 hover:bg-neutral-50/50">
                  <td className="p-3">
                    <img src={p.images[0]} alt={p.name} className="w-10 h-14 object-cover rounded bg-neutral-100" />
                  </td>
                  <td className="p-3 font-semibold text-neutral-900 truncate max-w-[180px]">{p.name}</td>
                  <td className="p-3 font-mono text-zinc-400 font-bold uppercase">
                    {categories.find(c => c.id === p.categoryId)?.name || 'Private House'}
                  </td>
                  <td className="p-3 text-center font-serif font-light text-neutral-900">${p.price}.00</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          const updated = { ...p, inventory: Math.max(0, p.inventory - 1) };
                          onUpdateProduct(updated);
                          triggerNotification(`Decreased "${p.name}" stock to ${updated.inventory}`);
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-neutral-150 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold rounded cursor-pointer transition-all select-none"
                        title="Decrement Stock Count (-1)"
                        id={`dec-stock-${p.id}`}
                      >
                        -
                      </button>
                      <span className={`px-2.5 py-1 rounded font-mono text-[10px] inline-block font-bold min-w-[70px] ${
                        p.inventory === 0 ? 'bg-red-50 text-red-700 border border-red-100' :
                        p.inventory <= 5 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {p.inventory === 0 ? 'Out of Stock' : `${p.inventory} Units`}
                      </span>
                      <button
                        onClick={() => {
                          const updated = { ...p, inventory: p.inventory + 1 };
                          onUpdateProduct(updated);
                          triggerNotification(`Increased "${p.name}" stock to ${updated.inventory}`);
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-neutral-150 hover:bg-neutral-200 text-neutral-800 text-xs font-mono font-bold rounded cursor-pointer transition-all select-none"
                        title="Increment Stock Count (+1)"
                        id={`inc-stock-${p.id}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button 
                        onClick={() => handleDuplicateProduct(p)}
                        className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
                        title="Clone & Duplicate Specimen"
                        id={`clone-prod-control-${p.id}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEditProduct(p)}
                        className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer"
                        title="Edit Lot Specifications"
                        id={`edit-prod-control-${p.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently prune "${p.name}"?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        title="Purge Lot from catalog"
                        id={`delete-prod-control-${p.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
