import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { testConnection } from './config/database.js';

import authRoutes from './routes/authRoutes.js';
import healthCheckRoutes from './routes/healthCheckRoutes.js';
import consultantRoutes from './routes/consultantRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import insightRoutes from './routes/insightRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Smart Finance API is running!',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard',
      health_check: '/api/health-check',
      consultants: '/api/consultants',
      bookings: '/api/bookings',
      insights: '/api/insights',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health-check', healthCheckRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/insights', insightRoutes);

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan internal pada server.',
  });
});

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Smart Finance API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Gagal menyalakan server:', error);
  }
};

startServer();

export default app;
