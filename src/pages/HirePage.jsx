import React, { useState } from 'react';
import HireHero from '../components/Hire/jsx/HireHero';
import FeaturedVehicle from '../components/Hire/jsx/FeaturedVehicle';
import WhyChoose from '../components/Hire/jsx/WhyChoose';
import HireList from '../components/Hire/jsx/HireList';
import VipTravelPortal from '../components/Hire/jsx/VipTravelPortal';
import HireTestimonial from '../components/Hire/jsx/HireTestimonial';
import HireBookingModal from '../components/Hire/jsx/HireBookingModal';
import './HirePage.css';

const HirePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleHireClick = (vehicleName) => {
    setSelectedVehicle(vehicleName || null);
    setIsModalOpen(true);
  };

  return (
    <div className="hire-page-container">
      {/* 1. Hero Section: "Choose Your Elite Journey" */}
      <HireHero />

      {/* 2. Featured Vehicles Section */}
      <FeaturedVehicle onHireClick={handleHireClick} />

      {/* 3. Why Choose Island Elite? Section */}
      <WhyChoose />

      {/* 4. Our Fleet Grid Section */}
      <HireList onHireClick={handleHireClick} />

      {/* 5. VIP TRAVEL PORTAL Section */}
      <VipTravelPortal onHireClick={handleHireClick} />

      {/* 6. Customer Comment / Testimonial Quote Section */}
      <HireTestimonial />

      {/* 7. Step-by-Step Hire Booking Modal */}
      <HireBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedVehicle={selectedVehicle}
      />
    </div>
  );
};

export default HirePage;
