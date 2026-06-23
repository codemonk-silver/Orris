/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { 
  sessions, 
  recoveryCodes, 
  rateLimiter, 
  getCookie,
  requireAdmin
} from '../../middleware.js';
import { 
  getCitizensDoc, 
  saveCitizenDoc, 
  getCredentialsDoc, 
  saveCredentialDoc 
} from '../../src/lib/firebaseService.js';
import { createEmailTransporter } from '../../src/lib/email.js';
import { registerCodes } from './verificationStore.js';

const router = express.Router();

// --- SECURE AUTHORIZATION AUTH HANDSHAKE ---
router.post('/login', rateLimiter(15, 60 * 1000), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please enter your email and password.' });
      return;
    }
    const emailLower = email.toLowerCase().trim();
    
    // Check credentials catalog in Firebase Firestore
    const creds = await getCredentialsDoc();
    const cred = creds.find((c) => c.email.toLowerCase() === emailLower);
    if (!cred) {
      res.status(401).json({ error: 'Access denied. Incorrect security credentials.' });
      return;
    }

    let isMatch = false;
    const dbHash = cred.passwordHash;

    if (dbHash.startsWith('$2')) {
      // Modern bcrypt hash
      isMatch = await bcrypt.compare(password.trim(), dbHash);
    } else {
      // Legacy SHA-256 hash fallback
      const legacyHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
      isMatch = (dbHash === legacyHash);
      if (isMatch) {
        // Automatically upgrade the legacy SHA-256 hash to memory-hard bcrypt
        try {
          const upgradedHash = await bcrypt.hash(password.trim(), 10);
          await saveCredentialDoc(emailLower, upgradedHash);
          console.log(`[SECURITY UPGRADE] Upgraded legacy password hash to bcrypt for: ${emailLower}`);
        } catch (upgradeErr) {
          console.error('[SECURITY UPGRADE FAIL] Failed to auto-upgrade hash on login:', upgradeErr);
        }
      }
    }

    if (!isMatch) {
      res.status(401).json({ error: 'Access denied. Incorrect security credentials.' });
      return;
    }
    
    // Find matching profile details
    let name = emailLower.split('@')[0].toUpperCase();
    let role: 'USER' | 'ADMIN' = 'USER';
    
    const citizens = await getCitizensDoc();
    const matchCit = citizens.find((c) => c.email.toLowerCase() === emailLower);
    if (matchCit) {
      name = matchCit.name;
      role = matchCit.role;
    } else if (emailLower === 'admin@orris.com') {
      name = 'Orris Curator';
      role = 'ADMIN';
    } else if (emailLower === 'client@orris.com') {
      name = 'Evelyn Vance';
      role = 'USER';
    }
    
    // Dynamically produce cryptographically robust Session Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24-hours expiration duration
    sessions.set(token, { email: emailLower, name, role, expiresAt });
    
    // Set cookie for strict server-side direct routing checks
    res.cookie('orris_session_token', token, {
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      secure: true,
      sameSite: 'strict',
      httpOnly: true // prevents client-side scripts from accessing session tokens
    });
    
    res.json({ token, email: emailLower, name, role });
  } catch (err: any) {
    console.error('[AUTH ERROR]', err);
    res.status(500).json({ error: 'Secure authentication failure. Please retry later.' });
  }
});

// Federated Identity Authentication and Session Handshake
router.post('/google', rateLimiter(25, 60 * 1000), async (req, res) => {
  try {
    const { email, name, uid } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Advisory: Federated authorization payload missing principal identifier.' });
      return;
    }
    const emailLower = email.toLowerCase().trim();

    // Retrieve Registered Citizen Profile directory
    const citizens = await getCitizensDoc();
    let matchCit = citizens.find((c) => c.email.toLowerCase() === emailLower);

    if (!matchCit) {
      // Automatically provision an Atelier Citizen dossier if new
      matchCit = {
        id: 'usr-google-' + (uid || Date.now()),
        name: name || emailLower.split('@')[0].toUpperCase(),
        email: emailLower,
        role: 'USER' as const,
        phone: '',
        location: '',
        VIPLevel: 'Standard Account',
        spend: '$0',
        status: 'Online',
        createdAt: new Date().toISOString()
      };
      await saveCitizenDoc(matchCit);
      
      // Also register credentials map to keep identity maps synchronized
      await saveCredentialDoc(emailLower, 'oauth_federated_google_' + (uid || 'sec'));
    }

    // Assert curator privileges for bootstrap configurations
    const role = (emailLower === 'admin@orris.com' || matchCit.role === 'ADMIN') ? 'ADMIN' : 'USER';

    // Generate Cryptographically secure session portal ID
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    sessions.set(token, { email: emailLower, name: matchCit.name, role, expiresAt });

    res.cookie('orris_session_token', token, {
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      secure: true,
      sameSite: 'strict',
      httpOnly: true
    });

    res.json({ token, email: emailLower, name: matchCit.name, role });
  } catch (err: any) {
    console.error('[GOOGLE AUTH ERROR]', err);
    res.status(500).json({ error: 'Secure OAuth integration failure.' });
  }
});

