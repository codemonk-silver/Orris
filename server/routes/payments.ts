/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import Stripe from 'stripe';
import { Order, Product } from '../../src/types';
import { 
  getProductsDoc, 
  updateProductDoc, 
  getOrdersDoc, 
  saveOrderDoc 
} from '../../src/lib/firebaseService.js';
import { sendOrderConfirmationEmail } from '../../src/lib/email.js';
import { useCheckoutSuccessHook } from '../hooks/useCheckoutSuccessHook.js';

const router = express.Router();

// Lazy initialization of Stripe to prevent startup crashes when keys are omitted
let stripeClient: Stripe | null = null;
export function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key) {
      stripeClient = new Stripe(key);
    }
  }
  return stripeClient;
}

// --- STRIPE ENDPOINTS ---

// Stripe Checkout Session Broker
router.post('/stripe/create-checkout-session', express.json(), async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      shippingAddress,
      items,
      discountPercent,
      promoCode,
      shippingCost,
      grossSubtotal,
      discountAmount,
      finalTotal
    } = req.body;

    if (!customerEmail || !items || !items.length) {
      res.status(400).json({ error: 'Discrepancy in order specification.' });
      return;
    }

    // Re-evaluate prices and subtotal securely using server-side Firestore records (defense against client tampering)
    const products = await getProductsDoc();
    let calculatedSubtotal = 0;
    const lineItems: any[] = [];
    const orderItemsMatched: any[] = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        res.status(404).json({ error: `Selected lot "${item.productId}" is not referenced in our catalog.` });
        return;
      }

      if (prod.inventory < item.quantity) {
        res.status(400).json({ error: `The selected luxury lot "${prod.name}" has insufficient inventory remaining in private reserve.` });
        return;
      }

      const price = prod.price;
      calculatedSubtotal += price * item.quantity;
      
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: prod.name,
            images: prod.images && prod.images.length > 0 ? [prod.images[0]] : [],
            description: prod.description || '',
          },
          unit_amount: price * 100, // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      });

      orderItemsMatched.push({
        id: `oi-gen-${Math.floor(100000 + Math.random() * 900000)}-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        productPrice: prod.price,
        productImage: prod.images?.[0] || '',
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined
      });
    }

    // Apply coupon deductions if present
    const calculatedDiscount = Math.round(calculatedSubtotal * (discountPercent || 0) / 100);
    const verifiedTotal = calculatedSubtotal - calculatedDiscount + (shippingCost || 0);

    // Add Ground Courier shipping to checkout line items if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Atelier Ground Courier Courier Logistics',
            description: 'Insured end-to-end luxury parcel dispatch.',
          },
          unit_amount: shippingCost * 100,
        },
        quantity: 1,
      });
    }

    // Pre-register corresponding Pending Invoice draft order inside Cloud Firestore document store
    const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: generatedOrderId,
      userId: customerEmail.replace(/[.@]/g, '_'),
      customerName: customerName,
      customerEmail: customerEmail,
      status: 'PROCESSING',
      total: verifiedTotal,
      shippingAddress: shippingAddress,
      paymentStatus: 'UNPAID', // Initial draft state is unpaid
      stripeSessionId: '',
      items: orderItemsMatched,
      createdAt: new Date().toISOString()
    };

    const stripe = getStripeClient();
    if (stripe) {
      // Stripe integration is fully ACTIVE!
      // Setup Coupon configuration in Stripe session
      let discountOptions: any[] | undefined = undefined;
      if (discountPercent > 0) {
        try {
          const couponId = `ORRIS_DISC_${discountPercent}`;
          try {
            await stripe.coupons.retrieve(couponId);
          } catch {
            await stripe.coupons.create({
              id: couponId,
              percent_off: discountPercent,
              duration: 'once',
              name: `${discountPercent}% Off Coupon`
            });
          }
          discountOptions = [{ coupon: couponId }];
        } catch (couponErr) {
          console.warn('[STRIPE COUPON REGISTRATION FAILURE]', couponErr);
        }
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: customerEmail,
        success_url: `${req.headers.origin || 'http://localhost:3000'}/checkout?success=true&order_id=${generatedOrderId}`,
        cancel_url: `${req.headers.origin || 'http://localhost:3000'}/checkout?cancel=true&order_id=${generatedOrderId}`,
        metadata: {
          orderId: generatedOrderId,
        },
        ...(discountOptions ? { discounts: discountOptions } : {}),
      });

      newOrder.stripeSessionId = stripeSession.id;
      await saveOrderDoc(newOrder);

      res.json({
        url: stripeSession.url,
        stripeSessionId: stripeSession.id,
        orderId: generatedOrderId,
        simulated: false
      });
    } else {
      // Stripe credentials are unconfigured or pending setup. Fallback gracefully to Orris Atelier visual simulation
      const mockSessionId = `sim_cs_${Math.random().toString(36).substring(2, 17)}`;
      newOrder.stripeSessionId = mockSessionId;
      await saveOrderDoc(newOrder);

      res.json({
        url: `/checkout?simulated=true&order_id=${generatedOrderId}`,
        stripeSessionId: mockSessionId,
        orderId: generatedOrderId,
        simulated: true,
        order: newOrder
      });
    }
  } catch (err: any) {
    console.error('[STRIPE PRE-FLIGHT SESSION BROKER ERROR]', err);
    res.status(500).json({ error: 'Stripe broker was unable to generate checkout session. Please try again.' });
  }
});

// Simulated payment settlement endpoint (Fulfill simulated transactions)
router.post('/stripe/simulate-payment', express.json(), async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: 'Order reference is mandatory.' });
      return;
    }

    const orders = await getOrdersDoc();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Specified order pending invoice not found.' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      res.json({ success: true, message: 'This premium invoice has already been fully settled.', order });
      return;
    }

    // Call unified successful checkout hook
    const finalizedOrder = await useCheckoutSuccessHook(orderId, order.stripeSessionId);

    res.json({ success: true, order: finalizedOrder || order });
  } catch (err: any) {
    console.error('[STRIPE SYSTEM SIMULATED PAYMENT ERROR]', err);
    res.status(500).json({ error: 'Failed to settle simulated payment.' });
  }
});

// --- PAYSTACK ENDPOINTS ---

// Paystack Initialize Transaction Endpoint
router.post('/paystack/create-payment-session', express.json(), async (req, res) => {
  try {
    const {
      customerEmail,
      customerName,
      shippingAddress,
      items,
      discountPercent,
      promoCode,
      shippingCost,
      grossSubtotal,
      discountAmount,
      finalTotal
    } = req.body;

    if (!customerEmail || !items || !items.length) {
      res.status(400).json({ error: 'Discrepancy in order specification.' });
      return;
    }

    // Re-evaluate prices and subtotal securely using server-side Firestore records to protect system integrity
    const products = await getProductsDoc();
    let calculatedSubtotal = 0;
    const orderItemsMatched: any[] = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        res.status(404).json({ error: `Selected lot "${item.productId}" is not referenced in our catalog.` });
        return;
      }

      if (prod.inventory < item.quantity) {
        res.status(400).json({ error: `The selected luxury lot "${prod.name}" has insufficient inventory remaining in private reserve.` });
        return;
      }

      const price = prod.price;
      calculatedSubtotal += price * item.quantity;

      orderItemsMatched.push({
        id: `oi-gen-${Math.floor(100000 + Math.random() * 900000)}-${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        productPrice: prod.price,
        productImage: prod.images?.[0] || '',
        quantity: item.quantity,
        size: item.size || undefined,
        color: item.color || undefined
      });
    }

    // Apply coupon deductions if present
    const calculatedDiscount = Math.round(calculatedSubtotal * (discountPercent || 0) / 100);
    const verifiedTotal = calculatedSubtotal - calculatedDiscount + (shippingCost || 0);

    // Pre-register corresponding Pending Invoice draft order inside Cloud Firestore document store
    const generatedOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: generatedOrderId,
      userId: customerEmail.replace(/[.@]/g, '_'),
      customerName: customerName,
      customerEmail: customerEmail,
      status: 'PROCESSING',
      total: verifiedTotal,
      shippingAddress: shippingAddress,
      paymentStatus: 'UNPAID', // Initial draft state is unpaid
      stripeSessionId: `paystack-${generatedOrderId}`, // Reuse for compatibility
      items: orderItemsMatched,
      createdAt: new Date().toISOString()
    };

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecretKey) {
      // Paystack integration is fully ACTIVE!
      const subunitAmount = verifiedTotal * 100; // Paystack expects amount in cents / kobo
      const callbackUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout?paystack_verified=true&order_id=${generatedOrderId}`;

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: subunitAmount,
          callback_url: callbackUrl,
          reference: `ref-${generatedOrderId}-${Date.now()}`,
          metadata: {
            custom_fields: [
              {
                display_name: "Order ID",
                variable_name: "order_id",
                value: generatedOrderId
              },
              {
                display_name: "Customer Name",
                variable_name: "customer_name",
                value: customerName
              }
            ]
          }
        })
      });

      const paystackData: any = await paystackResponse.json();
      if (!paystackResponse.ok || !paystackData.status) {
        throw new Error(paystackData.message || 'Paystack initialize session rejected.');
      }

      await saveOrderDoc(newOrder);

      res.json({
        url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        orderId: generatedOrderId,
        simulated: false
      });
    } else {
      // Paystack credentials are unconfigured. Fallback gracefully to custom Paystack simulator screen
      await saveOrderDoc(newOrder);

      res.json({
        url: `/checkout?simulated_paystack=true&order_id=${generatedOrderId}`,
        orderId: generatedOrderId,
        simulated: true,
        order: newOrder
      });
    }
  } catch (err: any) {
    console.error('[PAYSTACK PRE-FLIGHT SESSION BROKER ERROR]', err);
    res.status(500).json({ error: err.message || 'Paystack broker was unable to generate checkout session. Please try again.' });
  }
});

// Paystack Settle / Verification endpoint
router.post('/paystack/verify-payment', express.json(), async (req, res) => {
  try {
    const { reference, orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ error: 'Order reference is mandatory.' });
      return;
    }

    const orders = await getOrdersDoc();
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Specified order pending invoice not found.' });
      return;
    }

    if (order.paymentStatus === 'PAID') {
      res.json({ success: true, message: 'This premium invoice has already been fully settled.', order });
      return;
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecretKey && reference) {
      // Verify with Paystack live verification endpoint
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'
        }
      });
      const verifyData: any = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.status || verifyData.data.status !== 'success') {
        res.status(400).json({ error: 'Paystack transaction confirmation failed or is outstanding.' });
        return;
      }
    }

    // Call unified successful checkout hook
    const finalizedOrder = await useCheckoutSuccessHook(orderId, reference || order.stripeSessionId);

    res.json({ success: true, order: finalizedOrder || order });
  } catch (err: any) {
    console.error('[PAYSTACK RECONCILIATION FAULT]', err);
    res.status(500).json({ error: 'Secure transaction status reconciliation failed.' });
  }
});

export default router;
