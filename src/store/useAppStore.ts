/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Category, Product, Order, CartItem, OrderStatus, Review, Citizen, MaisonSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CITIZENS, INITIAL_SETTINGS } from '../mockData';

// Helper to interact with localStorage safely in SSR/non-browser environment
const getSafeLocalStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const getSafeLocalStorageString = (key: string, fallback: string): string => {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
};

const getSafeLocalStorageBool = (key: string, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return fallback;
  }
};

const setSafeLocalStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }
};

const removeSafeLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(e);
    }
  }
};

export interface AppStoreState {
  categories: Category[];
  products: Product[];
  orders: Order[];
  currentView: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact';
  currentCategorySlug: string | null;
  cartItems: CartItem[];
  isCartOpen: boolean;
  wishlist: string[];
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string;
  userName: string;
  authToken: string;
  activeProductForSpecs: Product | null;
  toastMessage: string | null;
  sort: string;
  promoCode: string;
  discountPercent: number;
  promoSuccess: string;
  promoError: string;

  // Real-time exchange rate additions
  currency: 'USD' | 'EUR' | 'GBP' | 'NGN' | 'XAU';
  exchangeRates: { USD: number; EUR: number; GBP: number; NGN: number; XAU: number; };
  isFetchingRates: boolean;
  ratesError: string | null;
  setCurrency: (currency: 'USD' | 'EUR' | 'GBP' | 'NGN' | 'XAU') => void;
  fetchExchangeRates: () => Promise<void>;
  formatPrice: (usdPrice: number) => string;
  getRawPrice: (usdPrice: number) => number;

