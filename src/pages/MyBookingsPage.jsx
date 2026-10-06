import React, { useState } from 'react';
import HireList from '../components/Hire/jsx/HireList';
import HireBookingModal from '../components/Hire/jsx/HireBookingModal';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleHireClick = (vehicleName) => {
    setSelectedVehicle(vehicleName || null);
    setIsModalOpen(true);
  };

  return (
    <div className="mybookings-page-section">
      {/* Fleet Catalog Grid (Image 1) */}
      <div className="mybookings-fleet-section">
        <HireList onHireClick={handleHireClick} showTitle={false} />
      </div>

      {/* Step-by-Step Hire Booking Modal */}
      <HireBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedVehicle={selectedVehicle}
      />
    </div>
  );
};

export default MyBookingsPage;
