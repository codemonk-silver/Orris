/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, ShoppingBag, Layers, ShieldCheck, X, Heart
} from 'lucide-react';
import { Order, OrderStatus, Product } from '../../types';
import OrderTracker from './OrderTracker';
import { useAppStore } from '../../store/useAppStore';

// Import subcomponents
import AcquisitionsTab from './customer/AcquisitionsTab';
import WishlistTab from './customer/WishlistTab';
import ProfileDetailsTab from './customer/ProfileDetailsTab';
import SecurityTab from './customer/SecurityTab';

/**
 * ============================================================================
 * JUNIOR DEVELOPER SPECIAL: CustomerProfile Hub Component
 * ============================================================================
 * What is this component's purpose?
 * Core viewport router for user personal profiles. Shows stats counters,
 * interactive order dispatch trackers, and triggers subcomponent sections
 * for wishlist portfolios, personal addresses, or multi-factor credentials.
 * ============================================================================
 */

interface CustomerProfileProps {
  userEmail: string;
  userName: string;
  isAdmin: boolean;
  orders: Order[];
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout') => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
  wishlist?: string[];
  products?: Product[];
  onToggleWishlist?: (productId: string) => void;
  onAddToCart?: (product: Product, quantity: number, size?: string, color?: string) => void;
  onViewProduct?: (product: Product) => void;
}

