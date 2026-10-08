import express from 'express';
import {
  getAllDrivers,
  getStandbyDrivers,
  createDriver,
  updateDriver,
  deleteDriver
} from '../controllers/driverController.js';

const router = express.Router();

router.route('/')
  .get(getAllDrivers)
  .post(createDriver);

router.get('/standby', getStandbyDrivers);

router.route('/:id')
  .put(updateDriver)
  .delete(deleteDriver);

export default router;

