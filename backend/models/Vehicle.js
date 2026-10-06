import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    assetCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Cars', 'SUVs', 'Vans', 'Buses', 'Luxury']
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    ratePerKm: {
      type: Number,
      required: true
    },
    capacity: {
      type: Number,
      default: 4
    },
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'In Transit', 'Maintenance', 'Reserved']
    },
    features: [{ type: String }]
  },
  {
    timestamps: true
  }
);

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
