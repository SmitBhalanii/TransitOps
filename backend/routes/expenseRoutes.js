import express from 'express';
import {
  getAllExpenses,
  createExpense,
  getOperationalCost,
  deleteExpense,
} from '../controllers/expenseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/operational-cost', authorize('admin', 'financial_analyst'), getOperationalCost);

router.route('/')
  .get(authorize('admin', 'financial_analyst', 'fleet_manager'), getAllExpenses)
  .post(authorize('admin', 'financial_analyst', 'dispatcher'), createExpense);

router.route('/:id')
  .delete(authorize('admin'), deleteExpense);

export default router;
