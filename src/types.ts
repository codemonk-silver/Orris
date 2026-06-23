/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  images: string[];
  categoryId: string;
  sizes: string[];
  colors: string[];
  isFeatured: boolean;
  isActive: boolean;
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  total: number;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED';
  stripeSessionId?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  location?: string;
  VIPLevel?: string;
  spend?: string;
  status?: string;
  createdAt: string;
}

export interface Citizen {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone: string;
  location: string;
  VIPLevel: string;
  spend: string;
  status: string;
  createdAt: string;
}

export interface MaisonSettings {
  brandName: string;
  announcementBarText: string;
  isAnnouncementBarActive: boolean;
  freeShippingThreshold: number;
  taxRatePercentage: number;
  currencySymbol: string;
  currencyName: string;
  chiefCuratorEmail: string;
  isSignatureSeriesActive: boolean;
}

export interface CodeFile {
  path: string;
  content: string;
}
