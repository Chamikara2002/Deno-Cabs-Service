import React, { useState } from 'react';
import { Search } from 'lucide-react';
import HireCard from './HireCard';
import '../css/HireList.css';

const FLEET_VEHICLES = [
  {
    id: '1',
    name: 'Toyota Land Cruiser V8',
    type: 'SUV',
    brand: 'Toyota',
    model: 'Land Cruiser',
    category: 'Premium SUVs',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    name: 'Range Rover Autobiography',
    type: 'SUV',
    brand: 'Range Rover',
    model: 'Autobiography',
    category: 'Premium SUVs',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '3',
    name: 'Mercedes-Benz Sprinter',
    type: 'Van',
    brand: 'Mercedes-Benz',
    model: 'Sprinter',
    category: 'Executive Vans',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '4',
    name: 'BMW 7 Series',
    type: 'Sedan',
    brand: 'BMW',
    model: '7 Series',
    category: 'Luxury Sedans',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '5',
    name: 'Audi A8 L',
    type: 'Sedan',
    brand: 'Audi',
    model: 'A8 L',
    category: 'Luxury Sedans',
    image: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '6',
    name: 'Mitsubishi Montero',
    type: 'SUV',
    brand: 'Mitsubishi',
    model: 'Montero',
    category: 'Premium SUVs',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '7',
    name: 'Toyota Axio',
    type: 'Sedan',
    brand: 'Toyota',
    model: 'Axio',
    category: 'Luxury Sedans',
    image: null
  },
  {
    id: '8',
    name: 'Suzuki Wagon R',
    type: 'Compact',
    brand: 'Suzuki',
    model: 'Wagon R',
    category: 'Compact',
    image: null
  },
  {
    id: '9',
    name: 'Honda Vezel',
    type: 'SUV',
    brand: 'Honda',
    model: 'Vezel',
    category: 'Premium SUVs',
    image: null
  },
  {
    id: '10',
    name: 'Toyota KDH',
    type: 'Van',
    brand: 'Toyota',
    model: 'KDH',
    category: 'Executive Vans',
    image: null
  },
  {
    id: '11',
    name: 'Micro Panda',
    type: 'Compact',
    brand: 'Micro',
    model: 'Panda',
    category: 'Compact',
    image: null
  },
  {
    id: '12',
    name: 'Nissan Leaf',
    type: 'Electric Sedan',
    brand: 'Nissan',
    model: 'Leaf',
    category: 'Luxury Sedans',
    image: null
  }
];

const HireList = ({ onHireClick, showTitle = true }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Premium SUVs', 'Executive Vans', 'Luxury Sedans'];

  const filteredVehicles = FLEET_VEHICLES.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || vehicle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="hire-list-section">
      <div className="hire-list-container">
        {showTitle && <h2 className="hire-list-heading">Our Fleet</h2>}

        {/* Top Search & Filter Pill Bar */}
        <div className="hire-filter-bar">
          <div className="hire-search-input-wrapper">
            <Search size={18} className="hire-search-icon" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hire-search-input"
            />
          </div>

          <div className="hire-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`hire-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of 12 Vehicle Cards */}
        <div className="hire-grid">
          {filteredVehicles.map((vehicle) => (
            <HireCard key={vehicle.id} vehicle={vehicle} onHireClick={onHireClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HireList;
