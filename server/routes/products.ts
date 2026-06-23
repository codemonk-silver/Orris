/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { Category, Product, Review } from '../../src/types';
import { requireAdmin } from '../../middleware.js';
import { 
  getCategoriesDoc, 
  saveCategoryDoc, 
  getProductsDoc, 
  saveProductDoc, 
  updateProductDoc, 
  updateProductReviews 
} from '../../src/lib/firebaseService.js';

const router = express.Router();

// --- CATEGORIES ENDPOINTS ---

router.get('/categories', async (req, res) => {
  try {
    const categories = await getCategoriesDoc();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync categories.' });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const newCat = req.body as Category;
    if (!newCat.id || !newCat.name || !newCat.slug) {
      res.status(400).json({ error: 'Incomplete category specs.' });
      return;
    }
    await saveCategoryDoc(newCat);
    res.status(201).json(newCat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record category.' });
  }
});

// --- PRODUCTS ENDPOINTS ---

router.get('/products', async (req, res) => {
  try {
    const products = await getProductsDoc();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync product listings.' });
  }
});

router.post('/products', requireAdmin, async (req, res) => {
  try {
    const newProd = req.body as Product;
    if (!newProd.id || !newProd.name || !newProd.price) {
      res.status(400).json({ error: 'Incomplete product specs.' });
      return;
    }
    await saveProductDoc(newProd);
    res.status(201).json(newProd);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process product spec.' });
  }
});

router.put('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProd = req.body as Product;
    const updated = await updateProductDoc(id, updatedProd);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calibrate product spec.' });
  }
});

router.delete('/products/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateProductDoc(id, { isActive: false });
    res.json({ success: true, message: 'Product status inactivated.', product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to inactivate product.' });
  }
});

router.post('/products/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = req.body as Review[];
    await updateProductReviews(id, reviews);
    res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback review.' });
  }
});

export default router;
