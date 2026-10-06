import express from 'express';
import { sendOtpVerification } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/send-otp
router.post('/send-otp', sendOtpVerification);

export default router;
