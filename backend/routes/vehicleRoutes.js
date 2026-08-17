import express from 'express';
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'financial_analyst'), getAllVehicles)
  .post(authorize('admin', 'fleet_manager'), createVehicle);

router.route('/:id')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'financial_analyst'), getVehicleById)
  .put(authorize('admin', 'fleet_manager'), updateVehicle)
  .delete(authorize('admin', 'fleet_manager'), deleteVehicle);

export default router;
