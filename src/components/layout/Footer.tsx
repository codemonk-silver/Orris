import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import PolicyModal, { PolicyType } from '../common/PolicyModal';

export default function Footer() {
  const { setCategorySlug, setView } = useAppStore();
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <footer className="bg-white border-t border-neutral-100 py-16 px-6 md:px-12 selection:bg-[#C9A96E] selection:text-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h4 className="text-base font-serif tracking-[0.2em] font-light mb-4 text-neutral-900">ORRIS ATELIER</h4>
          <p className="text-[11px] text-neutral-400 leading-relaxed font-light mb-5 font-sans">
            Independent physical craft direct from European ateliers, precision Swiss horology, and curated reserve fragrances. Curated without high-street retail markups.
          </p>
          <div className="text-[10px] text-neutral-400 font-mono tracking-wider space-y-1">
            <p>Direct: desk@orrisatelier.com</p>
            <p>Hours: Mon–Fri, 09:00 – 18:00 CET</p>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-900 block mb-4">Curated Collections</span>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-500 font-light font-mono">
            <li><button onClick={() => { setCategorySlug(null); setView('shop'); }} className="hover:text-black hover:underline text-left cursor-pointer">All Portfolio Items</button></li>
            <li><button onClick={() => { setCategorySlug('perfumes'); setView('shop'); }} className="hover:text-black hover:underline text-left cursor-pointer">Premium Fragrances</button></li>
            <li><button onClick={() => { setCategorySlug('wristwatches'); setView('shop'); }} className="hover:text-black hover:underline text-left cursor-pointer">Precision Horology</button></li>
            <li><button onClick={() => { setCategorySlug('clothing'); setView('shop'); }} className="hover:text-black hover:underline text-left cursor-pointer">Fine Apparel</button></li>
          </ul>
        </div>

        <div>
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-900 block mb-4">Client Advisory</span>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-500 font-light font-mono">
            <li><button onClick={() => setView('about')} className="hover:text-black hover:underline text-left cursor-pointer">About Our Heritage</button></li>
            <li><button onClick={() => setView('contact')} className="hover:text-black hover:underline text-left cursor-pointer">Inquire & Contact</button></li>
          </ul>
        </div>

        <div>
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-neutral-900 block mb-4">Legal & Disclosures</span>
          <ul className="flex flex-col gap-2.5 text-xs text-neutral-500 font-light font-mono">
            <li>
              <button 
                onClick={() => setActivePolicy('privacy')} 
                className="hover:text-black hover:underline text-left cursor-pointer text-[#C9A96E] font-medium"
                id="footer-disclosure-privacy-btn"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePolicy('terms')} 
                className="hover:text-black hover:underline text-left cursor-pointer text-[#C9A96E] font-medium"
                id="footer-disclosure-terms-btn"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePolicy('shipping')} 
                className="hover:text-black hover:underline text-left cursor-pointer"
                id="footer-disclosure-shipping-btn"
              >
                Shipping & Customs
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActivePolicy('returns')} 
                className="hover:text-black hover:underline text-left cursor-pointer"
                id="footer-disclosure-returns-btn"
              >
                Returns & Support
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-neutral-100 mt-12 pt-6 flex flex-col sm:flex-row justify-between text-[#A3A3A3] text-[10px] uppercase font-mono tracking-widest">
        <span>&copy; {new Date().getFullYear()} ORRIS ATELIER. All rights reserved.</span>
        <div className="flex gap-4 mt-4 sm:mt-0 font-mono text-[9px] text-[#A3A3A3]/80">
          <span>Swiss Registered Office</span>
          <span>•</span>
          <span>Secure checkout processed via Stripe</span>
        </div>
      </div>

      {/* Render the production-grade legal overlays seamlessly */}
      <PolicyModal 
        type={activePolicy} 
        onClose={() => setActivePolicy(null)} 
      />
    </footer>
  );
}
