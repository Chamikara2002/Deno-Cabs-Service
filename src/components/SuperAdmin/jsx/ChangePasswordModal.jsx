import React, { useState, useEffect, useRef } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminAuthContext';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  X,
  Sparkles
} from 'lucide-react';
import '../css/ChangePasswordModal.css';

const ChangePasswordModal = () => {
  const {
    adminCredentials,
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    isOtpModalOpen,
    setIsOtpModalOpen,
    requestPasswordChange,
    verifyOtpAndUpdatePassword,
    resendOtpCode,
    generatedOtp
  } = useSuperAdmin();

  // Form states for password input
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for OTP verification
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const otpInputRefs = useRef([]);

  // Reset inputs when modal opens or closes
  useEffect(() => {
    if (isChangePasswordModalOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isChangePasswordModalOpen]);

  useEffect(() => {
    if (isOtpModalOpen) {
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      setOtpSuccess(false);
      setResendCooldown(30);
      // Focus first OTP input
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    }
  }, [isOtpModalOpen]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (isOtpModalOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpModalOpen, resendCooldown]);

  // Step 1: Handle Initial "Confirm" Click
  const handleConfirmPasswordChange = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    if (newPassword === adminCredentials.password) {
      setErrorMessage('New password cannot be the same as your current password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = requestPasswordChange(newPassword, confirmPassword);
      setIsSubmitting(false);
      if (!result.success) {
        setErrorMessage(result.error);
      }
    }, 400);
  };

  // Step 2: OTP Digit inputs handling
  const handleOtpChange = (index, value) => {
    // Only accept numeric values
    const cleanVal = value.replace(/\D/g, '');
    
    if (cleanVal.length > 1) {
      // Handle paste
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (index + i < 6) {
          newDigits[index + i] = char;
        }
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(index + pasted.length, 5);
      if (otpInputRefs.current[nextFocus]) {
        otpInputRefs.current[nextFocus].focus();
      }
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal ? cleanVal.slice(-1) : '';
    setOtpDigits(updated);
    setOtpError('');

    // Auto focus next input
    if (cleanVal && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const currentOtpString = otpDigits.join('');
  // Check if exactly 6 digits are typed and match the generated OTP
  const isOtpComplete = currentOtpString.length === 6;
  const isOtpValid = isOtpComplete && currentOtpString === generatedOtp;

  // Step 3: Handle Final "Change Password" Button Click
  const handleFinalPasswordChange = () => {
    setOtpError('');
    if (!isOtpComplete) {
      setOtpError('Please enter all 6 digits of the OTP code.');
      return;
    }

    if (!isOtpValid) {
      setOtpError('Invalid OTP Code. Please verify the code sent to your email.');
      return;
    }

    const res = verifyOtpAndUpdatePassword(currentOtpString);
    if (res.success) {
      setOtpSuccess(true);
      setTimeout(() => {
        setIsOtpModalOpen(false);
        setOtpSuccess(false);
      }, 1800);
    } else {
      setOtpError(res.error);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsResending(true);
    setTimeout(() => {
      resendOtpCode();
      setIsResending(false);
      setResendCooldown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    }, 400);
  };

  if (!isChangePasswordModalOpen && !isOtpModalOpen) return null;

  return (
    <>
      {/* ================= STEP 1: PASSWORD & CONFIRM PASSWORD MODAL ================= */}
      {isChangePasswordModalOpen && (
        <div className="deno-admin-modal-overlay">
          <div className="deno-admin-modal-container">
            <div className="deno-admin-modal-header">
              <div className="deno-modal-title-group">
                <div className="deno-modal-icon-badge">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="deno-modal-title">Super Admin Security</h3>
                  <p className="deno-modal-subtitle">Update Master Account Credentials</p>
                </div>
              </div>
              <button
                className="deno-modal-close-btn"
                onClick={() => setIsChangePasswordModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmPasswordChange} className="deno-admin-modal-form">
              {/* Target Super Admin Email Indicator */}
              <div className="deno-admin-info-pill">
                <Mail size={16} className="text-gold" />
                <div className="deno-admin-info-text">
                  <span>Linked Super Admin Email:</span>
                  <strong>{adminCredentials.email}</strong>
                </div>
              </div>

              {errorMessage && (
                <div className="deno-admin-modal-alert error">
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* New Password Input */}
              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <Lock size={14} /> New Password
                </label>
                <div className="deno-admin-input-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="deno-admin-input"
                  />
                  <button
                    type="button"
                    className="deno-admin-eye-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="deno-form-hint">Minimum 6 characters with mixed symbols/letters recommended.</span>
              </div>

              {/* Confirm Password Input */}
              <div className="deno-admin-form-group">
                <label className="deno-admin-form-label">
                  <ShieldCheck size={14} /> Confirm Password
                </label>
                <div className="deno-admin-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type new password to confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="deno-admin-input"
                  />
                  <button
                    type="button"
                    className="deno-admin-eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="deno-admin-modal-actions">
                <button
                  type="button"
                  className="deno-admin-btn-secondary"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || !confirmPassword}
                  className="deno-admin-btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" /> Sending OTP...
                    </>
                  ) : (
                    <>
                      Confirm <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= STEP 2: EMAIL OTP VERIFICATION POPUP ================= */}
      {isOtpModalOpen && (
        <div className="deno-admin-modal-overlay">
          <div className="deno-admin-modal-container otp-modal">
            {otpSuccess ? (
              <div className="deno-otp-success-screen">
                <div className="deno-otp-success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h3>Password Successfully Updated!</h3>
                <p>Your Super Admin credentials have been replaced with the new password.</p>
              </div>
            ) : (
              <>
                <div className="deno-admin-modal-header">
                  <div className="deno-modal-title-group">
                    <div className="deno-modal-icon-badge gold-glow">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="deno-modal-title">Enter Email OTP Code</h3>
                      <p className="deno-modal-subtitle">Two-Factor Authentication Security</p>
                    </div>
                  </div>
                  <button
                    className="deno-modal-close-btn"
                    onClick={() => setIsOtpModalOpen(false)}
                    aria-label="Close OTP popup"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="deno-otp-modal-content">
                  <div className="deno-otp-instruction-card">
                    <p>
                      A 6-digit verification OTP code has been dispatched to:
                    </p>
                    <div className="deno-otp-target-email">
                      <Mail size={14} />
                      <strong>{adminCredentials.email}</strong>
                    </div>
                    <span className="deno-otp-sub-help">
                      Please check your inbox or the simulated incoming mail popup above.
                    </span>
                  </div>

                  {otpError && (
                    <div className="deno-admin-modal-alert error">
                      <AlertCircle size={16} />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {/* 6-Digit OTP Boxes */}
                  <div className="deno-otp-inputs-grid">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`deno-otp-box ${digit ? 'filled' : ''} ${
                          isOtpComplete && isOtpValid ? 'valid' : ''
                        }`}
                        autoComplete="one-time-code"
                      />
                    ))}
                  </div>

                  {/* Status Helper */}
                  <div className="deno-otp-status-indicator">
                    {isOtpComplete ? (
                      isOtpValid ? (
                        <span className="otp-status-text success">
                          <CheckCircle2 size={14} /> Valid OTP Code verified! Change button enabled.
                        </span>
                      ) : (
                        <span className="otp-status-text error">
                          <AlertCircle size={14} /> Incorrect OTP Code. Please re-check code.
                        </span>
                      )
                    ) : (
                      <span className="otp-status-text waiting">
                        Enter all 6 digits to enable the Change button.
                      </span>
                    )}
                  </div>

                  {/* Resend Section */}
                  <div className="deno-otp-resend-row">
                    <span>Didn't receive the code?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || isResending}
                      className="deno-resend-btn"
                    >
                      {isResending ? (
                        'Sending...'
                      ) : resendCooldown > 0 ? (
                        `Resend Code in ${resendCooldown}s`
                      ) : (
                        <>
                          <RefreshCw size={13} /> Resend OTP
                        </>
                      )}
                    </button>
                  </div>

                  {/* Final Change Password Button */}
                  <div className="deno-admin-modal-actions">
                    <button
                      type="button"
                      className="deno-admin-btn-secondary"
                      onClick={() => setIsOtpModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalPasswordChange}
                      disabled={!isOtpValid}
                      className={`deno-admin-btn-primary ${!isOtpValid ? 'btn-disabled' : 'btn-active-glow'}`}
                      title={!isOtpValid ? 'Please enter valid 6-digit OTP code to enable' : 'Click to Change Password'}
                    >
                      <Sparkles size={16} /> Change Password
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChangePasswordModal;
