import React, { useState } from 'react';
import { Mail, Check, Copy, X, ShieldAlert, Sparkles } from 'lucide-react';
import '../css/EmailOtpToast.css';

const EmailOtpToast = ({ toast, onDismiss, onFillOtp }) => {
  const [copied, setCopied] = useState(false);

  if (!toast) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(toast.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onFillOtp) {
      onFillOtp(toast.otp);
    }
  };

  return (
    <aside aria-label="Notifications" className="deno-email-toast-backdrop">
      <div className="deno-email-toast-card">
        <div className="deno-email-toast-header">
          <div className="deno-email-toast-badge">
            <Mail size={14} className="email-pulse-icon" />
            <span>INCOMING EMAIL SIMULATION</span>
          </div>
          <button className="deno-email-toast-close" onClick={onDismiss} aria-label="Close notification">
            <X size={16} />
          </button>
        </div>

        <div className="deno-email-toast-body">
          <div className="deno-email-toast-to">
            <span className="deno-toast-label">To:</span>
            <span className="deno-toast-email">{toast.email}</span>
          </div>
          <div className="deno-email-toast-subject">
            <strong>Subject:</strong> Super Admin Security - Your 6-Digit Password Change OTP Code
          </div>
          
          <div className="deno-email-otp-box">
            <div className="deno-otp-display">
              <span className="deno-otp-number">{toast.otp}</span>
            </div>
            <button
              className={`deno-otp-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
              title="Copy OTP to Clipboard and auto-fill"
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied & Filled!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy OTP
                </>
              )}
            </button>
          </div>

          <p className="deno-email-toast-footer-note">
            <ShieldAlert size={13} /> This OTP is valid for 5 minutes. Do not share this code with anyone.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default EmailOtpToast;
