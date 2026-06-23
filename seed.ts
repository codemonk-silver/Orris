/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CITIZENS, INITIAL_SETTINGS } from './src/mockData.js';

const DATA_DIR = path.join(process.cwd(), 'data-store');

async function seedDatabase() {
  console.log('[ORRIS SEED] Initiating database seeding...');

  try {
    // 1. Seed Local JSON File Store
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      console.log(`[ORRIS SEED] Instantiated local directory: ${DATA_DIR}`);
    }

    const targets = [
      { filename: 'categories.json', content: INITIAL_CATEGORIES },
      { filename: 'products.json', content: INITIAL_PRODUCTS },
      { filename: 'orders.json', content: INITIAL_ORDERS },
      { filename: 'citizens.json', content: INITIAL_CITIZENS },
      { filename: 'settings.json', content: INITIAL_SETTINGS }
    ];

    targets.forEach(({ filename, content }) => {
      const fullPath = path.join(DATA_DIR, filename);
      fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), 'utf-8');
      console.log(`[ORRIS SEED] Seeded local ${filename} with ${Array.isArray(content) ? content.length : 1} starting records.`);
    });

    // 2. Seed Firebase Cloud Firestore (if config exists)
    const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(firebaseConfigPath)) {
      console.log('[ORRIS SEED] firebase-applet-config.json found! Syncing with Firestore...');
      
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
      
      const firebaseApp = initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
      });

      const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || '(default)');

      // Seed Categories (8 items)
      console.log(`[ORRIS SEED] Seeding ${INITIAL_CATEGORIES.length} Categories to Firestore...`);
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }

      // Seed Products (24 items)
      console.log(`[ORRIS SEED] Seeding ${INITIAL_PRODUCTS.length} Curated Products to Firestore...`);
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }

      // Seed Citizens
      console.log(`[ORRIS SEED] Seeding ${INITIAL_CITIZENS.length} Registered Citizens to Firestore...`);
      for (const citizen of INITIAL_CITIZENS) {
        await setDoc(doc(db, 'citizens', citizen.id), citizen);
      }

      // Seed default admin user and members in Credentials collection
      console.log('[ORRIS SEED] Hashing and seeding Security Credentials to Firestore...');
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

      // Seed Orders
      console.log(`[ORRIS SEED] Seeding ${INITIAL_ORDERS.length} Sovereign Invoices history to Firestore...`);
      for (const order of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', order.id), order);
      }

      // Seed Global Settings
      console.log('[ORRIS SEED] Seeding Maison Config parameters to Firestore...');
      await setDoc(doc(db, 'settings', 'maison'), INITIAL_SETTINGS);

      console.log('[ORRIS SEED] Firestore database synchronization completed successfully.');
    } else {
      console.log('[ORRIS SEED] No firebase-applet-config.json found. Skipping Firestore sync.');
    }

    console.log('[ORRIS SEED] All database seed operations finished successfully.');
  } catch (error) {
    console.error('[ORRIS SEED] Critical error during database seed execution:', error);
    process.exit(1);
  }
}

seedDatabase();
