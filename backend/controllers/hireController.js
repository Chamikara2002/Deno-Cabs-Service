import HireBooking from '../models/HireBooking.js';

// Helper to generate formatted sequential booking reference: #DENO-000-000-001
export const formatBookingRef = (sequenceNumber = 1) => {
  const padded = String(sequenceNumber).padStart(9, '0');
  return `#DENO-${padded.slice(0, 3)}-${padded.slice(3, 6)}-${padded.slice(6, 9)}`;
};

// Helper to normalize and format booking object for client
const formatBookingResponse = (b) => {
  if (!b) return null;
  const doc = b.toObject ? b.toObject() : b;
  const customerEmail = (doc.customer?.email || doc.contactEmail || doc.email || '').toLowerCase().trim();
  const customerName = doc.customer?.name || doc.customer || doc.fullName || 'Valued Guest';
  const customerPhone = doc.customer?.phone || doc.contactPhone || doc.phone || '';
  const customerId = doc.customerId || doc.userId || '';

  return {
    _id: doc._id,
    id: doc.bookingId || doc.id,
    ref: doc.ref || (doc.bookingId ? (doc.bookingId.startsWith('#') ? doc.bookingId : `#${doc.bookingId}`) : '#DENO-000-000-001'),
    bookingId: doc.bookingId || doc.id,

    // User / Customer details
    customerId,
    userId: customerId,
    customer: customerName,
    fullName: customerName,
    email: customerEmail,
    contactEmail: customerEmail,
    customerEmail: customerEmail,
    phone: customerPhone,
    contactPhone: customerPhone,
    corporate: doc.customer?.corporate || doc.corporate || 'Individual Guest',
    accountTier: doc.customer?.accountTier || doc.accountTier || 'Verified Guest',
    accountNumber: doc.customer?.accountNumber || doc.accountNumber || '',
    
    // Route
    pickupLocation: doc.route?.pickupLocation || doc.pickupLocation || '',
    pickupSub: doc.route?.pickupSub || doc.pickupSub || '',
    dropoffLocation: doc.route?.dropoffLocation || doc.dropoffLocation || '',
    dropoffSub: doc.route?.dropoffSub || doc.dropoffSub || '',
    distance: doc.route?.distance || doc.distance || (doc.distanceKm ? `${doc.distanceKm} km` : '45 km'),
    distanceKm: doc.route?.distanceKm || doc.distanceKm || 45,

    // Schedule
    scheduleDate: doc.schedule?.pickupDate || doc.scheduleDate || doc.hireDate || 'Today',
    scheduleTime: doc.schedule?.pickupTime || doc.scheduleTime || doc.hireTime || '10:30 AM',
    hireDate: doc.schedule?.pickupDate || doc.scheduleDate || doc.hireDate || 'Today',
    hireTime: doc.schedule?.pickupTime || doc.scheduleTime || doc.hireTime || '10:30 AM',
    dropoffDate: doc.schedule?.dropoffDate || doc.dropoffDate || '',
    dropoffTime: doc.schedule?.dropoffTime || doc.dropoffTime || '',

    // Vehicle
    vehicle: doc.vehicle?.model || doc.vehicle || doc.vehicleModel || 'Executive Class',
    vehicleModel: doc.vehicle?.model || doc.vehicle || doc.vehicleModel || 'Executive Class',
    vehiclePlate: doc.assignedVehicle?.plateNumber || doc.vehicle?.plateNumber || doc.vehiclePlate || '',
    vehicleCategory: doc.vehicle?.category || doc.vehicleCategory || 'Cars',
    vehicleType: doc.vehicle?.type || doc.vehicleType || 'Executive Class',

    // Pricing
    totalLKR: doc.pricing?.totalLKR || doc.totalLKR || 15000,
    totalUSD: doc.pricing?.totalUSD || doc.totalUSD || Math.round((doc.pricing?.totalLKR || doc.totalLKR || 15000) / 330),
    estimatedFare: doc.pricing?.estimatedFare || doc.estimatedFare || `LKR ${(doc.pricing?.totalLKR || doc.totalLKR || 15000).toLocaleString()}`,
    paymentStatus: (doc.status === 'Completed' || (doc.status || '').toLowerCase().includes('complete') || doc.pricing?.paymentStatus === 'Paid' || doc.paymentStatus === 'Paid')
      ? 'Paid'
      : (doc.pricing?.paymentStatus || doc.paymentStatus || 'Advance Paid (50%)'),

    // Status
    status: doc.status || 'Pending Approval',
    badgeType: doc.badgeType || (doc.status?.toLowerCase().includes('pending') ? 'pending' : doc.status?.toLowerCase().includes('cancel') ? 'cancelled' : 'active'),
    
    // Assigned Details
    assignedDriverName: doc.assignedDriver?.name || doc.assignedDriverName || '',
    assignedDriverId: doc.assignedDriver?.driverId || doc.assignedDriverId || '',
    assignedDriverPhone: doc.assignedDriver?.phone || doc.assignedDriverPhone || '',
    assignedDriverRating: doc.assignedDriver?.rating || 4.9,
    assignedVehicleNumber: doc.assignedVehicle?.plateNumber || doc.assignedVehicleNumber || doc.vehiclePlate || '',
    assignedVehicleColor: doc.assignedVehicle?.color || doc.assignedVehicleColor || '',
    assignedAssetPreview: doc.assignedVehicle?.model || doc.assignedAssetPreview || doc.vehicle?.model || '',
    assignedAssetCode: doc.assignedVehicle?.assetCode || doc.assignedAssetCode || '',

    // Dispatch Details
    dispatchConfirmed: Boolean(doc.dispatch?.isDispatched || doc.dispatchConfirmed || doc.status === 'Confirmed / Active'),
    dispatchedAt: doc.dispatch?.dispatchedAt || doc.dispatchedAt || '',
    autoSmsAlert: doc.dispatch?.autoSmsAlert ?? true,

    // Notes
    specialNotes: doc.extras?.specialNotes || doc.specialNotes || doc.specialNote || doc.description || '',
    flightNo: doc.extras?.flightNo || doc.flightNo || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
};

// 1. Create a New Hire Booking (Customer Booking Flow)
export const createHireBooking = async (req, res, next) => {
  try {
    const data = req.body;

    let refNumber = data.ref;
    if (!refNumber) {
      const existingCount = await HireBooking.countDocuments();
      refNumber = formatBookingRef(existingCount + 1);
    }
    const bookingId = refNumber.replace('#', '');

    // Customer email clean
    const customerEmail = (data.email || data.contactEmail || data.customerEmail || 'guest@denocabs.com').toLowerCase().trim();
    const customerName = (data.fullName || data.customer || data.name || 'Executive Guest').trim();
    const customerPhone = (data.phone || data.contactPhone || '+94 77 123 4567').trim();
    const customerId = data.customerId || data.userId || '';

    let numericLkr = 25000;
    if (typeof data.totalLKR === 'number' && data.totalLKR > 0) {
      numericLkr = data.totalLKR;
    } else if (typeof data.estimatedFare === 'string') {
      const parsed = Number(data.estimatedFare.replace(/[^0-9]/g, ''));
      if (parsed > 0) numericLkr = parsed;
    } else if (typeof data.totalAmount === 'number' && data.totalAmount > 0) {
      numericLkr = data.totalAmount;
    }

    // Check if booking with this ID / ref already exists in MongoDB -> if exists, update it!
    let booking = await HireBooking.findOne({
      $or: [{ bookingId }, { ref: refNumber }]
    });

    if (booking) {
      booking.customer = {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        corporate: data.corporate || data.company || 'Private Executive Client',
        accountTier: data.accountTier || 'Individual / Guest',
        accountNumber: data.accountNumber || `#CUST-DENO-${bookingId.slice(-4)}`
      };
      booking.customerId = customerId;
      booking.userId = customerId;
      booking.route = {
        pickupLocation: data.pickupLocation || 'Colombo International Airport (CMB)',
        pickupSub: data.pickupSub || 'Primary Passenger Terminal',
        dropoffLocation: data.dropoffLocation || 'Kandy City Center',
        dropoffSub: data.dropoffSub || 'Designated Destination',
        distance: data.distance || (typeof data.distanceKm === 'string' ? data.distanceKm : `${data.distanceKm || 45} km`),
        distanceKm: Number(data.distanceKm) || 45
      };
      booking.schedule = {
        pickupDate: data.hireDate || data.pickupDate || data.scheduleDate || 'Today',
        pickupTime: data.hireTime || data.pickupTime || data.scheduleTime || '10:30 AM',
        dropoffDate: data.dropoffDate || '',
        dropoffTime: data.dropoffTime || ''
      };
      booking.vehicle = {
        category: data.vehicleCategory || data.category || 'Cars',
        model: data.vehicle || data.vehicleModel || 'Toyota Axio',
        plateNumber: data.vehiclePlate || '',
        type: data.vehicleType || 'Executive Fleet Class',
        color: data.vehicleColor || 'Obsidian Black'
      };
      booking.pricing = {
        totalLKR: numericLkr,
        totalUSD: Math.round(numericLkr / 330),
        estimatedFare: data.estimatedFare || `LKR ${numericLkr.toLocaleString()}`,
        paymentStatus: data.paymentStatus || 'Advance Paid (50%)',
        tollIncluded: true,
        insuranceIncluded: true
      };
      booking.extras = {
        extraDates: Boolean(data.extraDates),
        extraKm: Boolean(data.extraKm),
        wifi: true,
        childSeat: false,
        specialNotes: data.description || data.specialNotes || data.specialNote || '',
        flightNo: data.flightNo || ''
      };
      booking.status = data.status || 'Pending Approval';
      booking.badgeType = data.badgeType || 'pending';

      const saved = await booking.save();
      console.log(`✅ [MongoDB Hire Booking Updated]: ${saved.ref} for ${customerEmail}`);
      return res.status(200).json({
        success: true,
        message: 'Hire booking updated successfully',
        data: formatBookingResponse(saved)
      });
    }

    const newBooking = new HireBooking({
      bookingId,
      ref: refNumber,
      customerId,
      userId: customerId,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        corporate: data.corporate || data.company || 'Private Executive Client',
        accountTier: data.accountTier || 'Individual / Guest',
        accountNumber: data.accountNumber || `#CUST-DENO-${bookingId.slice(-4)}`
      },
      route: {
        pickupLocation: data.pickupLocation || 'Colombo International Airport (CMB)',
        pickupSub: data.pickupSub || 'Primary Passenger Terminal',
        dropoffLocation: data.dropoffLocation || 'Kandy City Center',
        dropoffSub: data.dropoffSub || 'Designated Destination',
        distance: data.distance || (typeof data.distanceKm === 'string' ? data.distanceKm : `${data.distanceKm || 45} km`),
        distanceKm: Number(data.distanceKm) || 45
      },
      schedule: {
        pickupDate: data.hireDate || data.pickupDate || data.scheduleDate || 'Today',
        pickupTime: data.hireTime || data.pickupTime || data.scheduleTime || '10:30 AM',
        dropoffDate: data.dropoffDate || '',
        dropoffTime: data.dropoffTime || ''
      },
      vehicle: {
        category: data.vehicleCategory || data.category || 'Cars',
        model: data.vehicle || data.vehicleModel || 'Toyota Axio',
        plateNumber: data.vehiclePlate || '',
        type: data.vehicleType || 'Executive Fleet Class',
        color: data.vehicleColor || 'Obsidian Black'
      },
      pricing: {
        totalLKR: numericLkr,
        totalUSD: Math.round(numericLkr / 330),
        estimatedFare: data.estimatedFare || `LKR ${numericLkr.toLocaleString()}`,
        paymentStatus: data.paymentStatus || 'Advance Paid (50%)',
        tollIncluded: true,
        insuranceIncluded: true
      },
      extras: {
        extraDates: Boolean(data.extraDates),
        extraKm: Boolean(data.extraKm),
        wifi: true,
        childSeat: false,
        specialNotes: data.description || data.specialNotes || data.specialNote || '',
        flightNo: data.flightNo || ''
      },
      status: data.status || 'Pending Approval',
      badgeType: data.badgeType || 'pending'
    });

    const saved = await newBooking.save();
    console.log(`✅ [MongoDB Hire Booking Created]: ${saved.ref} for ${customerEmail}`);
    return res.status(201).json({
      success: true,
      message: 'Hire booking created successfully',
      data: formatBookingResponse(saved)
    });
  } catch (error) {
    console.error('❌ [Create Booking Error in MongoDB]:', error.message);
    next(error);
  }
};

