import express from 'express';
import {
  getAllFuelLogs,
  createFuelLog,
  deleteFuelLog,
} from '../controllers/fuelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'fleet_manager', 'financial_analyst'), getAllFuelLogs)
  .post(authorize('admin', 'fleet_manager'), createFuelLog);

router.route('/:id')
  .delete(authorize('admin'), deleteFuelLog);

export default router;
