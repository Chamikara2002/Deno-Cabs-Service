import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bell, User, LogOut, ChevronDown, Car, Calendar, ShieldCheck, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, openAuthModal, userHires } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const isMainLandingPage = location.pathname === '/';

  const isActive = (path) => {
    if (path === '/home' && location.pathname === '/home') return true;
    if (path !== '/' && path !== '/home' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'About', path: '/about' },
    { label: 'Hire', path: '/hire' },
    { label: 'Booking Hire', path: '/my-bookings' },
    { label: 'Previous Hire', path: '/previous-hire' },
    { label: 'Payment History', path: '/payment-history' },
  ];

  // Auto-close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate notifications count
  const notifCount = user ? (userHires && userHires.length > 0 ? userHires.length : 0) : 0;

  return (
    <header className="deno-nav-header">
      <div className="deno-nav-topbar">
        <div className="deno-nav-container deno-nav-topbar-inner">
          {/* Logo Section */}
          <div className="deno-nav-brand">
            <Link
              to="/"
              className="deno-nav-logo-link"
              onClick={() => {
                setIsProfileDropdownOpen(false);
                setIsNotifOpen(false);
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Go to Deno Cabs Main Landing Page"
            >
              <div className="deno-nav-logo-icon">
                <Car size={20} color="#0b172a" />
              </div>
            </Link>
          </div>

          {/* Conditional Navigation Center Header */}
          {isMainLandingPage ? (
            <div className="deno-nav-landing-title-box">
              <span className="deno-nav-landing-title">WELL COME TO DENO CABS & TOURS</span>
            </div>
          ) : (
            <nav className="deno-nav-links-desktop">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`deno-nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.label}
                  {isActive(item.path) && <span className="deno-nav-active-bar" />}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Action Icons & Buttons */}
          <div className="deno-nav-top-right">
            {/* Notification Icon & Dropdown */}
            <div className="deno-nav-notif-wrapper" ref={notifRef} title="Notifications">
              <button 
                className={`deno-nav-notif-btn ${isNotifOpen ? 'active' : ''}`} 
                aria-label="Notifications"
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setIsProfileDropdownOpen(false);
                }}
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="deno-nav-notif-badge">{notifCount}</span>
                )}
              </button>

              {/* Interactive Notification Dropdown */}
              {isNotifOpen && (
                <div className="deno-nav-notif-dropdown">
                  <div className="notif-dropdown-header">
                    <div className="notif-header-title-row">
                      <Bell size={16} color="#d97706" />
                      <strong>Ride & Dispatch Alerts</strong>
                    </div>
                    <span className="notif-badge-pill">
                      {notifCount > 0 ? `${notifCount} Update${notifCount === 1 ? '' : 's'}` : '0 New'}
                    </span>
                  </div>

                  <div className="notif-dropdown-body">
                    {!user ? (
                      <div className="notif-empty-box">
                        <ShieldCheck size={28} color="#d97706" style={{ marginBottom: '8px' }} />
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', margin: '0 0 4px 0' }}>
                          Sign In to View Alerts
                        </p>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                          Track chauffeur allocations, trip status and booking updates in real-time.
                        </span>
                        <button
                          className="notif-action-btn gold"
                          onClick={() => {
                            setIsNotifOpen(false);
                            openAuthModal('login');
                          }}
                        >
                          Sign In / Register ➔
                        </button>
                      </div>
                    ) : userHires && userHires.length > 0 ? (
                      <div className="notif-items-list">
                        {userHires.map((hire, idx) => {
                          const isConfirmed = hire.status === 'Confirmed / Active' || hire.dispatchConfirmed;
                          const isCancelled = (hire.status || '').toLowerCase().includes('cancel');

                          return (
                            <Link
                              key={hire.id || idx}
                              to="/previous-hire"
                              className="notif-item-card"
                              onClick={() => setIsNotifOpen(false)}
                            >
                              <div className="notif-card-icon-col">
                                {isConfirmed ? (
                                  <span className="notif-status-dot green" />
                                ) : isCancelled ? (
                                  <span className="notif-status-dot red" />
                                ) : (
                                  <span className="notif-status-dot amber" />
                                )}
                              </div>
                              <div className="notif-card-meta">
                                <div className="notif-card-top">
                                  <strong className="notif-ref-text">{hire.ref || hire.id || `#DENO-${String(idx + 1).padStart(9, '0').slice(0, 3)}-${String(idx + 1).padStart(9, '0').slice(3, 6)}-${String(idx + 1).padStart(9, '0').slice(6, 9)}`}</strong>
                                  <span className={`notif-status-tag ${isConfirmed ? 'confirmed' : isCancelled ? 'cancelled' : 'pending'}`}>
                                    {isConfirmed ? 'Chauffeur Confirmed' : (hire.status || 'Pending Approval')}
                                  </span>
                                </div>
                                <p className="notif-route-text">
                                  {hire.pickupLocation || 'Colombo'} ➔ {hire.dropoffLocation || 'Airport'}
                                </p>
                                <span className="notif-time-text">
                                  {hire.scheduleDate || 'Today'} • {hire.vehicleModel || 'Executive Class'}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="notif-empty-box">
                        <div className="notif-empty-icon-wrap">
                          <Car size={24} color="#64748b" />
                        </div>
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.88rem', margin: '0 0 4px 0' }}>
                          No Active Ride Alerts
                        </p>
                        <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '12px' }}>
                          Welcome, <strong>{user.fullName}</strong>! When you reserve a luxury chauffeur hire, live updates will appear here.
                        </span>
                        <Link
                          to="/hire"
                          className="notif-action-btn gold"
                          onClick={() => setIsNotifOpen(false)}
                        >
                          Book Your Journey Now ➔
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons / Profile Dropdown */}
            {user ? (
              <div className="deno-nav-user-profile-container" ref={profileRef}>
                <button
                  className="deno-nav-user-avatar-btn"
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    setIsNotifOpen(false);
                  }}
                  title={user.fullName}
                >
                  <div className="deno-nav-avatar-fallback">
                    <User size={16} />
                  </div>
                  <span className="deno-nav-user-name">{user.fullName}</span>
                  <ChevronDown size={14} className={`deno-nav-chevron ${isProfileDropdownOpen ? 'open' : ''}`} />
                </button>

                {isProfileDropdownOpen && (
                  <div className="deno-nav-profile-menu">
                    <div className="deno-nav-profile-menu-header">
                      <div className="deno-nav-menu-avatar-large">
                        <User size={22} />
                      </div>
                      <div>
                        <strong>{user.fullName}</strong>
                        <p>{user.email}</p>
                        <span className="deno-nav-user-tier-tag"><ShieldCheck size={12} /> {user.accountTier}</span>
                      </div>
                    </div>
                    <div className="deno-nav-menu-divider" />
                    <Link
                      to="/my-bookings"
                      className="deno-nav-menu-item"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Calendar size={16} /> My Hires & Bookings ({userHires.length})
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="deno-nav-menu-item"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Car size={16} /> Place New Hire
                    </Link>
                    <div className="deno-nav-menu-divider" />
                    <button
                      className="deno-nav-menu-item deno-nav-logout-item"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="deno-nav-auth-actions">
                <button className="deno-nav-booknow-btn" onClick={() => openAuthModal('register')}>
                  Book Now
                </button>
                <button className="deno-nav-login-btn" onClick={() => openAuthModal('login')}>
                  Login
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle (Only on inner pages) */}
            {!isMainLandingPage && (
              <button
                className="deno-nav-mobile-toggle-btn"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {!isMainLandingPage && isMobileMenuOpen && (
          <div className="deno-nav-mobile-drawer">
            <nav className="deno-nav-mobile-links">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`deno-nav-mobile-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
