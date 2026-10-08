import express from 'express';
import {
  createHireBooking,
  getAllHireBookings,
  getHireBookingById,
  getLatestHireBooking,
  dispatchHireBooking,
  updateHireStatus,
  getHireMetrics,
  deleteHireBooking
} from '../controllers/hireController.js';

const router = express.Router();

// Stats & Metrics
router.get('/metrics', getHireMetrics);

// Latest booking (for user status tracking)
router.get('/latest', getLatestHireBooking);

// CRUD routes
router.route('/')
  .get(getAllHireBookings)
  .post(createHireBooking);

router.route('/:id')
  .get(getHireBookingById)
  .delete(deleteHireBooking);

// Dispatch & Status action endpoints
router.put('/:id/dispatch', dispatchHireBooking);
router.put('/:id/status', updateHireStatus);

export default router;
