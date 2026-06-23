/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import { Category, Product, Order, Citizen, MaisonSettings, Review } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CITIZENS, INITIAL_SETTINGS } from '../mockData';

// Load Firebase configuration
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  throw new Error('firebase-applet-config.json is missing in project root. Please run setup first.');
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Initialize Firebase
const firebaseApp = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Connect to the specific assigned Firestore database ID from configuration
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

export interface Credential {
  email: string;
  passwordHash: string;
}

// ---------------- STAGE 3 ERROR HANDLER ----------------

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --------------------------------------------------------

// Low-latency document and collection accessors
export async function getCategoriesDoc(): Promise<Category[]> {
  const colRef = collection(db, 'categories');
  try {
    const snap = await getDocs(colRef);
    const list: Category[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Category);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'categories');
  }
}

export async function saveCategoryDoc(category: Category): Promise<void> {
  const docRef = doc(db, 'categories', category.id);
  try {
    await setDoc(docRef, category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
  }
}

export async function getProductsDoc(): Promise<Product[]> {
  const colRef = collection(db, 'products');
  try {
    const snap = await getDocs(colRef);
    const list: Product[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Product);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'products');
  }
}

export async function saveProductDoc(product: Product): Promise<void> {
  const docRef = doc(db, 'products', product.id);
  try {
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
  }
}

export async function updateProductDoc(id: string, productData: Partial<Product>): Promise<Product> {
  const docRef = doc(db, 'products', id);
  try {
    await updateDoc(docRef, productData);
    const fresh = await getDoc(docRef);
    return fresh.data() as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
  }
}

export async function updateProductReviews(id: string, reviews: Review[]): Promise<void> {
  const docRef = doc(db, 'products', id);
  try {
    await updateDoc(docRef, { reviews });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}/reviews`);
  }
}

export async function getOrdersDoc(): Promise<Order[]> {
  const colRef = collection(db, 'orders');
  try {
    const snap = await getDocs(colRef);
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'orders');
  }
}

export async function saveOrderDoc(order: Order): Promise<void> {
  const docRef = doc(db, 'orders', order.id);
  try {
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
  }
}

export async function updateOrderStatusDoc(id: string, status: string): Promise<Order> {
  const docRef = doc(db, 'orders', id);
  try {
    await updateDoc(docRef, { status });
    const fresh = await getDoc(docRef);
    return fresh.data() as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
  }
}

export async function getCitizensDoc(): Promise<Citizen[]> {
  const colRef = collection(db, 'citizens');
  try {
    const snap = await getDocs(colRef);
    const list: Citizen[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Citizen);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'citizens');
  }
}

export async function saveCitizenDoc(citizen: Citizen): Promise<void> {
  const docRef = doc(db, 'citizens', citizen.id);
  try {
    await setDoc(docRef, citizen);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `citizens/${citizen.id}`);
  }
}

export async function deleteCitizenDoc(id: string): Promise<void> {
  const docRef = doc(db, 'citizens', id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `citizens/${id}`);
  }
}

export async function getCredentialsDoc(): Promise<Credential[]> {
  const colRef = collection(db, 'credentials');
  try {
    const snap = await getDocs(colRef);
    const list: Credential[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Credential);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'credentials');
  }
}

export async function saveCredentialDoc(email: string, passwordHash: string): Promise<void> {
  const docKey = email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const docRef = doc(db, 'credentials', docKey);
  try {
    await setDoc(docRef, { email: email.toLowerCase().trim(), passwordHash });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `credentials/${docKey}`);
  }
}

export async function getSettingsDoc(): Promise<MaisonSettings> {
  const docRef = doc(db, 'settings', 'maison');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MaisonSettings;
    }
    return INITIAL_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/maison');
  }
}

export async function saveSettingsDoc(settings: MaisonSettings): Promise<void> {
  const docRef = doc(db, 'settings', 'maison');
  try {
    await setDoc(docRef, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/maison');
  }
}

// Bootstrap Seeding to Cloud Firestore on application initialization
export async function seedDatabaseIfNeeded(): Promise<void> {
  console.log('[FIREBASE INIT] Checking database synchronization state...');

  try {
    // Seeding Categories
    const categoriesCol = collection(db, 'categories');
    const categoriesSnap = await getDocs(categoriesCol);
    if (categoriesSnap.empty) {
      console.log('[FIREBASE SEED] Seeding Orris Categories info...');
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
    }

    // Seeding Products
    const productsCol = collection(db, 'products');
    const productsSnap = await getDocs(productsCol);
    if (productsSnap.empty) {
      console.log('[FIREBASE SEED] Seeding Orris Curated Products...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    }

    // Seeding Citizens
    const citizensCol = collection(db, 'citizens');
    const citizensSnap = await getDocs(citizensCol);
    if (citizensSnap.empty) {
      console.log('[FIREBASE SEED] Seeding Registered Orris Citizens info...');
      for (const citizen of INITIAL_CITIZENS) {
        await setDoc(doc(db, 'citizens', citizen.id), citizen);
      }
    }

    // Seeding Credentials
    const credentialsCol = collection(db, 'credentials');
    const credentialsSnap = await getDocs(credentialsCol);
    if (credentialsSnap.empty) {
      console.log('[FIREBASE SEED] Seeding Security Handshake Credentials...');
      const defaultCredentials = [
        { email: 'admin@orris.com', passwordHash: bcrypt.hashSync('admin123', 10) },
        { email: 'client@orris.com', passwordHash: bcrypt.hashSync('member123', 10) },
        { email: 'eleanor@vance.com', passwordHash: bcrypt.hashSync('member123', 10) },
        { email: 'marcus@sterling.co', passwordHash: bcrypt.hashSync('member123', 10) },
        { email: 'julian@reed.co.uk', passwordHash: bcrypt.hashSync('member123', 10) }
      ];
      for (const cred of defaultCredentials) {
        const docKey = cred.email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        await setDoc(doc(db, 'credentials', docKey), cred);
      }
    }

    // Seeding Orders
    const ordersCol = collection(db, 'orders');
    const ordersSnap = await getDocs(ordersCol);
    if (ordersSnap.empty) {
      console.log('[FIREBASE SEED] Seeding Sovereign Invoices history info...');
      for (const order of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', order.id), order);
      }
    }

    // Seeding Settings
    const settingsDocRef = doc(db, 'settings', 'maison');
    const settingsSnap = await getDoc(settingsDocRef);
    if (!settingsSnap.exists()) {
      console.log('[FIREBASE SEED] Seeding Maison Config parameters...');
      await setDoc(settingsDocRef, INITIAL_SETTINGS);
    }

    console.log('[FIREBASE STATUS] Connected & Synchronized successfully.');
  } catch (error) {
    console.error('[SEED FAILIURE] Checking/seeding failed due to permissions or connection settings:', error);
    handleFirestoreError(error, OperationType.GET, 'init-seeds');
  }
}
