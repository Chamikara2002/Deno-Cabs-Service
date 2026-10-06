import mongoose from 'mongoose';

const hireBookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    ref: {
      type: String,
      required: true,
      trim: true
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer full name is required'],
        trim: true
      },
      email: {
        type: String,
        required: [true, 'Customer email address is required'],
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        required: [true, 'Customer contact phone number is required'],
        trim: true
      },
      corporate: {
        type: String,
        default: 'Individual / Guest',
        trim: true
      },
      accountTier: {
        type: String,
        default: 'Verified Guest',
        trim: true
      },
      accountNumber: {
        type: String,
        default: '',
        trim: true
      }
    },
    route: {
      pickupLocation: {
        type: String,
        required: [true, 'Pickup location is required'],
        trim: true
      },
      pickupSub: {
        type: String,
        default: 'Primary Passenger Pickup Terminal',
        trim: true
      },
      dropoffLocation: {
        type: String,
        required: [true, 'Drop-off destination is required'],
        trim: true
      },
      dropoffSub: {
        type: String,
        default: 'Designated Destination Reception',
        trim: true
      },
      distance: {
        type: String,
        default: '45 km',
        trim: true
      },
      distanceKm: {
        type: Number,
        default: 45
      }
    },
    schedule: {
      pickupDate: {
        type: String,
        required: [true, 'Pickup date is required'],
        trim: true
      },
      pickupTime: {
        type: String,
        required: [true, 'Pickup time is required'],
        trim: true
      },
      dropoffDate: {
        type: String,
        default: '',
        trim: true
      },
      dropoffTime: {
        type: String,
        default: '',
        trim: true
      }
    },
    vehicle: {
      category: {
        type: String,
        default: 'Cars',
        enum: ['Cars', 'SUVs', 'Vans', 'Buses', 'Luxury']
      },
      model: {
        type: String,
        required: [true, 'Vehicle model is required'],
        trim: true
      },
      plateNumber: {
        type: String,
        default: '',
        trim: true
      },
      type: {
        type: String,
        default: 'Executive Fleet Class',
        trim: true
      },
      color: {
        type: String,
        default: 'Obsidian Black',
        trim: true
      }
    },
    pricing: {
      totalLKR: {
        type: Number,
        required: true,
        default: 15000
      },
      totalUSD: {
        type: Number,
        default: 45
      },
      estimatedFare: {
        type: String,
        default: 'LKR 15,000'
      },
      paymentStatus: {
        type: String,
        default: 'Advance Paid (50%)',
        enum: ['Pending', 'Advance Paid (50%)', 'Paid in Full', 'Corporate Invoiced', 'Refunded']
      },
      tollIncluded: {
        type: Boolean,
        default: true
      },
      insuranceIncluded: {
        type: Boolean,
        default: true
      }
    },
    extras: {
      extraDates: {
        type: Boolean,
        default: false
      },
      extraKm: {
        type: Boolean,
        default: false
      },
      wifi: {
        type: Boolean,
        default: true
      },
      childSeat: {
        type: Boolean,
        default: false
      },
      specialNotes: {
        type: String,
        default: ''
      },
      flightNo: {
        type: String,
        default: ''
      }
    },
    status: {
      type: String,
      default: 'Pending Dispatch',
      enum: ['Pending Dispatch', 'Confirmed / Active', 'In Transit', 'Completed', 'Cancelled'],
      index: true
    },
    badgeType: {
      type: String,
      default: 'pending',
      enum: ['pending', 'active', 'cancelled', 'completed']
    },
    assignedDriver: {
      name: {
        type: String,
        default: '',
        trim: true
      },
      driverId: {
        type: String,
        default: '',
        trim: true
      },
      phone: {
        type: String,
        default: '',
        trim: true
      },
      rating: {
        type: Number,
        default: 4.9
      },
      isVerified: {
        type: Boolean,
        default: true
      }
    },
    assignedVehicle: {
      model: {
        type: String,
        default: '',
        trim: true
      },
      plateNumber: {
        type: String,
        default: '',
        trim: true
      },
      color: {
        type: String,
        default: '',
        trim: true
      },
      assetCode: {
        type: String,
        default: '',
        trim: true
      }
    },
    dispatch: {
      isDispatched: {
        type: Boolean,
        default: false
      },
      dispatchedAt: {
        type: String,
        default: ''
      },
      dispatchedTimestamp: {
        type: Date
      },
      autoSmsAlert: {
        type: Boolean,
        default: true
      },
      etaRemaining: {
        type: String,
        default: '~8 mins'
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for backward-compatibility with flat properties
hireBookingSchema.virtual('id').get(function () {
  return this.bookingId;
});

export const HireBooking = mongoose.model('HireBooking', hireBookingSchema);
export default HireBooking;
