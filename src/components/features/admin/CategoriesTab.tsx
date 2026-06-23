/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Category, Product } from '../../../types';
import { useAppStore } from '../../../store/useAppStore';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: CategoriesTab Component
 * ============================================================================
 * What is this component's purpose?
 * Manages collections category segments. Supports dynamic counts of active 
 * products, editing existing structures, and safety alerts preventing deletion
 * of non-empty categories.
 * ============================================================================
 */

interface CategoriesTabProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (newCategory: Category) => void;
  triggerNotification: (message: string) => void;
}

export default function CategoriesTab({
  categories,
  products,
  onAddCategory,
  triggerNotification
}: CategoriesTabProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Category Edit Form Fields
  const [catFormName, setCatFormName] = useState('');
  const [catFormSlug, setCatFormSlug] = useState('');
  const [catFormImage, setCatFormImage] = useState('');
  const [catFormDesc, setCatFormDesc] = useState('');

  // Handle open category forms
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatFormName('');
    setCatFormSlug('');
    setCatFormImage('https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800');
    setCatFormDesc('');
    setShowCategoryForm(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatFormName(cat.name);
    setCatFormSlug(cat.slug);
    setCatFormImage(cat.image);
    setCatFormDesc(cat.description || '');
    setShowCategoryForm(true);
  };

  // Save changes
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim() || !catFormSlug.trim()) return;

    if (editingCategory) {
      const updatedCat: Category = {
        ...editingCategory,
        name: catFormName,
        slug: catFormSlug.toLowerCase(),
        image: catFormImage,
        description: catFormDesc
      };
      
      const updatedList = categories.map(c => c.id === editingCategory.id ? updatedCat : c);
      useAppStore.getState().setCategories(updatedList);
      
      fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCat)
      }).catch(err => console.error("Error updating category on server:", err));

      triggerNotification(`SUCCESS: Maison Category "${catFormName}" updated.`);
    } else {
      const newlyBorn: Category = {
        id: `cat-gen-${Date.now()}`,
        name: catFormName,
        slug: catFormSlug.toLowerCase(),
        image: catFormImage,
        description: catFormDesc
      };
      onAddCategory(newlyBorn);
      triggerNotification(`SUCCESS: Maison Category Segment "${catFormName}" authorized and cast.`);
    }

    setShowCategoryForm(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId: string) => {
    const productsInCat = products.filter(p => p.categoryId === catId && p.isActive);
    if (productsInCat.length > 0) {
      alert(`Cannot delete category because it contains ${productsInCat.length} active products. Re-assign or delete those products first!`);
      return;
    }
    if (confirm("Are you sure you want to delete this category list segment?")) {
      const updatedList = categories.filter(c => c.id !== catId);
      useAppStore.getState().setCategories(updatedList);
      triggerNotification("SUCCESS: Category pruned from directory structure.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4 border-b border-neutral-200 pb-5 text-left">
        <div>
          <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Categories Manager</span>
          <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-[#0F0F0F]">Product Categories</h1>
        </div>

        <button 
          onClick={handleOpenCreateCategory}
          className="px-5 py-2.5 bg-black hover:bg-[#C9A96E] text-[#C9A96E] hover:text-black text-xs font-bold uppercase tracking-widest rounded flex items-center gap-1 cursor-pointer transition-colors shadow"
          id="admin-new-cat-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {showCategoryForm && (
        <form onSubmit={handleSaveCategory} className="bg-white border border-neutral-250 p-6 rounded-lg gap-4 flex flex-col shadow-2xl max-w-xl text-left">
          <div className="flex justify-between items-center border-b border-neutral-150 pb-3 mb-2">
            <h3 className="text-xs uppercase font-bold text-neutral-900 font-mono">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
            </h3>
            <button 
              type="button" 
              onClick={() => {
                setShowCategoryForm(false);
                setEditingCategory(null);
              }} 
              className="text-xs text-neutral-400 hover:text-black font-mono uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Category Name</label>
              <input 
                type="text" 
                value={catFormName} 
                onChange={(e) => setCatFormName(e.target.value)}
                required
                placeholder="e.g. Fragrances or Home Goods"
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Slug URL Key</label>
              <input 
                type="text" 
                value={catFormSlug} 
                onChange={(e) => setCatFormSlug(e.target.value)}
                required
                placeholder="e.g. accessories"
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Illustration Image URL</label>
              <input 
                type="text" 
                value={catFormImage} 
                onChange={(e) => setCatFormImage(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Category Description</label>
              <textarea 
                value={catFormDesc} 
                onChange={(e) => setCatFormDesc(e.target.value)}
                rows={2}
                placeholder="Brief description for customers..."
                className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded resize-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="py-3 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-bold text-xs uppercase tracking-widest rounded cursor-pointer duration-300 shadow"
          >
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {categories.map((cat) => {
          const piecesCount = products.filter(p => p.categoryId === cat.id && p.isActive).length;
          return (
            <div key={cat.id} className="bg-white border border-neutral-100 rounded p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex gap-4 items-center">
                <img src={cat.image} alt={cat.name} className="w-14 h-18 object-cover rounded bg-neutral-100 grayscale hover:grayscale-0 duration-300 shadow-sm" />
                <div className="truncate flex-grow">
                  <h4 className="text-xs font-bold text-[#0F0F0F] uppercase tracking-wider">{cat.name}</h4>
                  <p className="text-[9px] font-mono text-[#C9A96E] font-bold uppercase mt-1">/collections/{cat.slug}</p>
                  <p className="text-[9px] font-mono text-zinc-400 uppercase mt-2">{piecesCount} products listed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border-t border-neutral-100 mt-4 pt-3 justify-end">
                <button 
                  onClick={() => handleOpenEditCategory(cat)}
                  className="p-1 px-2 hover:bg-neutral-50 text-neutral-500 hover:text-black shrink-0 transition-colors uppercase font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-[#C9A96E]" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1 px-2 hover:bg-red-50 text-neutral-400 hover:text-red-650 shrink-0 transition-colors uppercase font-mono text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                  <span>Prune</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
