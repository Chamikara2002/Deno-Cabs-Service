import React from 'react';
import { Key, Clock } from 'lucide-react';
import './RentPage.css';

const RentPage = () => {
  return (
    <div className="rent-pending-section">
      <div className="rent-pending-card">
        <div className="rent-pending-icon-wrapper">
          <Key size={42} className="rent-pending-icon" />
        </div>
        <span className="rent-pending-badge">
          <Clock size={14} /> STATUS: IN PROGRESS
        </span>
        <h1 className="rent-pending-title">Development Pending</h1>
        <p className="rent-pending-desc">
          The <strong>Rent Section</strong> is currently under active development. Self-drive and long-term vehicle rental bookings will be available soon!
        </p>
      </div>
    </div>
  );
};

export default RentPage;
