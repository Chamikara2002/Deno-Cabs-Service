import React from 'react';
import { Star } from 'lucide-react';
import '../css/HireTestimonial.css';

const HireTestimonial = () => {
  return (
    <section className="hire-testimonial-section">
      <div className="hire-testimonial-container">
        <div className="hire-testimonial-card">
          <div className="hire-stars-row">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} fill="#ffb800" color="#ffb800" />
            ))}
          </div>
          <p className="hire-quote-text">
            "The service was impeccable. Our chauffeur was professional, and the Range Rover was pristine. Made our trip across the island truly luxurious."
          </p>
          <div className="hire-author-row">
            <div className="hire-author-avatar">JD</div>
            <div className="hire-author-info">
              <strong className="hire-author-name">James D.</strong>
              <span className="hire-author-role">Verified Client</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HireTestimonial;
