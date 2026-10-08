import Driver from '../models/Driver.js';

export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

export const getStandbyDrivers = async (req, res, next) => {
  try {
    const standby = await Driver.find().sort({ rating: -1 });
    return res.status(200).json({
      success: true,
      data: standby
    });
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const { fullName, phone, driverId, licenseClass, rating, status, assignedVehiclePlate, locationHub } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Full Name and Phone Number are required.'
      });
    }

    let finalDriverId = driverId ? driverId.trim() : '';
    if (!finalDriverId) {
      const count = await Driver.countDocuments();
      const nextNum = String(count + 1).padStart(7, '0');
      finalDriverId = `DENO-DRV-${nextNum}`;
    }

    // Check if driver ID already exists
    const existing = await Driver.findOne({ driverId: finalDriverId });
    if (existing) {
      existing.fullName = fullName.trim();
      existing.phone = phone.trim();
      if (licenseClass) existing.licenseClass = licenseClass.trim();
      if (rating) existing.rating = Number(rating);
      if (status) existing.status = status;
      if (assignedVehiclePlate) existing.assignedVehiclePlate = assignedVehiclePlate.trim();
      if (locationHub) existing.locationHub = locationHub.trim();
      const updated = await existing.save();
      return res.status(200).json({
        success: true,
        message: 'Driver updated successfully',
        data: updated
      });
    }

    const newDriver = new Driver({
      driverId: finalDriverId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      licenseClass: licenseClass ? licenseClass.trim() : 'Class A Heavy / Dual Protocol',
      rating: Number(rating) || 4.9,
      status: status || 'Available',
      assignedVehiclePlate: assignedVehiclePlate ? assignedVehiclePlate.trim() : '',
      locationHub: locationHub ? locationHub.trim() : 'Colombo Hub'
    });

    const saved = await newDriver.save();
    return res.status(201).json({
      success: true,
      message: 'Driver added successfully',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, licenseClass, rating, status, assignedVehiclePlate, locationHub } = req.body;

    const driver = await Driver.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { driverId: id }]
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: `Driver ${id} not found.`
      });
    }

    if (fullName) driver.fullName = fullName.trim();
    if (phone) driver.phone = phone.trim();
    if (licenseClass) driver.licenseClass = licenseClass.trim();
    if (rating !== undefined) driver.rating = Number(rating);
    if (status) driver.status = status;
    if (assignedVehiclePlate !== undefined) driver.assignedVehiclePlate = assignedVehiclePlate.trim();
    if (locationHub) driver.locationHub = locationHub.trim();

    const updated = await driver.save();
    return res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Driver.findOneAndDelete({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { driverId: id }]
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Driver ${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Driver deleted successfully',
      data: deleted
    });
  } catch (error) {
    next(error);
  }
};