// 2. Get All Hire Bookings (with Search, Email, Status Filter & Pagination)
export const getAllHireBookings = async (req, res, next) => {
  try {
    const { status, search, email, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (email && email.trim()) {
      filter['customer.email'] = email.toLowerCase().trim();
    }

    if (status && status !== 'All') {
      if (status.toLowerCase() === 'pending') {
        filter.status = { $regex: /pending/i };
      } else if (status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'active') {
        filter.status = { $regex: /confirm|active/i };
      } else if (status.toLowerCase() === 'cancelled') {
        filter.status = { $regex: /cancel/i };
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { bookingId: { $regex: q, $options: 'i' } },
        { ref: { $regex: q, $options: 'i' } },
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.corporate': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
        { 'customer.phone': { $regex: q, $options: 'i' } },
        { 'route.pickupLocation': { $regex: q, $options: 'i' } },
        { 'route.dropoffLocation': { $regex: q, $options: 'i' } },
        { 'vehicle.model': { $regex: q, $options: 'i' } },
        { 'assignedDriver.name': { $regex: q, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      HireBooking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      HireBooking.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: bookings.map(formatBookingResponse)
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Single Booking by ID or Reference
export const getHireBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = id.replace('#', '').trim();

    const booking = await HireBooking.findOne({
      $or: [{ bookingId: cleanId }, { ref: `#${cleanId}` }, { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking with reference ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatBookingResponse(booking)
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Latest Hire Booking for Current User / Live Status (Strict User Scoped)
export const getLatestHireBooking = async (req, res, next) => {
  try {
    const { email, phone } = req.query;
    
    // User isolation: if no email/phone provided, do not return random other user's booking
    if (!email && !phone) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No user email provided.'
      });
    }

    const filterConditions = [];
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const escapedEmail = cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filterConditions.push(
        { 'customer.email': cleanEmail },
        { 'customer.email': { $regex: new RegExp(`^${escapedEmail}$`, 'i') } },
        { email: cleanEmail },
        { contactEmail: cleanEmail }
      );
    }
    if (phone && phone.trim()) {
      const cleanPhone = phone.trim();
      const escapedPhone = cleanPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filterConditions.push(
        { 'customer.phone': cleanPhone },
        { 'customer.phone': { $regex: new RegExp(escapedPhone, 'i') } }
      );
    }

    const filter = filterConditions.length > 0 ? { $or: filterConditions } : {};

    const latest = await HireBooking.findOne(filter).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active hire bookings found for this user.'
      });
    }

    return res.status(200).json({
      success: true,
      data: formatBookingResponse(latest)
    });
  } catch (error) {
    next(error);
  }
};

// 5. Super Admin: Confirm & Dispatch Booking (Assign Chauffeur & Fleet Vehicle)
export const dispatchHireBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = id.replace('#', '').trim();
    const {
      assignedDriverName,
      assignedDriverId,
      assignedDriverPhone,
      assignedDriverRating = 4.9,
      assignedVehicleNumber,
      assignedVehicleColor,
      assignedAssetPreview,
      assignedAssetCode,
      autoSmsAlert = true,
      dispatchedAt
    } = req.body;

    const booking = await HireBooking.findOne({
      $or: [{ bookingId: cleanId }, { ref: `#${cleanId}` }, { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking ${id} not found for dispatch.`
      });
    }

    const timestampStr = dispatchedAt || 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Update fields
    booking.status = 'Confirmed / Active';
    booking.badgeType = 'active';

    booking.assignedDriver = {
      name: (assignedDriverName !== undefined ? assignedDriverName : (booking.assignedDriver?.name || '')).trim(),
      driverId: (assignedDriverId !== undefined ? assignedDriverId : (booking.assignedDriver?.driverId || 'DENO-DRV-0000001')).trim(),
      phone: (assignedDriverPhone !== undefined ? assignedDriverPhone : (booking.assignedDriver?.phone || '')).trim(),
      rating: Number(assignedDriverRating) || 4.9,
      isVerified: true
    };

    booking.assignedVehicle = {
      model: (assignedAssetPreview || booking.vehicle?.model || '').trim(),
      plateNumber: (assignedVehicleNumber || booking.vehicle?.plateNumber || '').trim(),
      color: (assignedVehicleColor || booking.vehicle?.color || 'Pearl Metallic Black').trim(),
      assetCode: (assignedAssetCode || '#V8-EXEC-01').trim()
    };

    if (assignedAssetPreview) {
      booking.vehicle.model = assignedAssetPreview;
    }
    if (assignedVehicleNumber) {
      booking.vehicle.plateNumber = assignedVehicleNumber;
    }
    if (assignedVehicleColor) {
      booking.vehicle.color = assignedVehicleColor;
    }

    booking.dispatch = {
      isDispatched: true,
      dispatchedAt: timestampStr,
      dispatchedTimestamp: new Date(),
      autoSmsAlert: Boolean(autoSmsAlert),
      etaRemaining: '2h 18m Remaining'
    };

    const updated = await booking.save();

    return res.status(200).json({
      success: true,
      message: `Booking ${booking.ref} confirmed and dispatched successfully!`,
      data: formatBookingResponse(updated)
    });
  } catch (error) {
    next(error);
  }
};

// 6. Update Status (Cancel, Complete, etc.)
export const updateHireStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const cleanId = id.replace('#', '').trim();

    const booking = await HireBooking.findOne({
      $or: [{ bookingId: cleanId }, { ref: `#${cleanId}` }, { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: `Booking ${id} not found.`
      });
    }

    const isCancel = status.toLowerCase().includes('cancel');
    const isComplete = status.toLowerCase().includes('complete');

    booking.status = status;
    booking.badgeType = status.toLowerCase().includes('pending')
      ? 'pending'
      : isCancel
      ? 'cancelled'
      : isComplete
      ? 'completed'
      : 'active';

    if (isCancel) {
      if (!booking.dispatch) {
        booking.dispatch = {};
      }
      booking.dispatch.isDispatched = false;
    }

    if (isComplete) {
      if (!booking.pricing) {
        booking.pricing = {};
      }
      booking.pricing.paymentStatus = 'Paid';
    }

    const updated = await booking.save();

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      data: formatBookingResponse(updated)
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get Dispatch Metrics & Statistics for Super Admin Dashboard
export const getHireMetrics = async (req, res, next) => {
  try {
    const [total, pending, active, completed, cancelled] = await Promise.all([
      HireBooking.countDocuments(),
      HireBooking.countDocuments({ status: { $regex: /pending/i } }),
      HireBooking.countDocuments({ status: { $regex: /confirm|active/i } }),
      HireBooking.countDocuments({ status: { $regex: /completed/i } }),
      HireBooking.countDocuments({ status: { $regex: /cancel/i } })
    ]);

    const revenueResult = await HireBooking.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalLKR: { $sum: '$pricing.totalLKR' } } }
    ]);

    const totalRevenueLKR = revenueResult.length > 0 ? revenueResult[0].totalLKR : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalBookings: total,
        pendingDispatch: pending,
        activeDispatches: active,
        completedHires: completed,
        cancelledHires: cancelled,
        totalRevenueLKR,
        totalRevenueUSD: Math.round(totalRevenueLKR / 330)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 8. Delete a Hire Booking by ID or Reference
export const deleteHireBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanId = id.replace('#', '').trim();

    const deleted = await HireBooking.findOneAndDelete({
      $or: [
        { bookingId: cleanId },
        { ref: `#${cleanId}` },
        { ref: id },
        { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null }
      ]
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Booking ${id} not found for deletion.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking ${deleted.ref} has been deleted from database.`,
      data: formatBookingResponse(deleted)
    });
  } catch (error) {
    next(error);
  }
};

