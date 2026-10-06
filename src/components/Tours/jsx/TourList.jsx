import React, { useState } from 'react';
import TourCard from './TourCard';
import { useAuth } from '../../../context/AuthContext';
import '../css/TourList.css';

const TOURS_DATA = [
  {
    id: 't1',
    title: 'Sigiriya Rock & Kandy Cultural Heritage Tour',
    duration: '2 Days / 1 Night',
    locations: 'Sigiriya • Dambulla • Kandy',
    rating: 4.9,
    reviewsCount: 128,
    price: 45000,
    description: 'Conquer ancient Sigiriya lion rock, visit Dambulla cave temple, and experience the Sacred Temple of the Tooth Relic in hill capital Kandy.',
    highlights: ['Sigiriya Fortress Hike', 'Golden Temple Dambulla', 'Kandy Lake & Cultural Show', 'Luxury Chauffeur SUV'],
    image: 'https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 't2',
    title: 'Ella Tea Trails & Nine Arch Bridge Wonder',
    duration: '3 Days / 2 Nights',
    locations: 'Nuwara Eliya • Ella • Haputale',
    rating: 4.95,
    reviewsCount: 210,
    price: 68000,
    description: 'Ride scenic mountain passes, witness majestic waterfalls, photograph Nine Arch Bridge, and sample world-famous Ceylon tea at high altitude.',
    highlights: ['Nine Arch Bridge', 'Little Adam’s Peak', 'Tea Factory Tasting', 'Scenery Drive in Prado'],
    image: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 't3',
    title: 'Yala Wild Safari & Mirissa Coast Odyssey',
    duration: '2 Days / 1 Night',
    locations: 'Yala National Park • Mirissa • Galle',
    rating: 4.88,
    reviewsCount: 94,
    price: 52000,
    description: 'Thrill in leopard and elephant safaris in Yala, stroll UNESCO Galle Fort ramparts, and relax on coconut tree beach in Mirissa.',
    highlights: ['4x4 Yala Safari Jeep', 'Galle Fort Sunset Walk', 'Whale Watching option', 'VIP Transfer'],
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 't4',
    title: 'Ultimate 7-Day Island Grand Discovery Tour',
    duration: '7 Days / 6 Nights',
    locations: 'Colombo • Sigiriya • Kandy • Ella • Yala • Galle',
    rating: 5.0,
    reviewsCount: 88,
    price: 185000,
    description: 'The definitive Sri Lanka round-trip. Cultural triangle, misty tea country, wild safaris, and pristine southern beaches with a dedicated chauffeur guide.',
    highlights: ['Complete Round-trip', 'Dedicated Driver Guide', 'Flexibility on stops', 'Unlimited mileage'],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600'
  }
];

const TourList = () => {
  const { user, triggerLoginRequiredAlert } = useAuth();
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookedNotice, setBookedNotice] = useState(false);

  const handleBookTour = (tour) => {
    if (!user) {
      triggerLoginRequiredAlert();
    } else {
      setSelectedTour(tour);
      setBookedNotice(true);
    }
  };

  return (
    <div className="tours-list-section">
      <div className="tours-list-container">
        <div className="tours-list-header">
          <h2 className="tours-list-title">Featured Curated Packages</h2>
          <p className="tours-list-subtitle">
            All tour packages include dedicated luxury vehicle, English-speaking driver guide, fuel, and toll passes.
          </p>
        </div>

        {bookedNotice && selectedTour && (
          <div className="tours-booked-banner">
            <div>
              <strong>Inquiry Received for {selectedTour.title}!</strong>
              <p>Our travel specialist will contact you on {user.phone} to finalize custom dates.</p>
            </div>
            <button className="tours-banner-close" onClick={() => setBookedNotice(false)}>Dismiss</button>
          </div>
        )}

        <div className="tours-list-grid">
          {TOURS_DATA.map((tour) => (
            <TourCard key={tour.id} tour={tour} onBookTour={handleBookTour} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TourList;
