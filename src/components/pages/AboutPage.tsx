/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Calendar, MapPin, Sparkles, Award } from 'lucide-react';

interface AboutPageProps {
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout' | 'about' | 'contact') => void;
}

export default function AboutPage({ setView }: AboutPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-white min-h-screen py-16 md:py-24 px-6 md:px-12 selection:bg-[#C9A96E] selection:text-black font-sans"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb / Top Indicator */}
        <div className="border-b border-neutral-100 pb-6 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#C9A96E] uppercase font-bold">The Orris Story</span>
            <h1 className="text-3xl md:text-5xl font-serif font-light tracking-tight text-neutral-900 mt-2">OUR MANIFESTO</h1>
          </div>
          <button 
            onClick={() => setView('shop')}
            className="text-[10px] uppercase tracking-[0.2em] font-medium border-b border-black pb-1 hover:text-[#C9A96E] hover:border-[#C9A96E] transition-all"
          >
            Explore Masterworks &rarr;
          </button>
        </div>

        {/* Desktop Split-Screen Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch font-light">
          
          {/* Left Column - Large Typography (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-100 pb-12 lg:pb-0 lg:pr-12">
            <div>
              <span className="text-xs font-mono text-neutral-405 uppercase tracking-widest block mb-4">Established 2026 / Geneva & Paris</span>
              <p className="text-xl md:text-2xl leading-relaxed text-black font-serif italic font-light mb-8">
                "Creating functional sanctuaries of sensory absolute, challenging the mass-market paradigm of transient obsolescence."
              </p>
              <div className="space-y-6 text-neutral-600 text-sm md:text-base leading-relaxed">
                <p>
                  At ORRIS, we believe luxury is not a reflection of currency, but an uncompromised commitment to structural honesty. Our direct-to-atelier control bypasses high-street markup tiers to ensure artisans retain their dignity and you retrieve pure materiality.
                </p>
                <p>
                  Every collection is produced in highly restricted numbers, allowing our watchmaking directors, Master Grasse perfumers, and legacy textile weavers to inspect and sign off on every thread, crown, and essence.
                </p>
              </div>
            </div>

            {/* Custom high-contrast brand signature */}
            <div className="mt-12 p-6 bg-neutral-50 border border-neutral-100">
              <span className="text-[10px] font-mono tracking-widest text-[#0b0b0b] font-bold block uppercase mb-1">Architectural Integrity Guarantee</span>
              <span className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                Each casing is milled from grade-5 titanium or marine brass; every perfume is aged for 90 days inside copper-shielded glass vats to prevent spectral oxidation.
              </span>
            </div>
          </div>

          {/* Right Column - Deep Philosophy & Bento Details (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Split layout highlighting the three core columns of design */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E] font-bold mb-6">POLICIES OF LUXURY SENSORY</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-neutral-100 hover:border-black transition-colors duration-400">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-3">01 / APPAREL ATELIER</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Source Pure Weaves</h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Rejecting polyester blends. We source exclusively pure Italian counts: long-staple linen, high-twist merino, and Japanese selvedge.
                  </p>
                </div>

                <div className="p-5 border border-neutral-100 hover:border-black transition-colors duration-400">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-3">02 / HOROLOGY VAULT</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Chronometric Zero</h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Swiss horizontal mechanical alignments. Every escapement is monitored across 5 vertical axes to maintain an accuracy of -2/+4 seconds daily.
                  </p>
                </div>

                <div className="p-5 border border-neutral-100 hover:border-black transition-colors duration-400">
                  <span className="text-[10px] font-mono text-neutral-400 block mb-3">03 / PERFUMERY CODES</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Olfactory Absolutes</h3>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Over 25% premium raw concentration counts. Featuring real Iris Pallida butter, block-graded sandalwood, and absolute Bulgarian rosewater.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom horizontal statement with gorgeous illustration text */}
            <div className="bg-neutral-900 text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 text-[180px] font-serif select-none pointer-events-none">
                Ω
              </div>
              
              <div className="max-w-md z-10">
                <span className="text-[9px] font-mono tracking-widest text-[#C9A96E] uppercase font-bold block mb-2">Our Stances on Waste</span>
                <h4 className="text-xl md:text-2xl font-serif text-[#C9A96E] font-light uppercase tracking-tight mb-4">NO TRANSIENT SEASONS</h4>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Orris does not coordinate quarterly collections. We launch singular editions that sit perpetually active until physical stock constraints occur. Buy fewer items, cherish their lifetime design.
                </p>
              </div>

              <div className="mt-8 border-t border-neutral-850 pt-4 flex gap-6 text-[10px] font-mono text-[#C9A96E]/80 uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-400" />
                  <span>Certified Origin</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-neutral-400" />
                  <span>Atelier Inspected</span>
                </div>
              </div>
            </div>

            {/* Address points showcasing desktop split-grid precision */}
            <div className="border-t border-neutral-100 pt-8 mt-4">
              <span className="text-[10px] font-mono tracking-[0.2em] text-neutral-400 uppercase font-bold block mb-4">Physical Registries</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#525252]">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-black">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Bespoke Counter Paris</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-5 font-sans">
                    24 Rue du Faubourg Saint-Honoré<br />
                    75008 Paris, France<br />
                    <span className="text-neutral-400 font-mono text-[10px]">curator@orris.com</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-black">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span className="text-xs uppercase font-bold tracking-wider font-mono">Switzerland Assembly</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-5 font-sans">
                    Rue de l'Atelier 45, Geneva<br />
                    CH-1201 Geneva, Switzerland<br />
                    <span className="text-neutral-400 font-mono text-[10px]">+41 (0) 44 227 78 99</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </motion.div>
  );
}
