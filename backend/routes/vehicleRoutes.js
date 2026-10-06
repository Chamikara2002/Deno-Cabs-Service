import express from 'express';
import { getAllVehicles } from '../controllers/vehicleController.js';

const router = express.Router();

router.get('/', getAllVehicles);

export default router;
