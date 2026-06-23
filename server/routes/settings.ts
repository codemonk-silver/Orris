/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { MaisonSettings } from '../../src/types';
import { requireAdmin } from '../../middleware.js';
import { getSettingsDoc, saveSettingsDoc } from '../../src/lib/firebaseService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const settings = await getSettingsDoc();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calibrate settings.' });
  }
});

router.put('/', requireAdmin, async (req, res) => {
  try {
    const newSettings = req.body as MaisonSettings;
    const current = await getSettingsDoc();
    const payload = { ...current, ...newSettings };
    await saveSettingsDoc(payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

export default router;
