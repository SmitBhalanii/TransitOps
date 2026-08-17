import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Vehicle from '../models/Vehicle.js';
import AppError from '../utils/appError.js';

// Retrieve all expense records
export const getAllExpenses = async (req, res, next) => {
  try {
    const { vehicle, expenseType } = req.query;
    const filter = {};

    if (vehicle) {
      filter.vehicle = vehicle;
    }
    if (expenseType && expenseType !== 'All') {
      filter.expenseType = expenseType;
    }

    const expenses = await Expense.find(filter)
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: expenses.length,
      data: {
        expenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new expense record (e.g. Tolls, road costs)
export const createExpense = async (req, res, next) => {
  try {
    const { vehicle, trip, expenseType, amount, date, description } = req.body;

    if (!vehicle || !expenseType || amount === undefined) {
      return next(new AppError('Please provide vehicle, expense type, and amount', 400));
    }

    // Verify vehicle exists
    const targetVehicle = await Vehicle.findById(vehicle);
    if (!targetVehicle) {
      return next(new AppError('Vehicle reference does not exist', 400));
    }

    const newExpense = await Expense.create({
      vehicle,
      trip: trip || null,
      expenseType,
      amount: Number(amount),
      date: date || new Date(),
      description,
    });

    res.status(201).json({
      status: 'success',
      data: {
        expense: newExpense,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Operational Cost breakdown (Server-side Aggregation Engine)
export const getOperationalCost = async (req, res, next) => {
  try {
    const { vehicle, startDate, endDate } = req.query;
    const match = {};

    // 1) Match vehicle filter
    if (vehicle) {
      match.vehicle = new mongoose.Types.ObjectId(vehicle);
    }

    // 2) Match date range filters
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    // 3) Group by expense type and sum amounts
    const aggregation = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$expenseType',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Format the cost ledger response
    const costBreakdown = {
      Fuel: 0,
      Maintenance: 0,
      Toll: 0,
      Other: 0,
    };

    let totalOperationalCost = 0;

    aggregation.forEach((item) => {
      if (costBreakdown[item._id] !== undefined) {
        costBreakdown[item._id] = item.totalAmount;
      }
      totalOperationalCost += item.totalAmount;
    });

    res.status(200).json({
      status: 'success',
      data: {
        breakdown: costBreakdown,
        totalOperationalCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete an expense record
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return next(new AppError('Expense record not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Expense record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
