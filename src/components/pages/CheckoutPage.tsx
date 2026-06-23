/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard, ShieldCheck, Mail, User, MapPin, Globe, CheckCircle2, ShoppingBag, ArrowLeft, Printer, Loader2, Ticket, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, Order } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface CheckoutPageProps {
  cartItems: CartItem[];
  userEmail: string;
  userName: string;
  onClearCart: () => void;
  onAddOrder: (newOrder: Order) => void;
  setView: (view: 'home' | 'shop' | 'admin' | 'export' | 'profile' | 'checkout') => void;
}

export default function CheckoutPage({
  cartItems,
  userEmail,
  userName,
  onClearCart,
  onAddOrder,
  setView
}: CheckoutPageProps) {
  const { 
    settings, 
    promoCode, 
    discountPercent, 
    promoSuccess, 
    promoError, 
    setPromoDiscount,
    formatPrice
  } = useAppStore();
  
  const cSym = settings?.currencySymbol || '$';
  
  // Payment method selection ('stripe' | 'paystack')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paystack'>('stripe');

  // Client forms
  const [email, setEmail] = useState(userEmail || '');
  const [name, setName] = useState(userName || '');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');

  // Credit Card mock elements
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Payment states
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // Stripe & Paystack & Webhook query routing states
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const successParam = queryParams.get('success');
  const cancelParam = queryParams.get('cancel');
  const simulatedParam = queryParams.get('simulated');
  const simulatedPaystackParam = queryParams.get('simulated_paystack');
  const paystackVerifiedParam = queryParams.get('paystack_verified');
  const referenceParam = queryParams.get('reference');
  const orderIdParam = queryParams.get('order_id');

  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [simulatedOrder, setSimulatedOrder] = useState<Order | null>(null);
  const [isSimulatingAuth, setIsSimulatingAuth] = useState(false);
  const [simulationErrorMessage, setSimulationErrorMessage] = useState('');

  // Handle URL redirect query checkbacks
  useEffect(() => {
    if (cancelParam === 'true') {
      setCheckoutError('Payment transaction was cancelled. You may adjust items in your boutique cart or re-attempt payment lock confirmation.');
    }
  }, [cancelParam]);

  useEffect(() => {
    if (orderIdParam) {
      if (paystackVerifiedParam === 'true') {
        setIsLoadingOrder(true);
        fetch('/api/paystack/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: referenceParam, orderId: orderIdParam })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.order) {
              setCompletedOrder(data.order);
              onClearCart();
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#0F0F0F', '#C4A465', '#FAFAFA']
              });
            } else {
              setCheckoutError(data.error || 'Failed to authenticate Paystack payment transaction.');
            }
          })
          .catch(err => {
            console.error(err);
            setCheckoutError('Paystack verification handshake offline.');
          })
          .finally(() => {
            setIsLoadingOrder(false);
          });
      } else {
        setIsLoadingOrder(true);
        fetch('/api/orders')
          .then(res => res.json())
          .then((orders: Order[]) => {
            const found = orders.find(o => o.id === orderIdParam);
            if (found) {
              if (successParam === 'true') {
                setCompletedOrder(found);
                onClearCart();
                // Fire victory confetti elements!
                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ['#0F0F0F', '#C4A465', '#FAFAFA']
                });
              } else if (simulatedParam === 'true') {
                setSimulatedOrder(found);
              } else if (simulatedPaystackParam === 'true') {
                setSimulatedOrder(found);
              }
            } else {
              setCheckoutError('Specified pending draft order could not be loaded.');
            }
          })
          .catch(err => {
            console.error(err);
            setCheckoutError('Failed to synchronize server orders log database.');
          })
          .finally(() => {
            setIsLoadingOrder(false);
          });
      }
    }
  }, [successParam, simulatedParam, simulatedPaystackParam, paystackVerifiedParam, referenceParam, orderIdParam]);

  const handleSimulatedPaymentSubmit = async () => {
    if (!orderIdParam) return;
    setIsSimulatingAuth(true);
    setSimulationErrorMessage('');
    try {
      const res = await fetch('/api/stripe/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderIdParam })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The system simulation broker experienced an issue.');
      }
      
      if (data.order) {
        onAddOrder(data.order);
      }
      
      // Navigate to success receipt visualization
      window.location.search = `?success=true&order_id=${orderIdParam}`;
    } catch (err: any) {
      console.error(err);
      setSimulationErrorMessage(err.message || 'Payment simulation handshake failed.');
    } finally {
      setIsSimulatingAuth(false);
    }
  };

  const handleSimulatedPaystackSubmit = async () => {
    if (!orderIdParam) return;
    setIsSimulatingAuth(true);
    setSimulationErrorMessage('');
    try {
      const res = await fetch('/api/paystack/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderIdParam })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'The Paystack simulation broker experienced an issue.');
      }
      
      if (data.order) {
        onAddOrder(data.order);
      }
      
      // Navigate to success receipt visualization
      window.location.search = `?success=true&order_id=${orderIdParam}`;
    } catch (err: any) {
      console.error(err);
      setSimulationErrorMessage(err.message || 'Paystack simulation handshake failed.');
    } finally {
      setIsSimulatingAuth(false);
    }
  };

  const FREE_SHIPPING_LIMIT = settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 150;

  // Checkout-exclusive promo form state
  const [checkoutPromoCode, setCheckoutPromoCode] = useState(promoCode || '');
  const [checkoutPromoSuccess, setCheckoutPromoSuccess] = useState(promoSuccess || '');
  const [checkoutPromoError, setCheckoutPromoError] = useState(promoError || '');

  useEffect(() => {
    setCheckoutPromoCode(promoCode);
    setCheckoutPromoSuccess(promoSuccess);
    setCheckoutPromoError(promoError);
  }, [promoCode, promoSuccess, promoError]);

  // Totals calculations
  const grossSubtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    return Number((grossSubtotal * (discountPercent / 100)).toFixed(2));
  }, [grossSubtotal, discountPercent]);

  const finalSubtotal = useMemo(() => {
    return Math.max(0, grossSubtotal - discountAmount);
  }, [grossSubtotal, discountAmount]);

  const shippingCost = useMemo(() => {
    if (finalSubtotal === 0) return 0;
    return finalSubtotal >= FREE_SHIPPING_LIMIT ? 0 : 25;
  }, [finalSubtotal, FREE_SHIPPING_LIMIT]);

  const finalTotal = useMemo(() => {
    return finalSubtotal + shippingCost;
  }, [finalSubtotal, shippingCost]);

  // Credit Card Type Auto Detection
  const cardBrand = useMemo(() => {
    const cleanNum = cardNumber.replace(/\s/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleanNum)) return 'Mastercard';
    if (/^(34|37)/.test(cleanNum)) return 'American Express';
    if (/^6/.test(cleanNum)) return 'Discover';
    return null;
  }, [cardNumber]);

  // Dynamic Shipment Duration Window
  const calculatedDeliveryRange = useMemo(() => {
    const today = new Date();
    const minDelivery = new Date();
    minDelivery.setDate(today.getDate() + 3);
    const maxDelivery = new Date();
    maxDelivery.setDate(today.getDate() + 5);
    
    return `${minDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${maxDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }, []);

  // Strip non-numerical inputs for card fields
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2, 4)}` : raw;
    setCardExpiry(formatted.substring(0, 5));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCardCvv(raw.substring(0, 4));
  };

  // Submit & execute checkout transaction
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setPaymentProcessing(true);
    setCheckoutError('');

    try {
      const endpoint = paymentMethod === 'stripe'
        ? '/api/stripe/create-checkout-session'
        : '/api/paystack/create-payment-session';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          shippingAddress: {
            line1: addressLine,
            city,
            state,
            postalCode: zip,
            country
          },
          items: cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.selectedSize || undefined,
            color: item.selectedColor || undefined
          })),
          discountPercent,
          promoCode,
          shippingCost,
          grossSubtotal,
          discountAmount,
          finalTotal
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'The session broker experienced an authorization preflight issue.');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setCheckoutError(err.message || 'Payment pre-flight authentication failed. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. Loading and validation gate screen
  if (isLoadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 font-mono select-none">
        <Loader2 className="w-10 h-10 animate-spin text-[#C9A96E]" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Verifying secure database archives...</span>
      </div>
    );
  }

  // 2. Stripe Simulation Overlay Panel
  if (simulatedParam === 'true' && simulatedOrder) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 select-none selection:bg-[#C9A96E]">
        <div className="grid lg:grid-cols-12 gap-8 bg-white border border-neutral-100 rounded-lg shadow-2xl overflow-hidden min-h-[450px]">
          {/* Left panel: Invoice Review */}
          <div className="lg:col-span-5 bg-neutral-900 text-neutral-200 p-8 flex flex-col justify-between border-r border-[#C9A96E]/10">
            <div>
              <div className="mb-8 pb-4 border-b border-neutral-800">
                <span className="font-serif text-lg tracking-widest text-white uppercase block">ORRIS ATELIER</span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#C9A96E]">Payment Interface</span>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-medium font-mono text-neutral-400">Bespoke Select Packaging</div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                  {simulatedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{it.productName}</span>
                        <span className="text-[9px] text-[#C9A96E] font-mono uppercase">{it.quantity}x {it.size ? `Size: ${it.size}` : ''}</span>
                      </div>
                      <span className="font-semibold font-mono text-neutral-300">${it.productPrice * it.quantity}.00</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800 font-mono text-xs">
              <div className="flex justify-between text-neutral-400 mb-2">
                <span>Shipping Priority</span>
                <span>Free Express Delivery</span>
              </div>
              <div className="flex justify-between text-neutral-400 mb-4">
                <span>Pending Invoice ID</span>
                <span className="text-[10px] text-[#C9A96E]">{simulatedOrder.id}</span>
              </div>
              <div className="flex justify-between text-white text-base font-bold font-serif pt-2 border-t border-dashed border-neutral-800">
                <span>Total Assessment</span>
                <span className="text-[#C9A96E]">${simulatedOrder.total}.00</span>
              </div>
            </div>
          </div>

          {/* Right panel: Secure Simulation portal */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-5 mb-6">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#0F0F0F] font-mono">Stripe Checkout Simulator</h3>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-450 block font-mono">Dynamic Webhook Verification Mode</span>
                </div>
              </div>

              <div className="mt-2 bg-amber-500/5 border border-[#C9A96E]/20 p-4 rounded-lg text-xs leading-relaxed text-neutral-700">
                <p className="font-medium text-[#C9A96E] mb-1 font-mono uppercase text-[10px] tracking-wide">Developer Environment Active</p>
                This workspace is running Stripe Checkout on a secure mock simulation layer because direct API credentials are pending setup. Authorized submissions will securely fire live backend webhook receivers to calibrate transaction status in your Cloud Firestore.
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSimulatedPaymentSubmit(); }} className="mt-6 space-y-4">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1.5 font-bold font-mono">Simulated Cardholder</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={simulatedOrder.customerName}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none text-neutral-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-neutral-450 block mb-1.5 font-bold font-mono">Simulated Card Number</label>
                    <input 
                      type="text" 
                      readOnly 
                      value="4242 •••• •••• 4242"
                      className="w-full px-3.5 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded text-center text-neutral-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-widest text-neutral-455 block mb-1.5 font-bold font-mono">Expiry & CVV</label>
                    <input 
                      type="text" 
                      readOnly 
                      value="12/28 | 424"
                      className="w-full px-3.5 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded text-center text-neutral-600 outline-none"
                    />
                  </div>
                </div>

                {simulationErrorMessage && (
                  <p className="text-xs text-red-600 font-mono bg-red-50 p-3 border border-red-100 rounded leading-relaxed">{simulationErrorMessage}</p>
                )}
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-150 flex flex-col sm:flex-row gap-4 items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  window.location.search = `?cancel=true&order_id=${orderIdParam}`;
                }}
                disabled={isSimulatingAuth}
                className="w-full sm:w-auto px-6 py-2.5 border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 text-[10px] uppercase tracking-widest font-mono font-bold rounded transition-colors disabled:opacity-50"
              >
                Inactivate Draft
              </button>
              <button
                type="button"
                onClick={handleSimulatedPaymentSubmit}
                disabled={isSimulatingAuth}
                className="w-full sm:w-auto px-8 py-2.5 bg-black hover:bg-[#C9A96E] text-[#C9A96E] hover:text-black font-bold text-[10px] uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2 font-mono disabled:opacity-75"
              >
                {isSimulatingAuth ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <span>Authorize & Settle (${simulatedOrder.total}.00)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2.2 Paystack Simulation Overlay Panel
  if (simulatedPaystackParam === 'true' && simulatedOrder) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 select-none selection:bg-[#3AC5A0]">
        <div className="grid lg:grid-cols-12 gap-8 bg-white border border-neutral-100 rounded-lg shadow-2xl overflow-hidden min-h-[450px]">
          {/* Left panel: Invoice Review */}
          <div className="lg:col-span-5 bg-neutral-950 text-neutral-200 p-8 flex flex-col justify-between border-r border-[#3AC5A0]/10">
            <div>
              <div className="mb-8 pb-4 border-b border-neutral-800">
                <span className="font-serif text-lg tracking-widest text-white uppercase block">ORRIS ATELIER</span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#3AC5A0] font-bold">Paystack Gate</span>
              </div>

              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest font-medium font-mono text-neutral-400">Bespoke Select Packaging</div>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin">
                  {simulatedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{it.productName}</span>
                        <span className="text-[9px] text-[#3AC5A0] font-mono uppercase">{it.quantity}x {it.size ? `Size: ${it.size}` : ''}</span>
                      </div>
                      <span className="font-semibold font-mono text-neutral-300">${it.productPrice * it.quantity}.00</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800 font-mono text-xs">
              <div className="flex justify-between text-neutral-400 mb-2">
                <span>Shipping Priority</span>
                <span>Free Express Delivery</span>
              </div>
              <div className="flex justify-between text-neutral-400 mb-4">
                <span>Pending Invoice ID</span>
                <span className="text-[10px] text-[#3AC5A0] font-bold">{simulatedOrder.id}</span>
              </div>
              <div className="flex justify-between text-white text-base font-bold font-serif pt-2 border-t border-dashed border-neutral-800">
                <span>Total Assessment</span>
                <span className="text-[#3AC5A0]">${simulatedOrder.total}.00</span>
              </div>
            </div>
          </div>

          {/* Right panel: Secure Paystack Portal */}
          <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-neutral-100 pb-5 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-[#3AC5A0] animate-pulse" />
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-widest text-[#0F0F0F] font-mono flex items-center gap-1.5">
                    <span>Paystack Secure Terminal</span>
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-450 block font-mono">Dynamic Callback Handshake</span>
                </div>
              </div>

              <div className="mt-2 bg-[#3AC5A0]/5 border border-[#3AC5A0]/20 p-4 rounded-lg text-xs leading-relaxed text-neutral-700">
                <p className="font-semibold text-[#11C281] mb-1 font-mono uppercase text-[10px] tracking-wide">Paystack Developer Sandpit Active</p>
                This workspace is running Paystack payment on a secure local simulation layer because direct API credentials are pending setup. Authorized submissions will securely execute backend verification callbacks to settle your Cloud Firestore order.
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSimulatedPaystackSubmit(); }} className="mt-6 space-y-4">
                <div>
                  <label className="text-[9px] uppercase tracking-widest text-neutral-400 block mb-1.5 font-bold font-mono">Simulated Depositor</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={simulatedOrder.customerName}
                    className="w-full px-3.5 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded outline-none text-neutral-600"
                  />
                </div>

                <div className="bg-neutral-50 p-4 border border-neutral-150 rounded flex flex-col gap-2">
                  <span className="text-[8px] font-mono uppercase font-bold text-neutral-400">Available Simulation Channels</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-[#3AC5A0] bg-[#3AC5A0]/5 text-[#11C281] p-3 text-center rounded font-mono text-[10px] font-bold cursor-pointer transition-all">
                      💳 Pay with Card
                    </div>
                    <div className="border border-neutral-200 bg-white hover:border-[#3AC5A0] text-neutral-600 hover:text-black p-3 text-center rounded font-mono text-[10px] cursor-pointer transition-all">
                      🏛️ Pay with Bank
                    </div>
                  </div>
                </div>

                {simulationErrorMessage && (
                  <p className="text-xs text-red-650 font-mono bg-red-50 p-3 border border-red-100 rounded leading-relaxed">{simulationErrorMessage}</p>
                )}
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-150 flex flex-col sm:flex-row gap-4 items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  window.location.search = `?cancel=true&order_id=${orderIdParam}`;
                }}
                disabled={isSimulatingAuth}
                className="w-full sm:w-auto px-6 py-2.5 border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 text-[10px] uppercase tracking-widest font-mono font-bold rounded transition-colors disabled:opacity-50"
              >
                Inactivate Draft
              </button>
              <button
                type="button"
                onClick={handleSimulatedPaystackSubmit}
                disabled={isSimulatingAuth}
                className="w-full sm:w-auto px-8 py-2.5 bg-neutral-900 hover:bg-[#3AC5A0] text-[#3AC5A0] hover:text-neutral-950 font-bold text-[10px] uppercase tracking-widest rounded transition-all duration-300 flex items-center justify-center gap-2 font-mono disabled:opacity-75"
              >
                {isSimulatingAuth ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying reference...</span>
                  </>
                ) : (
                  <span>Settle via Paystack (${simulatedOrder.total}.00)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS LAYOUT CANVAS
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center select-none selection:bg-[#C9A96E] selection:text-black">
        <div className="bg-white p-8 md:p-12 border border-neutral-100 rounded-lg shadow-xl relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-24 h-24 bg-[#C9A96E]/5 rounded-full blur-xl" />
          <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#C9A96E]/5 rounded-full blur-xl" />

          <div className="relative z-10 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mb-6 animate-bounce" />
            <span className="text-[10px] tracking-widest text-[#C9A96E] uppercase font-bold px-3 py-1 bg-amber-500/5 rounded-full">
              Acquisition Concluded
            </span>
            <h1 className="text-3xl font-light tracking-tight mt-4 font-serif text-[#0F0F0F]">
              Your Receipt of Sovereignty
            </h1>
            <p className="text-xs text-neutral-400 font-mono uppercase mt-2">
              Payment Code ID: {completedOrder.id}
            </p>

            <div className="w-full border-t border-dashed border-neutral-200 my-8" />

            {/* Receipt Summary table */}
            <div className="w-full text-left bg-neutral-50 p-5 rounded border border-neutral-100 font-mono text-[11px] text-neutral-600">
              <span className="text-[9px] uppercase tracking-widest text-neutral-450 block mb-3 font-bold">Delivery Consignee</span>
              <p className="text-neutral-900 font-sans font-semibold text-xs mb-1">{completedOrder.customerName}</p>
              <p className="leading-relaxed mb-4">{completedOrder.shippingAddress.line1}, {completedOrder.shippingAddress.city}, {completedOrder.shippingAddress.state} {completedOrder.shippingAddress.postalCode}</p>

              <div className="border-t border-neutral-150 pt-3">
                <span className="text-[9px] uppercase tracking-widest text-neutral-450 block mb-2 font-bold">Assembled Lots</span>
                <div className="flex flex-col gap-2">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-neutral-800">
                      <span>{it.quantity}x {it.productName} ({it.size || 'Default'})</span>
                      <span className="font-serif">${it.productPrice * it.quantity}.00</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-150 mt-4 pt-3 text-neutral-800 flex justify-between font-bold">
                <span>Aggregate Total Settlement</span>
                <span className="text-sm font-serif text-black">${completedOrder.total}.00</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 font-light mt-8 max-w-md leading-relaxed">
              We have queued your premium parcel in the Orris atelier registry. A digital shipping waybill will be dispatched to <span className="text-[#0F0F0F] font-mono font-medium">{completedOrder.customerEmail}</span> shortly.
            </p>

            {/* Success Actions button controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full justify-center">
              <button 
                onClick={handlePrint}
                className="px-6 py-3 border border-neutral-200 text-neutral-800 hover:bg-neutral-50 text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded transition-all active:scale-95"
                id="success-print-receipt-btn"
              >
                <Printer className="w-4 h-4 text-[#C9A96E]" />
                <span>Archive Copy</span>
              </button>
              <button 
                onClick={() => setView('shop')}
                className="px-8 py-3 bg-black text-[#C9A96E] hover:bg-[#C9A96E] hover:text-black text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 rounded transition-all duration-300"
                id="success-continue-shopping-btn"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Boutique</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD FORM CHECKOUT LAYOUT
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 selection:bg-[#C9A96E] selection:text-black">
      <button 
        onClick={() => setView('shop')}
        className="text-xs uppercase tracking-widest text-neutral-400 hover:text-black flex items-center gap-1.5 mb-8"
        id="checkout-back-shop-btn"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog Collections</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Hand: Secure form checkout validation */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 bg-white p-6 md:p-8 border border-neutral-100/50 rounded-lg shadow-xl">
          <div className="flex items-center gap-2 pb-5 border-b border-neutral-100 mb-6">
            <ShieldCheck className="w-5 h-5 text-[#C9A96E]" />
            <h2 className="text-lg uppercase tracking-wider font-semibold">Vault Security Checkout Link</h2>
          </div>

          {/* Secure Payment System Selector */}
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe')}
              className={`flex-1 py-3 border font-mono text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 rounded ${
                paymentMethod === 'stripe'
                  ? 'border-neutral-900 bg-neutral-900 text-[#C9A96E]'
                  : 'border-neutral-200 text-neutral-400 hover:text-black hover:border-black'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe Vault</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('paystack')}
              className={`flex-1 py-3 border font-mono text-[10px] uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 rounded ${
                paymentMethod === 'paystack'
                  ? 'border-neutral-900 bg-neutral-900 text-[#3AC5A0]'
                  : 'border-neutral-200 text-neutral-400 hover:text-black hover:border-black'
              }`}
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              <span>Paystack Hub</span>
            </button>
          </div>

          {checkoutError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-150 rounded text-xs text-red-650 font-mono leading-relaxed">
              {checkoutError}
            </div>
          )}

          <div className="flex flex-col gap-6">
            
            {/* Consignee Address */}
            <div>
              <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-900 mb-4 font-mono">1. Consignee Delivery Address</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">Full Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Eleanor Roosevelt"
                      className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 focus:bg-white rounded"
                      id="checkout-name-input"
                    />
                    <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -to-translate-y-100 -translate-y-1/2" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">Private Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. eleanor@consignee.org"
                      className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 focus:bg-white rounded"
                      id="checkout-email-input"
                    />
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">Street Address</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      required
                      placeholder="Apt, suite, lane detail..."
                      className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 focus:bg-white rounded"
                      id="checkout-address-input"
                    />
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">City</label>
                  <input 
                    type="text" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    placeholder="e.g. New York"
                    className="w-full px-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 rounded"
                    id="checkout-city-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">State / Province</label>
                  <input 
                    type="text" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    placeholder="e.g. NY"
                    className="w-full px-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 rounded"
                    id="checkout-state-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                    placeholder="e.g. 10001"
                    className="w-full px-4 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 rounded"
                    id="checkout-zip-input"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-neutral-400 tracking-wider block mb-1">Country</label>
                  <div className="relative">
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full appearance-none pl-9 pr-8 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-neutral-50 rounded"
                      id="checkout-country-select"
                    >
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Italy">Italy</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                    </select>
                    <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'stripe' ? (
              /* Credit Card Payment Information */
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-900 mb-4 font-mono">2. Stripe Elements Shield Secure Vault</h3>
                
                <div className="bg-neutral-50 p-5 rounded-lg border border-neutral-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-zinc-455 uppercase font-mono font-semibold flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-[#C9A96E]" />
                      Encrypted Ledger Fields
                    </span>
                    <div className="flex gap-1.5 text-[9px] font-bold tracking-widest uppercase border border-[#C9A96E]/20 bg-amber-500/5 px-2 py-0.5 rounded text-[#C9A96E] font-mono">
                      <span>{cardBrand ? cardBrand.toUpperCase() : 'STRIPE ELEMENTS'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-1">Card number</label>
                      <input 
                        type="text" 
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        required
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3.5 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded"
                        id="checkout-card-num"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-1">Expiration date</label>
                        <input 
                          type="text" 
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          required
                          placeholder="MM / YY"
                          className="w-full px-3.5 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded text-center"
                          id="checkout-card-expiry"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-1">Security code (CVV)</label>
                        <input 
                          type="password" 
                          value={cardCvv}
                          onChange={handleCvvChange}
                          required
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono bg-white rounded text-center"
                          id="checkout-card-cvv"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-mono text-neutral-400 block mb-1">Cardholder Name</label>
                      <input 
                        type="text" 
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        required
                        placeholder="e.g. ELEANOR ROOSEVELT"
                        className="w-full px-3.5 py-2.5 border border-neutral-200 outline-none focus:border-neutral-400 text-xs font-mono uppercase bg-white rounded"
                        id="checkout-cardholder"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Paystack Payment Information */
              <div className="border-t border-neutral-100 pt-6">
                <h3 className="text-xs uppercase font-bold tracking-widest text-[#092419] mb-4 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3AC5A0] animate-pulse" />
                  <span>2. Paystack Multi-Channel Portal</span>
                </h3>
                
                <div className="bg-[#3AC5A0]/5 p-5 rounded-lg border border-[#3AC5A0]/20 text-neutral-700">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-neutral-550 uppercase font-mono font-semibold flex items-center gap-1.5">
                      🛍️ Verified Integration
                    </span>
                    <div className="text-[9px] font-bold tracking-widest uppercase border border-[#3AC5A0]/20 bg-[#3AC5A0]/10 px-2.5 py-1 rounded text-[#092419] font-mono">
                      Paystack
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-neutral-600 mb-4 font-sans">
                    You will be redirected to the secure official Paystack system to checkout. Paystack fully supports secure local cards, bank transfers, USSD dials, and mobile wallets.
                  </p>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono font-semibold text-neutral-500">
                    <span className="px-2 py-1 bg-white border border-neutral-200 rounded">💳 Cards</span>
                    <span className="px-2 py-1 bg-white border border-neutral-200 rounded">🏛️ Transfer</span>
                    <span className="px-2 py-1 bg-white border border-neutral-200 rounded">📱 USSD</span>
                    <span className="px-2 py-1 bg-white border border-neutral-200 rounded">💰 Mobile Money</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pay action */}
            <button 
              type="submit"
              disabled={paymentProcessing || cartItems.length === 0}
              className={`w-full py-4.5 text-white transition-all duration-300 font-bold text-xs uppercase tracking-widest rounded flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                paymentMethod === 'stripe'
                  ? 'bg-neutral-900 hover:bg-[#C9A96E] hover:text-black text-[#C9A96E]'
                  : 'bg-neutral-900 hover:bg-[#3AC5A0] hover:text-neutral-950 text-[#3AC5A0]'
              }`}
              id="checkout-pay-now-btn"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {paymentMethod === 'stripe'
                      ? 'AUTHORIZING TRANSACTION NETWORKS WITH STRIPE...'
                      : 'INITIALISING ENCRYPTED PAYSTACK HANDSHAKE...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5" />
                  <span>
                    {paymentMethod === 'stripe'
                      ? `SECURELY SETTLE TOTAL FOR ${formatPrice(finalTotal)}`
                      : `PROCEED TO SECURE PAYSTACK FOR ${formatPrice(finalTotal)}`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Hand: Compact Summary panel */}
        <div className="lg:col-span-5 bg-neutral-50 p-6 md:p-8 rounded-lg border border-neutral-100 sticky top-40">
          <h3 className="text-xs uppercase font-bold tracking-widest text-[#0F0F0F] border-b border-neutral-200 pb-3 mb-6 font-mono">
            Lot Summary
          </h3>

          <div className="flex flex-col gap-5 max-h-[350px] overflow-y-auto mb-6 pr-2 scrollbar-thin">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center bg-white p-3 border border-neutral-100 rounded">
                <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-16 object-cover rounded bg-neutral-150" />
                <div className="flex-grow">
                  <h4 className="text-[11px] font-semibold text-neutral-900 line-clamp-1">{item.product.name}</h4>
                  <p className="text-[9px] font-mono text-neutral-400 mt-0.5 uppercase">
                    Sz: {item.selectedSize || 'Standard'} | Tone: {item.selectedColor || 'Standard'}
                  </p>
                  <div className="flex justify-between items-center text-[10px] mt-1.5 font-mono text-neutral-500">
                    <span>Qty: {item.quantity}</span>
                    <span className="font-serif text-neutral-900 font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 pt-4 flex flex-col gap-3 font-mono text-[10px] text-neutral-500">
            <div className="flex justify-between">
              <span>Gross Catalog Value</span>
              <span className="font-serif text-neutral-900">{formatPrice(grossSubtotal)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>VIP Deductions ({discountPercent}% - {promoCode})</span>
                <span className="font-serif font-bold">-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Atelier courier Ground</span>
              <span className="font-serif text-neutral-900">
                {shippingCost === 0 ? 'COMPLIMENTARY' : formatPrice(shippingCost)}
              </span>
            </div>
            
            <div className="border-t border-[#E5E5E5] mt-3 pt-3 flex justify-between text-xs font-bold text-neutral-900 font-serif">
              <span className="text-[10px] font-mono tracking-widest uppercase">Vault Balance</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Interactive Promo code inside Checkout */}
          <div className="mt-6 pt-5 border-t border-neutral-200">
            <span className="text-[9px] uppercase font-mono text-neutral-400 block mb-2 tracking-wider">Coupon Configuration</span>
            <div className="flex gap-2">
              <input 
                type="text"
                value={checkoutPromoCode}
                onChange={(e) => setCheckoutPromoCode(e.target.value)}
                placeholder="ORRIS15 or ATELIERGOLD"
                className="flex-grow px-3 py-2 border border-neutral-200 text-[10px] uppercase font-mono outline-none focus:border-neutral-400 bg-white"
                id="checkout-promo-input"
              />
              <button
                type="button"
                onClick={() => {
                  const cleaned = checkoutPromoCode.trim().toUpperCase();
                  if (cleaned === '') {
                    setPromoDiscount('', 0, '', '');
                  } else if (cleaned === 'ORRIS15') {
                    setPromoDiscount(cleaned, 15, '15% Discount Authorized', '');
                  } else if (cleaned === 'ATELIERGOLD') {
                    setPromoDiscount(cleaned, 30, '30% VIP Sovereign Discount Authorized', '');
                  } else {
                    setPromoDiscount(cleaned, 0, '', 'Invalid VIP Credentials');
                  }
                }}
                className="px-3.5 bg-black text-[#C9A96E] hover:bg-neutral-800 text-[9px] uppercase font-bold tracking-widest"
                id="checkout-promo-apply"
              >
                Apply
              </button>
            </div>
            {checkoutPromoSuccess && (
              <p className="text-[9px] text-emerald-800 font-mono mt-1.5 uppercase font-bold">{checkoutPromoSuccess}</p>
            )}
            {checkoutPromoError && (
              <p className="text-[9px] text-red-650 font-mono mt-1.5 uppercase font-bold">{checkoutPromoError}</p>
            )}
          </div>

          {/* Delivery Window estimation block */}
          <div className="mt-6 p-4 bg-amber-500/5 rounded border border-[#C9A96E]/20 text-xs">
            <div className="flex items-center gap-2 text-[#C9A96E] font-black uppercase tracking-[0.2em] text-[9px] mb-2 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>COMMITTED COURIER DELIVERIES</span>
            </div>
            <p className="text-[10px] text-neutral-600 uppercase font-light leading-relaxed">
              Expected safe courier parcel hand-off at your listed residence on:
            </p>
            <p className="text-[11px] text-neutral-900 font-mono font-bold mt-1 uppercase">
              {calculatedDeliveryRange}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
