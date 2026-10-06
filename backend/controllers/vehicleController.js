import Vehicle from '../models/Vehicle.js';

export const getAllVehicles = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const vehicles = await Vehicle.find(filter).sort({ ratePerKm: 1 });

    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};
