import React from 'react';
import { ArrowRight } from 'lucide-react';
import '../css/FeaturedVehicle.css';

const FeaturedVehicle = ({ onHireClick }) => {
  return (
    <section className="hire-featured-section">
      <div className="hire-featured-container">
        <h2 className="hire-featured-heading">Featured Vehicles</h2>

        <div className="hire-featured-card">
          <div className="hire-featured-image-col">
            <img
              src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=900"
              alt="Toyota Land Cruiser V8"
              className="hire-featured-img"
            />
          </div>

          <div className="hire-featured-info-col">
            <span className="hire-featured-badge">PREMIUM SUV</span>
            <h3 className="hire-featured-title">Toyota Land Cruiser V8</h3>
            <p className="hire-featured-desc">
              Uncompromising luxury meets rugged capacity. Perfect for both city executives and cross-country adventures.
            </p>

            <div className="hire-featured-specs-row">
              <div className="hire-featured-spec-item">
                <span className="spec-label">Passengers</span>
                <strong className="spec-value">7 Seats</strong>
              </div>
              <div className="hire-featured-spec-item">
                <span className="spec-label">Luggage</span>
                <strong className="spec-value">4 Large</strong>
              </div>
            </div>

            <button
              className="hire-featured-book-btn"
              onClick={() => onHireClick && onHireClick('Toyota Land Cruiser V8')}
            >
              Book Now +
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedVehicle;
