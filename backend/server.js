import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './config/db.js';
import hireRoutes from './routes/hireRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { seedDatabase } from './data/seedData.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably from backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting dynamic origins
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173')
  .split(',')
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP request logger in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Deno Cabs Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/hires', hireRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Deno Cabs & Tours REST API',
    version: '1.0.0',
    documentation: '/api/hires'
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server and initialize database
const startServer = async () => {
  try {
    const isDbConnected = await connectDB();
    if (isDbConnected) {
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log(`🚀 [Deno Cabs Backend Running] http://localhost:${PORT}`);
      console.log(`📡 [Hire Endpoints]: http://localhost:${PORT}/api/hires`);
      console.log(`🛡️ [Driver Endpoints]: http://localhost:${PORT}/api/drivers`);
      console.log(`🚘 [Vehicle Endpoints]: http://localhost:${PORT}/api/vehicles`);
    });
  } catch (err) {
    console.error('❌ Failed to start backend server:', err.message);
  }
};

startServer();

export default app;
