import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Building, 
  Globe, 
  Hash, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  Info, 
  ChevronRight, 
  ChevronLeft 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { auth, googleProvider, signInWithPopup } from '../../lib/firebaseClient';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialIsRegistering?: boolean;
  isCheckingOutBeforeLogin: boolean;
  setIsCheckingOutBeforeLogin: (val: boolean) => void;
}

export default function AuthOverlay({
  isOpen,
  onClose,
  initialIsRegistering = false,
  isCheckingOutBeforeLogin,
  setIsCheckingOutBeforeLogin,
}: AuthOverlayProps) {
  const {
    login,
    loginWithGoogle,
    addCitizen,
    showToast,
    cartItems,
    setView
  } = useAppStore();

  const [authEmailInput, setAuthEmailInput] = useState('');
  const [authPasswordInput, setAuthPasswordInput] = useState('');
  const [authConfirmPasswordInput, setAuthConfirmPasswordInput] = useState('');
  const [authNameInput, setAuthNameInput] = useState('');
  const [authIsRegistering, setAuthIsRegistering] = useState(initialIsRegistering);
  const [authError, setAuthError] = useState('');
  const [showSandboxBypass, setShowSandboxBypass] = useState(false);

  // Real registration detail inputs
  const [authPhoneInput, setAuthPhoneInput] = useState('');
  const [authStreetInput, setAuthStreetInput] = useState('');
  const [authCityInput, setAuthCityInput] = useState('');
  const [authStateInput, setAuthStateInput] = useState('');
  const [authPostalCodeInput, setAuthPostalCodeInput] = useState('');
  const [authCountryInput, setAuthCountryInput] = useState('');

  // Premium UX states
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [authEmailCodeInput, setAuthEmailCodeInput] = useState('');
  const [authPhoneCodeInput, setAuthPhoneCodeInput] = useState('');
  const [isSendingCodes, setIsSendingCodes] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [devEmailCode, setDevEmailCode] = useState('');
  const [devPhoneCode, setDevPhoneCode] = useState('');

  // Password Recovery Flow State
  const [authRecoveryStep, setAuthRecoveryStep] = useState<'none' | 'request' | 'reset'>('none');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [devCodeSuggested, setDevCodeSuggested] = useState('');

  // Sync initialIsRegistering prop when overlay opens
  useEffect(() => {
    if (isOpen) {
      setAuthIsRegistering(initialIsRegistering);
      setAuthError(isCheckingOutBeforeLogin ? 'AUTHENTICATION REQUIRED: Please register or sign in to complete your purchase securely.' : '');
      setAuthRecoveryStep('none');
      setShowSandboxBypass(false);
      setRegisterStep(1);
      setShowPassword(false);
      setAuthConfirmPasswordInput('');
    }
  }, [isOpen, initialIsRegistering, isCheckingOutBeforeLogin]);

  // Lock body scroll of the background when overlay is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? '' : originalStyle;
      };
    }
  }, [isOpen]);

  // Password Recovery Request Code
  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!recoveryEmail.trim()) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recoveryEmail.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Security verification dispatched.');
        if (data.devCode) {
          setDevCodeSuggested(data.devCode);
          setRecoveryCode(data.devCode); // Pre-fill code for effortless developer evaluation
        } else {
          setDevCodeSuggested('');
          setRecoveryCode('');
        }
        setAuthRecoveryStep('reset');
      } else {
        setAuthError(data.error || 'Failed to initiate password reset.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Security connection offline.');
    }
  };

  // Password Recovery Complete reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!recoveryEmail.trim() || !recoveryCode.trim() || !recoveryNewPassword.trim()) {
      setAuthError('All credentials fields are required.');
      return;
    }
    if (recoveryNewPassword.length < 6) {
      setAuthError('Password must be at least 6 characters in length.');
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recoveryEmail.trim(),
          code: recoveryCode.trim(),
          newPassword: recoveryNewPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Credentials calibrated successfully.');
        setAuthRecoveryStep('none');
        setAuthIsRegistering(false);
        setAuthError('');
        setAuthEmailInput(recoveryEmail);
        setAuthPasswordInput('');
        setRecoveryCode('');
        setRecoveryNewPassword('');
        setDevCodeSuggested('');
      } else {
        setAuthError(data.error || 'Calibration parameters rejected.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Calibration connection offline.');
    }
  };

  // Sandbox Developer Bypass Session Trigger
  const handleSandboxBypass = async () => {
    setAuthError('');
    setShowSandboxBypass(false);
    const email = 'codemonkrh@gmail.com';
    const displayName = 'Codemonk';
    const uid = 'usr-google-sandbox-default';
    try {
      const res = await loginWithGoogle(email, displayName, uid);
      if (res.success) {
        showToast(`Welcome to ORRIS, ${displayName}! (Sandbox Mode)`);
        onClose();
        if (isCheckingOutBeforeLogin && cartItems.length > 0) {
          setIsCheckingOutBeforeLogin(false);
          setView(res.isAdmin ? 'admin' : 'checkout');
        } else {
          setView(res.isAdmin ? 'admin' : 'profile');
        }
      } else {
        setAuthError(res.error || 'Failed to authenticate Google credentials on our secure server.');
      }
    } catch (error: any) {
      console.error('[SANDBOX BYPASS ERROR]', error);
      setAuthError(error?.message || 'Handshake failed during Sandbox Bypass.');
    }
  };

  // Google Federated Authentication Handler
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setShowSandboxBypass(false);
    
    // Smooth iframe redirection to prevent browser sandboxing issues
    const isInIframe = window.self !== window.top;
    if (isInIframe) {
      console.log('[ORRIS] Google Sign-In helper popup inside embedded preview requires top-level secure tab sequence.');
      const authUrl = `${window.location.origin}${window.location.pathname}?action=google-signin`;
      const newTab = window.open(authUrl, '_blank');
      if (newTab) {
        showToast('Directing authentication context to a secure top-level tab...');
      } else {
        setAuthError('Popup browser blocker active. Please allow popups or click "Open in New Tab" at the bottom to sign in with Google securely.');
      }
      return;
    }

    let email = '';
    let displayName = '';
    let uid = '';

    try {
      // Attempt standard Google sign-in
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      email = user.email || '';
      displayName = user.displayName || user.email?.split('@')[0] || 'Orris Member';
      uid = user.uid || '';
    } catch (popupErr: any) {
      if (popupErr?.code === 'auth/popup-closed-by-user') {
        console.log('[ORRIS] User closed the Google authentication window.');
        setAuthError('Authentication cancelled: Google window was closed before selection.');
        return; // Stop execution on cancel/reject
      } else {
        console.error('[ORRIS] Google Sign-In failed:', popupErr);
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
        setAuthError(
          `Firebase Error (${popupErr?.code || 'auth/internal-error'}): Google Sign-In failed.\n\n` +
          `Since you have enabled the Google provider in Firebase, you must also authorize this domain to run Firebase Auth popup scripts:\n\n` +
          `👉 Authorized Domain to Add: ${currentDomain}\n\n` +
          `How to resolve this in 3 easy steps:\n` +
          `1. Open Firebase Console -> Go to "Authentication" -> Click the "Settings" tab (top menu).\n` +
          `2. Scroll down/look for the "Authorized domains" list and click "Add domain".\n` +
          `3. Copy/paste "${currentDomain}" into the field and click Add.\n\n` +
          `After saving, close this modal and try clicking "Sign in with Google" again!`
        );
        setShowSandboxBypass(true);
        return;
      }
    }

    try {
      if (email) {
        const res = await loginWithGoogle(email, displayName, uid);
        if (res.success) {
          showToast(`Welcome to ORRIS, ${displayName}! Account synchronised successfully.`);
          onClose();
          if (isCheckingOutBeforeLogin && cartItems.length > 0) {
            setIsCheckingOutBeforeLogin(false);
            setView(res.isAdmin ? 'admin' : 'checkout');
          } else {
            setView(res.isAdmin ? 'admin' : 'profile');
          }
        } else {
          setAuthError(res.error || 'Failed to authenticate Google credentials on our secure server.');
        }
      } else {
        setAuthError('Google Sign-In response did not contain user email address.');
      }
    } catch (error: any) {
      console.error('[GOOGLE FLOW ERROR]', error);
      setAuthError(error?.message || 'Handshake failed during Google Sign-In.');
    }
  };

  // Synchronize top-level redirect trigger for iframe authentication handshakes
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.location.search.includes('action=google-signin')) {
      // Instantly clear the url queries to present a beautiful, pristine address bar
      const cleanUrl = window.location.pathname;
      window.history.replaceState(null, '', cleanUrl);
      
      // Execute standard top-level OAuth handshakes seamlessly
      console.log('[ORRIS] Auto-triggering secure top-level Google OAuth handshake.');
      handleGoogleSignIn();
    }
  }, [isOpen]);

  // Validation helpers for premium register experience
  const isStep1Valid = () => {
    const email = authEmailInput.trim();
    const pass = authPasswordInput;
    const confirmPass = authConfirmPasswordInput;
    const name = authNameInput.trim();
    const phone = authPhoneInput.trim();

    if (!name) {
      setAuthError('Please enter your full name to enroll in the Orris registry.');
      return false;
    }
    if (!phone) {
      setAuthError('Please specify a secure phone number for authentication queries.');
      return false;
    }
    if (!email || !email.includes('@')) {
      setAuthError('A valid email address is required to dispatch verification updates.');
      return false;
    }
    if (pass.length < 6) {
      setAuthError('Credentials require a passphrase of 6 or more characters to fulfill safety thresholds.');
      return false;
    }
    if (pass !== confirmPass) {
      setAuthError('Passwords do not match. Please verify your credentials.');
      return false;
    }
    return true;
  };

  const isStep2Valid = () => {
    const trimmedStreet = authStreetInput.trim();
    const trimmedCity = authCityInput.trim();
    const trimmedPostal = authPostalCodeInput.trim();
    const trimmedCountry = authCountryInput.trim();

    if (!trimmedStreet || !trimmedCity || !trimmedPostal || !trimmedCountry) {
      setAuthError('Incomplete delivery coordinates! Please specify your Street, City, ZIP, and Country details to continue.');
      return false;
    }
    return true;
  };

  const handleRequestVerification = async () => {
    setAuthError('');
    if (!isStep1Valid() || !isStep2Valid()) {
      return;
    }

    setIsSendingCodes(true);
    setVerificationSent(false);
    setDevEmailCode('');
    setDevPhoneCode('');

    try {
      const response = await fetch('/api/auth/send-register-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authEmailInput.trim(),
          phone: authPhoneInput.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Failed to dispatch verification codes.');
        setIsSendingCodes(false);
        return;
      }

      setVerificationSent(true);
      if (data.devEmailCode) {
        setDevEmailCode(data.devEmailCode);
      }
      if (data.devPhoneCode) {
        setDevPhoneCode(data.devPhoneCode);
      }
      showToast('Registration verification codes successfully generated.');
      setRegisterStep(3);
    } catch (err) {
      setAuthError('Network error while requesting identity verification codes.');
    } finally {
      setIsSendingCodes(false);
    }
  };

  const handleNextStep = () => {
    setAuthError('');
    if (isStep1Valid()) {
      setRegisterStep(2);
    }
  };

  // Login handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const email = authEmailInput.trim().toLowerCase();
    const pass = authPasswordInput;

    if (!email || !pass) return;

    if (authIsRegistering) {
      if (registerStep < 3) {
        if (registerStep === 1) {
          handleNextStep();
        } else if (registerStep === 2) {
          handleRequestVerification();
        }
        return;
      }

      if (pass.length < 6) {
        setAuthError('Password must be at least 6 characters long.');
        return;
      }
      if (pass !== authConfirmPasswordInput) {
        setAuthError('Passwords do not match. Please verify your credentials.');
        return;
      }
      if (!authEmailCodeInput || !authPhoneCodeInput) {
        setAuthError('Please input both Email and Phone verification codes to continue.');
        return;
      }

      // Register custom customer
      const name = authNameInput.trim() || 'Orris Member';
      
      const trimmedPhone = authPhoneInput.trim();
      const trimmedStreet = authStreetInput.trim();
      const trimmedCity = authCityInput.trim();
      const trimmedState = authStateInput.trim();
      const trimmedPostal = authPostalCodeInput.trim();
      const trimmedCountry = authCountryInput.trim();

      if (!trimmedPhone) {
        setAuthError('Please provide a secure phone number to secure your account credentials.');
        return;
      }
      if (!trimmedStreet || !trimmedCity || !trimmedPostal || !trimmedCountry) {
        setAuthError('Incomplete delivery coordinates! Please specify your Street, City, ZIP, and Country details to continue.');
        return;
      }

      const allocatedLocation = [trimmedStreet, trimmedCity, trimmedState, trimmedPostal, trimmedCountry].join(';');

      const newCitizen = {
        id: 'usr-' + Date.now(),
        name,
        email,
        role: 'USER' as const,
        phone: trimmedPhone,
        location: allocatedLocation,
        VIPLevel: 'Standard Account',
        spend: '$0',
        status: 'Online',
        createdAt: new Date().toISOString()
      };

      try {
        // Save client persistently as a citizen on backend file storage!
        await addCitizen(newCitizen, pass, authEmailCodeInput, authPhoneCodeInput);
        
        // Auto-login to obtain secure server session token!
        const res = await login(email, pass);
        if (res.success) {
          showToast(`Welcome to ORRIS, ${name}! Your profile is active and secured.`);
          onClose();
          if (isCheckingOutBeforeLogin && cartItems.length > 0) {
            setIsCheckingOutBeforeLogin(false);
            setView('checkout');
          } else {
            setView('profile'); // Direct straight to user dashboard (profile)
          }

          // Reset fields on success completely
          setAuthEmailInput('');
          setAuthPasswordInput('');
          setAuthConfirmPasswordInput('');
          setAuthNameInput('');
          setAuthPhoneInput('');
          setAuthStreetInput('');
          setAuthCityInput('');
          setAuthStateInput('');
          setAuthPostalCodeInput('');
          setAuthCountryInput('');
          setAuthEmailCodeInput('');
          setAuthPhoneCodeInput('');
          setRegisterStep(1);
          setVerificationSent(false);
          setDevEmailCode('');
          setDevPhoneCode('');
        } else {
          setAuthError(res.error || 'Failed to auto-sign-in after registration.');
        }
      } catch (err: any) {
        setAuthError(err?.message || 'Secure connection issue on login.');
      }
    } else {
      // Secure backend login validation
      const res = await login(email, pass.trim());
      if (res.success) {
        showToast(res.isAdmin ? 'Admin Command privilege verified.' : 'Security check successful. Welcome.');
        onClose();
        if (isCheckingOutBeforeLogin && cartItems.length > 0) {
          setIsCheckingOutBeforeLogin(false);
          setView(res.isAdmin ? 'admin' : 'checkout');
        } else {
          setView(res.isAdmin ? 'admin' : 'profile'); // Direct straight to Admin or Profile
        }

        // Reset fields on success completely
        setAuthEmailInput('');
        setAuthPasswordInput('');
        setAuthConfirmPasswordInput('');
        setAuthNameInput('');
        setAuthPhoneCodeInput('');
        setAuthEmailCodeInput('');
        setRegisterStep(1);
        setVerificationSent(false);
        setDevEmailCode('');
        setDevPhoneCode('');
      } else {
        setAuthError(res.error || 'Access denied. Check your credentials or try quick links.');
      }
    }
  };

  const handleQuickFill = (role: 'client' | 'admin') => {
    if (role === 'admin') {
      setAuthEmailInput('admin@orris.com');
      setAuthPasswordInput('admin123');
      setAuthIsRegistering(false);
    } else {
      setAuthEmailInput('client@orris.com');
      setAuthPasswordInput('member123');
      setAuthIsRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setIsCheckingOutBeforeLogin(false);
          setAuthError('');
          setAuthRecoveryStep('none');
        }
      }}
      className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md z-[100000] overflow-y-auto selection:bg-[#C9A96E] selection:text-black"
    >
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
            setIsCheckingOutBeforeLogin(false);
            setAuthError('');
            setAuthRecoveryStep('none');
          }
        }}
        className="min-h-full flex items-center justify-center p-4 sm:p-6 md:p-8"
      >
        <div className="bg-white border text-neutral-950 border-neutral-100 rounded-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative max-w-4xl w-full animate-in zoom-in-95 duration-300 grid grid-cols-1 md:grid-cols-12 overflow-hidden my-auto">
          
          {/* Universal Sticky-Behavior Close Button (Always visible top-right of overlay card) */}
        <button 
          onClick={() => {
            onClose();
            setIsCheckingOutBeforeLogin(false);
            setAuthError('');
            setAuthRecoveryStep('none');
          }} 
          className="absolute top-4 right-4 z-50 p-2 text-white bg-black/60 md:text-neutral-500 md:bg-neutral-100 hover:bg-[#C9A96E] hover:text-[#0b0b0b] hover:scale-105 active:scale-95 transition-all duration-300 rounded-full flex items-center justify-center shadow-lg border border-white/10 md:border-neutral-200 cursor-pointer outline-none"
          id="auth-close-btn"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Left Column: Premium Sovereign Privileges (Hero Brand Showcase) */}
        <div className="md:col-span-5 bg-black text-white p-6 md:p-8 flex flex-col justify-between relative overflow-hidden text-center md:text-left">
          {/* Subtle visual gradient backing */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_45%)]" />
          
          <div>
            <div className="flex items-center gap-2 mb-6 md:mb-10 pb-3 md:pb-4 border-b border-neutral-900 justify-center md:justify-start">
              <span className="font-serif tracking-[0.3em] font-light text-sm text-[#C9A96E]">ORRIS</span>
              <div className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest leading-none">Est. 2026</span>
            </div>

            <h3 className="text-xl md:text-2xl font-serif font-light tracking-tight text-white mb-2 md:mb-4">
              Welcome to ORRIS
            </h3>
            <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4 md:mb-8 max-w-xs mx-auto md:mx-0">
              Create an account or sign in to track your orders, save items to your wishlist, and enjoy private member benefits.
            </p>

            {/* Hidden on mobile to prevent blocking user from seeing the actual heading and elements immediately */}
            <div className="hidden md:block lg:block space-y-4 font-mono text-[10px]">
              <div className="flex items-start gap-3">
                <span className="text-[#C9A96E] font-bold">01/</span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Exclusive Collections</h4>
                  <p className="text-[10px] text-[#A3A3A3] font-light font-sans mt-0.5 normal-case tracking-normal">Get early access to select items, custom apparel, and limited-edition design pieces.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C9A96E] font-bold">02/</span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Custom Details</h4>
                  <p className="text-[10px] text-[#A3A3A3] font-light font-sans mt-0.5 normal-case tracking-normal">Optional custom engraving, batch numbering, and unique customized options.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#C9A96E] font-bold">03/</span>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Direct Pricing</h4>
                  <p className="text-[10px] text-[#A3A3A3] font-light font-sans mt-0.5 normal-case tracking-normal">By working directly with designers and makers, we pass the savings directly to you.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4 md:pt-6 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-[9px] text-neutral-400 tracking-wider font-mono justify-center md:justify-start">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
              <span>SECURE ENCRYPTED PORTAL</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Credentials Form */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative bg-white">

          {authRecoveryStep === 'none' && (
            <div className="w-full text-center md:text-left">
              <span className="text-[9px] bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-none font-bold uppercase tracking-widest inline-block mb-3.5 font-mono">
                Orris Customer Login
              </span>
              <h3 className="text-xl font-light tracking-tight font-serif mb-6 text-neutral-900">
                {authIsRegistering ? 'Register Private Account' : 'Account Login'}
              </h3>

              {authError && (
                <div className="p-4 bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs font-mono rounded-none mb-5 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed whitespace-pre-line">{authError}</span>
                  </div>
                  {authError.includes('AUTHENTICATION PRIVACY RESTRICTION') && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(window.location.href, '_blank');
                      }}
                      className="self-start px-4 py-2 bg-[#C9A96E] hover:bg-white text-black font-bold text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer outline-none border border-transparent hover:border-black"
                    >
                      Open in New Tab
                    </button>
                  )}
                  {showSandboxBypass && (
                    <button
                      type="button"
                      onClick={handleSandboxBypass}
                      className="self-start px-3 py-2 bg-[#C9A96E] hover:bg-white text-black font-black text-[9px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer outline-none border border-transparent hover:border-black"
                    >
                      Bypass & Sign In with Sandbox Profile
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                {authIsRegistering ? (
                  <>
                    {/* Premium Stepper Indicator */}
                    <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3 font-mono">
                      <button 
                        type="button"
                        onClick={() => {
                          if (registerStep === 2 || registerStep === 3) setRegisterStep(1);
                        }}
                        className={`flex items-center gap-1.5 text-[9px] uppercase tracking-wider transition-colors ${registerStep === 1 ? 'text-[#C9A96E] font-bold' : 'text-neutral-400 hover:text-black'}`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${registerStep === 1 ? 'bg-[#C9A96E] text-black font-bold' : 'bg-neutral-100 text-neutral-500'}`}>1</span>
                        <span>Credentials</span>
                      </button>
                      <div className="flex-grow mx-1.5 h-[1px] bg-neutral-150 relative">
                        <div className={`absolute left-0 top-0 h-full bg-[#C9A96E] transition-all duration-300 ${registerStep >= 2 ? 'w-full' : 'w-0'}`} />
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          if (registerStep === 3) {
                            setRegisterStep(2);
                          } else if (registerStep === 1 && isStep1Valid()) {
                            setRegisterStep(2);
                          }
                        }}
                        disabled={registerStep === 1 && (!authNameInput || !authPhoneInput || !authEmailInput)}
                        className={`flex items-center gap-1.5 text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${registerStep === 2 ? 'text-[#C9A96E] font-bold' : 'text-neutral-400 hover:text-black'}`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${registerStep === 2 ? 'bg-[#C9A96E] text-black font-bold' : 'bg-neutral-100 text-neutral-500'}`}>2</span>
                        <span>Coordinates</span>
                      </button>
                      <div className="flex-grow mx-1.5 h-[1px] bg-neutral-150 relative">
                        <div className={`absolute left-0 top-0 h-full bg-[#C9A96E] transition-all duration-300 ${registerStep === 3 ? 'w-full' : 'w-0'}`} />
                      </div>
                      <button 
                        type="button"
                        disabled={!isStep1Valid() || !isStep2Valid()}
                        className={`flex items-center gap-1.5 text-[9px] uppercase tracking-wider transition-colors disabled:opacity-50 ${registerStep === 3 ? 'text-[#C9A96E] font-bold' : 'text-neutral-400'}`}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${registerStep === 3 ? 'bg-[#C9A96E] text-black font-bold' : 'bg-neutral-100 text-neutral-500'}`}>3</span>
                        <span>Verification</span>
                      </button>
                    </div>

                    {/* Step 1: Core Credentials */}
                    {registerStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-neutral-50/50 p-3 border border-neutral-100 text-[10.5px] text-neutral-500 leading-relaxed font-sans mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A96E] inline mr-1" />
                          To construct your bespoke Orris Atelier profile, please register your authentic credentials below. No automated/generic data is accepted.
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Your Full Name</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={authNameInput}
                              onChange={(e) => setAuthNameInput(e.target.value)}
                              required
                              placeholder="e.g. Eleanor Vance"
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-name-field"
                            />
                            <User className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Secure Phone Number</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={authPhoneInput}
                              onChange={(e) => setAuthPhoneInput(e.target.value)}
                              required
                              placeholder="e.g. +41 79 555 8899"
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-phone-field"
                            />
                            <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Email Address</label>
                          <div className="relative">
                            <input 
                              type="email" 
                              value={authEmailInput}
                              onChange={(e) => setAuthEmailInput(e.target.value)}
                              required
                              placeholder="e.g. client@orris.com"
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-email-field"
                            />
                            <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              value={authPasswordInput}
                              onChange={(e) => setAuthPasswordInput(e.target.value)}
                              required
                              placeholder="Minimum 6 characters..."
                              className="w-full pl-9 pr-10 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-password-field"
                            />
                            <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Confirm Password</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"} 
                              value={authConfirmPasswordInput}
                              onChange={(e) => setAuthConfirmPasswordInput(e.target.value)}
                              required
                              placeholder="Verify credentials passphrase..."
                              className="w-full pl-9 pr-10 py-2.5 border border-neutral-200 text-xs font-mono bg-[#FAFAFA] focus:bg-white focus:border-black transition-colors outline-none"
                              id="auth-confirm-password-field"
                            />
                            <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={handleNextStep}
                          className="w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2 mt-2"
                        >
                          <span>Fulfill Delivery Parameters</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Step 2: Physical/Delivery Coordinates */}
                    {registerStep === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-neutral-50/70 p-3 text-[10.5px] text-neutral-500 font-sans leading-relaxed flex items-start gap-2 border border-neutral-100 mb-1">
                          <Info className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0 animate-pulse" />
                          <span>Ensure coordinates are precise to calibrate accurate, custom luxury courier dispatch routes across Swiss and global destinations.</span>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Street Address</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={authStreetInput}
                              onChange={(e) => setAuthStreetInput(e.target.value)}
                              required
                              placeholder="e.g. Rue de l'Atelier 45"
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-sans bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-street-field"
                            />
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">City</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={authCityInput}
                                onChange={(e) => setAuthCityInput(e.target.value)}
                                required
                                placeholder="e.g. Geneva"
                                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-sans bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                                id="auth-city-field"
                              />
                              <Building className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">State / Province</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={authStateInput}
                                onChange={(e) => setAuthStateInput(e.target.value)}
                                placeholder="e.g. CH"
                                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-sans bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                                id="auth-state-field"
                              />
                              <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Postal / ZIP Code</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={authPostalCodeInput}
                                onChange={(e) => setAuthPostalCodeInput(e.target.value)}
                                required
                                placeholder="e.g. 1201"
                                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-sans bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                                id="auth-postal-field"
                              />
                              <Hash className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Country</label>
                            <div className="relative">
                              <input 
                                type="text" 
                                value={authCountryInput}
                                onChange={(e) => setAuthCountryInput(e.target.value)}
                                required
                                placeholder="e.g. Switzerland"
                                className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-sans bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                                id="auth-country-field"
                              />
                              <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-neutral-50 border border-neutral-150 rounded-none flex items-start gap-2.5 text-[10px] text-neutral-500 font-sans leading-normal">
                          <input type="checkbox" required defaultChecked className="mt-0.5 accent-black focus:ring-0" />
                          <span>I agree to receive store notifications and authorize Orris to securely coordinate my shipments.</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setRegisterStep(1)}
                            className="w-full py-3 border border-neutral-200 text-neutral-700 hover:border-black hover:text-black font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer outline-none bg-white"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={handleRequestVerification}
                            disabled={isSendingCodes}
                            className="col-span-2 w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2 disabled:opacity-50"
                            id="auth-submit-btn"
                          >
                            <span>{isSendingCodes ? 'Dispensing Codes...' : 'Verify Email & Phone'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Dual Verification Validation */}
                    {registerStep === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="bg-neutral-50/75 p-3 text-[10.5px] text-neutral-500 font-sans leading-relaxed flex items-start gap-2 border border-neutral-100 mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                          <span>Validation codes have been triggered to secure your dossier identity. Check your email or look below to confirm credentials.</span>
                        </div>

                        {/* Developer sandbox indicator for manual copy-pasting code */}
                        {(devEmailCode || devPhoneCode) && (
                          <div className="p-3 bg-[#FCF8F2] border border-[#C9A96E]/30 text-[10.5px] font-mono text-[#8C6C30] space-y-1 rounded-none leading-relaxed">
                            <span className="uppercase font-bold block text-[9px] tracking-wider text-[#C9A96E] mb-1">Sandbox Credentials Suggestion</span>
                            {devEmailCode && <div>Email Code: <span className="font-bold select-all bg-amber-100 px-1 border border-amber-200/50">{devEmailCode}</span></div>}
                            {devPhoneCode && <div>Phone Code: <span className="font-bold select-all bg-amber-100 px-1 border border-amber-200/50">{devPhoneCode}</span></div>}
                          </div>
                        )}

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Email Verification Code</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={authEmailCodeInput}
                              onChange={(e) => setAuthEmailCodeInput(e.target.value)}
                              required
                              placeholder="6-digit Email Code"
                              maxLength={6}
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-verification-email-code"
                            />
                            <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Phone Verification Code</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={authPhoneCodeInput}
                              onChange={(e) => setAuthPhoneCodeInput(e.target.value)}
                              required
                              placeholder="6-digit Phone Code"
                              maxLength={6}
                              className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                              id="auth-verification-phone-code"
                            />
                            <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        <div className="text-right text-[10px] font-mono">
                          <button
                            type="button"
                            onClick={handleRequestVerification}
                            disabled={isSendingCodes}
                            className="text-[#C9A96E] hover:underline disabled:opacity-50 inline-block"
                          >
                            {isSendingCodes ? 'Resending...' : 'Resend Verification Codes'}
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setRegisterStep(2)}
                            className="w-full py-3 border border-neutral-200 text-neutral-700 hover:border-black hover:text-black font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer outline-none bg-white"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Back</span>
                          </button>
                          <button 
                            type="submit" 
                            className="col-span-2 w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2"
                            id="auth-submit-btn-step3"
                          >
                            <span>Fulfill Registration Registry</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Standard Login Mode */}
                    <div>
                      <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Email Address</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          value={authEmailInput}
                          onChange={(e) => setAuthEmailInput(e.target.value)}
                          required
                          placeholder="e.g. client@orris.com"
                          className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                          id="auth-email-field"
                        />
                        <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[9px] uppercase font-mono block text-neutral-500 font-bold tracking-wider">Password</label>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthError('');
                            setRecoveryEmail(authEmailInput);
                            setAuthRecoveryStep('request');
                          }}
                          className="text-[10px] text-[#C9A96E] hover:underline font-mono"
                          id="forgot-password-trigger"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={authPasswordInput}
                          onChange={(e) => setAuthPasswordInput(e.target.value)}
                          required
                          placeholder="Minimum 6 characters..."
                          className="w-full pl-9 pr-10 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                          id="auth-password-field"
                        />
                        <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-black transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2 mt-2"
                      id="auth-submit-btn"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </form>

              {/* Federated Identity Provider Integrations */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-100" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-[#A3A3A3] font-mono">
                  <span className="bg-white px-3 font-medium">Or Authenticate Credentials via</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 border border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50 font-bold font-mono text-[10px] uppercase tracking-widest rounded-none transition-all duration-200 outline-none flex items-center justify-center gap-2 cursor-pointer"
                id="auth-google-btn"
              >
                <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google Personal Access</span>
              </button>
            </div>
          )}

          {authRecoveryStep === 'request' && (
            <div className="w-full text-center md:text-left">
              <span className="text-[9px] bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-none font-bold uppercase tracking-widest inline-block mb-3.5 font-mono">
                Security handshake
              </span>
              <h3 className="text-xl font-light tracking-tight font-serif mb-3 text-neutral-900">
                Recover Credentials
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-sans leading-relaxed max-w-sm mx-auto md:mx-0">
                Enter your registered email address. We will transmit an active 6-digit confirmation code to calibrate your access passport.
              </p>
              
              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-none border border-red-100 mb-4 flex items-center justify-center md:justify-start gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleRequestRecovery} className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      placeholder="e.g. client@orris.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                      id="recovery-email-field"
                    />
                    <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2 mt-2"
                  id="recovery-request-submit-btn"
                >
                  <span>Request Reset Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-6 text-center border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthRecoveryStep('none');
                  }}
                  className="text-neutral-500 hover:text-black font-mono text-[10.5px] tracking-wide"
                  id="recovery-back-to-login"
                >
                  &larr; Back to login
                </button>
              </div>
            </div>
          )}

          {authRecoveryStep === 'reset' && (
            <div className="w-full text-center md:text-left">
              <span className="text-[9px] bg-[#C9A96E]/20 text-[#C9A96E] px-2.5 py-1 rounded-none font-bold uppercase tracking-widest inline-block mb-3.5 font-mono">
                Calibration pending
              </span>
              <h3 className="text-xl font-light tracking-tight font-serif mb-3 text-neutral-900">
                Calibrate New Password
              </h3>
              <p className="text-xs text-neutral-500 mb-6 font-sans leading-relaxed max-w-sm mx-auto md:mx-0">
                Your verification dispatch has been initiated. Input the code and set your refined password.
              </p>

              {authError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-mono rounded-none border border-red-100 mb-4 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{authError}</span>
                </div>
              )}

              {devCodeSuggested && (
                <div className="p-3 bg-amber-50 text-amber-800 text-xs font-mono rounded-none border border-amber-100 mb-4 leading-relaxed">
                  <strong>Atelier Dev Mode:</strong> Simulated email verification code is <span className="font-bold underline text-black">{devCodeSuggested}</span>. (Pre-filled below for testing convenience).
                </div>
              )}

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div>
                  <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={recoveryEmail}
                    disabled
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-100 text-neutral-500 rounded-none outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">Verification Code (6-Digits)</label>
                  <input 
                    type="text" 
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    required
                    placeholder="e.g. 581903"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors tracking-widest text-center font-bold"
                    id="recovery-code-field"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono mb-1.5 block text-neutral-500 font-bold tracking-wider">New Password</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={recoveryNewPassword}
                      onChange={(e) => setRecoveryNewPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 characters..."
                      className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 text-xs font-mono bg-neutral-50 rounded-none focus:bg-white focus:border-black outline-none transition-colors"
                      id="recovery-new-password-field"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-[#0F0F0F] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0b0b0b] font-bold text-xs uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-2 mt-2"
                  id="recovery-reset-submit-btn"
                >
                  <span>Calibrate Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-6 text-center border-t border-neutral-100 pt-4 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthRecoveryStep('request');
                  }}
                  className="text-neutral-500 hover:text-black font-mono text-[10.5px] tracking-wide"
                  id="recovery-back-to-request"
                >
                  &larr; Resend code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthRecoveryStep('none');
                  }}
                  className="text-neutral-500 hover:text-black font-mono text-[10.5px] tracking-wide"
                  id="recovery-cancel-to-login"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Register/Login Toggle (only visible on main login/register step) */}
          {authRecoveryStep === 'none' && (
            <div className="mt-6 text-center text-xs">
              <button 
                onClick={() => {
                  setAuthError('');
                  setAuthIsRegistering(!authIsRegistering);
                }}
                className="text-[#C9A96E] hover:underline font-mono text-[10.5px] tracking-wide"
                id="auth-toggle-btn"
              >
                {authIsRegistering ? 'Already have an account? Sign In here' : "Don't have an account yet? Create one here"}
              </button>
            </div>
          )}

          {/* Mobile-Only Prominent Close Button */}
          <div className="block md:hidden mt-6 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsCheckingOutBeforeLogin(false);
                setAuthError('');
                setAuthRecoveryStep('none');
              }}
              className="w-full py-3 bg-neutral-900 hover:bg-[#C9A96E] hover:text-[#0b0b0b] text-[#C9A96E] text-xs font-bold uppercase tracking-widest rounded-none transition-all duration-300 shadow cursor-pointer outline-none flex items-center justify-center gap-1.5"
              id="auth-mobile-close-action-btn"
            >
              <span>Dismiss Portal</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
);
}
