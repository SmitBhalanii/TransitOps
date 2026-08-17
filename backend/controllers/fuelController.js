import FuelLog from '../models/FuelLog.js';
import Vehicle from '../models/Vehicle.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/appError.js';

// Retrieve all fuel logs with optional filters
export const getAllFuelLogs = async (req, res, next) => {
  try {
    const { vehicle } = req.query;
    const filter = {};

    if (vehicle) {
      filter.vehicle = vehicle;
    }

    const logs = await FuelLog.find(filter)
      .populate('vehicle')
      .populate('trip')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: {
        logs,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new fuel log & sync with expense ledger
export const createFuelLog = async (req, res, next) => {
  try {
    const { vehicle, liters, fuelCost, date, trip } = req.body;

    if (!vehicle || liters === undefined || fuelCost === undefined) {
      return next(new AppError('Please provide vehicle, liters quantity, and fuel cost', 400));
    }

    // Verify vehicle exists
    const targetVehicle = await Vehicle.findById(vehicle);
    if (!targetVehicle) {
      return next(new AppError('Vehicle reference does not exist', 400));
    }

    const logDate = date || new Date();

    // 1) Create FuelLog
    const newLog = await FuelLog.create({
      vehicle,
      liters: Number(liters),
      fuelCost: Number(fuelCost),
      date: logDate,
      trip: trip || null,
    });

    // 2) Create corresponding Expense record
    await Expense.create({
      vehicle,
      trip: trip || null,
      expenseType: 'Fuel',
      amount: Number(fuelCost),
      date: logDate,
      description: `Fuel refueling: ${liters} liters logged`,
    });

    res.status(201).json({
      status: 'success',
      data: {
        log: newLog,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a fuel log and its synced expense record
export const deleteFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findById(req.params.id);
    if (!log) {
      return next(new AppError('Fuel log not found with that ID', 404));
    }

    // Delete matching Expense entry
    await Expense.deleteOne({
      vehicle: log.vehicle,
      trip: log.trip,
      expenseType: 'Fuel',
      amount: log.fuelCost,
    });

    await FuelLog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Fuel log and associated expense removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