  fetchInitialData: () => Promise<void>;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact') => void;
  setCategorySlug: (slug: string | null) => void;
  setSort: (sort: string) => void;
  setPromoDiscount: (code: string, percent: number, success: string, error: string) => void;
  clearPromoDiscount: () => void;
  setCartItems: (items: CartItem[]) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  setWishlist: (wishlist: string[]) => void;
  toggleWishlist: (productId: string) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setUserEmail: (userEmail: string) => void;
  setUserName: (userName: string) => void;
  setActiveProductForSpecs: (activeProductForSpecs: Product | null) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  loginWithGoogle: (email: string, name: string, uid: string) => Promise<{ success: boolean; error?: string; isAdmin?: boolean }>;
  logout: () => void;
  addToCart: (product: Product, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  updateCartQty: (productId: string, qty: number, size?: string, color?: string) => void;
  clearCart: () => void;
  addProduct: (newProduct: Product) => Promise<void>;
  updateProduct: (updated: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (newCat: Category) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addNewOrder: (newOrder: Order) => Promise<void>;
  resendOrderEmail: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  updateReviews: (productId: string, reviews: Review[]) => Promise<void>;

  citizens: Citizen[];
  settings: MaisonSettings;
  addCitizen: (citizen: Citizen, password?: string, emailCode?: string, phoneCode?: string) => Promise<void>;
  updateCitizen: (citizen: Citizen) => Promise<void>;
  deleteCitizen: (id: string) => Promise<void>;
  updateSettings: (settings: MaisonSettings) => Promise<void>;
}

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

interface FetchOptions extends RequestInit {
  silentOnStatus?: number[];
}

const apiFetch = async (input: RequestInfo | URL, init?: FetchOptions): Promise<Response> => {
  try {
    const response = await fetch(input, init);
    
    if (!response.ok) {
      if (init?.silentOnStatus && init.silentOnStatus.includes(response.status)) {
        return response;
      }

      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const clonedResponse = response.clone();
        const json = await clonedResponse.json();
        if (json && typeof json.error === 'string') {
          errorMessage = json.error;
        } else if (json && typeof json.message === 'string') {
          errorMessage = json.message;
        }
      } catch (e) {
        try {
          const textResponse = response.clone();
          const text = await textResponse.text();
          if (text && text.length < 100) {
            errorMessage = text;
          }
        } catch {}
      }

      const store = useAppStore.getState();
      if (store && store.showToast) {
        store.showToast(`Atelier Error: ${errorMessage}`);
      }
    }
    return response;
  } catch (err: any) {
    console.error('[API Network Error]', err);
    if (!(init?.silentOnStatus && init.silentOnStatus.includes(500))) {
      const store = useAppStore.getState();
      if (store && store.showToast) {
        store.showToast(`Network Error: Lost synchronization with server.`);
      }
    }
    throw err;
  }
};


export const useAppStore = create<AppStoreState>((set, get) => ({
  categories: getSafeLocalStorage<Category[]>('orris-categories-db', INITIAL_CATEGORIES),
  products: getSafeLocalStorage<Product[]>('orris-products-db', INITIAL_PRODUCTS),
  orders: getSafeLocalStorage<Order[]>('orris-orders-db', INITIAL_ORDERS),
  citizens: getSafeLocalStorage<Citizen[]>('orris-citizens-db', INITIAL_CITIZENS),
  settings: getSafeLocalStorage<MaisonSettings>('orris-settings-db', INITIAL_SETTINGS),
  currentView: (typeof window !== 'undefined' && ['home', 'shop', 'admin', 'export', 'profile', 'checkout', 'about', 'contact'].includes(window.location.pathname.replace(/^\//, ''))) 
    ? (window.location.pathname.replace(/^\//, '') as any) 
    : 'home',
  currentCategorySlug: null,
  cartItems: getSafeLocalStorage<CartItem[]>('orris-cart-state', []),
  isCartOpen: false,
  wishlist: getSafeLocalStorage<string[]>('orris-wishlist-state', []),
  isLoggedIn: getSafeLocalStorageBool('orris-auth-isloggedin', false),
  isAdmin: getSafeLocalStorageBool('orris-auth-isadmin', false),
  userEmail: getSafeLocalStorageString('orris-auth-email', ''),
  userName: getSafeLocalStorageString('orris-auth-name', ''),
  authToken: getSafeLocalStorageString('orris-session-token', ''),
  activeProductForSpecs: null,
  toastMessage: null,
  sort: 'featured',
  promoCode: '',
  discountPercent: 0,
  promoSuccess: '',
  promoError: '',

  currency: getSafeLocalStorage<'USD' | 'EUR' | 'GBP' | 'NGN' | 'XAU'>('orris-currency', 'USD'),
  exchangeRates: getSafeLocalStorage<{ USD: number; EUR: number; GBP: number; NGN: number; XAU: number; }>('orris-exchange-rates', {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    NGN: 1485.0,
    XAU: 0.000416,
  }),
  isFetchingRates: false,
  ratesError: null,

  setCurrency: (curr) => {
    set({ currency: curr });
    setSafeLocalStorage('orris-currency', curr);
    get().showToast(`Sovereign Catalog currency toggled to: ${curr === 'XAU' ? 'Gold (Ounces)' : curr}`);
  },

  fetchExchangeRates: async () => {
    set({ isFetchingRates: true, ratesError: null });
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!response.ok) throw new Error('Handshake with Exchange API refused.');
      const data = await response.json();
      if (data && data.rates) {
        const rates = {
          USD: 1.0,
          EUR: data.rates.EUR || 0.92,
          GBP: data.rates.GBP || 0.78,
          NGN: data.rates.NGN || 1485.0,
          XAU: data.rates.XAU || 0.000416
        };
        set({ exchangeRates: rates, isFetchingRates: false });
        setSafeLocalStorage('orris-exchange-rates', rates);
      } else {
        throw new Error('Malformed API exchange rate record structure.');
      }
    } catch (err: any) {
      console.warn('[EXCHANGE RATE BROKER RESTRICTED]', err);
      set({ isFetchingRates: false, ratesError: err.message || 'Offline API' });
    }
  },

  formatPrice: (usdPrice: number) => {
    const { currency, exchangeRates } = get();
    const rate = exchangeRates[currency] || 1.0;
    const value = usdPrice * rate;
    
    if (currency === 'XAU') {
      return `${value.toFixed(3)} oz Au`;
    }
    if (currency === 'NGN') {
      return `₦${Math.round(value).toLocaleString()}`;
    }
    if (currency === 'EUR') {
      return `€${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    if (currency === 'GBP') {
      return `£${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    }
    // Default USD
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  },

  getRawPrice: (usdPrice: number) => {
    const { currency, exchangeRates } = get();
    const rate = exchangeRates[currency] || 1.0;
    return usdPrice * rate;
  },

  fetchInitialData: async () => {
    // Background fetch real-time exchange quotes
    get().fetchExchangeRates().catch(() => {});

    try {
      const token = get().authToken || getSafeLocalStorageString('orris-session-token', '');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const [prodRes, catRes, orderRes, citizenRes, settingsRes] = await Promise.all([
        apiFetch('/api/products'),
        apiFetch('/api/categories'),
        apiFetch('/api/orders', { headers, silentOnStatus: [401, 403] }),
        apiFetch('/api/citizens', { headers, silentOnStatus: [401, 403] }),
        apiFetch('/api/settings')
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        set({ products: prodData });
        setSafeLocalStorage('orris-products-db', prodData);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        set({ categories: catData });
        setSafeLocalStorage('orris-categories-db', catData);
      }
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        set({ orders: orderData });
        setSafeLocalStorage('orris-orders-db', orderData);
      }
      if (citizenRes && citizenRes.ok) {
        const citizenData = await citizenRes.json();
        set({ citizens: citizenData });
        setSafeLocalStorage('orris-citizens-db', citizenData);
      }
      if (settingsRes && settingsRes.ok) {
        const settingsData = await settingsRes.json();
        set({ settings: settingsData });
        setSafeLocalStorage('orris-settings-db', settingsData);
      }
    } catch (err) {
      console.warn('[ORRIS] Server connection unavailable, operating in standalone persistent client mode.', err);
    }
  },

  setCategories: (categories: Category[]) => {
    set({ categories });
    setSafeLocalStorage('orris-categories-db', categories);
  },
  
  setProducts: (products: Product[]) => {
    set({ products });
    setSafeLocalStorage('orris-products-db', products);
  },

  setOrders: (orders: Order[]) => {
    set({ orders });
    setSafeLocalStorage('orris-orders-db', orders);
  },

  setView: (currentView: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact') => {
    set({ currentView });
    if (typeof window !== 'undefined') {
      const path = currentView === 'home' ? '/' : `/${currentView}`;
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  },
  setCategorySlug: (currentCategorySlug: string | null) => set({ currentCategorySlug }),
  setSort: (sort: string) => set({ sort }),
  setPromoDiscount: (promoCode: string, discountPercent: number, promoSuccess: string, promoError: string) => set({ promoCode, discountPercent, promoSuccess, promoError }),
  clearPromoDiscount: () => set({ promoCode: '', discountPercent: 0, promoSuccess: '', promoError: '' }),
  
  setCartItems: (cartItems: CartItem[]) => {
    set({ cartItems });
    setSafeLocalStorage('orris-cart-state', cartItems);
  },

  setIsCartOpen: (isCartOpen: boolean) => set({ isCartOpen }),

  setWishlist: (wishlist: string[]) => {
    set({ wishlist });
    setSafeLocalStorage('orris-wishlist-state', wishlist);
  },

  toggleWishlist: (productId: string) => {
    const { wishlist, products, showToast } = get();
    const exists = wishlist.includes(productId);
    const updated = exists 
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    
    set({ wishlist: updated });
    setSafeLocalStorage('orris-wishlist-state', updated);

    const product = products.find((p) => p.id === productId);
    if (product) {
      showToast(exists ? `Removed "${product.name}" from your saved wishlist.` : `Saved "${product.name}" into your private wishlist.`);
    }
  },

  setIsLoggedIn: (isLoggedIn: boolean) => {
    set({ isLoggedIn });
    setSafeLocalStorage('orris-auth-isloggedin', String(isLoggedIn));
  },

  setIsAdmin: (isAdmin: boolean) => {
    set({ isAdmin });
    setSafeLocalStorage('orris-auth-isadmin', String(isAdmin));
  },

  setUserEmail: (userEmail: string) => {
    set({ userEmail });
    setSafeLocalStorage('orris-auth-email', userEmail);
  },

  setUserName: (userName: string) => {
    set({ userName });
    setSafeLocalStorage('orris-auth-name', userName);
  },

  setActiveProductForSpecs: (activeProductForSpecs: Product | null) => set({ activeProductForSpecs }),

  showToast: (message: string) => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toastMessage: message });
    toastTimeout = setTimeout(() => {
      set({ toastMessage: null });
    }, 4000);
  },

  clearToast: () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    set({ toastMessage: null });
  },

  login: async (email: string, pass: string) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        set({
          isLoggedIn: true,
          isAdmin: data.role === 'ADMIN',
          userEmail: data.email,
          userName: data.name,
          authToken: data.token,
        });
        setSafeLocalStorage('orris-auth-isloggedin', 'true');
        setSafeLocalStorage('orris-auth-isadmin', String(data.role === 'ADMIN'));
        setSafeLocalStorage('orris-auth-email', data.email);
        setSafeLocalStorage('orris-auth-name', data.name);
        setSafeLocalStorage('orris-session-token', data.token);
        // Triggers re-fetch of now authenticated endpoints
        get().fetchInitialData();
        return { success: true, isAdmin: data.role === 'ADMIN' };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Access denied.' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Database handshake offline.' };
    }
  },

  loginWithGoogle: async (email: string, name: string, uid: string) => {
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, uid })
      });
      if (res.ok) {
        const data = await res.json();
        set({
          isLoggedIn: true,
          isAdmin: data.role === 'ADMIN',
          userEmail: data.email,
          userName: data.name,
          authToken: data.token,
        });
        setSafeLocalStorage('orris-auth-isloggedin', 'true');
        setSafeLocalStorage('orris-auth-isadmin', String(data.role === 'ADMIN'));
        setSafeLocalStorage('orris-auth-email', data.email);
        setSafeLocalStorage('orris-auth-name', data.name);
        setSafeLocalStorage('orris-session-token', data.token);
        // Triggers re-fetch of now authenticated endpoints
        get().fetchInitialData();
        return { success: true, isAdmin: data.role === 'ADMIN' };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Access denied.' };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Database handshake offline.' };
    }
  },

  logout: () => {
    set({
      isLoggedIn: false,
      isAdmin: false,
      userEmail: '',
      userName: '',
      authToken: '',
      currentView: 'home',
    });
    removeSafeLocalStorage('orris-auth-isloggedin');
    removeSafeLocalStorage('orris-auth-isadmin');
    removeSafeLocalStorage('orris-auth-email');
    removeSafeLocalStorage('orris-auth-name');
    removeSafeLocalStorage('orris-session-token');

    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      document.cookie = "orris_session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  },

  addToCart: (product: Product, quantity: number, size?: string, color?: string) => {
    const { cartItems, showToast } = get();
    if (product.inventory === 0) {
      showToast(`Unable to acquire. ${product.name} is currently sold out.`);
      return;
    }

    const existingIdx = cartItems.findIndex((item) => 
      item.product.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor === color
    );

    let updated: CartItem[];
    if (existingIdx > -1) {
      updated = [...cartItems];
      const newQty = updated[existingIdx].quantity + quantity;
      updated[existingIdx].quantity = Math.min(newQty, product.inventory);
    } else {
      updated = [...cartItems, { product, quantity, selectedSize: size, selectedColor: color }];
    }

    set({ cartItems: updated, isCartOpen: true });
    setSafeLocalStorage('orris-cart-state', updated);
    showToast(`Successfully packaged ${quantity}x ${product.name} in your bag.`);
  },

  removeFromCart: (productId: string, size?: string, color?: string) => {
    const { cartItems, showToast } = get();
    const updated = cartItems.filter((item) => 
      !(item.product.id === productId && 
        item.selectedSize === size && 
        item.selectedColor === color)
    );
    set({ cartItems: updated });
    setSafeLocalStorage('orris-cart-state', updated);
    showToast('Item purged from acquisition slots.');
  },

  updateCartQty: (productId: string, qty: number, size?: string, color?: string) => {
    const { cartItems } = get();
    const updated = cartItems.map((item) => {
      if (item.product.id === productId && item.selectedSize === size && item.selectedColor === color) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    set({ cartItems: updated });
    setSafeLocalStorage('orris-cart-state', updated);
  },

  clearCart: () => {
    set({ cartItems: [] });
    setSafeLocalStorage('orris-cart-state', []);
  },

  addProduct: async (newProduct: Product) => {
    const { products, showToast } = get();
    // Optimistic Update
    const updated = [newProduct, ...products];
    set({ products: updated });
    setSafeLocalStorage('orris-products-db', updated);

    try {
      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const prod = await res.json();
        // Replace optimistic version with server final response
        set({ products: [prod, ...products.filter((p) => p.id !== newProduct.id)] });
      }
    } catch (err) {
      console.warn('API error duringaddProduct, state is saved locally:', err);
    }
    showToast(`Published product ${newProduct.name} to frontend portfolio.`);
  },

  updateProduct: async (updatedProduct: Product) => {
    const { products, showToast } = get();
    // Optimistic Update
    const updated = products.map((p) => p.id === updatedProduct.id ? updatedProduct : p);
    set({ products: updated });
    setSafeLocalStorage('orris-products-db', updated);

    try {
      await apiFetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify(updatedProduct)
      });
    } catch (err) {
      console.warn('API error during updateProduct, state is saved locally:', err);
    }
    showToast(`Saved layout updates for ${updatedProduct.name}.`);
  },

  deleteProduct: async (id: string) => {
    const { products, showToast } = get();
    // Optimistic Update
    const updated = products.map((p) => p.id === id ? { ...p, isActive: false } : p);
    set({ products: updated });
    setSafeLocalStorage('orris-products-db', updated);

    try {
      await apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${get().authToken}`
        }
      });
    } catch (err) {
      console.warn('API error during deleteProduct, state is saved locally:', err);
    }
    showToast('Item status deleted from active catalogs.');
  },

  addCategory: async (newCat: Category) => {
    const { categories, showToast } = get();
    // Optimistic Update
    const updated = [...categories, newCat];
    set({ categories: updated });
    setSafeLocalStorage('orris-categories-db', updated);

    try {
      const res = await apiFetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify(newCat)
      });
      if (res.ok) {
        const cat = await res.json();
        set({ categories: [...categories.filter((c) => c.id !== newCat.id), cat] });
      }
    } catch (err) {
      console.warn('API error during addCategory, state is saved locally:', err);
    }
    showToast(`Created house division catalog: ${newCat.name}`);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const { orders, showToast } = get();
    // Optimistic Update
    const updated = orders.map((o) => o.id === orderId ? { ...o, status } : o);
    set({ orders: updated });
    setSafeLocalStorage('orris-orders-db', updated);

    try {
      await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.warn('API error during updateOrderStatus, state is saved locally:', err);
    }
    showToast(`Order ID ${orderId} status set to: ${status}`);
  },

  resendOrderEmail: async (orderId: string) => {
    const { showToast } = get();
    try {
      const res = await apiFetch(`/api/orders/${orderId}/resend-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${get().authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        showToast(data.message || 'Transmission dispatched successfully.');
        return { success: true };
      } else {
        const data = await res.json();
        const err = data.error || 'Dispatch failed.';
        showToast(`SMTP Error: ${err}`);
        return { success: false, error: err };
      }
    } catch (err: any) {
      console.error(err);
      showToast('SMTP Handshake Error: server could not be reached.');
      return { success: false, error: 'Database network offline' };
    }
  },

  addNewOrder: async (newOrder: Order) => {
    const { orders, products, showToast } = get();
    // Optimistic Update
    const updatedOrders = [newOrder, ...orders];
    const updatedProducts = products.map((p) => {
      const orderItem = newOrder.items.find((it) => it.productId === p.id);
      if (orderItem) {
        return {
          ...p,
          inventory: Math.max(0, p.inventory - orderItem.quantity)
        };
      }
      return p;
    });

    set({ 
      orders: updatedOrders,
      products: updatedProducts 
    });
    setSafeLocalStorage('orris-orders-db', updatedOrders);
    setSafeLocalStorage('orris-products-db', updatedProducts);

    const token = get().authToken;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const data = await res.json();
        // Server will return actual updated products with real stocks
        if (data.products) {
          set({ products: data.products });
          setSafeLocalStorage('orris-products-db', data.products);
        }
      }
    } catch (err) {
      console.warn('API error during addNewOrder, state is saved locally:', err);
    }
    showToast('Secure settlement dispatched. Inventories adjusted.');
  },

  updateReviews: async (productId: string, reviews: Review[]) => {
    const { products, activeProductForSpecs, showToast } = get();
    // Optimistic Update
    const updatedProducts = products.map((p) => p.id === productId ? { ...p, reviews } : p);
    
    set({ products: updatedProducts });
    setSafeLocalStorage('orris-products-db', updatedProducts);

    if (activeProductForSpecs && activeProductForSpecs.id === productId) {
      set({ activeProductForSpecs: { ...activeProductForSpecs, reviews } });
    }

    const token = get().authToken;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify(reviews)
      });
    } catch (err) {
      console.warn('API error during updateReviews, state is saved locally:', err);
    }
    showToast('Sensory feedback dispatched and synchronized successfully.');
  },

  addCitizen: async (newCit: Citizen, password?: string, emailCode?: string, phoneCode?: string) => {
    const { citizens, showToast } = get();
    
    const token = get().authToken;
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await apiFetch('/api/citizens', {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...newCit, password, emailCode, phoneCode })
    });

    if (!res.ok) {
      let errorMessage = 'Failed to register citizen dossier.';
      try {
        const cloned = res.clone();
        const json = await cloned.json();
        if (json && typeof json.error === 'string') {
          errorMessage = json.error;
        }
      } catch {}
      throw new Error(errorMessage);
    }

    const updated = [newCit, ...citizens];
    set({ citizens: updated });
    setSafeLocalStorage('orris-citizens-db', updated);
    showToast(`Registered client/citizen ${newCit.name} in Maison register.`);
  },

  updateCitizen: async (updated: Citizen) => {
    const { citizens, showToast } = get();
    const updatedList = citizens.map((c) => c.id === updated.id ? updated : c);
    set({ citizens: updatedList });
    setSafeLocalStorage('orris-citizens-db', updatedList);
    try {
      await apiFetch(`/api/citizens/${updated.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('API error during updateCitizen, state is saved locally:', err);
    }
    showToast(`Dossier specifications for ${updated.name} have been updated.`);
  },

  deleteCitizen: async (id: string) => {
    const { citizens, showToast } = get();
    const updated = citizens.filter((c) => c.id !== id);
    set({ citizens: updated });
    setSafeLocalStorage('orris-citizens-db', updated);
    try {
      await apiFetch(`/api/citizens/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${get().authToken}`
        }
      });
    } catch (err) {
      console.warn('API error during deleteCitizen, state is saved locally:', err);
    }
    showToast('Citizen has been successfully removed from register.');
  },

  updateSettings: async (newSettings: MaisonSettings) => {
    const { showToast } = get();
    set({ settings: newSettings });
    setSafeLocalStorage('orris-settings-db', newSettings);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${get().authToken}`
        },
        body: JSON.stringify(newSettings)
      });
    } catch (err) {
      console.warn('API error during updateSettings, state is saved locally:', err);
    }
    showToast('Atelier global custom configurations have been saved.');
  }
}));
