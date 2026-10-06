import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    driverId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      default: 4.9
    },
    licenseClass: {
      type: String,
      default: 'Class A Heavy / Dual Protocol',
      trim: true
    },
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'On Duty', 'Standby', 'Off Duty']
    },
    assignedVehiclePlate: {
      type: String,
      default: ''
    },
    locationHub: {
      type: String,
      default: 'Colombo 03 Hub'
    }
  },
  {
    timestamps: true
  }
);

export const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
