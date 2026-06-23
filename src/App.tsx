/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ============================================================================
 * JUNIOR DEVELOPER FRONTEND TRAINING MANUAL: CLIENT CORE HUB (App.tsx)
 * ============================================================================
 * What is this file doing?
 * App.tsx is the central central router and state-synchronization hub of the app.
 * It is structured into clean modular pieces to maintain high scalability:
 *
 * 1. STATE MANAGEMENT (Zustand):
 *    Instead of drilling props through 15 levels of components, we use a global
 *    custom state manager (`useAppStore`). This is imported from `src/store/useAppStore.ts`
 *    and gives us instant, type-safe access to categories, products, checkout steps, etc.
 *
 * 2. ROUTING DESIGN (Pathless routing):
 *    To ensure smooth transition effects in an iframe constraints environment, we use
 *    a state-driven navigation architecture (`currentView`). We synchronize this with
 *    native browser histories so back/forward clicks still work.
 *
 * 3. SECURITY GATEWAYS:
 *    We enforce state boundaries — standard clients cannot see the Curator/Admin dashboard
 *    and vice versa. They are automatically redirected based on their session token status.
 *
 * 4. REUSABLE COMPONENT DIRECTORY GUIDE:
 *    - /src/components/common: Interactive fragments like Modals, Drawers, Portals.
 *    - /src/components/layout: Global static structures like the Navbar and Footer.
 *    - /src/components/pages: Complete layout structures rendered dynamically in our router switch.
 *    - /src/components/features: Complex heavy widgets (e.g. Admin Command Center or Profile Ledger).
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import Helmet from './components/common/Helmet';
import Navbar from './components/layout/Navbar';
import Homepage from './components/pages/Homepage';
import Shop from './components/pages/Shop';
import ProductDetailModal from './components/common/ProductDetailModal';
import CartDrawer from './components/common/CartDrawer';
import CheckoutPage from './components/pages/CheckoutPage';
import AdminDashboard from './components/features/AdminDashboard';
import ExportSuite from './components/features/ExportSuite';
import CustomerProfile from './components/features/CustomerProfile';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import AuthOverlay from './components/common/AuthOverlay';
import Footer from './components/layout/Footer';
import { useAppStore } from './store/useAppStore';
import { ShieldAlert, Check } from 'lucide-react';

