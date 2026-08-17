import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy';
  res.status(200).json({
    status: 'success',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      uptime: process.uptime(),
    },
  });
});

export default router;
