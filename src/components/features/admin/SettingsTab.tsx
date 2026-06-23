/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MaisonSettings } from '../../../types';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: SettingsTab Component
 * ============================================================================
 * What is this component's purpose?
 * Manages store branding, currency indicators, delivery tier calculations,
 * and announcement bars. Mapped locally of all settings fields with interactive 
 * effect bounds synched cleanly to the global store configuration.
 * ============================================================================
 */

interface SettingsTabProps {
  settings: MaisonSettings | null;
  onUpdateSettings: (updated: MaisonSettings) => void;
  triggerNotification: (message: string) => void;
}

export default function SettingsTab({
  settings,
  onUpdateSettings,
  triggerNotification
}: SettingsTabProps) {
  // Maison global settings state
  const [settingsBrandName, setSettingsBrandName] = useState('ORRIS');
  const [settingsBarText, setSettingsBarText] = useState('');
  const [settingsBarActive, setSettingsBarActive] = useState(true);
  const [settingsThreshold, setSettingsThreshold] = useState(150);
  const [settingsTax, setSettingsTax] = useState(0);
  const [settingsSymbol, setSettingsSymbol] = useState('$');
  const [settingsCurName, setSettingsCurName] = useState('USD');
  const [settingsCuratorEmail, setSettingsCuratorEmail] = useState('curator@orris.com');
  const [settingsSignatureActive, setSettingsSignatureActive] = useState(true);

  useEffect(() => {
    if (settings) {
      setSettingsBrandName(settings.brandName || 'ORRIS');
      setSettingsBarText(settings.announcementBarText || '');
      setSettingsBarActive(settings.isAnnouncementBarActive !== false);
      setSettingsThreshold(settings.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 150);
      setSettingsTax(settings.taxRatePercentage !== undefined ? settings.taxRatePercentage : 0);
      setSettingsSymbol(settings.currencySymbol || '$');
      setSettingsCurName(settings.currencyName || 'USD');
      setSettingsCuratorEmail(settings.chiefCuratorEmail || 'curator@orris.com');
      setSettingsSignatureActive(settings.isSignatureSeriesActive !== false);
    }
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: MaisonSettings = {
      brandName: settingsBrandName,
      announcementBarText: settingsBarText,
      isAnnouncementBarActive: settingsBarActive,
      freeShippingThreshold: Number(settingsThreshold) || 150,
      taxRatePercentage: Number(settingsTax) || 0,
      currencySymbol: settingsSymbol,
      currencyName: settingsCurName,
      chiefCuratorEmail: settingsCuratorEmail,
      isSignatureSeriesActive: settingsSignatureActive
    };
    onUpdateSettings(updated);
    triggerNotification("SUCCESS: Orris store settings updated and successfully applied.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto text-left">
      <div className="border-b border-neutral-200 pb-5">
        <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Global Configuration</span>
        <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-[#0F0F0F]">Orris Brand & Store Settings</h1>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white border border-neutral-150 p-6 md:p-8 rounded-lg shadow-lg flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1.5 font-bold">Store Brand Name</label>
            <input 
              type="text" 
              value={settingsBrandName} 
              onChange={(e) => setSettingsBrandName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1.5 font-bold">Store Administrator Email</label>
            <input 
              type="email" 
              value={settingsCuratorEmail} 
              onChange={(e) => setSettingsCuratorEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1.5 font-bold">Hero Announcement Banner Text</label>
            <input 
              type="text" 
              value={settingsBarText} 
              onChange={(e) => setSettingsBarText(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 p-3.5 rounded">
            <input 
              type="checkbox" 
              id="sett-ann-active"
              checked={settingsBarActive} 
              onChange={(e) => setSettingsBarActive(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#C9A96E]"
            />
            <label htmlFor="sett-ann-active" className="text-xs uppercase font-mono text-neutral-700 tracking-wider cursor-pointer font-semibold select-none">Show Announcement Bar</label>
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 p-3.5 rounded">
            <input 
              type="checkbox" 
              id="sett-sig-active"
              checked={settingsSignatureActive} 
              onChange={(e) => setSettingsSignatureActive(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#C9A96E]"
            />
            <label htmlFor="sett-sig-active" className="text-xs uppercase font-mono text-neutral-700 tracking-wider cursor-pointer font-semibold select-none">Enable Product Signature Highlights</label>
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-450 tracking-wider block mb-1.5 font-bold">Free Courier Delivery Threshold ($)</label>
            <input 
              type="number" 
              value={settingsThreshold} 
              onChange={(e) => setSettingsThreshold(Number(e.target.value))}
              required
              min={0}
              className="w-full px-4 py-2.5 border border-[#E5E5E5] text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-450 tracking-wider block mb-1.5 font-bold">Dynamic Tax / Duties Percentage (%)</label>
            <input 
              type="number" 
              value={settingsTax} 
              onChange={(e) => setSettingsTax(Number(e.target.value))}
              required
              min={0}
              max={100}
              className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-450 tracking-wider block mb-1.5 font-bold">Dynamic Currency Symbol</label>
            <input 
              type="text" 
              value={settingsSymbol} 
              onChange={(e) => setSettingsSymbol(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-mono text-neutral-450 tracking-wider block mb-1.5 font-bold">Dynamic Currency Name</label>
            <input 
              type="text" 
              value={settingsCurName} 
              onChange={(e) => setSettingsCurName(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-neutral-200 text-[#1A1A1A] text-xs font-mono bg-neutral-50 rounded focus:bg-white outline-none focus:border-[#C9A96E]"
            />
          </div>

        </div>

        <div className="border-t border-neutral-100 pt-5 flex justify-end gap-4 mt-2">
          <button 
            type="submit" 
            className="px-8 py-3.5 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-semibold text-xs uppercase tracking-widest rounded transition-all duration-300 shadow cursor-pointer font-mono"
          >
            Authorize Brand Configuration settings
          </button>
        </div>

      </form>
    </div>
  );
}
