import React from 'react';
import { X } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'shipping' | 'returns' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
}

export default function PolicyModal({ type, onClose }: PolicyModalProps) {
  React.useEffect(() => {
    if (type) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [type]);

  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          sub: 'Updated June 22, 2026',
          sections: [
            {
              heading: '1. Information We Collect',
              text: 'We collect information you provide directly to us when creating an account, authenticating through modern web portals, updating your customer ledger, or conducting an acquisition. This includes your name, email address, transaction information, and billing details.',
            },
            {
              heading: '2. How We Use Your Data',
              text: 'Your registration email is used solely for secure catalog reservation, ledger authorization, order fulfillment, and critical system communications. We do not engage in mailing list resale. Data processing and storage is governed entirely by standard cloud storage services.',
            },
            {
              heading: '3. Security & Secure Storage',
              text: 'We incorporate robust security protocols to guard your personal credentials. Authentication processes is integrated directly with secure, industry-standard Auth systems. No raw payment credentials or credit card numbers are ever stored on our servers; they are processed securely through certified payment bridges.',
            },
            {
              heading: '4. Cookie Notice & Tracking',
              text: 'Cookies are utilized to persist client login sessions and local cart inventories to ensure checkout continuity. You can manage or block cookies via your browser preferences, though certain interactive client services may require active session tracking.',
            },
          ],
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          sub: 'Updated June 22, 2026',
          sections: [
            {
              heading: '1. Acquisition & Contract',
              text: 'By submitting an order through ORRIS ATELIER, you request to register a premium acquisition contract. Order verification is completed upon full clearance check. Prices and shipping timelines are presented pre-acquisition and checked at order checkout.',
            },
            {
              heading: '2. Authenticity & Portfolios',
              text: 'We warrant that all precision horology, fine apparel, and private reserve fragrances in our collection are authenticated at point of origin. All pieces correspond to detailed specifications shown, sourced directly from Italian ateliers and horological facilities.',
            },
            {
              heading: '3. Intellectual Property',
              text: 'All visual resources, custom brand materials, digital catalog compositions, and technical specifications are protected under trademark and intellectual database laws. High-resolution presentation reproductions may not be used without written authorization.',
            },
            {
              heading: '4. Limitation of Liability',
              text: 'ORRIS ATELIER behaves strictly as premium provider of curated products. Under no circumstances shall our liabilities exceed the original acquisition cost of the specific order unit in question.',
            },
          ],
        };
      case 'shipping':
        return {
          title: 'Shipping & Delivery',
          sub: 'Domestic & Global Freight Guidelines',
          sections: [
            {
              heading: '1. Expedited Curated Logistics',
              text: 'All orders are processed with top-tier security checks within 24–48 hours of acquisition. We coordinate with elite courier routes to offer temperature-stable and shock-proof distribution options for sensitive watch mechanisms and botanical perfume extracts.',
            },
            {
              heading: '2. Customs & International Clearances',
              text: 'Global shipments may be subject to local tariffs and clearance reviews. ORRIS ATELIER automatically prepares complete customs declarations. Import tariffs are computed dynamically or settled upon localized arrival depending on global jurisdiction.',
            },
            {
              heading: '3. Transit Tracking & Escrow',
              text: 'Upon courier dispatch, a secure tracking dispatch ID is issued to your client account ledger. High-value horology or delicate botanical collections are fully insured during transit, requiring an authorized signature on physical handover.',
            },
          ],
        };
      case 'returns':
        return {
          title: 'Returns & Exchanges',
          sub: 'Complimentary Returns & Curated Re-shelving',
          sections: [
            {
              heading: '1. Grace Period & Criteria',
              text: 'We accommodate pristine returns requested within 14 days of visual hand-delivery. Items must be returned in their original design boxes, complete with protective custom seals unbroken and accompanying certificates of horological authenticity intact.',
            },
            {
              heading: '2. Non-Refundable Classifications',
              text: 'Due to custom sanitary requirements and raw ingredient integrity, opened luxury skincare foundations and custom-infused private fragrances cannot be returned once their wax security seals have been compromised.',
            },
            {
              heading: '3. Processing Ledger Updates',
              text: 'Approved returns are processed back to the original funding account within 5–7 bank settlement days. Returns qualify for complimentary priority return postage, arranged via our Inquire & Contact desk.',
            },
          ],
        };
      default:
        return { title: '', sub: '', sections: [] };
    }
  };

  const content = getContent();

  return (
    <div 
      className="fixed inset-0 bg-neutral-900/65 backdrop-blur-md z-[110000] flex items-center justify-center p-4 selection:bg-[#C9A96E] selection:text-black"
      onClick={onClose}
    >
      <div 
        className="bg-white border text-neutral-950 border-neutral-100 rounded-none shadow-2xl relative max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="policy-modal-container"
      >
        {/* Header section with closing tool */}
        <div className="flex justify-between items-center border-b border-neutral-100 px-6 py-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold font-mono uppercase tracking-[0.25em] text-[#C9A96E]">ORRIS ATELIER</span>
            <h3 className="text-xl font-serif text-neutral-900 font-light mt-0.5">{content.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-black transition-colors rounded-none outline-none cursor-pointer"
            aria-label="Close dialog"
            id="policy-modal-close-icon"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Dynamic content rendering */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
          <p className="text-xs text-neutral-500 font-mono italic tracking-wide pb-2 border-b border-dashed border-neutral-100">
            {content.sub} — Official Documentation
          </p>

          <div className="space-y-6">
            {content.sections.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-bold font-mono text-neutral-900 uppercase tracking-widest">
                  {sec.heading}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-light font-sans">
                  {sec.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-neutral-100 text-center">
            <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
              Securely Ledgered at ORRIS ATELIER
            </p>
          </div>
        </div>

        {/* Prompt Close action at bottom */}
        <div className="px-6 py-4 bg-neutral-50/70 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-[#C9A96E] hover:text-black text-[#C9A96E] text-[10px] uppercase tracking-widest font-mono font-bold transition-all duration-300 rounded-none cursor-pointer"
            id="policy-modal-dismiss-btn"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
