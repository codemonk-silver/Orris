/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import Stripe from 'stripe';

import { 
  seedDatabaseIfNeeded,
  getOrdersDoc,
  getProductsDoc,
  saveOrderDoc,
  updateProductDoc
} from '../src/lib/firebaseService.js';
import { sendOrderConfirmationEmail } from '../src/lib/email.js';
import { securityHeaders, routeProtection } from '../middleware.js';

// Import modular routing segments
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter, { getStripeClient } from './routes/payments.js';
import citizensRouter from './routes/citizens.js';
import settingsRouter from './routes/settings.js';
import { useCheckoutSuccessHook } from './hooks/useCheckoutSuccessHook.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add robust HTTP security headers from our centralized middleware suite
  app.use(securityHeaders);

  // Stripe Webhook (MUST be registered before express.json() to get raw request body buffer)
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripe = getStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripe) {
      console.warn('[STRIPE WEBHOOK WARNING] Stripe is unconfigured, skipping signature validation.');
      res.status(200).json({ warning: 'Stripe unconfigured' });
      return;
    }

    let event;
    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      } else {
        console.warn('[STRIPE WEBHOOK WARNING] Missing webhookSecret or stripe-signature, parsing payload directly.');
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`[STRIPE WEBHOOK ERROR] Verification failed: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      console.log(`[STRIPE WEBHOOK SUCCESS] Received session completed event for Order: ${orderId}`);
      
      if (orderId) {
        try {
          const updatedOrder = await useCheckoutSuccessHook(orderId, session.id);
          if (updatedOrder) {
            console.log(`[STRIPE WEBHOOK] Order ${orderId} successfully processed and confirmed paid via success hook.`);
          } else {
            console.warn(`[STRIPE WEBHOOK] Success hook could not locate Order ${orderId}.`);
          }
        } catch (dbErr) {
          console.error('[STRIPE WEBHOOK FAIL]', dbErr);
          res.status(500).send('Database updating failure.');
          return;
        }
      }
    }

    res.json({ received: true });
  });

  // Apply JSON body-parses for all subsequent REST operations
  app.use(express.json());

  // Strict, server-side route-protection middleware from our centralized middleware suite
  app.use(routeProtection);

  // --- MOUNT SEGMENTED APIS ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api', paymentsRouter);
  app.use('/api/citizens', citizensRouter);
  app.use('/api/settings', settingsRouter);

  // --- FRONTEND INTEGRATION & VITE STATIC SERVING ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bootstrap Firestore cache seeding before starting standard Node.js Express server
  await seedDatabaseIfNeeded();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ORRIS Server Ready] running on http://localhost:${PORT}`);
  });
}

startServer();
