import express from 'express';
import {
  getAnalyticsOverview,
  getVehicleRoiReport,
  getCostliestVehiclesReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', authorize('admin', 'financial_analyst', 'fleet_manager'), getAnalyticsOverview);
router.get('/roi', authorize('admin', 'financial_analyst'), getVehicleRoiReport);
router.get('/costliest-vehicles', authorize('admin', 'financial_analyst', 'fleet_manager'), getCostliestVehiclesReport);

export default router;
