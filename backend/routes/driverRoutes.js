import express from 'express';
import { getAllDrivers, getStandbyDrivers } from '../controllers/driverController.js';

const router = express.Router();

router.get('/', getAllDrivers);
router.get('/standby', getStandbyDrivers);

export default router;
