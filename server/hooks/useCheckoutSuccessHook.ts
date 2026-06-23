/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order } from '../../src/types';
import { 
  getOrdersDoc, 
  getProductsDoc, 
  saveOrderDoc, 
  updateProductDoc 
} from '../../src/lib/firebaseService.js';
import { sendOrderConfirmationEmail } from '../../src/lib/email.js';

/**
 * Server-side hook triggered automatically upon successful completion of a checkout session
 * (handles Stripe webhook events, Paystack verified transactions, and system-simulated pathways).
 * 
 * This hook:
 * 1. Synchronizes the target order from Firestore.
 * 2. Checks and prevents duplicate executions (idempotency safety).
 * 3. Transitions the order status to PAID and associates any Stripe/external session IDs.
 * 4. Iterates over order products to deduct acquired stock limits from private reserve.
 * 5. Fires an automated, professional purchase confirmation email using configured SMTP settings.
 * 
 * @param orderId Target checkout order ID key.
 * @param stripeSessionId Optional external verification session reference ID.
 * @returns The updated, finalized Order document, or null if the order wasn't found/could not be processed.
 */
export async function useCheckoutSuccessHook(orderId: string, stripeSessionId?: string): Promise<Order | null> {
  console.log(`[CHECKOUT SUCCESS HOOK] Execution initiated for Order: ${orderId}`);

  try {
    const orders = await getOrdersDoc();
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      console.warn(`[CHECKOUT SUCCESS HOOK WARNING] Order ID "${orderId}" could not be referenced in Firestore.`);
      return null;
    }

    if (order.paymentStatus === 'PAID') {
      console.log(`[CHECKOUT SUCCESS HOOK IDEMPOTENCY] Order "${orderId}" is already marked as PAID. Triggering confirmation dispatch bypass.`);
      // Run fallback send in case SMTP settings changed or email failed beforehand
      await sendOrderConfirmationEmail(order);
      return order;
    }

    // Phase 1: Update order state to paid
    order.paymentStatus = 'PAID';
    if (stripeSessionId) {
      order.stripeSessionId = stripeSessionId;
    }
    await saveOrderDoc(order);
    console.log(`[CHECKOUT SUCCESS HOOK] Order "${orderId}" status updated to PAID.`);

    // Phase 2: Deduct products inventory
    try {
      const products = await getProductsDoc();
      for (const item of order.items) {
        const prod = products.find(p => p.id === item.productId);
        if (prod) {
          const updatedInventory = Math.max(0, prod.inventory - item.quantity);
          await updateProductDoc(prod.id, { inventory: updatedInventory });
          console.log(`[CHECKOUT SUCCESS HOOK STOCK] Specimen "${prod.name}" inventory adjusted to ${updatedInventory} units.`);
        } else {
          console.warn(`[CHECKOUT SUCCESS HOOK WARNING] Specimen item catalog mapping missing for product ID: "${item.productId}"`);
        }
      }
    } catch (invErr) {
      console.error(`[CHECKOUT SUCCESS HOOK ERROR] Stock deduction phase encountered an exception:`, invErr);
    }

    // Phase 3: Dispatch automated purchase confirmation email to patron using SMTP settings
    try {
      console.log(`[CHECKOUT SUCCESS HOOK DISPATCH] Assembling email confirmation receipt segment for ${order.customerEmail}...`);
      await sendOrderConfirmationEmail(order);
    } catch (emailErr) {
      console.error(`[CHECKOUT SUCCESS HOOK ERROR] SMTP transacting/sending phase failed:`, emailErr);
    }

    return order;
  } catch (err: any) {
    console.error(`[CHECKOUT SUCCESS HOOK CRITICAL FAULT] Execution failed for Order "${orderId}":`, err);
    throw err;
  }
}
