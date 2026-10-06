import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, LogIn, X } from 'lucide-react';
import './LoginAlertModal.css';

const LoginAlertModal = () => {
  const { loginAlertModal, closeLoginAlertModal } = useAuth();

  if (!loginAlertModal.isOpen) return null;

  const handleOkClick = () => {
    if (loginAlertModal.onConfirm) {
      loginAlertModal.onConfirm();
    } else {
      closeLoginAlertModal();
    }
  };

  return (
    <div className="deno-login-alert-backdrop">
      <div className="deno-login-alert-card">
        <button 
          className="deno-login-alert-close-btn" 
          onClick={closeLoginAlertModal}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="deno-login-alert-icon-wrapper">
          <AlertTriangle size={36} className="deno-login-alert-icon" />
        </div>

        <h3 className="deno-login-alert-title">Authentication Required</h3>
        <p className="deno-login-alert-message">{loginAlertModal.message}</p>

        <div className="deno-login-alert-actions">
          <button className="deno-login-alert-cancel-btn" onClick={closeLoginAlertModal}>
            Cancel
          </button>
          <button className="deno-login-alert-ok-btn" onClick={handleOkClick}>
            <LogIn size={18} />
            OK (Go to Login)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginAlertModal;
