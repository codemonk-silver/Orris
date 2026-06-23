/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, RefreshCw } from 'lucide-react';
import { Citizen } from '../../../types';

/**
 * ============================================================================
 * JUNIOR DEVELOPER TRAINING MANUAL: ProfileDetailsTab Component
 * ============================================================================
 * What is this component's purpose?
 * Provides editing controls over the client's registered Profile.
 * Split into two clear blocks:
 * 1. Contact Information (identity credentials)
 * 2. Shipping coordinates (physical routes)
 *
 * Local State Syncing:
 * Synchronously grabs current values on mounting or when parent dossier updates.
 * ============================================================================
 */

interface ProfileDetailsTabProps {
  currentCitizen: Citizen | undefined;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  addCitizen: (c: Citizen) => void;
  updateCitizen: (c: Citizen) => void;
  triggerSecNotification: (message: string) => void;
}

export default function ProfileDetailsTab({
  currentCitizen,
  userName,
  userEmail,
  isAdmin,
  addCitizen,
  updateCitizen,
  triggerSecNotification
}: ProfileDetailsTabProps) {
  const [profileName, setProfileName] = useState(userName || 'Orris Client');
  const [profileEmail, setProfileEmail] = useState(userEmail || 'client@orris.com');
  const [profilePhone, setProfilePhone] = useState('+41 (79) 555-8899');
  const [profileStreet, setProfileStreet] = useState("Rue de l'Atelier 45");
  const [profileCity, setProfileCity] = useState("Geneva");
  const [profileState, setProfileState] = useState("CH");
  const [profilePostalCode, setProfilePostalCode] = useState("1201");
  const [profileCountry, setProfileCountry] = useState("Switzerland");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (currentCitizen) {
      setProfileName(currentCitizen.name || '');
      setProfileEmail(currentCitizen.email || '');
      setProfilePhone(currentCitizen.phone || '');
      if (currentCitizen.location) {
        if (currentCitizen.location.includes(';')) {
          const parts = currentCitizen.location.split(';');
          setProfileStreet(parts[0] || '');
          setProfileCity(parts[1] || '');
          setProfileState(parts[2] || '');
          setProfilePostalCode(parts[3] || '');
          setProfileCountry(parts[4] || '');
        } else {
          setProfileStreet(currentCitizen.location);
        }
      }
    } else {
      if (userName) setProfileName(userName);
      if (userEmail) setProfileEmail(userEmail);
    }
  }, [currentCitizen, userName, userEmail]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const fullLoc = [profileStreet, profileCity, profileState, profilePostalCode, profileCountry].join(';');
      if (currentCitizen) {
        const updated = {
          ...currentCitizen,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          location: fullLoc,
        };
        await updateCitizen(updated);
        triggerSecNotification('Atelier profile synchronized successfully in Citizen Directory.');
      } else {
        const newCit: Citizen = {
          id: 'usr-' + Date.now(),
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          location: fullLoc,
          role: isAdmin ? 'ADMIN' as const : 'USER' as const,
          VIPLevel: 'VIP Member',
          spend: '$0',
          status: 'Online',
          createdAt: new Date().toISOString()
        };
        await addCitizen(newCit);
        triggerSecNotification('Registered new Citizen dossier in Maison Registry.');
      }
    } catch (err: any) {
      console.error('[PROFILE SYNC ERROR]', err);
      triggerSecNotification('Coordination error with Maison database.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex flex-col gap-8 bg-white border border-[#E5E5E5] p-6 shadow-sm rounded-none text-left"
      id="profile-details-panel"
    >
      {/* Header Info */}
      <div className="border-b border-neutral-100 pb-4 font-sans">
        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-2">
          <Award className="w-4 h-4 text-[#C9A96E]" />
          Orris Profile Information
        </h4>
        <p className="text-xs text-neutral-500 font-light mt-1.5 leading-relaxed font-sans normal-case tracking-normal">
          Update your contact details and shipping address. Let our coordinators arrange shipping and secure packaging correctly.
        </p>
      </div>

      {/* Form details */}
      <form onSubmit={handleSubmitProfile} className="space-y-6">
        {/* General Segment */}
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] font-bold block mb-4">01 / Contact Information</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold font-sans">Full Identity Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-mono text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none font-bold"
                placeholder="Jean Cocteau"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Secure Email Address ID</label>
              <input
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                required
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-mono text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                placeholder="client@orris.com"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Private Telephone Direct Line</label>
              <input
                type="text"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                required
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-mono text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                placeholder="+41 (79) 555-8899"
              />
            </div>
          </div>
        </div>

        {/* Shipping Coordinates Segment */}
        <div className="border-t border-neutral-100 pt-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#737373] font-bold block mb-4">02 / Shipping Coordinates</span>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Atelier Delivery Street Address</label>
              <input
                type="text"
                value={profileStreet}
                onChange={(e) => setProfileStreet(e.target.value)}
                required
                className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3.5 py-2.5 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                placeholder="Rue de l'Atelier 45"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">City / District</label>
                <input
                  type="text"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  required
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                  placeholder="Geneva"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">State / Province</label>
                <input
                  type="text"
                  value={profileState}
                  onChange={(e) => setProfileState(e.target.value)}
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                  placeholder="CH"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Postal / ZIP Code</label>
                <input
                  type="text"
                  value={profilePostalCode}
                  onChange={(e) => setProfilePostalCode(e.target.value)}
                  required
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                  placeholder="1201"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Territory Country</label>
                <input
                  type="text"
                  value={profileCountry}
                  onChange={(e) => setProfileCountry(e.target.value)}
                  required
                  className="w-full bg-neutral-50 hover:bg-neutral-100 focus:bg-white border border-[#E5E5E5] px-3 py-2 text-xs font-sans text-neutral-800 transition-colors focus:outline-none focus:border-black rounded-none"
                  placeholder="Switzerland"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submitting button */}
        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSavingProfile}
            className="w-full sm:w-auto px-6 py-3 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black transition-all text-[10px] font-mono uppercase tracking-widest font-black rounded-none cursor-pointer border border-black flex items-center justify-center gap-2"
          >
            {isSavingProfile ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synchronizing Registry...</span>
              </>
            ) : (
              <span>Save and Synchronize Registry</span>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
