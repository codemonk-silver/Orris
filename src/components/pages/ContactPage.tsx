/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldCheck, Heart } from 'lucide-react';

interface ContactPageProps {
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact') => void;
  showToast: (msg: string) => void;
}

export default function ContactPage({ setView, showToast }: ContactPageProps) {
  // Correspondence State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate luxury server-encryption handshake
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      showToast('Electronic correspondence securely synchronized.');
      setTimeout(() => {
        setSuccess(false);
        setName('');
        setEmail('');
        setMessage('');
      }, 5000);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white min-h-screen py-16 md:py-24 px-6 md:px-12 selection:bg-[#C9A96E] selection:text-black font-sans"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="border-b border-neutral-100 pb-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold">Atelier Desk</span>
            <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-neutral-900 mt-2">CORRESPONDENCE</h1>
          </div>
          <button 
            onClick={() => setView('shop')}
            className="text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all"
          >
            Return to Collection &rarr;
          </button>
        </div>

        {/* Desktop Split-Screen Grid: left (direct details), right (beautiful interactive form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch font-light">
          
          {/* Left Column - Direct Channels & Map Coordinates */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-100 pb-12 lg:pb-0 lg:pr-12">
            <div>
              <span className="text-xs font-mono text-[#C9A96E] uppercase tracking-widest block mb-4">Direct Communication Links</span>
              <h2 className="text-xl md:text-2xl font-serif font-light text-black uppercase tracking-tight mb-6">
                Curator Concierge Access
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-10">
                Our private curator desk sits open on an uninterrupted schedule to handle bespoke sizing orders, bespoke olfactory formulas, horological restoration requests, or private atelier reservations.
              </p>

              {/* Direct Details Grid */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-100 text-[#C9A96E]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#000000] uppercase font-bold block">Hotline Concierge</span>
                    <p className="text-sm font-mono mt-0.5 text-[#525252]">+1 (800) 555-ORRIS</p>
                    <span className="text-[9px] text-neutral-400 font-mono">Toll-free, Direct handoff, 24/7 global coverage</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-100 text-[#C9A96E]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#000000] uppercase font-bold block">Digital Dispatch</span>
                    <p className="text-sm font-mono mt-0.5 text-[#555555]">atelier@orris-lux.com</p>
                    <span className="text-[9px] text-neutral-400 font-mono">Curator review queue responses within 4 hours</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-100 text-[#C9A96E]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#000000] uppercase font-bold block">Switzerland HQ Address</span>
                    <p className="text-xs leading-relaxed mt-1 text-[#525252]">
                      Rue de l'Atelier 45, CH-1201 Geneva, Switzerland
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-neutral-50 border border-neutral-100 text-[#C9A96E]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#000000] uppercase font-bold block">Visiting Hours</span>
                    <p className="text-xs leading-relaxed mt-1 text-[#525252]">
                      Monday – Saturday, by appointment only.<br />
                      Private viewing slots must be requested 48 hours in advance.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Certification Badge */}
            <div className="mt-12 p-5 bg-neutral-50 border border-neutral-100 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-neutral-400 flex-shrink-0" />
              <p className="text-[10px] text-neutral-500 font-mono tracking-wider uppercase leading-relaxed uppercase">
                All communications filtered through encrypted endpoints. No metadata registers cached locally.
              </p>
            </div>
          </div>

          {/* Right Column - Premium Correspondence Dispatch Form */}
          <div className="lg:col-span-7 bg-neutral-50 border border-neutral-100 p-8 md:p-12">
            <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase font-bold block mb-2">Secure Correspondence Form</span>
            <h3 className="text-xl font-serif text-black uppercase tracking-tight mb-8">
              Dispatch Electronic Memo
            </h3>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success-screen"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-16 text-center flex flex-col items-center justify-center bg-white border border-border mt-2 p-8"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-900">Handshake Complete</span>
                  <h4 className="text-lg font-serif italic text-black mt-2 font-light">Your specifications are lodged.</h4>
                  <p className="text-[11px] text-neutral-500 mt-3 max-w-sm leading-relaxed mx-auto font-sans">
                    Our master curator team has queued your correspondence. We will initiate a secure communication stream back to your email within 4 standard hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-500 block mb-2 font-bold">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Lord Sterling"
                        className="w-full px-4 py-3 border border-neutral-200 outline-none focus:border-black text-xs font-mono bg-white hover:bg-neutral-50/50 focus:bg-white transition-all rounded-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-500 block mb-2 font-bold">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="e.g. sterling@atelier.com"
                        className="w-full px-4 py-3 border border-neutral-200 outline-none focus:border-black text-xs font-mono bg-white hover:bg-neutral-50/50 focus:bg-white transition-all rounded-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase tracking-widest font-mono text-neutral-500 block mb-2 font-bold">
                      Your Detailed Memo <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      placeholder="How may our ateliers accommodate your precise horological or tailoring specifications?"
                      className="w-full px-4 py-3 border border-neutral-200 outline-none focus:border-black text-xs font-mono bg-white hover:bg-neutral-50/50 focus:bg-white transition-all rounded-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Submitting state loader indicator */}
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer rounded-none flex items-center justify-center gap-2 border border-black"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] animate-bounce delay-200" />
                        Securing Link...
                      </span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Transmit Encrypted Memo
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
