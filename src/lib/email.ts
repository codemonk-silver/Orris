/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import nodemailer from 'nodemailer';
import { Order } from '../types';

/**
 * Creates and returns a Nodemailer Transporter reading from SMTP environment variables.
 * Returns null if the required SMTP configuration is missing.
 */
export function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return null if credentials are left blank; we will print nicely to server log
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Prints the order email format directly to the server terminal when SMTP is unconfigured.
 */
export function logVisualEmailToTerminal(order: Order, subject: string, textBody: string) {
  console.log("\n" + "=".repeat(80));
  console.log(`[SMTP TRANSACT SERVER - NO SMTP CONFIG PROVIDED]`);
  console.log(`To: ${order.customerEmail}`);
  console.log(`Subject: ${subject}`);
  console.log("-".repeat(80));
  console.log(textBody);
  console.log("=".repeat(80) + "\n");
}

/**
 * Generates and dispatches a professional, minimalist order purchase confirmation email.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const transporter = createEmailTransporter();
  const from = process.env.SMTP_FROM || 'Orris Atelier <noreply@orris.com>';

  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #EAEAEA;">
      <td style="padding: 12px 0; vertical-align: top;">
        <div style="font-weight: bold; font-size: 14px; color: #111111;">${item.productName}</div>
        ${item.size || item.color ? `
          <div style="font-size: 11px; color: #666666; margin-top: 4px; font-family: monospace; text-transform: uppercase;">
            ${item.size ? `Size: ${item.size}` : ''} ${item.color ? `&nbsp;|&nbsp; Color: ${item.color}` : ''}
          </div>
        ` : ''}
      </td>
      <td style="padding: 12px 0; text-align: center; color: #111111; font-weight: 500;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; text-align: right; color: #C9A96E; font-weight: bold; font-family: monospace;">
        $${item.productPrice}.00
      </td>
    </tr>
  `).join('');

  const itemsTxt = order.items.map(item => {
    let details = '';
    if (item.size) details += ` Size: ${item.size}`;
    if (item.color) details += ` Color: ${item.color}`;
    return `- ${item.productName}${details ? ` (${details.trim()})` : ''} x${item.quantity} -- $${item.productPrice}.00`;
  }).join('\n');

  const addr = order.shippingAddress;
  const shippingAddressString = addr 
    ? `${addr.line1}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
    : 'No delivery address specified (Digital/Virtual Curated service)';

  const subject = `Confirmation & Receipt for Order #${order.id} | Orris Atelier`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Orris Atelier Confirmed Purchase</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EBEBEB; border-radius: 0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02); overflow: hidden;">
        
        <!-- Header Banner -->
        <div style="background-color: #0F0F0F; color: #FFFFFF; padding: 35px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A96E;">Orris Atelier</h1>
          <p style="margin: 8px 0 0; font-size: 11px; letter-spacing: 0.2em; color: #A3A3A3; text-transform: uppercase;">Aperture of High Specimen Artistry</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 40px 35px;">
          <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 15px; font-weight: 600; color: #111111; text-transform: uppercase; letter-spacing: 0.05em;">Order Confirmation</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; margin-bottom: 25px;">
            Dear ${order.customerName || 'Valued Art Patron'},
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #4A4A4A; margin-bottom: 25px;">
            Thank you for your purchase from <strong>Orris Atelier</strong>. Your transaction has processed successfully, and we have authenticated your requested specimens for dispatch.
          </p>

          <!-- Order Summary Dashboard -->
          <div style="background-color: #F8F8F8; border-left: 3px solid #C9A96E; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #666666;"><strong>Order Reference:</strong></td>
                <td style="padding: 4px 0; color: #111111; font-family: monospace; font-weight: bold; text-align: right;">#${order.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666666;"><strong>Acquisition Date:</strong></td>
                <td style="padding: 4px 0; color: #111111; text-align: right;">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666666;"><strong>Payment Status:</strong></td>
                <td style="padding: 4px 0; color: #111111; text-align: right;"><span style="background-color: #E6F4EA; color: #137333; padding: 2px 8px; font-size: 10px; font-weight: bold; text-transform: uppercase;">${order.paymentStatus || 'PAID'}</span></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666666;"><strong>Delivery Destination:</strong></td>
                <td style="padding: 4px 0; color: #111111; text-align: right; font-size: 12px; max-width: 250px; white-space: normal; word-wrap: break-word;">${shippingAddressString}</td>
              </tr>
            </table>
          </div>

          <!-- Items list -->
          <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; color: #111111; border-bottom: 2px solid #111111; padding-bottom: 8px; margin-bottom: 12px; letter-spacing: 0.1em;">Selected Specimens</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #111111;">
                <th style="padding: 8px 0; text-align: left; font-weight: 600; color: #666666;">Product</th>
                <th style="padding: 8px 0; text-align: center; font-weight: 600; color: #666666; width: 60px;">Qty</th>
                <th style="padding: 8px 0; text-align: right; font-weight: 600; color: #666666; width: 100px;">Valuation</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 16px 0 4px; text-align: right; font-weight: 500; color: #666666;">Subtotal:</td>
                <td style="padding: 16px 0 4px; text-align: right; font-family: monospace; font-weight: bold; color: #111111;">$${order.total}.00</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 4px 0; text-align: right; font-weight: 500; color: #666666;">Taxes &amp; Delivery:</td>
                <td style="padding: 4px 0; text-align: right; font-family: monospace; color: #666666;">Complimentary</td>
              </tr>
              <tr style="border-top: 2px solid #EAEAEA;">
                <td colspan="2" style="padding: 12px 0 0; text-align: right; font-weight: bold; font-size: 15px; color: #111111; text-transform: uppercase;">Total Valuation:</td>
                <td style="padding: 12px 0 0; text-align: right; font-family: monospace; font-weight: bold; font-size: 18px; color: #C9A96E;">$${order.total}.00</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; border-top: 1px solid #EAEAEA; padding-top: 30px; text-align: center;">
            <p style="font-size: 13px; line-height: 1.6; color: #666666;">
              Should you require assistance, curate adjustment, or details about delivery status, please establish contact with our curator staff using our client interface.
            </p>
            <p style="font-size: 12px; margin-top: 20px; font-weight: bold; color: #111111; letter-spacing: 0.1em; text-transform: uppercase;">
              Orris Atelier Client Services
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #F8F8F8; border-top: 1px solid #EBEBEB; padding: 25px; text-align: center; font-size: 11px; color: #888888; font-family: monospace;">
          This transmission contains private transaction info regarding Orris Order #${order.id}.<br/>
          &copy; 2026 Orris Atelier Inc. Paris &bull; Geneva &bull; Edinburgh. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textBody = `
=============================================
             ORRIS ATELIER
=============================================
Order Reference: #${order.id}
Acquisition Date: ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Payment Status: ${order.paymentStatus || 'PAID'}
Delivery Destination: ${shippingAddressString}

Selected Specimens Purchased:
---------------------------------------------
${itemsTxt}
---------------------------------------------
Subtotal: $${order.total}.00
Taxes & Delivery: Complimentary
---------------------------------------------
Total Valuation: $${order.total}.00

Dear ${order.customerName || 'Valued Art Patron'},

Thank you for your purchase from Orris Atelier. Your payment has processed successfully, and we have authorized your requested specimens for distribution.

Should you require any assistance, please contact our curators.

-- Orris Atelier Client Services
`;

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: order.customerEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });
      console.log(`[EMAIL DISPATCH] Transactional order confirmation email successfully dispatched to active recipient: <${order.customerEmail}> for Order Ref: #${order.id}`);
    } catch (err: any) {
      console.error(`[EMAIL FAILURE] Failed to send actual transactional confirmation via SMTP to <${order.customerEmail}>: ${err?.message || err}`);
      logVisualEmailToTerminal(order, subject, textBody);
    }
  } else {
    logVisualEmailToTerminal(order, subject, textBody);
  }
}
