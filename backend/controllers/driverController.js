import Driver from '../models/Driver.js';

export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().sort({ rating: -1 });
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
    const standby = await Driver.find({ status: { $in: ['Available', 'Standby'] } }).limit(6);
    return res.status(200).json({
      success: true,
      data: standby
    });
  } catch (error) {
    next(error);
  }
};
