import React from 'react';
import { ShieldCheck, Clock, Award, Tag } from 'lucide-react';
import '../css/WhyChoose.css';

const WhyChoose = () => {
  const features = [
    {
      icon: <ShieldCheck size={24} color="#f59e0b" />,
      title: 'Safety First',
      desc: 'Regularly maintained vehicles and strict safety protocols.'
    },
    {
      icon: <Clock size={24} color="#f59e0b" />,
      title: '24/7 Support',
      desc: 'Round-the-clock assistance for a worry-free journey.'
    },
    {
      icon: <Award size={24} color="#f59e0b" />,
      title: 'Pro Chauffeurs',
      desc: 'Experienced, multilingual, and courteous drivers.'
    },
    {
      icon: <Tag size={24} color="#f59e0b" />,
      title: 'Best Rates',
      desc: 'Transparent pricing with premium value guaranteed.'
    }
  ];

  return (
    <section className="hire-whychoose-section">
      <div className="hire-whychoose-container">
        <h2 className="hire-whychoose-heading">Why Choose Island Elite?</h2>

        <div className="hire-whychoose-grid">
          {features.map((item, idx) => (
            <div key={idx} className="hire-whychoose-card">
              <div className="whychoose-icon-box">{item.icon}</div>
              <h3 className="whychoose-card-title">{item.title}</h3>
              <p className="whychoose-card-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose;
