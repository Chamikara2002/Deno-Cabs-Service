import React from 'react';
import { 
  UserCheck, 
  Send, 
  Banknote, 
  CarFront, 
  TrendingUp, 
  ShieldCheck,
  Compass
} from 'lucide-react';
import '../css/SuperAdminStats.css';

const SuperAdminStats = ({ bookings = [] }) => {
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // Calculate live dynamic metrics from bookings
  const pendingCount = safeBookings.filter((b) => (b.status || '').toLowerCase().includes('pending')).length;
  const activeCount = safeBookings.filter((b) => {
    const s = (b.status || '').toLowerCase();
    return s.includes('confirmed') || s.includes('active');
  }).length;
  
  // Total calculated revenue
  const totalLKR = safeBookings
    .filter((b) => !(b.status || '').toLowerCase().includes('cancel'))
    .reduce((sum, b) => sum + (Number(b.totalLKR) || 0), 0);
  
  const totalUSD = Math.round(totalLKR / 330);

  const formattedLKR = new Intl.NumberFormat('en-US').format(totalLKR);
  const formattedUSD = new Intl.NumberFormat('en-US').format(totalUSD);

  // Fleet Readiness Calculation: 0% and 0 Chauffeurs when no bookings exist
  const fleetReadiness = safeBookings.length === 0 
    ? '0%' 
    : `${((activeCount / safeBookings.length) * 100).toFixed(1)}%`;

  const chauffeursText = safeBookings.length === 0
    ? '0 Chauffeurs Assigned'
    : `${activeCount} Chauffeur${activeCount === 1 ? '' : 's'} on Active Duty`;

  return (
    <div className="deno-admin-stats-grid">
      {/* 1. Pending Allocation Card */}
      <div className="deno-stat-card card-amber">
        <div className="deno-stat-card-header">
          <span className="deno-stat-title">Pending Allocation</span>
          <div className="deno-stat-icon-wrap amber-glow">
            <UserCheck size={18} />
          </div>
        </div>
        <div className="deno-stat-card-body">
          <span className="deno-stat-big-val">{pendingCount}</span>
          <div className="deno-stat-status-row">
            <span className="stat-bullet amber-bullet" />
            <span className="stat-desc">Requires Driver Match</span>
          </div>
        </div>
      </div>

      {/* 2. Dispatched / Active Card */}
      <div className="deno-stat-card card-emerald">
        <div className="deno-stat-card-header">
          <span className="deno-stat-title">Dispatched / Active</span>
          <div className="deno-stat-icon-wrap emerald-glow">
            <Send size={18} />
          </div>
        </div>
        <div className="deno-stat-card-body">
          <span className="deno-stat-big-val">{activeCount}</span>
          <div className="deno-stat-status-row">
            <span className="stat-bullet emerald-bullet" />
            <span className="stat-desc">En-Route on Expressways</span>
          </div>
        </div>
      </div>

      {/* 3. Total Value Today Card */}
      <div className="deno-stat-card card-cyan">
        <div className="deno-stat-card-header">
          <span className="deno-stat-title">Total Value Today</span>
          <div className="deno-stat-icon-wrap cyan-glow">
            <Banknote size={18} />
          </div>
        </div>
        <div className="deno-stat-card-body">
          <div className="deno-stat-currency-val">
            <span className="stat-currency-label">LKR</span>
            <span className="deno-stat-big-val currency">{formattedLKR}</span>
          </div>
          <div className="deno-stat-status-row">
            <span className="stat-desc cyan-text">≈ ${formattedUSD} USD</span>
          </div>
        </div>
      </div>

      {/* 4. Fleet Readiness Card */}
      <div className="deno-stat-card card-purple">
        <div className="deno-stat-card-header">
          <span className="deno-stat-title">Fleet Readiness</span>
          <div className="deno-stat-icon-wrap purple-glow">
            <CarFront size={18} />
          </div>
        </div>
        <div className="deno-stat-card-body">
          <span className="deno-stat-big-val">{fleetReadiness}</span>
          <div className="deno-stat-status-row">
            <span className="stat-desc">{chauffeursText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminStats;
