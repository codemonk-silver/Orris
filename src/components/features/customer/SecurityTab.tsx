/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Smartphone, ShieldAlert, KeyRound, Terminal, RefreshCw, Globe, Award 
} from 'lucide-react';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: SecurityTab Component
 * ============================================================================
 * What is this component's purpose?
 * Provides complete command over user authentication, multi-factor keys,
 * API developer secrets, password updating, and tracking active devices.
 * ============================================================================
 */

interface SecurityTabProps {
  triggerSecNotification: (message: string) => void;
  profileEmail: string;
  profileName: string;
}

export default function SecurityTab({
  triggerSecNotification,
  profileEmail,
  profileName
}: SecurityTabProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('orris_sk_live_226b8d9f10c4ee792be');
  const [showApiKey, setShowApiKey] = useState(false);
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [authorizedDevices, setAuthorizedDevices] = useState([
    { id: 'dev-1', name: 'Apple iPhone 15 Pro', location: 'Geneva, Switzerland', ip: '194.230.144.15', active: true },
    { id: 'dev-2', name: 'Apple MacBook Pro 16"', location: 'Paris, France', ip: '82.253.91.107', active: true }
  ]);

  const passwordStrength = useMemo(() => {
    if (!pwNew) return '';
    if (pwNew.length < 5) return 'WEAK';
    if (pwNew.length < 8 || !/[0-9]/.test(pwNew) || !/[a-zA-Z]/.test(pwNew)) return 'FAIR';
    return 'STRONG';
  }, [pwNew]);

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setBackupCodes(['ORS-88AF-99BC', 'ORS-1209-A4EF', 'ORS-BB88-F2AC', 'ORS-77CC-51FF']);
      setTwoFactorEnabled(true);
      triggerSecNotification('Multi-factor Authentication enabled. Please preserve your secure recovery backups.');
    } else {
      setBackupCodes([]);
      setTwoFactorEnabled(false);
      triggerSecNotification('Two-Factor Authentication decommissioned. It is recommended to secure your login.');
    }
  };

  const handleGenerateApiKey = () => {
    const chars = 'abcdef0123456789';
    let rand = '';
    for (let i = 0; i < 16; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(`orris_sk_live_226b8d9f${rand}`);
    triggerSecNotification('Your API access keys have been updated.');
  };

  const handleRevokeDevice = (deviceId: string, deviceName: string) => {
    setAuthorizedDevices(prev => prev.filter(d => d.id !== deviceId));
    triggerSecNotification(`Authorization revoked for ${deviceName}. Session terminated.`);
  };

  const handleUpdatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwCurrent) {
      triggerSecNotification('Please authorize password modification with your current password.');
      return;
    }
    if (pwNew !== pwConfirm) {
      triggerSecNotification('Verification mismatch: New password fields do not map correctly.');
      return;
    }
    if (passwordStrength === 'WEAK') {
      triggerSecNotification('The proposed new credentials are cryptographically weak. Please increase character complexity.');
      return;
    }
    
    // Simulate update success
    setPwCurrent('');
    setPwNew('');
    setPwConfirm('');
    triggerSecNotification('Access security credentials updated successfully. Current sessions remain authorized.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col gap-8 bg-white border border-[#E5E5E5] p-6 shadow-sm rounded-none text-left"
      id="security-dashboard-panel"
    >
      {/* Header Info */}
      <div className="border-b border-neutral-100 pb-4 font-sans">
        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
          Account Security Settings
        </h4>
        <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed font-sans normal-case tracking-normal">
          Manage your account password, activate secure two-factor authentication, or look at your private API tokens below.
        </p>
      </div>

      {/* Two-Factor Authentication Toggle */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start font-sans">
        <div className="md:col-span-8 flex flex-col gap-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] font-bold">Two-Factor Authentication</span>
          <p className="text-xs text-neutral-800 font-semibold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
            Secure Two-Factor Authentication (2FA)
          </p>
          <p className="text-[11px] text-neutral-500 leading-relaxed font-light font-sans tracking-normal normal-case">
            Elevate your account defense. When enabled, signing in will request an authentic temporary passcode from your authorized authenticator app (Google Authenticator, Duo).
          </p>
        </div>
        <div className="md:col-span-4 flex md:justify-end w-full">
          <button
            onClick={handleToggle2FA}
            className={`w-full md:w-auto px-4 py-2 text-[10px] uppercase font-mono tracking-wider font-black border transition-all cursor-pointer ${
              twoFactorEnabled 
                ? 'bg-[#10B981] text-white border-[#10B981]' 
                : 'bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black border-black animate-pulse'
            }`}
            id="toggle-2fa-btn"
          >
            {twoFactorEnabled ? '2FA ACTIVE ✓' : 'ENABLE 2FA'}
          </button>
        </div>
      </div>

      {/* Recovery Codes Expansion Block */}
      {twoFactorEnabled && (
        <div className="bg-neutral-50 p-4 border border-dashed border-[#E5E5E5] font-sans">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#C9A96E] font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Private Backup Recovery Codes
            </span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                triggerSecNotification('Private backup recovery codes saved to your clipboard.');
              }}
              className="text-[9px] font-mono uppercase text-[#C9A96E] hover:text-black border-b border-transparent hover:border-[#C9A96E] cursor-pointer"
            >
              Copy Codes
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs text-neutral-700 font-bold">
            {backupCodes.map((code, idx) => (
              <div key={idx} className="bg-white p-2 border border-neutral-100 flex items-center justify-between">
                <span>{code}</span>
                <span className="text-[8px] text-neutral-400 font-light font-sans normal-case tracking-normal">unused</span>
              </div>
            ))}
          </div>
          <p className="text-[9.5px] text-neutral-400 font-sans leading-relaxed mt-2 text-center normal-case tracking-normal">
            Keep these safe in a secure password manager. These codes provide instant access bypass if you lose your authentication device.
          </p>
        </div>
      )}

      {/* Password credentials editing block */}
      <div className="border-t border-neutral-100 pt-6 font-sans">
        <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] font-bold block mb-4">Change Account Password</span>
        <form onSubmit={handleUpdatePasswordSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Current Password</label>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">New Password</label>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Confirm New Password</label>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
              />
            </div>

            {/* Submit & Indicators column */}
            <div className="flex flex-col gap-2 pt-2">
              <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider font-bold">
                <span className="text-neutral-400">Security strength:</span>
                {pwNew ? (
                  <span className={`font-black ${
                    passwordStrength === 'WEAK' ? 'text-red-500' :
                    passwordStrength === 'FAIR' ? 'text-amber-500' : 'text-emerald-500'
                  }`}>{passwordStrength}</span>
                ) : (
                  <span className="text-neutral-400">Empty</span>
                )}
              </div>
              {/* Visual Strength bar */}
              <div className="h-1 bg-neutral-100 w-full rounded-none overflow-hidden relative">
                {pwNew && (
                  <div className={`h-full transition-all duration-300 ${
                    passwordStrength === 'WEAK' ? 'bg-red-500 w-1/3' :
                    passwordStrength === 'FAIR' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                  }`} />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!pwCurrent || !pwNew}
              className="w-full sm:w-auto px-6 py-2.5 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-colors disabled:opacity-40 disabled:bg-neutral-100 disabled:text-neutral-400 text-[10px] font-mono uppercase tracking-widest font-black rounded-none cursor-pointer border border-black"
            >
              Save Password Changes
            </button>
          </div>
        </form>
      </div>

      {/* Active Client Access logs */}
      <div className="border-t border-neutral-100 pt-6 font-sans">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] font-bold">Authorized Account Sessions</span>
          <span className="text-[9px] text-[#52525B] font-bold uppercase tracking-wider bg-neutral-100 px-2.5 py-0.5 font-mono">
            Active Security Log
          </span>
        </div>

        {authorizedDevices.length > 0 ? (
          <div className="flex flex-col gap-3 font-mono">
            {authorizedDevices.map((dev) => (
              <div key={dev.id} className="bg-neutral-50 px-3 py-2.5 border border-[#E5E5E5] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 bg-[#E5E5E5] mt-0.5 rounded-none flex items-center justify-center text-neutral-600">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left font-sans">
                    <p className="text-xs font-bold text-neutral-900">{dev.name}</p>
                    <p className="text-[9.5px] text-neutral-400 block mt-0.5 select-all font-mono">
                      {dev.location} &bull; IP: {dev.ip}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeDevice(dev.id, dev.name)}
                  className="px-3 py-1.5 text-[8.5px] font-bold border border-neutral-300 text-red-650 hover:bg-neutral-900 hover:text-white hover:border-black transition-colors rounded-none cursor-pointer uppercase font-mono tracking-widest bg-white"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-50 p-4 border border-dashed border-red-200 text-center font-mono rounded-none">
            <span className="text-[9px] text-red-600 block font-bold">All active sessions ended. You are currently on a temporary guest session.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
