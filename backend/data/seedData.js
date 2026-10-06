import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import HireBooking from '../models/HireBooking.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

dotenv.config();

// Clean initial state for live production deployment
export const INITIAL_SEED_BOOKINGS = [];

export const INITIAL_SEED_DRIVERS = [
  {
    driverId: 'DENO-DRV-0000001',
    fullName: 'Dinusha Chandrasena',
    phone: '+94 77 458 5471',
    rating: 4.9,
    licenseClass: 'Class A Heavy / Heavy Commercial',
    status: 'Available',
    locationHub: 'Colombo 03 Hub'
  },
  {
    driverId: 'DENO-DRV-0000002',
    fullName: 'Rohan Wickremasinghe',
    phone: '+94 71 883 4920',
    rating: 4.9,
    licenseClass: 'VIP Protocol Chauffeur',
    status: 'On Duty',
    locationHub: 'BIA Airport Lounge Hub'
  },
  {
    driverId: 'DENO-DRV-0000003',
    fullName: 'Kamal Bandara',
    phone: '+94 77 340 1822',
    rating: 4.8,
    licenseClass: 'Class A Heavy / All-Island',
    status: 'Available',
    locationHub: 'Kandy Express Hub'
  },
  {
    driverId: 'DENO-DRV-0000004',
    fullName: 'Nalaka Fernando',
    phone: '+94 77 459 9001',
    rating: 4.9,
    licenseClass: 'Hill Country Tour Specialist',
    status: 'Available',
    locationHub: 'Hatton & Nuwara Eliya Hub'
  }
];

export const INITIAL_SEED_VEHICLES = [
  {
    assetCode: '#V8-EXEC-01',
    model: 'Toyota Land Cruiser V8 (Prado Executive)',
    category: 'SUVs',
    plateNumber: 'WP CAB - 8829',
    color: 'Pearl Metallic Black',
    ratePerKm: 150,
    capacity: 7,
    status: 'Available',
    features: ['Luxury Nappa Leather', 'Dual A/C', 'Complimentary Water', '5G WiFi']
  },
  {
    assetCode: '#S-CLASS-02',
    model: 'Mercedes-Benz S-Class (Executive Sedan)',
    category: 'Cars',
    plateNumber: 'WP CAR - 4402',
    color: 'Obsidian Black',
    ratePerKm: 180,
    capacity: 4,
    status: 'Available',
    features: ['Rear Reclining Seats', 'Privacy Curtains', 'Burmester Audio', 'Champagne Chiller']
  },
  {
    assetCode: '#AXIO-01',
    model: 'Toyota Axio Premium Sedan',
    category: 'Cars',
    plateNumber: 'SG CCC 5548',
    color: 'Deep Navy Blue',
    ratePerKm: 100,
    capacity: 4,
    status: 'Available',
    features: ['High Fuel Economy', 'Comfort Ride', 'Air Conditioning', 'WiFi Hotspot']
  },
  {
    assetCode: '#MONTERO-05',
    model: 'Mitsubishi Montero Sport (Premium SUV)',
    category: 'SUVs',
    plateNumber: 'WP CBA - 7741',
    color: 'Metallic Silver',
    ratePerKm: 130,
    capacity: 7,
    status: 'Available',
    features: ['4x4 Off-road Capable', 'Spacious Cargo', 'Dual Zone Climate', 'Leather Seats']
  }
];

export const seedDatabase = async () => {
  const isConnected = await connectDB();
  if (!isConnected) {
    console.log('⚠️ Seed skipped because MongoDB is not connected.');
    return;
  }

  try {
    const existingCount = await HireBooking.countDocuments();
    if (existingCount === 0) {
      console.log('🌱 Seeding initial Hire Bookings into MongoDB...');
      await HireBooking.insertMany(INITIAL_SEED_BOOKINGS);
      console.log(`✅ Seeded ${INITIAL_SEED_BOOKINGS.length} Hire Bookings.`);
    }

    const driverCount = await Driver.countDocuments();
    if (driverCount === 0) {
      console.log('🌱 Seeding initial Drivers into MongoDB...');
      await Driver.insertMany(INITIAL_SEED_DRIVERS);
      console.log(`✅ Seeded ${INITIAL_SEED_DRIVERS.length} Drivers.`);
    }

    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('🌱 Seeding initial Vehicles into MongoDB...');
      await Vehicle.insertMany(INITIAL_SEED_VEHICLES);
      console.log(`✅ Seeded ${INITIAL_SEED_VEHICLES.length} Vehicles.`);
    }
  } catch (error) {
    console.error('❌ Error during seed:', error.message);
  }
};
