import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import HireBooking from './models/HireBooking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deno_cabs_db';

const targetRefs = [
  '#DENO-000-000-003',
  'DENO-000-000-003',
  '#DENO-85556',
  'DENO-85556',
  '#DENO-85712',
  'DENO-85712'
];

async function runDelete() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB:', uri);

    const query = {
      $or: [
        { ref: { $in: targetRefs } },
        { bookingId: { $in: targetRefs } },
        { id: { $in: targetRefs } },
        { ref: { $regex: /85556|85712|000-000-003/i } },
        { bookingId: { $regex: /85556|85712|000-000-003/i } }
      ]
    };

    const found = await HireBooking.find(query);
    console.log(`Found ${found.length} matching booking(s):`);
    found.forEach(b => {
      console.log(` - ID: ${b._id}, Ref: ${b.ref}, BookingId: ${b.bookingId}, Customer: ${b.customer?.name || b.fullName || 'Guest'}`);
    });

    const result = await HireBooking.deleteMany(query);
    console.log(`🗑️ Successfully deleted ${result.deletedCount} booking(s) from MongoDB.`);

    const remaining = await HireBooking.find({}, { ref: 1, bookingId: 1 });
    console.log(`Remaining bookings in database (${remaining.length}):`, remaining.map(r => r.ref || r.bookingId));

    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('❌ Error during deletion:', err.message);
    process.exit(1);
  }
}

runDelete();
