import React, { useState } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminAuthContext';
import { 
  Car, 
  BookOpen, 
  Radio, 
  Bell, 
  ChevronDown, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  ExternalLink,
  Activity,
  Layers,
  UserCheck,
  Users
} from 'lucide-react';
import '../css/SuperAdminTopNav.css';

const SuperAdminTopNav = ({ 
  activeTab, 
  setActiveTab, 
  totalBookingsCount, 
  onSimulateInboundHire,
  onManageDrivers 
}) => {
  const { 
    adminCredentials, 
    logoutSuperAdmin, 
    setIsChangePasswordModalOpen 
  } = useSuperAdmin();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="deno-admin-topbar">
      <div className="deno-admin-topbar-inner">
        {/* Left: Brand & Header Title */}
        <div className="deno-admin-brand-section">
          <div className="deno-admin-brand-logo">
            <div className="deno-admin-logo-icon">
              <Car size={22} color="#0b172a" />
            </div>
          </div>
          <div className="deno-admin-brand-texts">
            <span className="deno-admin-brand-name">DENO CABS & TOURS</span>
            <h1 className="deno-admin-main-heading">Hire Dispatch & Management</h1>
          </div>
        </div>

        {/* Center: Module View Switchers (All Bookings / Dispatch Console / Fleet Drivers) */}
        <div className="deno-admin-center-controls">
          <button
            className={`deno-admin-toggle-pill ${activeTab === 'all' ? 'active-gold' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <BookOpen size={16} />
            <span>All Bookings</span>
            <span className="deno-admin-pill-counter">{totalBookingsCount}</span>
          </button>

          <button
            className={`deno-admin-toggle-pill ${activeTab === 'console' ? 'active-dark' : ''}`}
            onClick={() => setActiveTab('console')}
          >
            <Layers size={16} />
            <span>Dispatch Console</span>
          </button>

          <button
            className="deno-admin-toggle-pill fleet-drivers-pill"
            onClick={onManageDrivers}
            title="Register & Manage Fleet Drivers across all browsers"
          >
            <Users size={16} />
            <span>Manage Drivers</span>
          </button>
        </div>

        {/* Right: GPS Feed, Notifications & Admin Profile */}
        <div className="deno-admin-right-controls">
          {/* Live GPS Feed Status Badge */}
          <div className="deno-admin-gps-feed-pill" title="Telemetry Feed Active across Sri Lanka fleet">
            <span className="deno-gps-pulsing-dot" />
            <span className="deno-gps-text">Live GPS Feed 100%</span>
          </div>

          {/* Bell Notification */}
          <div className="deno-admin-notif-box">
            <button
              className="deno-admin-notif-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              aria-label="Dispatch alerts"
            >
              <Bell size={18} />
              {totalBookingsCount > 0 && <span className="deno-admin-notif-dot" />}
            </button>

            {isNotifOpen && (
              <div className="deno-admin-notif-dropdown">
                <div className="notif-dropdown-header">
                  <strong>Dispatch Notifications</strong>
                  <span className="notif-count">{totalBookingsCount > 0 ? `${totalBookingsCount} Inbound` : '0 New'}</span>
                </div>
                <div className="notif-list">
                  {totalBookingsCount === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                      No new dispatch alerts or inbound hire notifications.
                    </div>
                  ) : (
                    <div className="notif-item unread">
                      <span className="notif-dot-small" />
                      <div>
                        <p>{totalBookingsCount} active dispatch hire(s) awaiting or in progress.</p>
                        <small>Live sync</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Super Admin Profile Badge with Dropdown */}
          <div className="deno-admin-profile-wrapper">
            <button
              className="deno-admin-profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title="Super Admin Profile and Security"
            >
              <div className="deno-admin-avatar-circle">
                <span>{adminCredentials.avatarInitials || 'DC'}</span>
              </div>
              <div className="deno-admin-profile-info">
                <span className="admin-profile-name">{adminCredentials.name || 'Dinusha Chandima'}</span>
                <span className="admin-profile-role">{adminCredentials.role || 'Chief Ops Controller'}</span>
              </div>
              <ChevronDown size={14} className={`admin-chevron ${isProfileOpen ? 'rotate' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="deno-admin-dropdown-menu">
                <div className="admin-dropdown-header">
                  <div className="admin-avatar-large">
                    {adminCredentials.avatarInitials || 'DC'}
                  </div>
                  <div className="admin-header-details">
                    <strong>{adminCredentials.name || 'Dinusha Chandima'}</strong>
                    <span className="admin-header-email">{adminCredentials.email || 'wdinushac@gmail.com'}</span>
                    <span className="admin-header-badge">
                      <ShieldCheck size={12} /> Master Super Admin
                    </span>
                  </div>
                </div>

                <div className="admin-dropdown-divider" />

                <button
                  className="admin-dropdown-item gold-hover"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onManageDrivers) onManageDrivers();
                  }}
                >
                  <Users size={16} />
                  <span>Manage Drivers Registry</span>
                </button>

                <button
                  className="admin-dropdown-item gold-hover"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsChangePasswordModalOpen(true);
                  }}
                >
                  <KeyRound size={16} />
                  <span>Change Password (Email OTP)</span>
                </button>

                <div className="admin-dropdown-divider" />

                <button
                  className="admin-dropdown-item logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logoutSuperAdmin();
                  }}
                >
                  <LogOut size={16} />
                  <span>Logout Super Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNav;
