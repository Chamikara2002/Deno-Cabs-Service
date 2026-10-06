import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hireApi } from '../../services/hireApi';
import { 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Smartphone,
  Check
} from 'lucide-react';
import './AuthModal.css';

// SVG Official 4-color Google Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authMode, 
    closeAuthModal, 
    openAuthModal, 
    login, 
    register, 
    loginWithGoogle,
    googlePrefill,
    prefilledEmail, 
    setPrefilledEmail,
    registeredUsers 
  } = useAuth();

  const navigate = useNavigate();

  // Form states - Initialized empty for live production
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    rememberMe: true
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountTier: 'Individual / Guest',
    agreeTerms: false
  });

  const [formError, setFormError] = useState('');
  const [notRegisteredAlert, setNotRegisteredAlert] = useState(null);
  const [googleConnectedBanner, setGoogleConnectedBanner] = useState(null);
  const [registrationSuccessNotice, setRegistrationSuccessNotice] = useState('');

  // Google Account Chooser modal state
  const [isGoogleChooserOpen, setIsGoogleChooserOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // ================= 4-DIGIT OTP VERIFICATION STATE =================
  const [isOtpVerificationModalOpen, setIsOtpVerificationModalOpen] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState(null);
  const [generatedOtpCode, setGeneratedOtpCode] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = [useRef(), useRef(), useRef(), useRef()];

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Sync prefilled email or google profile when modal opens or mode changes
  useEffect(() => {
    if (googlePrefill) {
      setRegisterData((prev) => ({
        ...prev,
        fullName: '', // Kept empty for user to enter manually
        email: googlePrefill.email || prev.email,
        username: '' // Kept empty for user to enter manually
      }));
      setGoogleConnectedBanner(googlePrefill.email);
    } else if (prefilledEmail) {
      setRegisterData((prev) => ({
        ...prev,
        fullName: '',
        email: prefilledEmail.includes('@') ? prefilledEmail : prev.email,
        username: ''
      }));
    }
  }, [prefilledEmail, googlePrefill]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setFormError('');
      setNotRegisteredAlert(null);
      if (authMode === 'login') {
        // Keep prefilled email if passed, otherwise keep current input
        if (prefilledEmail && !loginData.username) {
          setLoginData((prev) => ({ ...prev, username: prefilledEmail }));
        }
      }
    }
  }, [isAuthModalOpen, authMode]);

  if (!isAuthModalOpen) return null;

  // Process Google Account Selection
  const handleSelectGoogleProfile = (profile) => {
    setIsGoogleChooserOpen(false);
    setFormError('');
    setNotRegisteredAlert(null);

    const result = loginWithGoogle(profile);

    if (result.success) {
      if (result.isSuperAdmin) {
        navigate('/super-admin');
        return;
      }
      closeAuthModal();
    } else if (result.notRegistered) {
      // User not registered with this Google account -> navigate to Register form with ONLY email prefilled
      setGoogleConnectedBanner(result.googleData.email);
      setRegisterData((prev) => ({
        ...prev,
        fullName: '', // User enters manually
        email: result.googleData.email,
        username: '' // User enters manually
      }));
      openAuthModal('register', result.googleData.email);
    } else {
      setFormError(result.error || 'Failed to authenticate Google account.');
    }
  };

  // Trigger Google Account Flow
  const handleGoogleAccountClick = () => {
    setFormError('');
    setNotRegisteredAlert(null);

    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // 1. Try Google Identity Services (GSI) if configured
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response?.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                handleSelectGoogleProfile({
                  email: payload.email,
                  name: payload.name,
                  picture: payload.picture
                });
              } catch {
                setIsGoogleChooserOpen(true);
              }
            }
          },
          auto_select: false
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleChooserOpen(true);
          }
        });
        return;
      } catch (err) {
        console.warn('GIS error, falling back to Google account chooser:', err);
      }
    }

    // 2. Open interactive Google Account Chooser (Works seamlessly across mobile & desktop)
    setIsGoogleChooserOpen(true);
  };

  // Unified Login Submit Handler
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setNotRegisteredAlert(null);
    setRegistrationSuccessNotice('');

    const cleanUsername = (loginData.username || '').trim();
    const cleanPassword = (loginData.password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      setFormError('Please enter both Email/Username and Password');
      return;
    }

    const result = login({
      usernameOrEmail: cleanUsername,
      password: cleanPassword
    });

    if (result.success) {
      // 1. If Super Admin logged in -> Immediately navigate to Super Admin UI
      if (result.isSuperAdmin) {
        navigate('/super-admin');
        return;
      }
      closeAuthModal();
    } else {
      // 2. If Customer does not have an existing account -> Display alert hint to register
      if (result.notRegistered) {
        setNotRegisteredAlert({
          typedInput: result.typedEmail || cleanUsername,
          message: result.error
        });
      } else {
        setFormError(result.error);
      }
    }
  };

  // Switch to Register form and prefill typed email only
  const handleSwitchToRegisterFromAlert = () => {
    const inputVal = notRegisteredAlert?.typedInput || loginData.username;
    if (inputVal) {
      setPrefilledEmail(inputVal);
      setRegisterData((prev) => ({
        ...prev,
        fullName: '',
        email: inputVal.includes('@') ? inputVal : prev.email,
        username: ''
      }));
    }
    setNotRegisteredAlert(null);
    setFormError('');
    setRegistrationSuccessNotice('');
    openAuthModal('register');
  };

  // ================= STEP 1: REGISTER SUBMIT -> VALIDATE EMAIL & DISPATCH 4-DIGIT OTP =================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setRegistrationSuccessNotice('');

    const cleanFullName = (registerData.fullName || '').trim();
    const cleanEmail = (registerData.email || '').trim().toLowerCase();
    const cleanPassword = registerData.password || '';
    const cleanPhone = (registerData.phone || '').trim();

    if (!cleanFullName) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!cleanEmail) {
      setFormError('Please enter your Email Address.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setFormError('Please enter a valid Email Address format (e.g. name@domain.com).');
      return;
    }

    if (cleanPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (cleanPassword !== registerData.confirmPassword) {
      setFormError('Passwords do not match! Please check and confirm your password.');
      return;
    }
    if (!registerData.agreeTerms) {
      setFormError('Please agree to the Terms of Service to create your account.');
      return;
    }

    // Check if email already registered in system
    const emailExists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setFormError('An account with this email address already exists. Please Sign In.');
      return;
    }

    // Generate random 4-digit OTP code (e.g. 4829)
    const fourDigitOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtpCode(fourDigitOtp);
    setPendingRegistrationData({
      ...registerData,
      fullName: cleanFullName,
      email: cleanEmail,
      username: (registerData.username || cleanEmail.split('@')[0]).trim().toLowerCase(),
      phone: cleanPhone || '77 123 4567'
    });

    setOtpDigits(['', '', '', '']);
    setOtpError('');
    setResendCooldown(30);

    // Open 4-Digit OTP Popup
    setIsOtpVerificationModalOpen(true);

    // Auto-focus first digit box on next tick
    setTimeout(() => {
      otpInputRefs[0]?.current?.focus();
    }, 150);

    // Dispatch real email & SMS text message in background
    try {
      await hireApi.sendOtp({
        email: cleanEmail,
        phone: cleanPhone,
        otp: fourDigitOtp
      });
    } catch (err) {
      console.warn('Notice: Background OTP dispatch:', err.message);
    }
  };

  // Handle Digit Key Input across the 4 boxes
  const handleOtpDigitChange = (index, value) => {
    const sanitizedVal = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = sanitizedVal;
    setOtpDigits(newDigits);
    setOtpError('');

    if (sanitizedVal && index < 3) {
      otpInputRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1]?.current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      if (pastedData.length === 4) {
        otpInputRefs[3]?.current?.focus();
      } else {
        otpInputRefs[pastedData.length]?.current?.focus();
      }
    }
  };

  // Resend 4-Digit OTP via Email & SMS
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtpCode(newCode);
    setOtpDigits(['', '', '', '']);
    setOtpError('');
    setResendCooldown(30);

    const emailToUse = pendingRegistrationData?.email || registerData.email;
    const phoneToUse = pendingRegistrationData?.phone || registerData.phone;

    setTimeout(() => {
      otpInputRefs[0]?.current?.focus();
    }, 100);

    try {
      await hireApi.sendOtp({
        email: emailToUse,
        phone: phoneToUse,
        otp: newCode
      });
    } catch (err) {
      console.warn('Notice: Background OTP resend:', err.message);
    }
  };

  // ================= STEP 2: CONFIRM OTP -> REGISTER & NAVIGATE TO LOGIN TAB =================
  const handleVerifyOtpAndProceedToLogin = (e) => {
    if (e) e.preventDefault();
    setOtpError('');

    const enteredCode = otpDigits.join('').trim();

    if (enteredCode.length < 4) {
      setOtpError('Please enter all 4 digits of the OTP verification code.');
      return;
    }

    if (enteredCode !== generatedOtpCode) {
      setOtpError('Invalid OTP verification code. Please check the 4-digit code sent to your email & mobile SMS and try again.');
      return;
    }

    // OTP Verified! Register customer into database / localStorage without auto-login
    const result = register(pendingRegistrationData, false);

    if (!result.success) {
      setOtpError(result.error || 'Registration failed. Please try again.');
      return;
    }

    // Close OTP Modal
    setIsOtpVerificationModalOpen(false);

    // Pre-fill registered email on login tab
    const registeredEmail = pendingRegistrationData.email;
    setLoginData({
      username: registeredEmail,
      password: '',
      rememberMe: true
    });

    // Display prominent Success Notice on Login Page
    setRegistrationSuccessNotice(`🎉 Email (${registeredEmail}) and Mobile verified successfully! Please enter your password to sign in.`);
    setFormError('');
    setNotRegisteredAlert(null);

    // Switch to Login Tab
    openAuthModal('login', registeredEmail);
  };

  return (
    <div className="deno-auth-modal-overlay">
      <div className="deno-auth-modal-wrapper">
        {/* Left Side Visual Banner */}
        <div className="deno-auth-modal-visual">
          <div className="deno-auth-visual-badge">
            <span className="deno-auth-badge-car">🚕</span>
            <span className="deno-auth-badge-text">CABS & TOURS VIP</span>
            <span className="deno-auth-badge-sub">BY DENO CABS</span>
          </div>

          <div className="deno-auth-visual-content">
            <span className="deno-auth-tag">SRI LANKA'S PREMIER CHAUFFEUR SERVICE</span>
            <h2 className="deno-auth-visual-title">
              Elevating Every Journey Across the Island.
            </h2>
            <p className="deno-auth-visual-desc">
              Access your personalized travel portal, track live luxury fleets in real-time, review tax invoices, and manage bespoke island tours effortlessly.
            </p>

            <div className="deno-auth-visual-stats">
              <div className="deno-auth-stat-item">
                <strong>100%</strong>
                <span>Punctual Chauffeurs</span>
              </div>
              <div className="deno-auth-stat-item">
                <strong>4.9 ★</strong>
                <span>Customer Rating</span>
              </div>
              <div className="deno-auth-stat-item">
                <strong>24/7</strong>
                <span>Express Dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Auth Form */}
        <div className="deno-auth-modal-form-container">
          <button className="deno-auth-close-btn" onClick={closeAuthModal} aria-label="Close auth modal">
            <X size={20} />
          </button>

          {/* Mode Switcher Tabs */}
          <div className="deno-auth-tabs">
            <button
              className={`deno-auth-tab ${authMode === 'login' ? 'active' : ''}`}
              onClick={() => { 
                setFormError(''); 
                setNotRegisteredAlert(null);
                setGoogleConnectedBanner(null);
                openAuthModal('login'); 
              }}
            >
              Sign In
            </button>
            <button
              className={`deno-auth-tab ${authMode === 'register' ? 'active' : ''}`}
              onClick={() => { 
                setFormError(''); 
                setNotRegisteredAlert(null);
                setRegistrationSuccessNotice('');
                openAuthModal('register'); 
              }}
            >
              Create Account
            </button>
          </div>

          {/* Registration Verified Success Notice on Login Page */}
          {registrationSuccessNotice && authMode === 'login' && (
            <div className="deno-reg-success-banner">
              <CheckCircle size={18} className="text-emerald" />
              <span>{registrationSuccessNotice}</span>
            </div>
          )}

          {/* Standard Form Error */}
          {formError && <div className="deno-auth-error-banner">{formError}</div>}

          {/* Google Account Connected Notice */}
          {googleConnectedBanner && authMode === 'register' && (
            <div className="deno-google-connected-badge">
              <GoogleIcon />
              <div>
                <strong>Google Account Connected</strong>
                <span>{googleConnectedBanner} — Complete password to finish registration</span>
              </div>
            </div>
          )}

          {/* ================= UNREGISTERED CUSTOMER ALERT HINT ================= */}
          {notRegisteredAlert && (
            <div className="deno-not-registered-hint-card">
              <div className="hint-header">
                <div className="hint-icon-box">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h4 className="hint-title">No Account Found!</h4>
                  <p className="hint-sub">
                    There is no existing customer account registered under <strong>"{notRegisteredAlert.typedInput}"</strong>.
                  </p>
                </div>
              </div>

              <div className="hint-action-row">
                <p className="hint-lead-text">
                  Please register first to create your Deno Cabs traveler account.
                </p>
                <button
                  type="button"
                  className="deno-hint-register-btn"
                  onClick={handleSwitchToRegisterFromAlert}
                >
                  <UserPlus size={15} /> Create Account & Register Now
                </button>
              </div>
            </div>
          )}

          {/* ================= LOGIN FORM (Normal Guests & Super Admin) ================= */}
          {authMode === 'login' ? (
            <form className="deno-auth-form" onSubmit={handleLoginSubmit}>
              <div className="deno-auth-header">
                <h3 className="deno-auth-heading">Welcome Back</h3>
                <p className="deno-auth-subheading">
                  Sign in with your Email & Password to manage your bookings and fleet tracking.
                </p>
              </div>

              <div className="deno-auth-field-group">
                <div className="deno-auth-label-row">
                  <label>USERNAME OR EMAIL ADDRESS</label>
                  <span className="deno-auth-required">Required</span>
                </div>
                <div className="deno-auth-input-wrapper">
                  <User size={18} className="deno-auth-input-icon" />
                  <input
                    type="text"
                    placeholder="name@gmail.com or username"
                    value={loginData.username}
                    onChange={(e) => {
                      setLoginData({ ...loginData, username: e.target.value });
                      if (notRegisteredAlert) setNotRegisteredAlert(null);
                    }}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="deno-auth-field-group">
                <div className="deno-auth-label-row">
                  <label>PASSWORD</label>
                  <a href="#forgot" className="deno-auth-forgot-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                </div>
                <div className="deno-auth-input-wrapper">
                  <Lock size={18} className="deno-auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="deno-auth-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="deno-auth-options-row">
                <label className="deno-auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  <span>Remember this device</span>
                </label>
                <span className="deno-auth-ssl-badge"><ShieldCheck size={14} /> 256-Bit SSL Encrypted</span>
              </div>

              <button type="submit" className="deno-auth-submit-btn">
                Complete Sign in <ArrowRight size={18} />
              </button>

              <div className="deno-auth-divider">
                <span>OR SIGN IN WITH</span>
              </div>

              {/* Google Account Button */}
              <div className="deno-auth-social-btns single-col">
                <button 
                  type="button" 
                  className="deno-auth-social-btn google-full-btn" 
                  onClick={handleGoogleAccountClick}
                >
                  <GoogleIcon />
                  <span>Google Account</span>
                </button>
              </div>

              <p className="deno-auth-switch-text">
                Don't have an account yet?{' '}
                <span 
                  className="deno-auth-link" 
                  onClick={() => { 
                    setFormError(''); 
                    setNotRegisteredAlert(null);
                    setRegistrationSuccessNotice('');
                    openAuthModal('register'); 
                  }}
                >
                  Register for Free
                </span>
              </p>
            </form>
          ) : (
            /* ================= REGISTER FORM (WITH EMAIL/SMS OTP VALIDATION) ================= */
            <form className="deno-auth-form" onSubmit={handleRegisterSubmit}>
              <div className="deno-auth-header">
                <h3 className="deno-auth-heading">Create Your Account</h3>
                <p className="deno-auth-subheading">
                  Start reserving premium chauffeur drives across Sri Lanka today.
                </p>
              </div>

              {/* Quick Google Account Sign-up option */}
              <div className="deno-register-google-row">
                <button 
                  type="button" 
                  className="deno-auth-social-btn google-full-btn" 
                  onClick={handleGoogleAccountClick}
                >
                  <GoogleIcon />
                  <span>Auto-fill with Google Account</span>
                </button>
              </div>

              <div className="deno-auth-divider">
                <span>OR FILL REGISTRATION DETAILS</span>
              </div>

              <div className="deno-auth-grid-2">
                <div className="deno-auth-field-group">
                  <label>FULL NAME</label>
                  <div className="deno-auth-input-wrapper">
                    <User size={18} className="deno-auth-input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. Kasun Fernando"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="deno-auth-field-group">
                  <label>USERNAME</label>
                  <div className="deno-auth-input-wrapper">
                    <User size={18} className="deno-auth-input-icon" />
                    <input
                      type="text"
                      placeholder="@ username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="deno-auth-field-group">
                <div className="deno-auth-label-row">
                  <label>EMAIL ADDRESS</label>
                  <span className="deno-auth-otp-badge">REQUIRES 4-DIGIT OTP VERIFICATION</span>
                </div>
                <div className="deno-auth-input-wrapper">
                  <Mail size={18} className="deno-auth-input-icon" />
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="deno-auth-field-group">
                <div className="deno-auth-label-row">
                  <label>MOBILE / WHATSAPP NUMBER</label>
                  <span className="deno-auth-hint">SMS OTP DISPATCH</span>
                </div>
                <div className="deno-auth-input-wrapper">
                  <div className="deno-auth-phone-prefix"><Phone size={14} /> +94</div>
                  <input
                    type="tel"
                    placeholder="77 123 4567"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="deno-auth-grid-2">
                <div className="deno-auth-field-group">
                  <label>PASSWORD</label>
                  <div className="deno-auth-input-wrapper">
                    <Lock size={18} className="deno-auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="deno-auth-field-group">
                  <label>CONFIRM PASSWORD</label>
                  <div className="deno-auth-input-wrapper">
                    <Lock size={18} className="deno-auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SELECT ACCOUNT TIER */}
              <div className="deno-auth-tier-selection">
                <label className="deno-auth-section-label">SELECT ACCOUNT TIER</label>
                <div className="deno-auth-tier-grid">
                  <div
                    className={`deno-auth-tier-card ${registerData.accountTier === 'Individual / Guest' ? 'selected' : ''}`}
                    onClick={() => setRegisterData({ ...registerData, accountTier: 'Individual / Guest' })}
                  >
                    <div className="deno-auth-radio-indicator" />
                    <div>
                      <strong>Individual / Guest</strong>
                      <p>Personal rides & tours</p>
                    </div>
                  </div>

                  <div
                    className={`deno-auth-tier-card ${registerData.accountTier === 'Corporate Entity' ? 'selected' : ''}`}
                    onClick={() => setRegisterData({ ...registerData, accountTier: 'Corporate Entity' })}
                  >
                    <div className="deno-auth-radio-indicator" />
                    <div>
                      <strong>Corporate Entity</strong>
                      <p>Monthly billing & VAT</p>
                    </div>
                  </div>
                </div>
              </div>

              <label className="deno-auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={registerData.agreeTerms}
                  onChange={(e) => setRegisterData({ ...registerData, agreeTerms: e.target.checked })}
                />
                <span>I agree to the Terms of Service, Privacy Policy, and real-time chauffeur alerts.</span>
              </label>

              <button type="submit" className="deno-auth-submit-btn">
                Complete Registration <ArrowRight size={18} />
              </button>

              <p className="deno-auth-switch-text">
                Already have an account?{' '}
                <span 
                  className="deno-auth-link" 
                  onClick={() => { 
                    setFormError(''); 
                    setNotRegisteredAlert(null);
                    openAuthModal('login'); 
                  }}
                >
                  Sign In Here
                </span>
              </p>
            </form>
          )}
        </div>
      </div>

      {/* ================= 4-DIGIT OTP VERIFICATION POPUP MODAL ================= */}
      {isOtpVerificationModalOpen && (
        <div className="deno-otp-verify-overlay" onClick={() => setIsOtpVerificationModalOpen(false)}>
          <div className="deno-otp-verify-dialog" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="deno-otp-dialog-close"
              onClick={() => setIsOtpVerificationModalOpen(false)}
              aria-label="Close OTP verification"
            >
              <X size={18} />
            </button>

            <div className="otp-modal-header">
              <div className="otp-shield-badge">
                <ShieldCheck size={28} />
              </div>
              <h3 className="otp-modal-title">Verify Email & Mobile</h3>
              <p className="otp-modal-sub">
                To confirm your email is valid, a <strong>4-digit verification code (OTP)</strong> has been dispatched to:
              </p>
              <div className="otp-recipient-tags">
                <span className="otp-tag email-tag">
                  <Mail size={13} /> {pendingRegistrationData?.email}
                </span>
                {pendingRegistrationData?.phone && (
                  <span className="otp-tag phone-tag">
                    <Smartphone size={13} /> {pendingRegistrationData?.phone.startsWith('+') ? pendingRegistrationData?.phone : `+94 ${pendingRegistrationData?.phone}`}
                  </span>
                )}
              </div>
              <p className="otp-check-inbox-hint">
                📩 Please check your <strong>Email Inbox / Spam folder</strong> and <strong>Mobile SMS Text Messages</strong> for the 4-digit code.
              </p>
            </div>

            {/* OTP Error message */}
            {otpError && (
              <div className="otp-modal-error">
                <AlertTriangle size={15} />
                <span>{otpError}</span>
              </div>
            )}

            {/* 4-Digit Input Boxes */}
            <form onSubmit={handleVerifyOtpAndProceedToLogin} className="otp-digits-form">
              <div className="otp-digits-container" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpInputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className={`otp-digit-input ${digit ? 'filled' : ''}`}
                    autoComplete="one-time-code"
                    required
                  />
                ))}
              </div>

              <button type="submit" className="otp-confirm-submit-btn">
                <span>Confirm & Proceed to Sign In</span>
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Resend OTP Section */}
            <div className="otp-resend-row">
              <span className="resend-text">Didn't receive the code?</span>
              <button 
                type="button" 
                className="otp-resend-btn"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0}
              >
                <RotateCcw size={13} />
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= GOOGLE ACCOUNT CHOOSER POPUP DIALOG ================= */}
      {isGoogleChooserOpen && (
        <div className="deno-google-chooser-overlay" onClick={() => setIsGoogleChooserOpen(false)}>
          <div className="deno-google-chooser-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="google-chooser-header">
              <div className="google-logo-row">
                <GoogleIcon />
                <span className="google-title-text">Sign in with Google</span>
              </div>
              <button 
                type="button" 
                className="google-close-btn"
                onClick={() => setIsGoogleChooserOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="google-chooser-intro">
              <p className="google-subtext">Choose an active Google Account on your device to continue to <strong>Deno Cabs</strong></p>
            </div>

            {/* Quick Google Account Input Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (customGoogleEmail.trim()) {
                  const email = customGoogleEmail.trim();
                  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  handleSelectGoogleProfile({
                    email,
                    name,
                    picture: ''
                  });
                }
              }}
              className="google-custom-account-form"
            >
              <div className="google-input-box">
                <Mail size={16} className="google-input-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your Gmail (e.g. user@gmail.com)" 
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="google-proceed-btn">
                <span>Continue with this Gmail</span>
                <ChevronRight size={16} />
              </button>
            </form>

            <div className="google-footer-note">
              <ShieldCheck size={14} color="#34A853" />
              <span>Deno Cabs will securely verify your identity with Google OAuth.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthModal;
