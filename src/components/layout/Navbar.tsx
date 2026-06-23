/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, User, Menu, X, Landmark, Globe, Hammer, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface NavbarProps {
  categories: Category[];
  currentCategorySlug: string | null;
  setCategorySlug: (slug: string | null) => void;
  currentView: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact';
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact') => void;
  cartCount: number;
  openCart: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string;
  onLogout: () => void;
  onLoginTrigger: () => void;
}

export default function Navbar({
  categories,
  currentCategorySlug,
  setCategorySlug,
  currentView,
  setView,
  cartCount,
  openCart,
  isLoggedIn,
  isAdmin,
  userEmail,
  onLogout,
  onLoginTrigger
}: NavbarProps) {
  const { 
    settings,
    currency,
    setCurrency,
    exchangeRates,
    fetchExchangeRates,
    isFetchingRates,
    showToast
  } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileUserDropdownOpen, setMobileUserDropdownOpen] = useState(false);

  // Lock body scrolling when mobile navigation drawer is active
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [mobileMenuOpen]);

  // Mobile collections accordion toggle
  const [mobCollectionsOpen, setMobCollectionsOpen] = useState(false);

  // Active styles
  const activeLinkClass = 'text-black font-semibold border-b border-[#C9A96E] pb-2 transition-all duration-300 tracking-[0.2em]';
  const inactiveLinkClass = 'text-neutral-400 hover:text-black font-light pb-2 transition-all duration-300 tracking-[0.2em] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-black hover:after:w-full after:transition-all after:duration-300';

  const handleCategorySelect = (slug: string | null) => {
    setCategorySlug(slug);
    setView('shop');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-[#E5E5E5] flex flex-col w-full selection:bg-[#C9A96E] selection:text-black">
      {/* Editorial top banner */}
      {settings?.isAnnouncementBarActive && (
        <div className="bg-[#0F0F0F] text-[#C9A96E] text-[10px] tracking-[0.3em] uppercase py-2.5 text-center font-bold px-4 select-none animate-pulse">
          {settings.announcementBarText}
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-4 lg:py-5 flex items-center justify-between relative">
        
        {/* Left / Hamburger: Only visible on mobile/tablet */}
        <div className="flex lg:hidden items-center">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-neutral-800 hover:text-black hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer rounded-none animate-fade-in"
            id="mobile-menu-open-btn"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5.5 h-5.5 stroke-[1.5]" />
            ) : (
              <Menu className="w-5.5 h-5.5 stroke-[1.5]" />
            )}
          </button>
        </div>
        
        {/* Brand Logo - Centered absolutely on mobile/tablet, Left-aligned on desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none z-10">
          <button 
            onClick={() => { setView('home'); setCategorySlug(null); }}
            className="text-xl md:text-2xl lg:text-3.5xl font-black tracking-[-0.05em] text-[#0F0F0F] hover:opacity-85 transition-all duration-300 select-none font-sans cursor-pointer flex flex-col items-center lg:items-start"
            id="brand-logo-btn"
          >
            <span className="leading-none">{settings?.brandName || 'ORRIS'}</span>
            <span className="hidden lg:inline text-[7px] font-mono tracking-[0.3em] text-neutral-400 uppercase mt-0.5">Geneva Atelier</span>
          </button>
        </div>

        {/* Middle Side: Desktop Navigation Links (hidden on tablet/mobile) */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.2em] font-medium">
          <button 
            onClick={() => { setView('home'); setCategorySlug(null); }}
            className={`cursor-pointer ${currentView === 'home' ? activeLinkClass : inactiveLinkClass}`}
            id="nav-home-btn"
          >
            Home
          </button>
          
          <button 
            onClick={() => handleCategorySelect(null)}
            className={`cursor-pointer ${currentView === 'shop' && currentCategorySlug === null ? activeLinkClass : inactiveLinkClass}`}
            id="nav-shop-all-btn"
          >
            Shop
          </button>

          {/* Collections Dropdown Menu */}
          <div className="relative group py-1">
            <button 
              className={`cursor-pointer flex items-center gap-1.5 transition-all duration-300 tracking-[0.2em] pb-2 font-medium ${
                currentView === 'shop' && currentCategorySlug !== null ? 'text-black font-semibold border-b border-[#C9A96E]' : 'text-neutral-400 hover:text-black'
              }`}
              id="nav-collections-dropdown-trigger"
            >
              <span>Collections</span>
              <span className="text-[7px] transition-transform group-hover:rotate-180 block duration-300">▼</span>
            </button>
            
            {/* Seamless hover bridge container using pt-2 instead of mt-2 */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-48 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 origin-top">
              <div className="bg-white border border-[#E5E5E5] shadow-xl p-2 flex flex-col gap-0.5 rounded-none text-left">
                {[
                  { name: 'Watches', slug: 'wristwatches' },
                  { name: 'Clothes', slug: 'clothing' },
                  { name: 'Perfumes', slug: 'perfumes' },
                  { name: 'Shoes', slug: 'shoes' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => handleCategorySelect(item.slug)}
                    className={`w-full text-left px-3.5 py-2 text-[10px] uppercase tracking-widest transition-colors cursor-pointer rounded-none hover:bg-neutral-50 ${
                      currentView === 'shop' && currentCategorySlug === item.slug ? 'text-black font-extrabold bg-neutral-50/50' : 'text-neutral-600 hover:text-black'
                    }`}
                    id={`nav-collections-item-${item.slug}`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setView('about'); setCategorySlug(null); }}
            className={`${currentView === 'about' ? activeLinkClass : inactiveLinkClass} cursor-pointer`}
            id="nav-about-btn"
          >
            About
          </button>

          <button 
            onClick={() => { setView('contact'); setCategorySlug(null); }}
            className={`${currentView === 'contact' ? activeLinkClass : inactiveLinkClass} cursor-pointer`}
            id="nav-contact-btn"
          >
            Contact
          </button>
        </nav>

        {/* Right Side: Desktop full menu , mobile only Cart trigger */}
        <div className="flex items-center gap-1.5 sm:gap-4 z-10">
          
          {/* Quick links for testing - Command button (Visible on desktop & tablet but hidden on narrow mobile) */}
          {isAdmin && (
            <button
              onClick={() => setView('admin')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[9px] uppercase font-bold tracking-widest cursor-pointer border transition-colors ${
                currentView === 'admin'
                  ? 'bg-black text-white border-black'
                  : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
              id="quick-admin-center-btn"
            >
              Command
            </button>
          )}

          {/* Sovereign Exchange & Asset Controller Dropdown (hidden on tablet and mobile) */}
          <div className="hidden lg:block relative group py-1">
            <button 
              className="px-2.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 hover:text-black border border-neutral-200 transition-all duration-300 rounded-none text-neutral-800 flex items-center gap-1.5 cursor-pointer font-mono text-[9px] font-bold uppercase tracking-wider relative"
              title="Sovereign Asset Rates"
              id="header-currency-selector-btn"
            >
              <Globe className="w-3 h-3 text-[#C9A96E]" />
              <span>{currency === 'XAU' ? 'GOLD (oz)' : currency}</span>
              <span className="text-[7px] text-neutral-400 font-sans">▼</span>
            </button>

            {/* Hover asset portal dropdown */}
            <div className="absolute right-0 top-full pt-2 w-72 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 origin-top-right">
              <div className="bg-white border border-[#E5E5E5] shadow-xl p-4 flex flex-col gap-3 rounded-none text-left">
                
                {/* Dropdown Header */}
                <div className="pb-2 border-b border-neutral-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F0F0F] font-serif">Sovereign Exchange</h4>
                    <span className="text-[8px] text-neutral-400 font-mono tracking-wider uppercase block">Global Valuation Desk</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchExchangeRates().then(() => {
                        showToast('Asset prices synchronized with global interbank feed.');
                      }).catch(() => {
                        showToast('Handshake with exchange broker restricted.');
                      });
                    }}
                    disabled={isFetchingRates}
                    className="p-1 text-neutral-400 hover:text-[#0f0f0f] hover:bg-neutral-50 transition-all duration-305 rounded cursor-pointer disabled:opacity-50"
                    title="Synchronize Quotes with Interbank Feed"
                  >
                    <svg className={`w-3.5 h-3.5 ${isFetchingRates ? 'animate-spin text-[#C9A96E]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 16H18" stroke="currentColor"/>
                    </svg>
                  </button>
                </div>

                {/* Rates List (Interactive Selector) */}
                <div className="space-y-1.5">
                  {[
                    { code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat' },
                    { code: 'EUR', name: 'Euro Asset', symbol: '€', type: 'fiat' },
                    { code: 'GBP', name: 'Sterling Specie', symbol: '£', type: 'fiat' },
                    { code: 'NGN', name: 'Naira Currency', symbol: '₦', type: 'fiat' },
                    { code: 'XAU', name: 'Gold Bullion', symbol: 'oz Au', type: 'commodity' },
                  ].map((asset) => {
                    const isSelected = currency === asset.code;
                    const rawRate = exchangeRates[asset.code as any] || 1.0;
                    
                    // Format display quote
                    let quoteStr = '';
                    if (asset.code === 'USD') {
                      quoteStr = 'Baseline Anchor';
                    } else if (asset.code === 'XAU') {
                      const goldPricePerOunce = (1 / rawRate);
                      quoteStr = `1 oz = $${goldPricePerOunce.toFixed(2)}`;
                    } else {
                      quoteStr = `1 USD = ${rawRate.toFixed(2)} ${asset.code}`;
                    }

                    return (
                      <button
                        key={asset.code}
                        onClick={() => setCurrency(asset.code as any)}
                        className={`w-full flex items-center justify-between p-2 text-left rounded-none border border-transparent transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-neutral-950 text-[#C9A96E] border-neutral-950 font-bold' 
                            : 'hover:bg-neutral-50 hover:border-neutral-100 text-neutral-700 hover:text-black font-light'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[10px] w-6 text-center ${isSelected ? 'text-[#C9A96E]' : 'text-neutral-400 font-bold'}`}>
                            {asset.symbol}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[10px] tracking-wide uppercase font-bold">{asset.name}</span>
                            <span className="text-[8px] font-mono text-neutral-400">{asset.code}</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <span className={`text-[9px] font-mono font-bold ${isSelected ? 'text-[#C9A96E]' : 'text-[#a3a3a3]'}`}>
                            {quoteStr}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-neutral-105 flex items-center justify-between text-[8px] font-mono text-neutral-400">
                  <span>Feed status: Online</span>
                  <span>UTC tick: {new Date().toISOString().substring(11, 16)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Account Dropdown Portal (hidden on tablet and mobile) */}
          <div className="hidden lg:block relative group py-1">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setView('profile');
                } else {
                  onLoginTrigger();
                }
              }}
              className={`p-1.5 transition-colors duration-305 rounded-none hover:bg-neutral-50 flex items-center justify-center cursor-pointer ${
                currentView === 'profile' ? 'text-[#C9A96E]' : 'text-neutral-800 hover:text-black'
              }`}
              title="Orris Member Portal"
              id="user-portal-trigger"
            >
              <User className="w-4.5 h-4.5" />
            </button>
            {/* Hover dropdown list bridged seamlessly with pt-2 instead of mt-2 */}
            <div className="absolute right-0 top-full pt-2 w-52 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-50 origin-top-right">
              <div className="bg-white border border-[#E5E5E5] shadow-xl p-1 flex flex-col gap-0.5 rounded-none text-left">
                {isLoggedIn ? (
                  <>
                    <div className="px-3.5 py-2.5 text-[9px] text-neutral-500 font-mono uppercase border-b border-[#E5E5E5] truncate font-bold bg-neutral-50/50">
                      User: {userEmail}
                    </div>
                    <button 
                      onClick={() => setView('profile')}
                      className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors rounded-none cursor-pointer"
                      id="drop-my-profile-btn"
                    >
                      My Profile Information
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => setView('admin')}
                        className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors rounded-none cursor-pointer"
                        id="drop-command-btn"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button 
                      onClick={onLogout}
                      className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-black text-red-650 hover:bg-red-50 transition-colors rounded-none border-t border-[#E5E5E5]/80 mt-1 cursor-pointer"
                      id="user-dropdown-signout-btn"
                    >
                      Sign Out / Exit
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={onLoginTrigger}
                      className="w-full text-left px-3.5 py-3 text-[10px] uppercase tracking-[0.15em] font-black text-emerald-800 bg-emerald-50/30 hover:bg-emerald-50 transition-colors rounded-none cursor-pointer"
                      id="user-dropdown-signin-btn"
                    >
                      Sign In to Account
                    </button>
                    <button 
                      disabled
                      className="w-full text-left px-3.5 py-3 text-[10px] uppercase tracking-[0.14em] font-bold text-neutral-400 opacity-50 rounded-none border-t border-[#E5E5E5]/60 cursor-not-allowed"
                    >
                      Sign Out (Inactive)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User Avatar Action for Mobile/Tablet */}
          <div className="block lg:hidden relative">
            <button 
              onClick={() => {
                if (isLoggedIn) {
                  setMobileUserDropdownOpen(!mobileUserDropdownOpen);
                } else {
                  onLoginTrigger();
                }
              }}
              className="p-1.5 hover:bg-neutral-50 relative transition-transform hover:scale-105 cursor-pointer rounded-none flex items-center justify-center"
              title="Orris Member Portal"
              id="navbar-mobile-user-avatar"
            >
              {isLoggedIn ? (
                <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-[#C9A96E] flex items-center justify-center font-mono text-[10px] font-bold border border-[#C9A96E]/50 shadow-sm tracking-normal">
                  {userEmail?.charAt(0).toUpperCase() || 'M'}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4 stroke-[1.5]" />
                </div>
              )}
            </button>

            {isLoggedIn && mobileUserDropdownOpen && (
              <>
                {/* Invisible backing layer to close on clicking outside on mobile dropdown */}
                <div 
                  className="fixed inset-0 z-[9999] bg-transparent"
                  onClick={() => setMobileUserDropdownOpen(false)}
                />
                {/* Mobile Dropdown Portal (Z-50 context is perfect relative to button parent) */}
                <div className="absolute right-0 top-full pt-1.5 w-52 z-[10000] origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white border border-[#E5E5E5] shadow-xl p-1 flex flex-col gap-0.5 rounded-none text-left">
                    <div className="px-3.5 py-2.5 text-[9px] text-neutral-500 font-mono uppercase border-b border-[#E5E5E5] truncate font-bold bg-neutral-50/50">
                      User: {userEmail}
                    </div>
                    <button 
                      onClick={() => {
                        setView('profile');
                        setMobileUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors rounded-none cursor-pointer"
                      id="mobile-drop-my-profile-btn"
                    >
                      My Profile Information
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setView('admin');
                          setMobileUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors rounded-none cursor-pointer"
                        id="mobile-drop-command-btn"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        onLogout();
                        setMobileUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-[10px] uppercase tracking-widest font-black text-red-650 hover:bg-red-50 transition-colors rounded-none border-t border-[#E5E5E5]/85 mt-1 cursor-pointer"
                      id="mobile-user-dropdown-signout-btn"
                    >
                      Sign Out / Exit
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cart Bag Trigger with Gold Counter Dot */}
          <button 
            onClick={openCart}
            className="p-2 text-neutral-800 hover:text-black rounded-none hover:bg-neutral-50 relative flex items-center justify-center transition-transform hover:scale-105 cursor-pointer -mr-2"
            title="Open Shopping Cart"
            id="navbar-cart-trigger-btn"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C9A96E] text-[#0F0F0F] text-[8px] font-bold rounded-full flex items-center justify-center border border-white font-mono shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Premium Inline Slide-Down Navigation Drawer for Tablet & Mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full bg-white border-t border-[#E5E5E5] overflow-hidden lg:hidden"
            id="mobile-navigation-dropdown-panel"
          >
            <div className="max-w-7xl mx-auto w-full px-6 py-6 flex flex-col gap-6 select-none bg-white">
              <div className="flex flex-col gap-1">
                {/* Section label */}
                <span className="text-[7.5px] font-mono tracking-[0.25em] text-neutral-400 uppercase block mb-1 text-left">
                  Maison Directory
                </span>

                {/* 1. HOME */}
                <button
                  onClick={() => { setView('home'); setCategorySlug(null); setMobileMenuOpen(false); }}
                  className={`w-full py-3.5 text-left border-b border-[#E5E5E5]/60 flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'home' ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                  id="mob-nav-home-btn"
                >
                  <span className="text-[11px] uppercase tracking-[0.25em] font-medium">Home</span>
                  {currentView === 'home' && <span className="w-1.5 h-1.5 bg-[#C9A96E]" />}
                </button>

                {/* 2. SHOP */}
                <button
                  onClick={() => { handleCategorySelect(null); }}
                  className={`w-full py-3.5 text-left border-b border-[#E5E5E5]/60 flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'shop' && currentCategorySlug === null ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                  id="mob-nav-shop-all-btn"
                >
                  <span className="text-[11px] uppercase tracking-[0.25em] font-medium">Shop</span>
                  {currentView === 'shop' && currentCategorySlug === null && <span className="w-1.5 h-1.5 bg-[#C9A96E]" />}
                </button>

                {/* 3. COLLECTIONS ACCORDION */}
                <div className="border-b border-[#E5E5E5]/60 py-1">
                  <button
                    onClick={() => setMobCollectionsOpen(!mobCollectionsOpen)}
                    className="w-full py-2.5 text-left flex items-center justify-between text-neutral-500 hover:text-black transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] uppercase tracking-[0.25em] font-medium">Collections</span>
                    <span className="text-[8px] font-mono font-bold text-[#C9A96E] tracking-widest bg-[#C9A96E]/10 px-2 py-0.5">
                      {mobCollectionsOpen ? 'COLLAPSE ▲' : 'EXPAND ▼'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {mobCollectionsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-4 pr-2 py-1 flex flex-col gap-1.5"
                      >
                        {[
                          { name: 'Watches', slug: 'wristwatches' },
                          { name: 'Clothes', slug: 'clothing' },
                          { name: 'Perfumes', slug: 'perfumes' },
                          { name: 'Shoes', slug: 'shoes' },
                        ].map((item) => {
                          const isSelected = currentView === 'shop' && currentCategorySlug === item.slug;
                          return (
                            <button
                              key={item.slug}
                              onClick={() => { handleCategorySelect(item.slug); }}
                              className={`w-full text-left py-2.5 text-[10.5px] uppercase tracking-widest transition-colors cursor-pointer ${
                                isSelected ? 'text-black font-semibold border-l-2 border-[#C9A96E] pl-2 bg-neutral-50/50px' : 'text-neutral-500 hover:text-black'
                              }`}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 4. ABOUT */}
                <button
                  onClick={() => { setView('about'); setCategorySlug(null); setMobileMenuOpen(false); }}
                  className={`w-full py-3.5 text-left border-b border-[#E5E5E5]/60 flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'about' ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                  id="mob-nav-about-btn"
                >
                  <span className="text-[11px] uppercase tracking-[0.25em] font-medium">About</span>
                  {currentView === 'about' && <span className="w-1.5 h-1.5 bg-[#C9A96E]" />}
                </button>

                {/* 5. CONTACT */}
                <button
                  onClick={() => { setView('contact'); setCategorySlug(null); setMobileMenuOpen(false); }}
                  className={`w-full py-3.5 text-left border-b border-[#E5E5E5]/60 flex items-center justify-between transition-colors cursor-pointer ${
                    currentView === 'contact' ? 'text-[#0F0F0F] font-semibold' : 'text-neutral-500 hover:text-black'
                  }`}
                  id="mob-nav-contact-btn"
                >
                  <span className="text-[11px] uppercase tracking-[0.25em] font-medium">Contact</span>
                  {currentView === 'contact' && <span className="w-1.5 h-1.5 bg-[#C9A96E]" />}
                </button>
              </div>

              {/* Lower Section: Currency Valuation & Auth */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Sovereign Exchange Widget */}
                <div className="bg-neutral-50 border border-neutral-250 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[8px] font-bold text-neutral-500 font-mono uppercase tracking-[0.25em]">
                      Sovereign Exchange
                    </span>
                    <span className="text-[7.5px] bg-[#C9A96E]/20 text-[#C9A96E] font-mono px-1.5 py-0.5 font-bold uppercase tracking-widest">
                      Desk Live
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['USD', 'EUR', 'GBP', 'NGN', 'XAU'] as const).map((curr) => {
                      const isSelected = currency === curr;
                      let dispSymbol = '$';
                      if (curr === 'EUR') dispSymbol = '€';
                      if (curr === 'GBP') dispSymbol = '£';
                      if (curr === 'NGN') dispSymbol = '₦';
                      if (curr === 'XAU') dispSymbol = 'oz';
                      return (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`py-2 text-center border font-mono text-[9px] font-bold transition-all cursor-pointer rounded-none outline-none ${
                            isSelected 
                              ? 'bg-neutral-950 text-[#C9A96E] border-neutral-950' 
                              : 'border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100'
                          }`}
                        >
                          <div className="text-[10px] font-sans h-3 flex items-center justify-center font-bold">{dispSymbol}</div>
                          <div className="text-[7px] opacity-75">{curr}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-3 text-[9.5px] font-mono text-neutral-600 bg-white p-2 border border-neutral-250">
                    <div className="flex flex-col text-left">
                      <span className="text-[6.5px] text-neutral-400 uppercase tracking-wider">Internal Quote</span>
                      <span className="font-bold text-neutral-800 text-[8.5px] mt-0.5">
                        {currency === 'XAU' 
                          ? `1 oz Au = $${(1 / (exchangeRates.XAU || 0.000416)).toFixed(2)}` 
                          : currency === 'USD' 
                            ? 'Baseline USD Anchor' 
                            : `1 USD = ${(exchangeRates[currency] || 1.0).toFixed(2)} ${currency}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Portal details */}
                <div className="bg-neutral-50 border border-neutral-250 p-4 flex flex-col justify-between">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-neutral-600 font-mono uppercase truncate font-bold">
                          Client: {userEmail}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          onClick={() => { setView('profile'); setMobileMenuOpen(false); }}
                          className={`py-1.5 border text-[9px] uppercase font-bold tracking-widest rounded-none bg-white hover:bg-white text-neutral-800 ${
                            currentView === 'profile' ? 'border-[#C9A96E] text-[#C9A96E] bg-[#C9A96E]/5' : 'border-[#E5E5E5]'
                          }`}
                        >
                          My Profile
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => { setView('admin'); setMobileMenuOpen(false); }}
                            className={`py-1.5 border text-[9px] uppercase font-bold tracking-widest rounded-none bg-white hover:bg-white text-neutral-800 ${
                              currentView === 'admin' ? 'border-[#C9A96E] text-[#C9A96E] bg-[#C9A96E]/5' : 'border-[#E5E5E5]'
                            }`}
                          >
                            Cmd Center
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                        className="w-full text-center py-2 bg-neutral-900 text-[#C9A96E] hover:bg-black text-[9px] font-bold uppercase tracking-widest rounded-none border border-transparent mt-2 transition-colors duration-300 cursor-pointer animate-fade-in"
                        id="mob-nav-logout-btn"
                      >
                        Exit Account Portal
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 h-full justify-center">
                      <p className="text-[9px] text-neutral-400 font-mono uppercase">AUTHENTICATION REQUIRED</p>
                      <button 
                        onClick={() => { onLoginTrigger(); setMobileMenuOpen(false); }}
                        className="w-full py-3 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black text-[9.5px] font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer border border-black"
                        id="mob-nav-login-btn"
                      >
                        Authenticate Member Account
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Secure footer footer row inside dropdown */}
              <div className="flex items-center justify-between text-[7.5px] font-mono text-neutral-400 border-t border-neutral-150 pt-3">
                <span>Atelier Interface v2.5</span>
                <span>UTC Time: {new Date().toISOString().substring(11, 16)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

