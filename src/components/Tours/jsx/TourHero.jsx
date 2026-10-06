import React from 'react';
import { Compass, Sun, Map, Sparkles } from 'lucide-react';
import '../css/TourHero.css';

const TourHero = () => {
  return (
    <div className="tours-hero-section">
      <div className="tours-hero-container">
        <div className="tours-hero-badge">
          <Sparkles size={16} /> CURATED SRI LANKAN EXPEDITIONS & TOURS
        </div>
        <h1 className="tours-hero-title">
          Explore paradise with <span className="tours-hero-highlight">Expert Chauffeur Guides</span>
        </h1>
        <p className="tours-hero-subtitle">
          From ancient Sigiriya fortress and Kandy cultural temples to misty Nuwara Eliya tea estates and Yala safari parks. Discover Sri Lanka in total air-conditioned comfort.
        </p>

        <div className="tours-hero-highlights-row">
          <div className="tours-highlight-card">
            <Compass size={24} className="tours-highlight-icon" />
            <div>
              <strong>Customizable Itineraries</strong>
              <span>Tailored to your family & schedule</span>
            </div>
          </div>

          <div className="tours-highlight-card">
            <Sun size={24} className="tours-highlight-icon" />
            <div>
              <strong>All-Inclusive Luxury</strong>
              <span>Vehicle, fuel, driver stay & toll fees included</span>
            </div>
          </div>

          <div className="tours-highlight-card">
            <Map size={24} className="tours-highlight-icon" />
            <div>
              <strong>Island-Wide Network</strong>
              <span>Pickup from any hotel or airport</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourHero;