export default function App() {
  const {
    categories,
    products,
    orders,
    currentView,
    currentCategorySlug,
    cartItems,
    isCartOpen,
    wishlist,
    isLoggedIn,
    isAdmin,
    userEmail,
    userName,
    activeProductForSpecs,
    toastMessage,
    fetchInitialData,
    setView,
    setCategorySlug,
    toggleWishlist,
    setIsCartOpen,
    showToast,
    login,
    logout,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateOrderStatus,
    addNewOrder,
    updateReviews,
    setActiveProductForSpecs,
    addCitizen
  } = useAppStore();

  // Scroll to top of the page when changing view state or active category
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView, currentCategorySlug]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Synchronize view state with window.location.pathname and verify login query param
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '') || 'home';
      const validViews = ['home', 'shop', 'admin', 'export', 'profile', 'checkout', 'about', 'contact'];
      if (validViews.includes(path)) {
        setView(path as any);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    // If query string has login=true or action=google-signin, pop open the authentication dialog automatically!
    if (typeof window !== 'undefined' && (window.location.search.includes('login=true') || window.location.search.includes('action=google-signin'))) {
      setShowAuthOverlay(true);
      // Clean query string (for login=true) to provide a pristine user visual experience; keeping action=google-signin for AuthOverlay detection
      if (window.location.search.includes('login=true')) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
      }
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setView]);

  // Security Gate & Direct Redirect Middleware
  useEffect(() => {
    if (isLoggedIn) {
      if (isAdmin) {
        // Enforce admin dashboard restriction, bypassing intermediate homepage landing
        const allowedAdminViews = ['admin', 'export', 'about', 'contact'];
        if (!allowedAdminViews.includes(currentView)) {
          setView('admin');
        }
      } else {
        // Enforce user profile dashboard restriction, bypassing intermediate homepage landing
        const allowedUserViews = ['profile', 'shop', 'checkout', 'about', 'contact'];
        if (!allowedUserViews.includes(currentView)) {
          setView('profile');
        }
      }
    }
  }, [isLoggedIn, isAdmin, currentView, setView]);

  // Auth Dialog overlays (keep locally as recommended for simple modal inputs)
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authIsRegistering, setAuthIsRegistering] = useState(false);
  const [isCheckingOutBeforeLogin, setIsCheckingOutBeforeLogin] = useState(false);

  const handleLogout = () => {
    logout();
    setView('home');
    showToast('Your session has secure logged out.');
  };

  // Determine SEO metadata dynamically for the current view state
  const getSeoMetadata = () => {
    switch (currentView) {
      case 'home':
        return {
          title: 'ORRIS Atelier | Architectural Curiosities & Horological Masterpieces',
          description: 'Explore ORRIS Atelier. We curate architectural luxury direct from Italian ateliers, Swiss clockwork, and private reserve fragrances, bypassing high-street markups.'
        };
      case 'shop': {
        const cat = categories.find(c => c.slug === currentCategorySlug);
        const catName = cat ? cat.name : 'All Collections';
        return {
          title: `Shop ${catName} | ORRIS Atelier`,
          description: `Acquire exquisite limited-edition items, precision-calibrated timekeeping instruments, and exceptional private reserve parfums in our ${catName.toLowerCase()} collection.`
        };
      }
      case 'admin':
        return {
          title: 'Curator Command Center | ORRIS Atelier',
          description: 'Dashboard console for ORRIS Atelier administration, inventory metrics, stock calibration, and client acquisition registries.'
        };
      case 'export':
        return {
          title: 'Next.js 15 Integration Suite | ORRIS Atelier',
          description: 'Seamlessly export your client-side architecture directly into Next.js production files for high performance and SSR ready distribution.'
        };
      case 'profile':
        return {
          title: 'My Private Reserve Account | ORRIS Atelier',
          description: 'Manage your customized profile, secure key transactions, watchlists, and verified acquisitions at ORRIS Atelier.'
        };
      case 'checkout':
        return {
          title: 'Acquisition Gateway | ORRIS Atelier',
          description: 'Complete your secure cryptographic purchase of premium goods using Stripe elements.'
        };
      case 'about':
        return {
          title: 'Our Manifesto & Atelier Craft | ORRIS Atelier',
          description: 'Learn about the core principles governing ORRIS Atelier. High-contrast artistry, direct-to-atelier partnerships, and timeless engineering.'
        };
      case 'contact':
        return {
          title: 'Consult a Curator | ORRIS Atelier',
          description: 'Contact our support desk. Reach out to our dedicated curations team for inquiries on bespoke sizing, orders, and horology questions.'
        };
      default:
        return {
          title: 'ORRIS Atelier | Architectural Curiosities',
          description: 'Exclusive direct-from-atelier luxury objects, precision timepieces, and reserve fragrances.'
        };
    }
  };

  const seo = getSeoMetadata();
  let finalTitle = seo.title;
  let finalDescription = seo.description;

  if (activeProductForSpecs) {
    finalTitle = `${activeProductForSpecs.name} Spec-Sheet | ORRIS Atelier`;
    finalDescription = `${activeProductForSpecs.name} - Detailed specifications, dimensional details, and acquisition guide. ${activeProductForSpecs.description}`;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between selection:bg-[#C9A96E] selection:text-black">
      <Helmet title={finalTitle} description={finalDescription} />
      
      {/* Front header controls */}
      <Navbar 
        categories={categories}
        currentCategorySlug={currentCategorySlug}
        setCategorySlug={setCategorySlug}
        currentView={currentView}
        setView={setView}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        openCart={() => setIsCartOpen(true)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userEmail={userEmail}
        onLogout={handleLogout}
        onLoginTrigger={() => {
          setAuthIsRegistering(false);
          setShowAuthOverlay(true);
        }}
      />

      {/* Floating toast notification bar */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 p-4 bg-[#0F0F0F] text-white rounded-lg shadow-2xl flex items-center gap-2.5 max-w-sm border border-neutral-800 animate-in slide-in-from-bottom duration-300">
          <Check className="w-5 h-5 text-[#C9A96E]" />
          <span className="text-xs font-mono tracking-wider font-light text-neutral-200">{toastMessage}</span>
        </div>
      )}

      {/* MAIN VIEWPORT PORTALS GRID */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <Homepage 
            categories={categories}
            products={products}
            onSelectCategory={setCategorySlug}
            onViewProduct={setActiveProductForSpecs}
            setView={setView}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentView === 'shop' && (
          <Shop 
            categories={categories}
            products={products}
            currentCategorySlug={currentCategorySlug}
            setCategorySlug={setCategorySlug}
            onViewProduct={setActiveProductForSpecs}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage 
            cartItems={cartItems}
            userEmail={userEmail}
            userName={userName}
            onClearCart={clearCart}
            onAddOrder={addNewOrder}
            setView={setView}
          />
        )}

        {currentView === 'profile' && (
          <CustomerProfile 
            userEmail={userEmail}
            userName={userName}
            isAdmin={isAdmin}
            orders={orders}
            setView={setView}
            onUpdateOrderStatus={updateOrderStatus}
            wishlist={wishlist}
            products={products}
            onToggleWishlist={toggleWishlist}
            onAddToCart={addToCart}
            onViewProduct={setActiveProductForSpecs}
          />
        )}

        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard 
              products={products}
              categories={categories}
              orders={orders}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onAddCategory={addCategory}
              onUpdateOrderStatus={updateOrderStatus}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#E5E5E5] text-center shadow-lg">
              <ShieldAlert className="w-12 h-12 text-red-650 mx-auto mb-4" />
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-2 text-neutral-900">Restricted Privileges</h3>
              <p className="text-xs text-neutral-500 mb-6 font-mono leading-relaxed">
                You must assume curator (admin) credentials to gain access to the secure Command center portal.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => {
                    setView('home');
                  }}
                  className="px-5 py-2.5 border border-[#E5E5E5] text-neutral-600 hover:text-black font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Return Home
                </button>
                <button 
                  onClick={() => {
                    setAuthIsRegistering(false);
                    setShowAuthOverlay(true);
                  }}
                  className="px-5 py-2.5 bg-black text-white hover:bg-[#C9A96E] hover:text-black font-bold text-[10px] uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Admin Authenticate
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'export' && (
          <ExportSuite onNotify={showToast} />
        )}

        {currentView === 'about' && (
          <AboutPage setView={setView} />
        )}

        {currentView === 'contact' && (
          <ContactPage setView={setView} showToast={showToast} />
        )}
      </main>

      {/* FOOTER METRIC BOTTOM */}
      <Footer />

      {/* SPECIFICATION PRODUCT DETAIL MODAL DRAWER */}
      {activeProductForSpecs && (
        <ProductDetailModal 
          product={activeProductForSpecs}
          onClose={() => setActiveProductForSpecs(null)}
          categories={categories}
          allProducts={products}
          onAddToCart={addToCart}
          onUpdateReviews={updateReviews}
          onViewProduct={setActiveProductForSpecs}
        />
      )}

      {/* PORTFOLIO BAG DRAWER SLIDER */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
        onViewProduct={setActiveProductForSpecs}
        onLoginTrigger={() => {
          setAuthIsRegistering(false);
          setShowAuthOverlay(true);
        }}
        onCheckoutTrigger={() => {
          setIsCartOpen(false);
          if (!isLoggedIn) {
            setIsCheckingOutBeforeLogin(true);
            setAuthIsRegistering(false);
            setShowAuthOverlay(true);
          } else {
            setView('checkout');
          }
        }}
        isLoggedIn={isLoggedIn}
        onContinueShopping={() => {
          setIsCartOpen(false);
          setView('shop');
        }}
      />

      {/* USER AUTH SECURE ACCOUNT OVERLAY */}
      <AuthOverlay 
        isOpen={showAuthOverlay}
        onClose={() => setShowAuthOverlay(false)}
        initialIsRegistering={authIsRegistering}
        isCheckingOutBeforeLogin={isCheckingOutBeforeLogin}
        setIsCheckingOutBeforeLogin={setIsCheckingOutBeforeLogin}
      />

    </div>
  );
}
