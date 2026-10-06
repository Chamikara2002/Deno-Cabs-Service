import React from 'react';
import { Clock, MapPin, Star, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import '../css/TourCard.css';

const TourCard = ({ tour, onBookTour }) => {
  return (
    <div className="tours-card-item">
      <div className="tours-card-badge-duration">
        <Clock size={14} /> {tour.duration}
      </div>

      <div className="tours-card-image-wrapper">
        <img src={tour.image} alt={tour.title} className="tours-card-img" />
        <div className="tours-card-rating">
          <Star size={14} fill="#f5b700" color="#f5b700" /> {tour.rating} ({tour.reviewsCount})
        </div>
      </div>

      <div className="tours-card-body">
        <div className="tours-card-loc">
          <MapPin size={14} className="tours-loc-icon" /> {tour.locations}
        </div>
        <h3 className="tours-card-title">{tour.title}</h3>
        <p className="tours-card-desc">{tour.description}</p>

        <div className="tours-card-highlights">
          {tour.highlights.map((item, idx) => (
            <span key={idx} className="tours-chip">
              ✓ {item}
            </span>
          ))}
        </div>

        <div className="tours-card-footer">
          <div className="tours-card-pricing">
            <span className="tours-price-label">All-Inclusive Tour</span>
            <strong className="tours-price-val">LKR {tour.price.toLocaleString()}</strong>
            <span className="tours-per-person">per vehicle (up to 4 pax)</span>
          </div>

          <button className="tours-card-book-btn" onClick={() => onBookTour(tour)}>
            Book Package <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourCard;
