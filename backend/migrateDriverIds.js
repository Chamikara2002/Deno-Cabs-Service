import connectDB from './config/db.js';
import Driver from './models/Driver.js';
import HireBooking from './models/HireBooking.js';
import { INITIAL_SEED_DRIVERS } from './data/seedData.js';

async function run() {
  await connectDB();
  
  // Re-sync drivers with clean DENO-DRV-0000001 series
  await Driver.deleteMany({});
  await Driver.insertMany(INITIAL_SEED_DRIVERS);
  console.log('✅ Drivers collection re-seeded with DENO-DRV-0000001 series.');

  // Update existing bookings
  const res1 = await HireBooking.updateMany(
    { 'assignedDriver.driverId': 'DENO-DRV-1048' },
    { $set: { 'assignedDriver.driverId': 'DENO-DRV-0000001' } }
  );
  const res2 = await HireBooking.updateMany(
    { 'assignedDriver.driverId': 'DENO-DRV-1012' },
    { $set: { 'assignedDriver.driverId': 'DENO-DRV-0000002' } }
  );
  console.log('✅ Updated bookings driver IDs:', res1.modifiedCount, res2.modifiedCount);
  
  process.exit(0);
}

run();
