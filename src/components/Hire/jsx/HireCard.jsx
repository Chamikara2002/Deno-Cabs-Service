import React from 'react';
import { ArrowRight, Car } from 'lucide-react';
import '../css/HireCard.css';

const HireCard = ({ vehicle, onHireClick }) => {
  return (
    <div className="hire-card-item">
      <div className="hire-card-image-box">
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.name} className="hire-card-img" />
        ) : (
          <div className="hire-card-placeholder">
            <Car size={32} color="#94a3b8" />
          </div>
        )}
      </div>

      <div className="hire-card-body">
        <h4 className="hire-card-name">{vehicle.name}</h4>

        <div className="hire-card-overview-box">
          <span className="overview-label">OVERVIEW</span>
          <div className="overview-row">
            <span className="row-key">Type:</span>
            <span className="row-val">{vehicle.type}</span>
          </div>
          <div className="overview-row">
            <span className="row-key">Brand:</span>
            <span className="row-val">{vehicle.brand}</span>
          </div>
          <div className="overview-row">
            <span className="row-key">Model:</span>
            <span className="row-val">{vehicle.model}</span>
          </div>
        </div>

        <button
          className="hire-card-action-btn"
          onClick={() => onHireClick && onHireClick(vehicle.name)}
        >
          Hire Now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default HireCard;
