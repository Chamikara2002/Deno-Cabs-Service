import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Globe, Youtube, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="deno-footer-section">
      <div className="deno-footer-container">
        <div className="deno-footer-grid">
          {/* Brand Info */}
          <div className="deno-footer-brand">
            <div className="deno-footer-logo">
              <div className="deno-footer-emblem">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="46" stroke="#D4AF37" strokeWidth="3" fill="#0B172A" />
                  <circle cx="50" cy="50" r="42" stroke="#D4AF37" strokeWidth="1" strokeDasharray="4 2" />
                  <path d="M30 45 Q50 35 70 45 L65 60 Q50 65 35 60 Z" fill="#FFB800" />
                  <circle cx="40" cy="60" r="5" fill="#1E293B" />
                  <circle cx="60" cy="60" r="5" fill="#1E293B" />
                  <text x="50" y="76" textAnchor="middle" fill="#D4AF37" fontSize="8" fontWeight="bold">DENO CABS</text>
                  <text x="50" y="84" textAnchor="middle" fill="#D4AF37" fontSize="6">CABS & TOURS</text>
                </svg>
              </div>
            </div>
            <p className="deno-footer-about">
              Founded on punctuality and premium hospitality, Deno Cabs & Tours is your ultimate travel partner in Sri Lanka. From corporate travel and bespoke island tours to premium vehicle rentals, we ensure a seamless and unforgettable journey.
            </p>
          </div>

          {/* Quick Links */}
          <div className="deno-footer-col">
            <h4 className="deno-footer-title">Quick Links</h4>
            <ul className="deno-footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/rent">Car Rentals</Link></li>
              <li><Link to="/hire">Features</Link></li>
              <li><Link to="/tours">Packages</Link></li>
              <li><Link to="/about">Contact</Link></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="deno-footer-col">
            <h4 className="deno-footer-title">Social Media Links</h4>
            <div className="deno-footer-social-icons">
              <a href="#fb" className="deno-footer-social-btn" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#insta" className="deno-footer-social-btn" aria-label="Instagram"><Globe size={18} /></a>
              <a href="#yt" className="deno-footer-social-btn" aria-label="Youtube"><Youtube size={18} /></a>
              <a href="#tw" className="deno-footer-social-btn" aria-label="Twitter"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Contact Us */}
          <div className="deno-footer-col">
            <h4 className="deno-footer-title">Contact Us.</h4>
            <div className="deno-footer-contact-info">
              <div className="deno-footer-contact-block">
                <strong>Address:</strong>
                <p>No 33, Galle Road, Colombo.</p>
              </div>
              <div className="deno-footer-contact-block">
                <strong>Phone:</strong>
                <p>+9475 876 5674</p>
              </div>
              <div className="deno-footer-contact-block">
                <strong>Email:</strong>
                <p>denocabstours@gmail.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="deno-footer-copyright">
          <p>© 2026 Deno Cabs and Tours. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
