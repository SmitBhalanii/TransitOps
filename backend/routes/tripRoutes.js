import express from 'express';
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
} from '../controllers/tripController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'), getAllTrips)
  .post(authorize('admin', 'dispatcher'), createTrip);

router.route('/:id')
  .get(authorize('admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'), getTripById)
  .put(authorize('admin', 'dispatcher'), updateTrip)
  .delete(authorize('admin'), deleteTrip);

router.put('/:id/dispatch', authorize('admin', 'dispatcher'), dispatchTrip);
router.put('/:id/complete', authorize('admin', 'dispatcher'), completeTrip);
router.put('/:id/cancel', authorize('admin', 'dispatcher'), cancelTrip);

export default router;
