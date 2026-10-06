import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Key, Compass, ArrowRight } from 'lucide-react';
import './MainLandingPage.css';

const MainLandingPage = () => {
  const { user, triggerLoginRequiredAlert } = useAuth();
  const navigate = useNavigate();

  const handleHireClick = (e) => {
    e.preventDefault();
    if (!user) {
      triggerLoginRequiredAlert();
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* HERO BANNER */}
      <section className="landing-hero-section">
        <div className="landing-hero-overlay"></div>
        <div className="landing-hero-container">
          {/* Subtle UI Overlay Card (Left) */}
          <div className="landing-widget-card left">
            <span className="widget-title">Service Selection</span>
            <span className="widget-user">Welcome, Rohan!</span>
            <span className="widget-date">Oct 26, 5:30 PM</span>
            <div className="widget-mini-item">
              <span>✈️ Airport Transfer</span>
              <strong>LKR 9500</strong>
            </div>
          </div>

          {/* Center Content */}
          <div className="landing-hero-center">
            <h1 className="landing-hero-title">
              Premium Travel in Sri Lanka
            </h1>
            <p className="landing-hero-subtitle">
              Experience unparalleled comfort and reliability with our fleet of luxury vehicles for hires, rentals, and curated island tours.
            </p>
            <div className="landing-hero-action">
              <button className="landing-book-ride-btn" onClick={handleHireClick}>
                Book a Ride <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Bottom UI Cards Row */}
          <div className="landing-bottom-ui-cards">
            <div className="bottom-mini-card">
              <span>Airport Transfer</span>
              <strong>LKR 9500</strong>
            </div>
            <div className="bottom-mini-card">
              <span>City Tour</span>
              <strong>LKR 12000</strong>
            </div>
            <div className="bottom-mini-card active">
              <span>Coastal Drive</span>
              <strong>Mercedes S-Class</strong>
            </div>
            <div className="bottom-mini-card highlight">
              <span>Book Now</span>
              <strong>LKR 18500</strong>
            </div>
          </div>
        </div>
      </section>

      {/* SELECT YOUR SERVICE SECTION */}
      <section className="landing-service-section">
        <div className="landing-service-container">
          <div className="landing-service-header">
            <h2 className="landing-service-title">Select Your Service</h2>
            <p className="landing-service-subtitle">
              Choose from our range of premium transportation options tailored to your needs.
            </p>
          </div>

          <div className="landing-service-cards-grid">
            {/* CARD 1: HIRE SECTION */}
            <div className="landing-card-box">
              <div className="landing-card-image-container">
                <img
                  src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600"
                  alt="Hire Section Chauffeur"
                  className="landing-card-img"
                />
              </div>
              <div className="landing-card-body">
                <div className="landing-card-title-row">
                  <span className="landing-card-badge-icon"><Car size={18} /></span>
                  <h3 className="landing-card-heading">Hire</h3>
                </div>
                <p className="landing-card-description">
                  Point-to-point drops and city transfers with our professional chauffeurs. Reliable, punctual, and comfortable.
                </p>
                <button className="landing-card-btn dark-btn" onClick={handleHireClick}>
                  Explore Hire Section
                </button>
              </div>
            </div>

            {/* CARD 2: VEHICLE RENT SECTION */}
            <div className="landing-card-box">
              <div className="landing-card-image-container">
                <img
                  src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600"
                  alt="Vehicle Rent Fleet"
                  className="landing-card-img"
                />
              </div>
              <div className="landing-card-body">
                <div className="landing-card-title-row">
                  <span className="landing-card-badge-icon"><Key size={18} /></span>
                  <h3 className="landing-card-heading">Vehicle Rent</h3>
                </div>
                <p className="landing-card-description">
                  Self-drive or chauffeur-driven rentals for longer durations. Choose from our diverse premium fleet.
                </p>
                <Link to="/rent" className="landing-card-btn outline-btn">
                  View Fleet
                </Link>
              </div>
            </div>

            {/* CARD 3: TOURS SECTION */}
            <div className="landing-card-box">
              <div className="landing-card-image-container">
                <img
                  src="https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=600"
                  alt="Tours Package"
                  className="landing-card-img"
                />
              </div>
              <div className="landing-card-body">
                <div className="landing-card-title-row">
                  <span className="landing-card-badge-icon"><Compass size={18} /></span>
                  <h3 className="landing-card-heading">Tours</h3>
                </div>
                <p className="landing-card-description">
                  Curated package tours across Sri Lanka's cultural and scenic hotspots with knowledgeable driver-guides.
                </p>
                <Link to="/tours" className="landing-card-btn outline-btn">
                  Explore Packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainLandingPage;
