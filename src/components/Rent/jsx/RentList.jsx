import React, { useState } from 'react';
import RentCard from './RentCard';
import { useAuth } from '../../../context/AuthContext';
import '../css/RentList.css';

const RENTALS_DATA = [
  {
    id: 'r1',
    name: 'Mercedes-Benz E-Class E200',
    category: 'Executive Sedan',
    dailyRate: 38000,
    passengers: 4,
    transmission: 'Automatic',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'r2',
    name: 'Toyota Land Cruiser Prado TRJ150',
    category: 'Luxury SUV',
    dailyRate: 32000,
    passengers: 7,
    transmission: 'Automatic Tiptronic',
    fuel: 'Petrol / Diesel',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'r3',
    name: 'Toyota KDH Super GL Dark Prime',
    category: 'Luxury Van',
    dailyRate: 26000,
    passengers: 10,
    transmission: 'Automatic',
    fuel: 'Diesel Turbo',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'r4',
    name: 'Mitsubishi Montero Sport',
    category: 'Luxury SUV',
    dailyRate: 28000,
    passengers: 7,
    transmission: 'Automatic 8-Speed',
    fuel: 'Diesel',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'r5',
    name: 'Toyota Premio F-Ex Package',
    category: 'Midsize Sedan',
    dailyRate: 18000,
    passengers: 5,
    transmission: 'Automatic CVT',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'r6',
    name: 'Toyota Raize Turbo Compact SUV',
    category: 'Compact SUV',
    dailyRate: 16000,
    passengers: 5,
    transmission: 'Automatic',
    fuel: 'Petrol Turbo',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600'
  }
];

const RentList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [rentModalCar, setRentModalCar] = useState(null);
  const [rentalSuccess, setRentalSuccess] = useState(false);

  const categories = ['All', 'Executive Sedan', 'Luxury SUV', 'Luxury Van', 'Compact SUV'];

  const filtered = activeTab === 'All'
    ? RENTALS_DATA
    : RENTALS_DATA.filter((item) => item.category === activeTab);

  const handleConfirmRental = (e) => {
    e.preventDefault();
    setRentalSuccess(true);
  };

  return (
    <div className="rent-list-section">
      <div className="rent-list-container">
        <div className="rent-list-header">
          <h2 className="rent-list-title">Explore Premium Vehicle Fleet</h2>
          <p className="rent-list-subtitle">
            Available for daily, weekly, or monthly self-drive & chauffeur rentals.
          </p>

          <div className="rent-list-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`rent-tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rent-list-grid">
          {filtered.map((car) => (
            <RentCard key={car.id} car={car} onRentClick={(c) => setRentModalCar(c)} />
          ))}
        </div>

        {/* Modal for Renting car when logged in */}
        {rentModalCar && (
          <div className="rent-booking-overlay">
            <div className="rent-booking-modal">
              <button className="rent-modal-close" onClick={() => { setRentModalCar(null); setRentalSuccess(false); }}>✕</button>

              {rentalSuccess ? (
                <div className="rent-modal-success">
                  <h3>Rental Reservation Submitted!</h3>
                  <p>Thank you <strong>{user?.fullName}</strong>. Our fleet agent will deliver the <strong>{rentModalCar.name}</strong> to your location.</p>
                  <button className="rent-modal-done-btn" onClick={() => { setRentModalCar(null); setRentalSuccess(false); }}>Done</button>
                </div>
              ) : (
                <form onSubmit={handleConfirmRental}>
                  <h3>Reserve {rentModalCar.name}</h3>
                  <p className="rent-modal-sub">Daily rate: <strong>LKR {rentModalCar.dailyRate.toLocaleString()}</strong></p>

                  <div className="rent-modal-field">
                    <label>Rental Type</label>
                    <select className="rent-modal-input">
                      <option>Self-Drive (Includes Full Insurance)</option>
                      <option>With Chauffeur (+ LKR 3,500/day driver fee)</option>
                    </select>
                  </div>

                  <div className="rent-modal-grid-2">
                    <div className="rent-modal-field">
                      <label>Start Date</label>
                      <input type="date" className="rent-modal-input" required />
                    </div>
                    <div className="rent-modal-field">
                      <label>Rental Duration</label>
                      <select className="rent-modal-input">
                        <option>1 Day</option>
                        <option>3 Days</option>
                        <option>7 Days (10% Discount)</option>
                        <option>30 Days (Monthly Rate)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="rent-modal-confirm-btn">Confirm Rental Request</button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentList;
