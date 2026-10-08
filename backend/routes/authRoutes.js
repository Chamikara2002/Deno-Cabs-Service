import express from 'express';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getAdminCredentials,
  updateAdminPassword,
  sendOtpVerification
} from '../controllers/authController.js';

const router = express.Router();

// Customer & Admin Authentication Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getAllUsers);
router.get('/admin-credentials', getAdminCredentials);
router.put('/admin-password', updateAdminPassword);
router.post('/send-otp', sendOtpVerification);

export default router;
