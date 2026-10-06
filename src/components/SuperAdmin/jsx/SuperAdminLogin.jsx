import React, { useState } from 'react';
import { useSuperAdmin, DEFAULT_SUPER_ADMIN_CREDENTIALS } from '../../../context/SuperAdminAuthContext';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Car, 
  KeyRound, 
  CheckCircle2, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import '../css/SuperAdminLogin.css';

const SuperAdminLogin = () => {
  const { loginSuperAdmin, adminCredentials } = useSuperAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = loginSuperAdmin(email, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error);
      }
    }, 450);
  };

  const handleQuickFill = () => {
    setEmail(adminCredentials.email);
    setPassword(adminCredentials.password);
    setErrorMessage('');
  };

  return (
    <div className="deno-superadmin-login-wrapper">
      <div className="deno-superadmin-login-bg-glow glow-1" />
      <div className="deno-superadmin-login-bg-glow glow-2" />

      <div className="deno-superadmin-login-card">
        {/* Header Branding */}
        <div className="deno-superadmin-login-brand">
          <div className="deno-admin-brand-icon-box">
            <div className="deno-admin-logo-badge">
              <Car size={26} color="#0b172a" />
            </div>
            <div className="deno-admin-pulse-ring" />
          </div>
          <div className="deno-admin-brand-meta">
            <span className="deno-admin-brand-badge">RESTRICTED ACCESS PORTAL</span>
            <h1 className="deno-admin-brand-title">DENO CABS & TOURS</h1>
            <p className="deno-admin-brand-sub">Super Admin • Dispatch Console & Fleet Command</p>
          </div>
        </div>

        {/* Security Warning / Info Badge */}
        <div className="deno-admin-security-banner">
          <ShieldCheck size={18} className="shield-icon" />
          <div className="security-banner-text">
            <span>Authorized Personnel Only</span>
            <small>Requires Master Super Admin unique credentials to authenticate.</small>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="deno-admin-login-alert error">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="deno-superadmin-login-form">
          <div className="deno-admin-input-group">
            <label className="deno-admin-label">
              <Mail size={15} /> Super Admin Email
            </label>
            <div className="deno-admin-input-field">
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="deno-admin-text-input"
              />
            </div>
          </div>

          <div className="deno-admin-input-group">
            <div className="deno-admin-label-row">
              <label className="deno-admin-label">
                <Lock size={15} /> Super Admin Password
              </label>
            </div>
            <div className="deno-admin-input-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Pass_@123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="deno-admin-text-input"
              />
              <button
                type="button"
                className="deno-admin-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="deno-superadmin-login-submit-btn"
          >
            {isLoading ? (
              <>Authenticating Credentials...</>
            ) : (
              <>
                Unlock Dispatch Console <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Return to Public Portal */}
        <div className="deno-admin-back-link">
          <Link to="/" className="back-to-home-link">
            <ChevronLeft size={16} /> Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