export default function CustomerProfile({
  userEmail,
  userName,
  isAdmin,
  orders,
  setView,
  onUpdateOrderStatus,
  wishlist = [],
  products = [],
  onToggleWishlist,
  onAddToCart,
  onViewProduct
}: CustomerProfileProps) {
  const [activeSection, setActiveSection] = useState<'acquisitions' | 'wishlist' | 'profile_details' | 'security'>('profile_details');
  
  const { citizens, addCitizen, updateCitizen, formatPrice } = useAppStore();

  const currentCitizen = useMemo(() => {
    return citizens?.find(c => c.email.toLowerCase() === userEmail.toLowerCase());
  }, [citizens, userEmail]);

  const [securityNotification, setSecurityNotification] = useState<string | null>(null);

  // Trigger self-dismissing notification helper
  const triggerSecNotification = (message: string) => {
    setSecurityNotification(message);
    setTimeout(() => {
      setSecurityNotification(prev => prev === message ? null : prev);
    }, 4500);
  };

  // Filter wishlisted products
  const wishlistedProducts = useMemo(() => {
    return products.filter(p => p.isActive && wishlist.includes(p.id));
  }, [products, wishlist]);

  // Extract historical orders matching the client emails
  const myOrders = useMemo(() => {
    return orders.filter(o => o.customerEmail.toLowerCase() === userEmail.toLowerCase());
  }, [orders, userEmail]);

  const spentTotal = useMemo(() => {
    return myOrders.reduce((sum, o) => o.paymentStatus === 'PAID' ? sum + o.total : sum, 0);
  }, [myOrders]);

  // Default to tracking the most recent real order if available
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string | null>(() => {
    return myOrders.length > 0 ? myOrders[0].id : null;
  });

  const [searchOrderIdInput, setSearchOrderIdInput] = useState(() => {
    return myOrders.length > 0 ? myOrders[0].id : '';
  });
  const [searchError, setSearchError] = useState<string | null>(null);

  const trackedOrder = useMemo(() => {
    if (!selectedTrackOrderId) return null;
    return orders.find(o => o.id.toUpperCase() === selectedTrackOrderId.toUpperCase()) || null;
  }, [selectedTrackOrderId, orders]);

  const handleTrackClick = (orderId: string) => {
    setSelectedTrackOrderId(orderId);
    setSearchOrderIdInput(orderId);
    setSearchError(null);
    const trackerEl = document.getElementById('atelier-dispatch-tracker');
    if (trackerEl) {
      trackerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchOrder = () => {
    const term = searchOrderIdInput.trim().toUpperCase();
    if (!term) {
      setSearchError('PLEASE ENTER A VALID ORDER ID');
      return;
    }

    const matched = orders.find(o => o.id.toUpperCase() === term);
    if (matched) {
      setSelectedTrackOrderId(matched.id);
      setSearchError(null);
    } else {
      setSearchError(`ORDER ${term} NOT FOUND IN ATELIER LEDGER`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 selection:bg-[#C9A96E] selection:text-black relative">
      
      {/* Animated Premium Notification Badge */}
      <AnimatePresence>
        {securityNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-24 right-6 md:right-12 z-[110] max-w-sm bg-neutral-900 border border-[#C9A96E]/45 p-4 flex items-start gap-3 rounded-none shadow-2xl font-sans"
            id="security-toast-banner"
          >
            <div className="w-8 h-8 rounded-none bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0 text-[#C9A96E]">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex-grow text-left">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#C9A96E] block mb-0.5 font-bold">Security Notification</span>
              <p className="text-xs text-[#E5E5E5] leading-relaxed font-light">{securityNotification}</p>
            </div>
            <button
              onClick={() => setSecurityNotification(null)}
              className="text-neutral-400 hover:text-white p-0.5 border border-transparent hover:border-neutral-800 rounded-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Account Header Section */}
      <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 rounded-none shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className="w-16 h-16 bg-[#0F0F0F] rounded-none flex items-center justify-center text-white text-xl font-bold font-serif shadow-md border border-neutral-850">
            {userName ? userName.slice(0, 1).toUpperCase() : userEmail.slice(0, 1).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-900 leading-none">{userName || 'Orris Client'}</h2>
              <span className="px-2 py-0.5 bg-neutral-100 rounded-none text-[9px] font-mono hover:bg-neutral-200">
                {isAdmin ? 'STORE ADMIN' : 'CUSTOMER'}
              </span>
            </div>
            <p className="text-xs text-neutral-550 mt-2 font-mono">{userEmail}</p>
          </div>
        </div>

        {/* Dynamic status badges */}
        <div className="flex gap-4 font-mono text-[10px] uppercase text-neutral-450 border-t md:border-t-0 md:border-l border-[#E5E5E5] pt-6 md:pt-0 md:pl-8 w-full md:w-auto justify-between md:justify-start">
          <div className="text-left">
            <span className="block text-neutral-400 font-bold tracking-wider">Total Purchases</span>
            <span className="text-sm font-semibold text-neutral-900 font-serif">${spentTotal}.00</span>
          </div>
          <div className="border-l border-[#E5E5E5] pl-6 text-left">
            <span className="block text-neutral-400 font-bold tracking-wider">Orders Placed</span>
            <span className="text-sm font-semibold text-neutral-900 font-serif">{myOrders.length} {myOrders.length === 1 ? 'Order' : 'Orders'}</span>
          </div>
        </div>
      </div>

      {/* Visual Live Tracker Console */}
      <div id="atelier-dispatch-tracker" className="mb-10 scroll-mt-24 font-sans bg-white border border-[#E5E5E5] p-6 lg:p-8 rounded-none shadow-xs">
        <div className="border-b border-neutral-100 pb-5 mb-6">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-950 font-mono flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-[#C9A96E]" />
            Atelier Courier Dispatch Tracking
          </h3>
          <p className="text-neutral-550 font-sans text-xs font-light">
            Enter your order reference number to view transaction processing stages and real-time shipping checkpoints.
          </p>
        </div>

        {/* Input lookup bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-6">
          <div className="md:col-span-6 lg:col-span-12 xl:col-span-5 text-left">
            <label htmlFor="search-order-id" className="block text-[9px] uppercase font-mono tracking-widest font-black text-neutral-400 mb-2">
              Order Lookup Reference Number
            </label>
            <div className="flex gap-2">
              <input
                id="search-order-id"
                type="text"
                placeholder="e.g. ORRIS-3023"
                value={searchOrderIdInput}
                onChange={(e) => {
                  setSearchOrderIdInput(e.target.value);
                  setSearchError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchOrder();
                  }
                }}
                className="flex-grow border border-neutral-200 px-3.5 py-2.5 text-xs font-mono uppercase bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-all rounded-none"
              />
              <button
                onClick={handleSearchOrder}
                className="bg-black hover:bg-[#C9A96E] hover:text-black text-[#C9A96E] text-[10px] uppercase tracking-widest font-mono font-bold px-5 transition-all duration-300 rounded-none cursor-pointer"
                id="order-tracker-lookup-btn"
              >
                Track
              </button>
            </div>
            {searchError && (
              <p className="text-[9px] text-red-650 font-mono uppercase font-black tracking-wider mt-1.5 px-0.5">{searchError}</p>
            )}
          </div>

          {/* Quick-select list of their own recent orders */}
          {myOrders.length > 0 && (
            <div className="md:col-span-6 lg:col-span-12 xl:col-span-7 text-left">
              <span className="block text-[9px] uppercase font-mono tracking-widest font-black text-neutral-400 mb-2">
                Click to Quick-Track Your Recent Orders
              </span>
              <div className="flex flex-wrap gap-1.5">
                {myOrders.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedTrackOrderId(o.id);
                      setSearchOrderIdInput(o.id);
                      setSearchError(null);
                    }}
                    className={`px-3.5 py-2 text-[8.5px] font-mono font-bold uppercase transition-all tracking-wider border cursor-pointer ${
                      selectedTrackOrderId === o.id
                        ? 'bg-neutral-50 text-neutral-900 border-[#C9A96E] font-black'
                        : 'bg-white hover:bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    Order ID: {o.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output Area */}
        {trackedOrder ? (
          <div className="border border-neutral-100 p-0.5 animate-in fade-in duration-350">
            <OrderTracker order={trackedOrder} />
          </div>
        ) : (
          <div className="border border-dashed border-neutral-200 p-8 text-center bg-neutral-50/50 flex flex-col items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-neutral-300 mb-2.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A96E] font-mono mb-1">
              Ledger Query Awaiting Entry
            </span>
            <p className="text-[10px] text-neutral-500 max-w-sm leading-relaxed">
              Enter any query order identifier above or select one of your client account purchases to retrieve live courier shipping updates.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Order lists, Wishlist, personal details & settings */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Tabs header list */}
          <div className="flex border-b border-[#E5E5E5] gap-6 mb-2 flex-wrap">
            <button 
              onClick={() => setActiveSection('profile_details')}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-black font-mono transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeSection === 'profile_details' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
              id="profile-details-tab"
            >
              Profile Information
            </button>
            <button 
              onClick={() => setActiveSection('acquisitions')}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-black font-mono transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeSection === 'acquisitions' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
              id="acquisitions-tab"
            >
              Past Acquisitions ({myOrders.length})
            </button>
            <button 
              onClick={() => setActiveSection('wishlist')}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-black font-mono transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeSection === 'wishlist' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
              id="wishlist-tab"
            >
              My Saved Pieces ({wishlistedProducts.length})
            </button>
            <button 
              onClick={() => setActiveSection('security')}
              className={`pb-3 text-xs uppercase tracking-[0.2em] font-black font-mono transition-all border-b-2 -mb-[2px] cursor-pointer ${
                activeSection === 'security' 
                  ? 'border-black text-black' 
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
              id="security-tab"
            >
              Security & Keys
            </button>
          </div>

          {/* Subcomponents viewport routing */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeSection === 'acquisitions' && (
                <AcquisitionsTab
                  myOrders={myOrders}
                  selectedTrackOrderId={selectedTrackOrderId}
                  handleTrackClick={handleTrackClick}
                  triggerSecNotification={triggerSecNotification}
                  setView={setView}
                />
              )}

              {activeSection === 'wishlist' && (
                <WishlistTab
                  wishlistedProducts={wishlistedProducts}
                  onViewProduct={onViewProduct}
                  onToggleWishlist={onToggleWishlist}
                  onAddToCart={onAddToCart}
                  setView={setView}
                  formatPrice={formatPrice}
                />
              )}

              {activeSection === 'profile_details' && (
                <ProfileDetailsTab
                  currentCitizen={currentCitizen}
                  userName={userName}
                  userEmail={userEmail}
                  isAdmin={isAdmin}
                  addCitizen={addCitizen}
                  updateCitizen={updateCitizen}
                  triggerSecNotification={triggerSecNotification}
                />
              )}

              {activeSection === 'security' && (
                <SecurityTab
                  triggerSecNotification={triggerSecNotification}
                  profileEmail={currentCitizen?.email || userEmail}
                  profileName={currentCitizen?.name || userName}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Side: High level Orris Account Passport Details */}
        <div className="lg:col-span-4 bg-white p-5 rounded-none border border-[#E5E5E5] shadow-sm flex flex-col gap-6 font-sans text-left">
          <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-[#E5E5E5] pb-2.5 font-mono">
            Orris Account Details
          </h3>

          <div className="flex flex-col gap-4 font-mono text-[11px] text-[#52525B]">
            <div>
              <span className="text-[9px] text-[#A1A1AA] uppercase block mb-0.5">Email Address</span>
              <p className="text-xs font-bold text-neutral-900 font-mono break-all">{currentCitizen?.email || userEmail}</p>
            </div>

            <div className="border-t border-[#E5E5E5] pt-3">
              <span className="text-[9px] text-[#A1A1AA] uppercase block mb-0.5">Registered Customer Identity</span>
              <p className="text-xs font-bold text-neutral-900 font-sans">{currentCitizen?.name || userName}</p>
              {currentCitizen?.phone && <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{currentCitizen.phone}</p>}
            </div>

            <div className="border-t border-[#E5E5E5] pt-3 text-left">
              <span className="text-[9px] text-[#A1A1AA] uppercase block mb-1">Shipping Address</span>
              <p className="text-xs font-sans text-neutral-900 leading-normal">
                {currentCitizen?.location ? (
                  currentCitizen.location.includes(';') ? (
                    (() => {
                      const parts = currentCitizen.location.split(';');
                      return (
                        <>
                          {parts[0]}<br />
                          {parts[3]} {parts[1]}, {parts[2]}<br />
                          <span className="font-bold text-[10px] text-[#C9A96E] mt-0.5 block">{parts[4]}</span>
                        </>
                      );
                    })()
                  ) : (
                    currentCitizen.location
                  )
                ) : (
                  <>
                    Rue de l'Atelier 45<br />
                    1254 Geneva, CH<br />
                    <span className="font-bold text-[10px] text-[#C9A96E] mt-0.5 block">Switzerland</span>
                  </>
                )}
              </p>
            </div>

            <div className="border-t border-[#E5E5E5] pt-3 font-sans">
              <p className="text-neutral-500 leading-relaxed text-[10px]">
                Your account history tracks courier shipments, priority order alerts, and special promotional rates (such as **ATELIERGOLD** yielding 30% savings).
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