router.post('/logout', (req, res) => {
  const token = getCookie(req, 'orris_session_token');
  if (token) {
    sessions.delete(token);
  }
  res.clearCookie('orris_session_token');
  res.json({ success: true });
});

router.post('/forgot-password', rateLimiter(10, 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Please enter your email address.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const creds = await getCredentialsDoc();
    const hasCreds = creds.some((c) => c.email.toLowerCase() === emailLower);
    
    if (!hasCreds) {
      res.status(404).json({ error: 'Our system could not reference this client dossier under that email.' });
      return;
    }

    // Generate 6 digit secure code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    recoveryCodes.set(emailLower, {
      code,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes of validity
    });

    const transporter = createEmailTransporter();
    const from = process.env.SMTP_FROM || 'Orris Atelier <noreply@orris.com>';
    const subject = 'ORRIS Atelier - Security Credentials Calibration Code';
    const textBody = `Your security credentials calibration code is: ${code}\n\nThis verification code will expire in 15 minutes.\n\nIf you did not request this, please disregard this system notification.`;
    const htmlBody = `
      <div style="font-family: inherit; max-width: 550px; margin: 0 auto; padding: 40px; border: 1px solid #EAEAEA; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-family: serif; font-size: 20px; letter-spacing: 0.2em; text-transform: uppercase; color: #111111; font-weight: 300;">ORRIS ATELIER</span>
        </div>
        <p style="font-size: 13px; color: #444444; line-height: 1.6;">A security handshake was initiated to reset your account password. Use the verification code below to calibrate your secure credentials:</p>
        <div style="background-color: #FAFAFA; border: 1px dashed #C9A96E; padding: 20px; text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 28px; letter-spacing: 0.15em; color: #C9A96E; font-weight: bold;">${code}</span>
        </div>
        <p style="font-size: 11px; color: #888888; line-height: 1.5; margin-top: 30px;">This certificate token is active for 15 minutes. If you did not make this request, please safely disregard this diagnostic dispatch.</p>
      </div>
    `;

    if (transporter) {
       transporter.sendMail({
         from,
         to: emailLower,
         subject,
         text: textBody,
         html: htmlBody
       }).then(() => {
         console.log(`[EMAIL DISPATCH] Password recovery email successfully dispatched to ${emailLower}`);
       }).catch((err) => {
         console.error(`[EMAIL FAILURE] Failed to send password recovery via SMTP: ${err?.message || err}`);
       });
       res.json({ success: true, message: 'Security handshake dispatched. A verification code has been sent.' });
    } else {
       console.log(`\n========================================\n[EMAIL DISPATCH] Password Recovery Code for ${emailLower}:\nCODE: ${code}\n========================================\n`);
       res.json({ 
         success: true, 
         message: 'Security handshake dispatched. Verification code simulated in system logs.',
         devCode: code 
       });
    }
  } catch (err) {
    console.error('[RECOVERY ERROR]', err);
    res.status(500).json({ error: 'Credentials calibration sequence failed. Please retry.' });
  }
});

router.post('/reset-password', rateLimiter(10, 60 * 1000), async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'All fields (Email, Verification Code, and New Password) are mandatory.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const record = recoveryCodes.get(emailLower);

    if (!record) {
      res.status(400).json({ error: 'No active recovery handshake exists for this email.' });
      return;
    }

    if (record.expiresAt < Date.now()) {
      recoveryCodes.delete(emailLower);
      res.status(400).json({ error: 'The verification code has expired. Please request a new security handshake.' });
      return;
    }

    if (record.code !== code.trim()) {
      res.status(400).json({ error: 'Invalid security code. Please check your credentials and retry.' });
      return;
    }

    // Success! Update password hash in Firebase Firestore
    const passHash = await bcrypt.hash(newPassword.trim(), 10);
    await saveCredentialDoc(emailLower, passHash);

    // Clean up recovery record
    recoveryCodes.delete(emailLower);

    res.json({ success: true, message: 'Password calibrated successfully. Your security credentials have been updated.' });
  } catch (err) {
    console.error('[RESET ERROR]', err);
    res.status(500).json({ error: 'Credentials calibration sequence failed. Please retry.' });
  }
});

