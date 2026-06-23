/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, ShoppingBag, Users, AlertTriangle, Package, Sparkles, Landmark, X, Settings
} from 'lucide-react';
import { Product, Category, Order, OrderStatus } from '../../types';
import { useAppStore } from '../../store/useAppStore';

// import modularized sub-tabs
import OverviewTab from './admin/OverviewTab';
import ProductsTab from './admin/ProductsTab';
import OrdersTab from './admin/OrdersTab';
import CategoriesTab from './admin/CategoriesTab';
import CustomersTab from './admin/CustomersTab';
import SettingsTab from './admin/SettingsTab';

/**
 * ============================================================================
 * JUNIOR DEVELOPER SPECIAL: AdminDashboard Core Router HUB
 * ============================================================================
 * What is this component's purpose?
 * It serves as the primary admin layout, containing the dark sidebar menu
 * and dispatching navigation changes to the modularized tab subcomponents.
 *
 * Incoming Prop Requirements:
 * - products: Array of active/draft inventory items
 * - categories: Array of collection categories
 * - orders: All checkout/receipt records
 * - onAddProduct: Fn casting newly manufactured item
 * - onUpdateProduct: Fn writing specifications for an item
 * - onDeleteProduct: Fn pruning an item from database indexes
 * - onAddCategory: Fn creating category house
 * - onUpdateOrderStatus: Fn driving courier dispatch status shifts
 * ============================================================================
 */

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (newCategory: Category) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function AdminDashboard({
  products,
  categories,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onUpdateOrderStatus
}: AdminDashboardProps) {
  const { citizens, addCitizen, updateCitizen, deleteCitizen, settings, updateSettings } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'categories' | 'customers' | 'settings'>('overview');
  const [adminNotification, setAdminNotification] = useState<string | null>(null);

  // Trigger self-dismissing notification helper
  const triggerNotification = (message: string) => {
    setAdminNotification(message);
    setTimeout(() => {
      setAdminNotification(prev => prev === message ? null : prev);
    }, 4000);
  };

  // Compile overview metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => o.paymentStatus === 'PAID' ? acc + o.total : acc, 0);
  }, [orders]);

  const outOfStockCount = useMemo(() => {
    return products.filter(p => p.inventory === 0).length;
  }, [products]);

  // Aggregate monthly progression curve
  const monthlySalesChartData = useMemo(() => [
    { name: 'Jan', Sales: 4200 },
    { name: 'Feb', Sales: 6100 },
    { name: 'Mar', Sales: 9400 },
    { name: 'Apr', Sales: 12500 },
    { name: 'May', Sales: 18900 },
    { name: 'Jun', Sales: totalRevenue }
  ], [totalRevenue]);

  // Aggregate category share allocation
  const categoryShareChartData = useMemo(() => {
    const list: { name: string; value: number }[] = [];
    categories.forEach((cat) => {
      const value = products
        .filter(p => p.categoryId === cat.id && p.isActive)
        .reduce((sum, p) => sum + (p.price * p.inventory), 0);
      list.push({ name: cat.name, value: value || 100 });
    });
    return list;
  }, [categories, products]);

  const COLORS = ['#C9A96E', '#1A1A1A', '#52525B', '#71717A', '#A1A1AA', '#D4D4D8', '#E4E4E7', '#F4F4F5'];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FAFAFA] text-[#1A1A1A] selection:bg-[#C9A96E] selection:text-black">
      
      {/* Dark Sidebar Admin Portal */}
      <aside className="w-full md:w-64 bg-[#0F0F0F] text-white flex-shrink-0 flex flex-col p-6 shadow-2xl justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10 pb-5 border-b border-neutral-800">
            <Landmark className="w-5 h-5 text-[#C9A96E]" />
            <span className="text-sm font-bold tracking-[0.25em] uppercase font-serif">ORRIS ADMIN</span>
          </div>

          <nav className="flex flex-col gap-1 text-xs font-mono uppercase tracking-widest text-[#D4D4D8]">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'overview' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-overview"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('products')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'products' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-products"
            >
              <Package className="w-4 h-4" />
              <span>Product Catalogue</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'orders' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-orders"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Orders</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('categories')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'categories' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-categories"
            >
              <Landmark className="w-4 h-4" />
              <span>Categories</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('customers')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'customers' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-customers"
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-left px-4 py-3.5 rounded transition-all flex items-center gap-2.5 cursor-pointer ${activeTab === 'settings' ? 'bg-[#C9A96E] text-black font-semibold shadow-md' : 'hover:bg-neutral-800/40'}`}
              id="admin-menu-settings"
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800 text-[10px] text-neutral-500 font-mono tracking-wider">
          <p>ORRIS ADMIN PORTAL</p>
          <p>Secure Connection</p>
        </div>
      </aside>

      {/* Main Administrative Action Workspace */}
      <main className="flex-grow p-6 md:p-10 relative">
        
        {/* Animated Premium Notification Badge */}
        <AnimatePresence>
          {adminNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 right-10 z-[110] max-w-md bg-neutral-900 border border-[#C9A96E]/45 p-4 flex items-start gap-3 rounded-none shadow-2xl font-sans"
              id="admin-toast-banner"
            >
              <div className="w-8 h-8 rounded-none bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0 text-[#C9A96E]">
                <Sparkles className="w-4 h-4 animate-spin-slow" />
              </div>
              <div className="flex-grow">
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A96E] block mb-0.5 font-bold">Admin Notifications</span>
                <p className="text-xs text-[#E5E5E5] leading-relaxed font-light">{adminNotification}</p>
              </div>
              <button
                onClick={() => setAdminNotification(null)}
                className="text-neutral-400 hover:text-white p-0.5 border border-transparent hover:border-neutral-800 rounded-none cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Render Active Dashboard Tab */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                orders={orders}
                products={products}
                categories={categories}
                totalRevenue={totalRevenue}
                outOfStockCount={outOfStockCount}
                monthlySalesChartData={monthlySalesChartData}
                categoryShareChartData={categoryShareChartData}
                COLORS={COLORS}
                citizens={citizens || []}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                categories={categories}
                onAddProduct={onAddProduct}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                triggerNotification={triggerNotification}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                onUpdateOrderStatus={onUpdateOrderStatus}
                triggerNotification={triggerNotification}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                products={products}
                onAddCategory={onAddCategory}
                triggerNotification={triggerNotification}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersTab
                citizens={citizens}
                addCitizen={addCitizen}
                updateCitizen={updateCitizen}
                deleteCitizen={deleteCitizen}
                triggerNotification={triggerNotification}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                settings={settings}
                onUpdateSettings={updateSettings}
                triggerNotification={triggerNotification}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
      </main>
    </div>
  );
}
