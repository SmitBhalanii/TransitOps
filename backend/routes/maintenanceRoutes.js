import express from 'express';
import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from '../controllers/maintenanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'financial_analyst'), getAllMaintenance)
  .post(authorize('admin', 'fleet_manager'), createMaintenance);

router.route('/:id')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'financial_analyst'), getMaintenanceById)
  .put(authorize('admin', 'fleet_manager'), updateMaintenance)
  .delete(authorize('admin', 'fleet_manager'), deleteMaintenance);

export default router;
