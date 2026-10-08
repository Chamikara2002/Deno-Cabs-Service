import React, { useState } from 'react';
import { useSuperAdmin } from '../../../context/SuperAdminAuthContext';
import SuperAdminTopNav from './SuperAdminTopNav';
import SuperAdminStats from './SuperAdminStats';
import SuperAdminTable from './SuperAdminTable';
import ChangePasswordModal from './ChangePasswordModal';
import EmailOtpToast from './EmailOtpToast';
import ExploreBookingModal from './ExploreBookingModal';
import SimulateHireModal from './SimulateHireModal';
import ManageDriversModal from './ManageDriversModal';
import LeafletRouteMap from '../../Common/LeafletRouteMap';
import { 
  Radio, 
  MapPin, 
  Compass, 
  Car, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Sparkles, 
  PhoneCall, 
  CheckCircle2,
  Users
} from 'lucide-react';
import '../css/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const { 
    bookings, 
    emailNotificationToast, 
    dismissEmailToast 
  } = useSuperAdmin();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'console'
  const [selectedBookingForExplore, setSelectedBookingForExplore] = useState(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isManageDriversOpen, setIsManageDriversOpen] = useState(false);

  return (
    <div className="deno-superadmin-page-root">
      {/* 1. Header Navigation */}
      <SuperAdminTopNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalBookingsCount={bookings.length}
        onSimulateInboundHire={() => setIsSimulateModalOpen(true)}
        onManageDrivers={() => setIsManageDriversOpen(true)}
      />

      {/* Main Content Area */}
      <main className="deno-superadmin-content-wrap">
        <div className="deno-superadmin-container">
          {/* Active View: All Bookings (Default & screenshot match) */}
          {activeTab === 'all' && (
            <div className="deno-admin-view-all">
              {/* 2. Top 4 KPI Metrics */}
              <SuperAdminStats bookings={bookings} />

              {/* 3. Dispatch & Management Table */}
              <SuperAdminTable
                bookings={bookings}
                onExploreBooking={(booking) => setSelectedBookingForExplore(booking)}
                onSimulateHire={() => setIsSimulateModalOpen(true)}
              />
            </div>
          )}

          {/* Active View: Live Dispatch Console */}
          {activeTab === 'console' && (
            <div className="deno-admin-view-console">
              <div className="console-hero-card">
                <div className="console-hero-header">
                  <div className="console-radar-badge">
                    <span className="radar-pulse" />
                    <Radio size={18} />
                    <strong>ACTIVE FLEET TELEMETRY & RADAR DISPATCH</strong>
                  </div>
                  <span className="console-tag">Sri Lanka Nationwide Coverage</span>
                </div>

                <div className="console-grid">
                  <div className="console-map-mock" style={{ minHeight: '320px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <LeafletRouteMap
                      pickupLocation={bookings[0]?.pickupLocation || 'Colombo International Airport (CMB)'}
                      dropoffLocation={bookings[0]?.dropoffLocation || 'Kandy City Center'}
                      pickupCoords={bookings[0]?.pickupCoords}
                      dropoffCoords={bookings[0]?.dropoffCoords}
                      height="320px"
                      theme="dark"
                      showTelemetry={true}
                      telemetryVehicles={bookings.map((b, idx) => ({
                        name: `${b.vehiclePlate || 'WP CAB-' + (8820 + idx)}: ${b.vehicleModel || 'Fleet'}`,
                        lat: idx === 0 ? 6.9271 : idx === 1 ? 7.2906 : idx === 2 ? 6.0535 : 7.1804,
                        lng: idx === 0 ? 79.8612 : idx === 1 ? 80.6337 : idx === 2 ? 80.2210 : 79.8841,
                        status: b.status || 'Active Dispatch',
                        chauffeur: b.assignedDriverName || b.chauffeur || 'Dinusha C.'
                      }))}
                      interactive={true}
                    />
                  </div>

                  <div className="console-feed-panel">
                    <h3 className="console-feed-title">
                      <Activity size={16} /> Real-Time Chauffeur Dispatch Feed
                    </h3>
                    <div className="console-feed-list">
                      {bookings.length === 0 ? (
                        <div className="console-feed-empty" style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8' }}>
                          <p style={{ fontSize: '0.88rem', color: '#e2e8f0', marginBottom: '4px' }}>No active dispatches currently in progress.</p>
                          <small style={{ fontSize: '0.78rem', color: '#64748b' }}>Live customer bookings will appear here in real-time.</small>
                        </div>
                      ) : (
                        bookings.slice(0, 4).map((b) => (
                          <div key={b.id} className="console-feed-item">
                            <div className="feed-status-dot" />
                            <div className="feed-meta">
                              <strong>{b.customer} • {b.vehicleModel}</strong>
                              <p>{b.pickupLocation} ➔ {b.dropoffLocation}</p>
                              <small>{b.chauffeur}</small>
                            </div>
                            <span className="feed-badge">{b.status}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table also embedded below console for swift operational access */}
              <SuperAdminTable
                bookings={bookings}
                onExploreBooking={(booking) => setSelectedBookingForExplore(booking)}
                onSimulateHire={() => setIsSimulateModalOpen(true)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Global Super Admin Modals */}
      <ChangePasswordModal />

      <ManageDriversModal
        isOpen={isManageDriversOpen}
        onClose={() => setIsManageDriversOpen(false)}
      />
      
      {selectedBookingForExplore && (
        <ExploreBookingModal
          booking={
            bookings.find(
              (b) =>
                b.id === selectedBookingForExplore.id ||
                b.ref === selectedBookingForExplore.ref ||
                (b.id && selectedBookingForExplore.id && String(b.id).replace('#', '') === String(selectedBookingForExplore.id).replace('#', ''))
            ) || selectedBookingForExplore
          }
          onClose={() => setSelectedBookingForExplore(null)}
          onOpenManageDrivers={() => setIsManageDriversOpen(true)}
        />
      )}

      <SimulateHireModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
      />

      {/* Simulated Email Delivery Popup */}
      <EmailOtpToast
        toast={emailNotificationToast}
        onDismiss={dismissEmailToast}
      />
    </div>
  );
};

export default SuperAdminDashboard;
