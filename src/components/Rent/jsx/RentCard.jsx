import React from 'react';
import { Key, Users, Settings, Fuel, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import '../css/RentCard.css';

const RentCard = ({ car, onRentClick }) => {
  const { user, triggerLoginRequiredAlert } = useAuth();

  const handleRental = () => {
    if (!user) {
      triggerLoginRequiredAlert();
    } else {
      if (onRentClick) onRentClick(car);
    }
  };

  return (
    <div className="rent-card-item">
      <div className="rent-card-badge">
        <ShieldCheck size={14} /> INSURED FLEET
      </div>
      <div className="rent-card-image-box">
        <img src={car.image} alt={car.name} className="rent-card-img" />
      </div>

      <div className="rent-card-content">
        <span className="rent-card-cat">{car.category}</span>
        <h4 className="rent-card-name">{car.name}</h4>

        <div className="rent-card-specs-grid">
          <div className="rent-spec-cell"><Users size={14} /> {car.passengers} Seats</div>
          <div className="rent-spec-cell"><Settings size={14} /> {car.transmission}</div>
          <div className="rent-spec-cell"><Fuel size={14} /> {car.fuel}</div>
        </div>

        <div className="rent-card-footer">
          <div className="rent-price-box">
            <span className="rent-label">Daily Rate</span>
            <strong className="rent-amount">LKR {car.dailyRate.toLocaleString()}</strong>
            <span className="rent-sub">per 24 hours</span>
          </div>

          <button className="rent-card-action-btn" onClick={handleRental}>
            Rent Vehicle <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentCard;
