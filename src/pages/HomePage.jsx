import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, Key, Compass, ArrowRight, Star } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('point');

  return (
    <div className="home-page-container">
      {/* 1. HERO BANNER WITH BOOK YOUR RIDE FORM */}
      <section className="home-hero">
        <div className="home-hero-overlay" />
        <div className="home-hero-container">
          <div className="home-hero-grid">
            {/* Hero Text */}
            <div className="home-hero-text">
              <span className="home-hero-badge">PREMIUM TRANSPORTATION IN SRI LANKA</span>
              <h1 className="home-hero-title">Elevating Every Journey</h1>
              <p className="home-hero-desc">
                Experience Sri Lanka's finest luxury fleet, customized chauffeur hires, curated island tours, and self-drive rentals with guaranteed punctuality and comfort.
              </p>
            </div>

            {/* Floating Form Card: Book Your Ride */}
            <div className="home-hero-form-card">
              <div className="form-card-header">
                <span className="form-card-pill">⚡ Book Your Ride</span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); navigate('/hire'); }} className="home-book-form">
                <div className="home-input-group">
                  <label>PICKUP LOCATION</label>
                  <div className="home-input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input type="text" placeholder="Enter pickup location or airport" required />
                  </div>
                </div>

                <div className="home-input-group">
                  <label>DROP-OFF DESTINATION</label>
                  <div className="home-input-wrapper">
                    <MapPin size={16} className="input-icon" />
                    <input type="text" placeholder="Enter drop-off destination" required />
                  </div>
                </div>

                <div className="home-form-row-2">
                  <div className="home-input-group">
                    <label>DATE</label>
                    <div className="home-input-wrapper">
                      <Calendar size={16} className="input-icon" />
                      <input type="date" required />
                    </div>
                  </div>

                  <div className="home-input-group">
                    <label>TIME</label>
                    <div className="home-input-wrapper">
                      <Clock size={16} className="input-icon" />
                      <input type="time" required />
                    </div>
                  </div>
                </div>

                {/* Service Type Selector */}
                <div className="home-service-type-pills">
                  <button
                    type="button"
                    className={`service-pill ${serviceType === 'point' ? 'active' : ''}`}
                    onClick={() => setServiceType('point')}
                  >
                    Point to Point
                  </button>
                  <button
                    type="button"
                    className={`service-pill ${serviceType === 'hourly' ? 'active' : ''}`}
                    onClick={() => setServiceType('hourly')}
                  >
                    Hourly
                  </button>
                  <button
                    type="button"
                    className={`service-pill ${serviceType === 'day' ? 'active' : ''}`}
                    onClick={() => setServiceType('day')}
                  >
                    Day Tour
                  </button>
                </div>

                <button type="submit" className="home-form-submit-btn">
                  Calculate & Continue <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTEGRATED TRAVEL SERVICES SECTION */}
      <section className="home-services-section">
        <div className="home-section-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Integrated Travel Services</h2>
            <p className="home-section-subtitle">
              Tailored luxury transport solutions designed for corporate executives, holiday travelers, and island explorers.
            </p>
          </div>

          <div className="home-services-grid">
            {/* Card 1: Point to Point Hire */}
            <div className="home-service-card">
              <div className="service-icon-box">
                <Car size={26} color="#0f172a" />
              </div>
              <h3 className="service-card-title">Point-to-Point Hire</h3>
              <p className="service-card-desc">
                Direct transfers between any two points in Sri Lanka with dedicated chauffeur. Reliable, punctual, and comfortable.
              </p>
              <Link to="/hire" className="service-link-btn primary-yellow">
                Explore Hire Section
              </Link>
            </div>

            {/* Card 2: Curated Tours */}
            <div className="home-service-card featured">
              <span className="featured-pill-tag">FEATURED</span>
              <div className="service-icon-box gold">
                <Compass size={26} color="#0f172a" />
              </div>
              <h3 className="service-card-title">Curated Tours</h3>
              <p className="service-card-desc">
                Handcrafted multi-day tour packages covering Sri Lanka's top heritage sites & beaches with professional driver-guides.
              </p>
              <Link to="/tours" className="service-link-btn">
                Explore Packages
              </Link>
            </div>

            {/* Card 3: Vehicle Rent */}
            <div className="home-service-card">
              <div className="service-icon-box">
                <Key size={26} color="#0f172a" />
              </div>
              <h3 className="service-card-title">Vehicle Rent</h3>
              <p className="service-card-desc">
                Self-drive or long-term vehicle rentals from our modern fleet with flexible plans and 24/7 telemetry support.
              </p>
              <Link to="/rent" className="service-link-btn">
                View Fleet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PERSONALIZED RIDE SECTION */}
      <section className="home-personalized-section">
        <div className="home-section-container">
          <div className="home-personalized-grid">
            <div className="personalized-text-col">
              <h2 className="personalized-title">Personalized Ride</h2>
              <p className="personalized-desc">
                Whether you require an executive airport drop, a wedding motorcade, or a multi-day island excursion, our fleet is tailored to meet your exacting standards of comfort and punctuality.
              </p>
              <Link to="/hire" className="personalized-action-btn">
                Explore Fleet & Pricing <ArrowRight size={18} />
              </Link>
            </div>
            <div className="personalized-img-col">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800"
                alt="Personalized Luxury Ride"
                className="personalized-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREMIUM FLEET SECTION */}
      <section className="home-fleet-section">
        <div className="home-section-container">
          <div className="home-section-header left">
            <h2 className="home-section-title">Premium Fleet</h2>
            <p className="home-section-subtitle">
              The ultimate vehicle line-up built for safety, elegance, and reliability.
            </p>
          </div>

          <div className="home-fleet-grid">
            <div className="fleet-featured-banner">
              <img
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800"
                alt="Premium Fleet Quality"
                className="fleet-banner-img"
              />
              <div className="fleet-banner-overlay">
                <h3>Uncompromising Quality Across All Classes</h3>
              </div>
            </div>

            <div className="fleet-cards-list">
              <div className="fleet-mini-card">
                <img
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400"
                  alt="Mercedes-Benz S-Class"
                />
                <div className="mini-card-info">
                  <strong>Mercedes-Benz S-Class</strong>
                  <span>VIP Sedan</span>
                </div>
              </div>

              <div className="fleet-mini-card">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"
                  alt="Toyota Land Cruiser"
                />
                <div className="mini-card-info">
                  <strong>Toyota Land Cruiser</strong>
                  <span>Luxury SUV</span>
                </div>
              </div>

              <div className="fleet-mini-card">
                <img
                  src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=400"
                  alt="Mitsubishi Montero"
                />
                <div className="mini-card-info">
                  <strong>Mitsubishi Montero</strong>
                  <span>Executive SUV</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="home-testimonials-section">
        <div className="home-section-container">
          <div className="home-section-header">
            <span className="section-kicker">WHAT OUR CLIENTS SAY</span>
            <h2 className="home-section-title white">Trusted by Thousands of Travelers</h2>
          </div>

          <div className="home-testimonials-grid">
            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb800" color="#ffb800" />)}
              </div>
              <p className="testimonial-quote">
                "Outstanding service! The Land Cruiser V8 was immaculate and our driver was always 10 minutes early."
              </p>
              <span className="testimonial-author">- Arthur P., UK</span>
            </div>

            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb800" color="#ffb800" />)}
              </div>
              <p className="testimonial-quote">
                "Most seamless transfer experience in Sri Lanka. High standards of safety and comfort."
              </p>
              <span className="testimonial-author">- David M., Australia</span>
            </div>

            <div className="testimonial-card">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#ffb800" color="#ffb800" />)}
              </div>
              <p className="testimonial-quote">
                "We booked a 7-day tour across Sri Lanka. The vehicle and chauffeur exceeded our expectations."
              </p>
              <span className="testimonial-author">- Christina S., Canada</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRAVEL NEWS SECTION */}
      <section className="home-news-section">
        <div className="home-section-container">
          <div className="home-section-header">
            <span className="section-kicker">TRAVEL NEWS</span>
            <h2 className="home-section-title">Insights for Your Journey</h2>
          </div>

          <div className="home-news-grid">
            <div className="news-card">
              <img
                src="https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=400"
                alt="Top Luxury Routes"
              />
              <div className="news-card-body">
                <span className="news-tag">DESTINATION GUIDE</span>
                <h4>Top Luxury Routes in Sri Lanka</h4>
                <p>Discover the scenic highways connecting Colombo to Kandy and the Southern Coast.</p>
              </div>
            </div>

            <div className="news-card">
              <img
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"
                alt="Chauffeur Benefits"
              />
              <div className="news-card-body">
                <span className="news-tag">TRAVEL TIPS</span>
                <h4>Why Choose a Chauffeur for Your Hill Country Tour</h4>
                <p>Relax and enjoy tea estate panoramas while professional drivers handle mountainous curves.</p>
              </div>
            </div>

            <div className="news-card">
              <img
                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400"
                alt="Fleet 2026"
              />
              <div className="news-card-body">
                <span className="news-tag">FLEET UPDATE</span>
                <h4>Expanding Our Premium Fleet for 2026</h4>
                <p>Learn about our latest luxury hybrid SUVs and VIP executive vans added to our lineup.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="home-cta-banner">
        <div className="home-section-container">
          <div className="home-cta-box">
            <h2>Ready for an Elite Experience?</h2>
            <p>Experience the pinnacle of luxury transport in Sri Lanka. Reserve your vehicle today.</p>
            <Link to="/hire" className="home-cta-btn">
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
