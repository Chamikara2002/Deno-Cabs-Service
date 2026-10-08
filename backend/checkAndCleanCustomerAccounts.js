import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import HireBooking from './models/HireBooking.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deno_cabs_db';

async function checkAndClean() {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB:', uri);

    // 1. Check all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // 2. Check HireBooking collection
    const targetPatterns = [/85556/i, /85712/i, /000-000-003/i, /0000003/i];
    
    for (const pattern of targetPatterns) {
      const match = await HireBooking.find({
        $or: [
          { ref: pattern },
          { bookingId: pattern },
          { id: pattern },
          { 'customer.name': pattern },
          { 'customer.accountNumber': pattern }
        ]
      });
      console.log(`Pattern ${pattern}: found ${match.length} booking(s) in HireBooking collection.`);
      if (match.length > 0) {
        const delRes = await HireBooking.deleteMany({
          $or: [
            { ref: pattern },
            { bookingId: pattern },
            { id: pattern },
            { 'customer.name': pattern },
            { 'customer.accountNumber': pattern }
          ]
        });
        console.log(` -> Deleted ${delRes.deletedCount} booking(s).`);
      }
    }

    // 3. Check Users collection
    const users = await User.find();
    console.log(`Total registered Users in database (${users.length}):`);
    users.forEach(u => {
      console.log(` - ID: ${u._id}, FullName: ${u.fullName}, Email: ${u.email}, Phone: ${u.phone}, AccountNumber: ${u.accountNumber}`);
    });

    // 4. Also check if any raw document in any collection contains these refs
    for (const coll of collections) {
      const collName = coll.name;
      const count = await mongoose.connection.db.collection(collName).countDocuments();
      console.log(`Collection "${collName}" has ${count} document(s).`);
    }

    await mongoose.disconnect();
    console.log('✅ MongoDB check complete.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAndClean();
