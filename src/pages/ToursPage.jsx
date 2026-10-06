import React from 'react';
import { Clock, Compass, ShieldAlert } from 'lucide-react';
import './ToursPage.css';

const ToursPage = () => {
  return (
    <div className="tours-pending-section">
      <div className="tours-pending-card">
        <div className="tours-pending-icon-wrapper">
          <Compass size={42} className="tours-pending-icon" />
        </div>
        <span className="tours-pending-badge">
          <Clock size={14} /> STATUS: IN PROGRESS
        </span>
        <h1 className="tours-pending-title">Development Pending</h1>
        <p className="tours-pending-desc">
          The <strong>Tours Section</strong> is currently under active development. Curated island package reservations will be available soon!
        </p>
      </div>
    </div>
  );
};

export default ToursPage;
