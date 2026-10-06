import React from 'react';
import { Key, Shield, Gauge, CheckCircle2 } from 'lucide-react';
import '../css/RentHero.css';

const RentHero = () => {
  return (
    <div className="rent-hero-section">
      <div className="rent-hero-container">
        <div className="rent-hero-badge">
          <Key size={16} /> SELF-DRIVE & CHAUFFEUR-DRIVEN VEHICLE RENTALS
        </div>
        <h1 className="rent-hero-title">
          Drive Sri Lanka in <span className="rent-hero-highlight">Unmatched Style & Comfort</span>
        </h1>
        <p className="rent-hero-subtitle">
          Choose from Sri Lanka's largest luxury rental fleet. Fully insured, mint condition sedans, SUVs, and luxury vans with unlimited mileage options for short or long-term rentals.
        </p>

        <div className="rent-hero-perks-row">
          <div className="rent-perk-box">
            <Shield size={22} className="rent-perk-icon" />
            <div>
              <strong>100% Comprehensive Insurance</strong>
              <span>Zero-liability collision coverage included</span>
            </div>
          </div>

          <div className="rent-perk-box">
            <Gauge size={22} className="rent-perk-icon" />
            <div>
              <strong>Unlimited Mileage Option</strong>
              <span>Travel without km restrictions</span>
            </div>
          </div>

          <div className="rent-perk-box">
            <CheckCircle2 size={22} className="rent-perk-icon" />
            <div>
              <strong>Airport & Hotel Delivery</strong>
              <span>Drop-off at your exact location</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentHero;
