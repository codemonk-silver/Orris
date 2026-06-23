/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Hammer, Truck, CheckCircle2, ShieldCheck, Box } from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackerProps {
  order: Order;
  onSimulateStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

const STEPS: { key: OrderStatus; label: string; desc: string; icon: React.ComponentType<any> }[] = [
  { key: 'PENDING', label: 'Pending', desc: 'Awaiting Atelier approval', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', desc: 'Crafting & premium assembly', icon: Hammer },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Dispatched via Express Courier', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Secured at client residence', icon: CheckCircle2 }
];

export default function OrderTracker({ order, onSimulateStatusChange }: OrderTrackerProps) {
  const currentStatus = order.status;

  const getStatusIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 0;
      case 'PROCESSING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);
  const progressPercent = (currentIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 rounded-none selection:bg-[#C9A96E] selection:text-black font-sans">
      
      {/* Header and overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E5E5] pb-5 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A96E] font-bold block mb-1">
            Real-Time Courier Dispatch Status
          </span>
          <h4 className="text-sm font-black text-neutral-900 font-mono">
            TRACKING LOT ID: <span className="text-[#C9A96E]">{order.id}</span>
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSimulateStatusChange && (
            <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1.5 border border-[#E5E5E5]">
              <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase tracking-wider">Simulate Status:</span>
              <div className="flex gap-1">
                {STEPS.map((step) => (
                  <button
                    key={step.key}
                    onClick={() => onSimulateStatusChange(order.id, step.key)}
                    className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase transition-all border cursor-pointer ${
                      currentStatus === step.key
                        ? 'bg-black text-white border-black'
                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border-[#E5E5E5]'
                    }`}
                    title={`Change state to ${step.label}`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar Component */}
      <div className="relative py-6 px-2 mb-8 select-none">
        {/* Track Line Background */}
        <div className="absolute top-1/2 left-3 right-3 h-[2px] bg-neutral-100 -translate-y-1/2 z-0" />
        
        {/* Track Line Progress Fill */}
        <div 
          className="absolute top-1/2 left-3 h-[2px] bg-[#C9A96E] -translate-y-1/2 z-0 transition-all duration-700 ease-out"
          style={{ width: `calc(${progressPercent}% - 6px)` }}
        />

        {/* Multi-step Visual Nodes */}
        <div className="flex justify-between items-center relative z-10">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center group relative">
                {/* Visual Circle Indicator */}
                <div 
                  className={`w-10 h-10 border transition-all duration-500 flex items-center justify-center rounded-none relative bg-white ${
                    isCompleted 
                      ? 'border-[#C9A96E] text-[#C9A96E]' 
                      : isActive 
                        ? 'border-black text-black ring-4 ring-[#C9A96E]/20 font-black' 
                        : 'border-[#E5E5E5] text-neutral-350'
                  }`}
                >
                  <StepIcon className={`w-4 h-4 ${isActive ? 'scale-110' : ''}`} />
                  
                  {/* Subtle completed small badge checkmark */}
                  {isCompleted && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A96E] text-white flex items-center justify-center border border-white text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </div>

                {/* Vertical Label descriptor */}
                <div className="text-center mt-3 max-w-[100px] absolute top-10 flex flex-col items-center">
                  <span className={`text-[10px] uppercase tracking-wider font-bold block whitespace-nowrap mt-1 ${
                    isActive ? 'text-black font-black' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Spacing spacer to compensate for the absolute layout labels */}
        <div className="h-10 sm:h-8" />
      </div>

      {/* Description block for currently active stage */}
      <div className="bg-neutral-50 p-4 border border-[#E5E5E5] mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white border border-[#E5E5E5] mt-0.5">
            <Box className="w-5 h-5 text-neutral-800" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-widest font-mono text-neutral-400 font-bold block mb-0.5">Atelier Stage Notes</span>
            <p className="text-xs text-neutral-900 font-bold">
              {STEPS[currentIndex].desc}
            </p>
            <p className="text-[10px] text-[#737373] mt-1">
              {currentStatus === 'DELIVERED' 
                ? 'Your shipment has been securely delivered to your registered delivery address.'
                : currentStatus === 'SHIPPED'
                  ? 'Your shipment is in transit via premium express courier, fully insured and tracked.'
                  : currentStatus === 'PROCESSING'
                    ? 'Our master craftsmen are preparing and hand-packaging your bespoke selections.'
                    : 'Awaiting order verification and payment authorization.'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px] text-[#737373] font-bold uppercase shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
          <span>Atelier Secure Link</span>
        </div>
      </div>
    </div>
  );
}
