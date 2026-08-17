import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorMiddleware.js';
import healthRouter from './routes/healthRoutes.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import vehicleRouter from './routes/vehicleRoutes.js';
import driverRouter from './routes/driverRoutes.js';
import tripRouter from './routes/tripRoutes.js';
import maintenanceRouter from './routes/maintenanceRoutes.js';
import AppError from './utils/appError.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: true, // Allow request from any origin for dev environment
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/vehicles', vehicleRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/trips', tripRouter);
app.use('/api/maintenance', maintenanceRouter);


// Fallback for unhandled API routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
