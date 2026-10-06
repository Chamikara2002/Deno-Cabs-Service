import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Car, Calendar, MapPin, Clock, Plus, CheckCircle } from 'lucide-react';
import '../css/VipTravelPortal.css';

const VipTravelPortal = ({ onHireClick }) => {
  const { user, userHires } = useAuth();

  const handleAction = () => {
    if (onHireClick) {
      onHireClick();
    }
  };

  return (
    <section className="vip-portal-section">
      <div className="vip-portal-container">
        <div className="vip-portal-header">
          <div>
            <span className="vip-portal-badge">VIP TRAVEL PORTAL</span>
            <h2 className="vip-portal-title">My Hires & Reservations</h2>
            <p className="vip-portal-sub">
              Manage your point-to-point chauffeur hires, active dispatch telemetry, and trip receipts.
            </p>
          </div>
          <button className="vip-portal-new-hire-btn" onClick={handleAction}>
            <Plus size={18} /> Place New Hire
          </button>
        </div>

        {/* Empty State Box or User Hires List */}
        {!user || userHires.length === 0 ? (
          <div className="vip-portal-empty-card">
            <div className="vip-portal-car-svg-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
                <circle cx="7" cy="17" r="2" />
                <path d="M9 17h6" />
                <circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <h3>No Hires Placed Yet</h3>
            <p>You haven't requested any chauffeur hires. Reserve your first luxury ride across Sri Lanka!</p>
            <button className="vip-portal-explore-btn" onClick={handleAction}>
              Explore Hire Options
            </button>
          </div>
        ) : (
          <div className="vip-portal-list">
            {userHires.map((hire) => (
              <div key={hire.id} className="vip-portal-hire-card">
                <div className="vip-portal-hire-top">
                  <div className="vip-portal-ref-box">
                    <span className="vip-portal-ref-label">Booking Reference</span>
                    <strong className="vip-portal-ref-code">{hire.id}</strong>
                  </div>
                  <span className="vip-portal-status-chip">
                    <CheckCircle size={14} /> {hire.status}
                  </span>
                </div>

                <div className="vip-portal-hire-body">
                  <div className="vip-portal-vehicle-info">
                    <Car size={24} className="vip-portal-car-icon" />
                    <div>
                      <strong>{hire.vehicle}</strong>
                      <span>{hire.vehicleCategory}</span>
                    </div>
                  </div>

                  <div className="vip-portal-route-info">
                    <div className="vip-portal-route-point">
                      <MapPin size={16} className="vip-portal-pin-pickup" />
                      <div>
                        <span className="vip-portal-label">Pickup</span>
                        <strong>{hire.pickupLocation}</strong>
                      </div>
                    </div>

                    <div className="vip-portal-route-line" />

                    <div className="vip-portal-route-point">
                      <MapPin size={16} className="vip-portal-pin-drop" />
                      <div>
                        <span className="vip-portal-label">Drop-off</span>
                        <strong>{hire.dropoffLocation}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="vip-portal-schedule-info">
                    <div>
                      <Calendar size={14} /> <span>{hire.hireDate}</span>
                    </div>
                    <div>
                      <Clock size={14} /> <span>{hire.hireTime}</span>
                    </div>
                  </div>

                  <div className="vip-portal-fare-box">
                    <span className="vip-portal-label">Estimated Total</span>
                    <strong className="vip-portal-amount">{hire.estimatedFare}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VipTravelPortal;
