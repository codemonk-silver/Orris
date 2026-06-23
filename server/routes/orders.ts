/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { Order, OrderStatus } from '../../src/types';
import { getSessionUser, requireAdmin, requireAuth } from '../../middleware.js';
import { 
  getOrdersDoc, 
  saveOrderDoc, 
  getProductsDoc, 
  updateProductDoc, 
  updateOrderStatusDoc 
} from '../../src/lib/firebaseService.js';
import { sendOrderConfirmationEmail } from '../../src/lib/email.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const user = getSessionUser(req);
    if (!user) {
      res.json([]);
      return;
    }
    const orders = await getOrdersDoc();
    if (user.role === 'ADMIN') {
      res.json(orders);
    } else {
      const userOrders = orders.filter((o) => o.customerEmail.toLowerCase() === user.email.toLowerCase());
      res.json(userOrders);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync sovereign history invoices.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newOrder = req.body as Order;
    if (!newOrder.id || !newOrder.items || !newOrder.total) {
      res.status(400).json({ error: 'Malformed order packaging.' });
      return;
    }
    
    // Decrease product stock levels inside Cloud Firestore
    const products = await getProductsDoc();
    for (const p of products) {
      const orderItem = newOrder.items.find((it) => it.productId === p.id);
      if (orderItem) {
        const updatedInventory = Math.max(0, p.inventory - orderItem.quantity);
        await updateProductDoc(p.id, { inventory: updatedInventory });
      }
    }

    await saveOrderDoc(newOrder);

    // Automatically send purchase confirmation email to client
    sendOrderConfirmationEmail(newOrder).catch((err) => {
      console.error('Error dispatching transactional confirmation email:', err);
    });

    const updatedProducts = await getProductsDoc();
    res.status(201).json({ success: true, order: newOrder, products: updatedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to authorize acquisition invoice.' });
  }
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: OrderStatus };
    if (!status) {
      res.status(400).json({ error: 'Status is necessary.' });
      return;
    }
    
    const updated = await updateOrderStatusDoc(id, status);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calibrate order status.' });
  }
});

router.post('/:id/resend-email', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await getOrdersDoc();
    const order = orders.find((o) => o.id === id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // Standard logged-in users are restricted to resending emails only for their own acquisitions
    const user = (req as any).user;
    if (user.role !== 'ADMIN' && order.customerEmail.toLowerCase() !== user.email.toLowerCase()) {
      res.status(403).json({ error: 'Access restricted. You may only resend confirmation alerts for your own orders.' });
      return;
    }

    await sendOrderConfirmationEmail(order);
    res.json({ success: true, message: `Acquisition transmission dispatched to ${order.customerEmail}` });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to dispatch email' });
  }
});

export default router;
