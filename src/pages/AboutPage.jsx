import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Award, Compass, Play, Zap, Globe, Target } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page-container">
      {/* 1. HERO BANNER */}
      <section className="about-hero">
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <h1 className="about-hero-title">Our Legacy of Excellence</h1>
          <p className="about-hero-subtitle">
            Providing premiere luxury transport in Sri Lanka since 2020. Where every journey is crafted with meticulous attention to detail and unwavering commitment to your comfort.
          </p>
        </div>
      </section>

      {/* 2. THE JOURNEY TO PREMIUM */}
      <section className="about-journey-section">
        <div className="about-section-container">
          <div className="about-journey-grid">
            <div className="journey-text-col">
              <h2 className="about-section-title">The Journey to Premium</h2>
              <p className="about-text-paragraph">
                Deno Cabs & Tours began with a singular vision: to elevate the standard of private transportation in Sri Lanka. We recognized a need for a service that goes beyond merely moving from point A to point B—a service that embodies reliability, executive comfort, and absolute discretion.
              </p>
              <p className="about-text-paragraph">
                Today, we stand as the premier choice for corporate executives, high-end travelers, and those who demand the finest. Our commitment to excellence is reflected in our meticulously maintained fleet and our rigorously trained chauffeurs.
              </p>
            </div>

            <div className="journey-video-col">
              <div className="video-card-preview">
                <img
                  src="https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&q=80&w=800"
                  alt="Deno Cabs Luxury Interior"
                  className="video-preview-img"
                />
                <button className="play-button-overlay" aria-label="Play Video Preview">
                  <Play size={24} fill="#0b172a" color="#0b172a" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR JOURNEY THROUGH TIME (TIMELINE) */}
      <section className="about-timeline-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2 className="about-section-title">Our Journey Through Time</h2>
            <p className="about-section-subtitle">Milestones that define our commitment to excellence.</p>
          </div>

          <div className="about-timeline-grid">
            <div className="timeline-card">
              <div className="timeline-icon-box yellow">
                <Zap size={22} color="#0f172a" />
              </div>
              <h3 className="timeline-year">2024 Launch</h3>
              <p className="timeline-desc">
                Deno Cabs established with a vision to redefine luxury travel in Sri Lanka.
              </p>
            </div>

            <div className="timeline-card">
              <div className="timeline-icon-box">
                <Globe size={22} color="#0f172a" />
              </div>
              <h3 className="timeline-year">Fleet Expansion</h3>
              <p className="timeline-desc">
                Expanded our premium fleet to include luxury SUVs, VIP sedans, and executive vans.
              </p>
            </div>

            <div className="timeline-card">
              <div className="timeline-icon-box">
                <Award size={22} color="#0f172a" />
              </div>
              <h3 className="timeline-year">Elite Service Award</h3>
              <p className="timeline-desc">
                Recognized for outstanding hospitality and reliability by industry leaders.
              </p>
            </div>

            <div className="timeline-card">
              <div className="timeline-icon-box">
                <Target size={22} color="#0f172a" />
              </div>
              <h3 className="timeline-year">National Coverage</h3>
              <p className="timeline-desc">
                Expanded our bespoke services to cover all major regions across the island.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR CORE VALUES */}
      <section className="about-values-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2 className="about-section-title">Our Core Values</h2>
            <p className="about-section-subtitle">The pillars that uphold our standard of excellence.</p>
          </div>

          <div className="about-values-grid">
            <div className="value-card">
              <div className="value-icon-circle"><ShieldCheck size={20} color="#d97706" /></div>
              <h3>Safety & Trust</h3>
              <p>Uncompromising security and rigorous maintenance for your peace of mind.</p>
            </div>

            <div className="value-card">
              <div className="value-icon-circle"><Clock size={20} color="#d97706" /></div>
              <h3>Executive Comfort</h3>
              <p>Pristine interiors, climate control, and premium amenities tailored for relaxation.</p>
            </div>

            <div className="value-card">
              <div className="value-icon-circle"><Clock size={20} color="#d97706" /></div>
              <h3>Punctual Reliability</h3>
              <p>Meticulous planning ensures we are always on time, respecting your valuable schedule.</p>
            </div>

            <div className="value-card">
              <div className="value-icon-circle"><Compass size={20} color="#d97706" /></div>
              <h3>Local Expertise</h3>
              <p>Navigating Sri Lanka with unparalleled local knowledge for a seamless journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET OUR ELITE CHAUFFEURS */}
      <section className="about-chauffeurs-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2 className="about-section-title">Meet Our Elite Chauffeurs</h2>
            <p className="about-section-subtitle">
              These distinguished professionals behind the wheel, ensuring your journey is nothing short of exceptional.
            </p>
          </div>

          <div className="about-chauffeurs-grid">
            {/* Driver 1 */}
            <div className="chauffeur-card">
              <div className="chauffeur-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
                  alt="Rajitha Silva"
                />
                <div className="chauffeur-overlay-badge">
                  <strong>Rajitha Silva</strong>
                  <span>10 Years Experience</span>
                </div>
              </div>
              <div className="chauffeur-quote-box">
                <p>"My priority is not just reaching the destination, but crafting a refined experience from the moment you step inside."</p>
              </div>
            </div>

            {/* Driver 2 */}
            <div className="chauffeur-card">
              <div className="chauffeur-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"
                  alt="Nuwan Perera"
                />
                <div className="chauffeur-overlay-badge">
                  <strong>Nuwan Perera</strong>
                  <span>8 Years Experience</span>
                </div>
              </div>
              <div className="chauffeur-quote-box">
                <p>"Anticipating a client's needs before they even speak—that is the trademark of elite service."</p>
              </div>
            </div>

            {/* Driver 3 */}
            <div className="chauffeur-card">
              <div className="chauffeur-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
                  alt="Kamal Fernando"
                />
                <div className="chauffeur-overlay-badge">
                  <strong>Kamal Fernando</strong>
                  <span>12 Years Experience</span>
                </div>
              </div>
              <div className="chauffeur-quote-box">
                <p>"Every journey is a promise of safety, discretion, and absolute tranquility for my passengers."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUSTED BY INDUSTRY LEADERS */}
      <section className="about-trust-section">
        <div className="about-section-container">
          <span className="trust-kicker">TRUSTED BY INDUSTRY LEADERS</span>
          <div className="trust-logos-row">
            <span className="trust-logo">ApexCorp</span>
            <span className="trust-logo">GlobalTech</span>
            <span className="trust-logo">HorizonHotels</span>
            <span className="trust-logo">ZephyrGroup</span>
            <span className="trust-logo">Meridian</span>
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="about-cta-section">
        <div className="about-section-container">
          <div className="about-cta-box">
            <h2>Ready for an Elite Experience?</h2>
            <p>Experience the pinnacle of luxury transport in Sri Lanka. Reserve your vehicle today.</p>
            <Link to="/hire" className="about-cta-btn">
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
