/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Edit, Trash2, Users, ShieldCheck, Key, Clock, RefreshCw } from 'lucide-react';
import { Citizen } from '../../../types';
import { useAppStore } from '../../../store/useAppStore';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: CustomersTab Component
 * ============================================================================
 * What is this component's purpose?
 * Manages customer credentials and profiles (Citizens). Facilitates account
 * editing, registering new customers, upgrading VIP rankings, emailing credits,
 * and pinging active session telemetries.
 * ============================================================================
 */

interface CustomersTabProps {
  citizens: Citizen[];
  addCitizen: (newCit: Citizen, password?: string) => Promise<void>;
  updateCitizen: (updatedCit: Citizen) => Promise<void>;
  deleteCitizen: (id: string) => void;
  triggerNotification: (message: string) => void;
}

export default function CustomersTab({
  citizens = [],
  addCitizen,
  updateCitizen,
  deleteCitizen,
  triggerNotification
}: CustomersTabProps) {
  const [citSearch, setCitSearch] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  
  const [showCitizenForm, setShowCitizenForm] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState<Citizen | null>(null);
  const [isCreatingCitizen, setIsCreatingCitizen] = useState(false);

  // Form Fields for Citizens
  const [citFormName, setCitFormName] = useState('');
  const [citFormEmail, setCitFormEmail] = useState('');
  const [citFormPhone, setCitFormPhone] = useState('');
  const [citFormLocation, setCitFormLocation] = useState('');
  const [citFormVIPLevel, setCitFormVIPLevel] = useState('Bronze VIP Member');
  const [citFormSpend, setCitFormSpend] = useState('$0');
  const [citFormRole, setCitFormRole] = useState<'USER' | 'ADMIN'>('USER');
  const [citFormStatus, setCitFormStatus] = useState('Online');
  const [citFormPassword, setCitFormPassword] = useState('');

  // Live registration handshakes state
  const [handshakes, setHandshakes] = useState<{ email: string; phone: string; emailCode: string; phoneCode: string; expiresAt: number }[]>([]);
  const [isLoadingHandshakes, setIsLoadingHandshakes] = useState(false);

  const fetchHandshakes = async () => {
    try {
      const token = useAppStore.getState().authToken;
      const res = await fetch('/api/auth/register-verification-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHandshakes(data);
      }
    } catch (err) {
      console.error('Failed to fetch verification handshakes:', err);
    }
  };

  React.useEffect(() => {
    fetchHandshakes();
    const interval = setInterval(fetchHandshakes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Trigger form state for creating a new citizen
  const handleOpenCreateCitizen = () => {
    setEditingCitizen(null);
    setIsCreatingCitizen(true);
    setCitFormName('');
    setCitFormEmail('');
    setCitFormPhone('');
    setCitFormLocation('');
    setCitFormVIPLevel('Bronze VIP Member');
    setCitFormSpend('$0');
    setCitFormRole('USER');
    setCitFormStatus('Online');
    setCitFormPassword('');
    setShowCitizenForm(true);
  };

  // Trigger form state for editing an existing citizen
  const handleOpenEditCitizen = (cit: Citizen) => {
    setEditingCitizen(cit);
    setIsCreatingCitizen(false);
    setCitFormName(cit.name);
    setCitFormEmail(cit.email);
    setCitFormPhone(cit.phone || '');
    setCitFormLocation(cit.location || '');
    setCitFormVIPLevel(cit.VIPLevel);
    setCitFormSpend(cit.spend);
    setCitFormRole(cit.role);
    setCitFormStatus(cit.status);
    setCitFormPassword('');
    setShowCitizenForm(true);
  };

  // Save Citizen Action handler
  const handleSaveCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citFormName.trim() || !citFormEmail.trim()) return;

    try {
      if (isCreatingCitizen) {
        const newCit: Citizen = {
          id: 'usr-' + Date.now(),
          name: citFormName,
          email: citFormEmail.toLowerCase(),
          phone: citFormPhone || '+1 (555) 000-0000',
          location: citFormLocation || 'Standard Session',
          VIPLevel: citFormVIPLevel,
          spend: citFormSpend || '$0',
          role: citFormRole,
          status: citFormStatus,
          createdAt: new Date().toISOString()
        };
        await addCitizen(newCit, citFormPassword.trim() || undefined);
        triggerNotification(`SUCCESS: Registered Citizen profile for "${citFormName}".`);
      } else if (editingCitizen) {
        const updatedCit: Citizen = {
          ...editingCitizen,
          name: citFormName,
          email: citFormEmail.toLowerCase(),
          phone: citFormPhone,
          location: citFormLocation,
          VIPLevel: citFormVIPLevel,
          spend: citFormSpend,
          role: citFormRole,
          status: citFormStatus
        };
        await updateCitizen(updatedCit);
        setSelectedCitizen(updatedCit);
        triggerNotification(`SUCCESS: Dossier changes for ${citFormName} applied.`);
      }
      setShowCitizenForm(false);
    } catch (err: any) {
      triggerNotification(`ERROR: ${err?.message || 'Failed to update customer registry.'}`);
    }
  };

  const handleDeleteCitizen = (id: string) => {
    if (confirm("Are you sure you want to permanently prune this citizen from files?")) {
      deleteCitizen(id);
      if (selectedCitizen?.id === id) {
        setSelectedCitizen(null);
      }
      triggerNotification("SUCCESS: Dossier removed from database successfully.");
    }
  };

  // Filter citizens list dynamically
  const filteredCitizens = useMemo(() => {
    const list = citizens || [];
    return list.filter(cit => 
      cit.name.toLowerCase().includes(citSearch.toLowerCase()) ||
      cit.email.toLowerCase().includes(citSearch.toLowerCase()) ||
      cit.location.toLowerCase().includes(citSearch.toLowerCase())
    );
  }, [citizens, citSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-4 border-b border-neutral-200 pb-5 text-left">
        <div>
          <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold">Customer Accounts</span>
          <h1 className="text-2xl font-light tracking-tight mt-1 font-serif text-[#0F0F0F]">Registered Customers & Accounts</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              value={citSearch}
              onChange={(e) => setCitSearch(e.target.value)}
              placeholder="Search customers..."
              className="pl-8 pr-4 py-2 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <button 
            onClick={handleOpenCreateCitizen}
            className="px-5 py-2.5 bg-black hover:bg-[#C9A96E] text-[#C9A96E] hover:text-black text-xs font-bold uppercase tracking-widest rounded flex items-center gap-1 cursor-pointer transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Live Customer Form */}
      {showCitizenForm && (
        <form onSubmit={handleSaveCitizen} className="bg-white border border-neutral-250 p-6 rounded-lg gap-4 flex flex-col shadow-2xl max-w-2xl text-left">
          <div className="flex justify-between items-center border-b border-neutral-150 pb-3 mb-2">
            <h3 className="text-xs uppercase font-bold text-neutral-900 font-mono">
              {isCreatingCitizen ? 'Add New Customer' : `Edit Customer Profile: ${editingCitizen?.name}`}
            </h3>
            <button 
              type="button" 
              onClick={() => setShowCitizenForm(false)} 
              className="text-xs text-neutral-400 hover:text-black font-mono uppercase cursor-pointer"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Customer Name</label>
              <input 
                type="text" 
                value={citFormName} 
                onChange={(e) => setCitFormName(e.target.value)}
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Email Address</label>
              <input 
                type="email" 
                value={citFormEmail} 
                onChange={(e) => setCitFormEmail(e.target.value)}
                required
                placeholder="e.g. j.doe@curator.com"
                className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Phone Number</label>
              <input 
                type="text" 
                value={citFormPhone} 
                onChange={(e) => setCitFormPhone(e.target.value)}
                placeholder="e.g. +1 (555) 019-2831"
                className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Location Address</label>
              <input 
                type="text" 
                value={citFormLocation} 
                onChange={(e) => setCitFormLocation(e.target.value)}
                placeholder="e.g. Geneva, Switzerland"
                className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Total Amount Spent ($)</label>
              <input 
                type="text" 
                value={citFormSpend} 
                onChange={(e) => setCitFormSpend(e.target.value)}
                placeholder="e.g. $4,150"
                 className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Access Privilege Level</label>
              <select 
                value={citFormRole} 
                onChange={(e) => setCitFormRole(e.target.value as 'USER' | 'ADMIN')}
                className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none"
              >
                <option value="USER">USER (Citizen Client)</option>
                <option value="ADMIN">ADMIN (Maison Curator)</option>
              </select>
            </div>
            {isCreatingCitizen && (
              <div>
                <label className="text-[10px] uppercase font-mono text-neutral-400 block mb-1 font-bold">Secure Initial Password (Optional)</label>
                <input 
                  type="password"
                  value={citFormPassword}
                  onChange={(e) => setCitFormPassword(e.target.value)}
                  placeholder="Leave empty or specify credential password"
                  className="w-full px-4 py-2 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-neutral-100 pt-4">
            <button 
              type="submit" 
              className="py-2.5 px-6 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-bold text-xs uppercase tracking-widest rounded cursor-pointer duration-300 shadow"
            >
              {isCreatingCitizen ? 'Add Customer Profile' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Table of Customers */}
        <div className="lg:col-span-7 bg-white border border-neutral-100 p-6 rounded shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 font-mono">
              Registered Customers ({filteredCitizens.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs bg-white">
              <thead>
                <tr className="border-b border-neutral-200 text-[10px] font-mono uppercase tracking-widest text-[#737373] bg-neutral-50 container-none">
                  <th className="p-3">Customer ID</th>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Privilege</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCitizens.map((usr) => (
                  <tr 
                    key={usr.id} 
                    onClick={() => setSelectedCitizen(usr)}
                    className={`border-b border-neutral-100 hover:bg-neutral-50/50 cursor-pointer transition-colors ${
                      selectedCitizen?.id === usr.id ? 'bg-[#C9A96E]/10' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-neutral-400">{usr.id.slice(0, 10)}</td>
                    <td className="p-3">
                      <p className="font-semibold text-neutral-900">{usr.name}</p>
                      <p className="text-[10px] font-mono text-neutral-400">{usr.email}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                        usr.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3 text-right flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button"
                        onClick={() => setSelectedCitizen(usr)}
                        className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#C9A96E] hover:underline cursor-pointer"
                      >
                        Details
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button 
                        type="button"
                        onClick={() => handleOpenEditCitizen(usr)}
                        className="text-neutral-500 hover:text-[#C9A96E] p-1 cursor-pointer"
                        title="Edit specifications"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-neutral-300">|</span>
                      <button 
                        type="button"
                        onClick={() => handleDeleteCitizen(usr.id)}
                        className="text-neutral-400 hover:text-red-650 p-1 cursor-pointer"
                        title="Delete profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCitizens.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400 font-mono text-xs">
                      No citizen registries matching query coordinates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-neutral-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
                <h3 className="text-xs uppercase tracking-widest font-bold text-neutral-900 font-mono">
                  Pending Verification Handshakes ({handshakes.length})
                </h3>
              </div>
              <button 
                type="button"
                onClick={fetchHandshakes}
                className="p-1 hover:text-[#C9A96E] text-neutral-400 transition-colors font-mono uppercase text-[9px] flex items-center gap-1 cursor-pointer"
                title="Force refresh"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <p className="text-[11px] text-neutral-500 font-sans leading-relaxed mb-4">
              Active verification registries triggered by register forms are listed here. You can manually provide these validation codes to citizens experiencing technical dispatch delays.
            </p>

            {handshakes.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-100 rounded">
                <table className="w-full text-left text-xs bg-white">
                  <thead>
                    <tr className="border-b border-neutral-150 text-[9px] font-mono uppercase tracking-wider text-[#737373] bg-neutral-50">
                      <th className="p-2.5">Email Address</th>
                      <th className="p-2.5">Email Code</th>
                      <th className="p-2.5">Phone Code</th>
                      <th className="p-2.5 text-right">Expiration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handshakes.map((h, i) => {
                      const minsLeft = Math.max(0, Math.round((h.expiresAt - Date.now()) / 1000 / 60));
                      return (
                        <tr key={i} className="border-b border-neutral-100 hover:bg-neutral-50/20 font-mono text-[11px]">
                          <td className="p-2.5 font-sans">
                            <span className="font-semibold block text-[#0F0F0F]">{h.email}</span>
                            <span className="text-[9px] text-[#737373] block">{h.phone || 'No phone'}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/50 rounded text-[10px] font-bold tracking-wider select-all">{h.emailCode}</span>
                          </td>
                          <td className="p-2.5">
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/50 rounded text-[10px] font-bold tracking-wider select-all">{h.phoneCode}</span>
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="text-[10px] text-rose-600 font-bold flex items-center justify-end gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {minsLeft} min
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-neutral-50/30 text-center text-neutral-400 font-mono text-[10px] border border-dashed border-neutral-200 rounded">
                No active registration verification codes found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Citizen Inspector Details Card */}
        <div className="lg:col-span-5 text-left font-sans">
          <AnimatePresence mode="wait">
            {selectedCitizen ? (
              <motion.div
                key={selectedCitizen.id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="bg-neutral-900 text-white rounded-lg p-6 border border-[#C9A96E]/50 shadow-xl"
              >
                <div className="flex justify-between items-start border-b border-neutral-800 pb-4 mb-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase block mb-1">Customer Profile Details</span>
                    <h3 className="text-xl font-serif text-white font-light">{selectedCitizen.name}</h3>
                    <span className="text-[10px] font-mono text-zinc-400 mt-1 block">{selectedCitizen.email}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 font-mono text-[11px] mb-6">
                  <div className="flex justify-between py-1.5 border-b border-neutral-850">
                    <span className="text-neutral-400 uppercase">Phone:</span>
                    <span className="text-neutral-200">{selectedCitizen.phone || 'None registered'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-neutral-850">
                    <span className="text-neutral-400 uppercase">Location Address:</span>
                    <span className="text-neutral-200">{selectedCitizen.location || 'New York, USA'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400 uppercase">Total Spent:</span>
                    <span className="text-[#C9A96E] font-serif font-light text-xs">{selectedCitizen.spend || '$0'}</span>
                  </div>
                </div>

                {/* Interactive Admin Simulations */}
                <div className="border-t border-neutral-800 pt-5 flex flex-col gap-3">
                  <h4 className="text-[9px] font-mono uppercase tracking-widest text-[#C9A96E] mb-1 font-bold">Quick Customer Actions</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const randomVoucher = 'ORRIS-VOUCHER-' + Math.floor(1000 + Math.random() * 9000);
                      triggerNotification(`CUSTOMER ACTION: Emailed credit voucher ${randomVoucher} to ${selectedCitizen.name}.`);
                    }}
                    className="w-full bg-neutral-800 text-[9px] uppercase font-mono py-2.5 text-center text-neutral-200 cursor-pointer hover:bg-[#C9A96E] hover:text-black transition-colors border border-transparent"
                  >
                    Grant $150 Credit Voucher
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="bg-neutral-50/50 border border-dashed border-neutral-200 text-center py-16 px-6 rounded-lg text-neutral-400 font-mono text-xs">
                <Users className="w-8 h-8 mx-auto text-neutral-300 mb-2.5 animate-pulse" />
                <p className="font-bold text-[#0F0F0F] uppercase tracking-wider text-[10px] mb-1">Inspector Idle</p>
                <p className="text-[10px] text-neutral-400">Select any listed customer to inspect full metrics and quick actions.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
