/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Citizen } from '../../src/types';
import { requireAdmin, getSessionUser } from '../../middleware.js';
import { registerCodes } from './verificationStore.js';
import { 
  getCitizensDoc, 
  saveCitizenDoc, 
  deleteCitizenDoc,
  saveCredentialDoc 
} from '../../src/lib/firebaseService.js';

const router = express.Router();

router.get('/', requireAdmin, async (req, res) => {
  try {
    const citizens = await getCitizensDoc();
    res.json(citizens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve registered Orris patrons.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { password, emailCode, phoneCode, ...newCitizen } = req.body;
    if (!newCitizen.id || !newCitizen.email || !newCitizen.name) {
      res.status(400).json({ error: 'Incomplete citizen specs.' });
      return;
    }

    const emailLower = newCitizen.email.toLowerCase().trim();

    // Check if user is an authenticated Admin
    const loggedUser = getSessionUser(req);
    const isAdmin = loggedUser && loggedUser.role === 'ADMIN';

    if (!isAdmin) {
      // Must verify email and phone code!
      if (!emailCode || !phoneCode) {
        res.status(400).json({ error: 'Both Email and Phone verification codes are required for registration.' });
        return;
      }

      const verRecord = registerCodes.get(emailLower);
      if (!verRecord) {
        res.status(400).json({ error: 'No active verification record found. Please send verification codes first.' });
        return;
      }

      if (verRecord.expiresAt < Date.now()) {
        registerCodes.delete(emailLower);
        res.status(400).json({ error: 'Verification codes have expired. Please request new verification codes.' });
        return;
      }

      if (verRecord.emailCode !== emailCode.trim()) {
        res.status(400).json({ error: 'Invalid Email verification code. Please try again.' });
        return;
      }

      if (verRecord.phoneCode !== phoneCode.trim()) {
        res.status(400).json({ error: 'Invalid Phone verification code. Please try again.' });
        return;
      }

      // Success, remove verification code record
      registerCodes.delete(emailLower);
    }

    // Hash and store credentials securely if provided
    if (password && password.length >= 6) {
      const passHash = await bcrypt.hash(password.trim(), 10);
      await saveCredentialDoc(emailLower, passHash);
    }

    await saveCitizenDoc(newCitizen);
    res.status(201).json(newCitizen);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register citizen dossier.' });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = req.body as Citizen;
    await saveCitizenDoc({ ...updatedUser, id });
    res.json({ ...updatedUser, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update citizen dossier.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const citizens = await getCitizensDoc();
    const departed = citizens.find((c) => c.id === id);
    if (!departed) {
      res.status(404).json({ error: 'Citizen dossier not found.' });
      return;
    }
    await deleteCitizenDoc(id);
    res.json({ success: true, departed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to withdraw citizen dossier.' });
  }
});

export default router;