// Send registration verification codes
router.post('/send-register-verification', rateLimiter(15, 60 * 1000), async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email || !phone) {
      res.status(400).json({ error: 'Please enter both a valid email and phone number.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const phoneTrimmed = phone.trim();

    // Check if citizen already exists
    const citizens = await getCitizensDoc();
    const exists = citizens.some(c => c.email.toLowerCase() === emailLower);
    if (exists) {
      res.status(400).json({ error: 'This email is already associated with an active account dossier.' });
      return;
    }

    // Generate random 6-digit code for both email and phone
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save record
    registerCodes.set(emailLower, {
      emailCode,
      phoneCode,
      email: emailLower,
      phone: phoneTrimmed,
      expiresAt: Date.now() + 15 * 60 * 1000 // Valid for 15 minutes
    });

    console.log(`\n========================================\n[REGISTRATION HANDSHAKE] Verification codes initialized for ${emailLower}:\nEMAIL CODE: ${emailCode}\nPHONE CODE: ${phoneCode}\n========================================\n`);

    const transporter = createEmailTransporter();
    const from = process.env.SMTP_FROM || 'Orris Atelier <noreply@orris.com>';
    const subject = 'ORRIS Atelier - Account Registration Verification Codes';
    
    const textBody = `Your Orris Atelier registration verification codes are:\n\nEmail Verification Code: ${emailCode}\nPhone Verification Code: ${phoneCode}\n\nThese codes will expire in 15 minutes.\n\nThank you,\nOrris Atelier`;
    
    const htmlBody = `
      <div style="font-family: inherit; max-width: 550px; margin: 0 auto; padding: 40px; border: 1px solid #EAEAEA; background-color: #FFFFFF;">
        <div style="text-align: center; margin-bottom: 30px;">
          <span style="font-family: serif; font-size: 20px; letter-spacing: 0.2em; text-transform: uppercase; color: #111111; font-weight: 300;">ORRIS ATELIER</span>
        </div>
        <p style="font-size: 13px; color: #444444; line-height: 1.6;">You are currently initiating an account registration process at Orris Atelier. To secure your client profile, please verify your email address and phone number with the codes below:</p>
        
        <div style="background-color: #FAFAFA; border: 1px dashed #C9A96E; padding: 15px; text-align: center; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 5px 0;">Email Verification Code</p>
          <span style="font-family: monospace; font-size: 26px; letter-spacing: 0.15em; color: #C9A96E; font-weight: bold;">${emailCode}</span>
        </div>

        <div style="background-color: #FAFAFA; border: 1px dashed #A3A3A3; padding: 15px; text-align: center; margin: 20px 0;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 0 0 5px 0;">Phone Verification Code</p>
          <span style="font-family: monospace; font-size: 26px; letter-spacing: 0.15em; color: #111111; font-weight: bold;">${phoneCode}</span>
        </div>

        <p style="font-size: 11px; color: #888888; line-height: 1.5; margin-top: 30px;">These certificate tokens are active for 15 minutes. If you did not make this request, please safely disregard this diagnostic dispatch.</p>
      </div>
    `;

    if (transporter) {
      transporter.sendMail({
        from,
        to: emailLower,
        subject,
        text: textBody,
        html: htmlBody
      }).then(() => {
        console.log(`[EMAIL DISPATCH] Registration verification codes successfully dispatched via SMTP email to ${emailLower}`);
      }).catch((err) => {
        console.error(`[EMAIL DISPATCH ERROR] Failed to send registration codes via SMTP: ${err?.message || err}`);
      });
      res.json({ 
        success: true, 
        message: 'Security verification handshake dispatched. Verification codes have been sent to your email.' 
      });
    } else {
      res.json({ 
        success: true, 
        message: 'Security verification handshake dispatched. Verification codes simulated in system logs.',
        devEmailCode: emailCode,
        devPhoneCode: phoneCode
      });
    }
  } catch (err: any) {
    console.error('[REGISTRATION CODE ERROR]', err);
    res.status(500).json({ error: err?.message || 'Verification code delivery failed.' });
  }
});

// Verify email & phone registration codes
router.post('/verify-register-codes', rateLimiter(20, 60 * 1000), (req, res) => {
  try {
    const { email, emailCode, phoneCode } = req.body;
    if (!email || !emailCode || !phoneCode) {
      res.status(400).json({ error: 'Mandatory verification codes missing.' });
      return;
    }

    const emailLower = email.toLowerCase().trim();
    const record = registerCodes.get(emailLower);

    if (!record) {
      res.status(400).json({ error: 'No active verification records found for this registry handshake.' });
      return;
    }

    if (record.expiresAt < Date.now()) {
      registerCodes.delete(emailLower);
      res.status(400).json({ error: 'Verification codes have expired. Please request a new security handshake.' });
      return;
    }

    if (record.emailCode !== emailCode.trim()) {
      res.status(400).json({ error: 'Invalid Email Verification code. Check and enter the correct code.' });
      return;
    }

    if (record.phoneCode !== phoneCode.trim()) {
      res.status(400).json({ error: 'Invalid Phone Verification code. Check and enter the correct code.' });
      return;
    }

    res.json({ success: true, message: 'Identity credentials successfully verified.' });
  } catch (err: any) {
    console.error('[VERIFICATION MATCH EXCEPTION]', err);
    res.status(500).json({ error: err?.message || 'Internal verification handler error.' });
  }
});

// Admin-only retrieval of pending register verification handshakes
router.get('/register-verification-codes', requireAdmin, (req, res) => {
  try {
    const list = Array.from(registerCodes.entries()).map(([email, record]) => ({
      email,
      phone: record.phone,
      emailCode: record.emailCode,
      phoneCode: record.phoneCode,
      expiresAt: record.expiresAt
    }));
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to list verification codes.' });
  }
});

export default router;
