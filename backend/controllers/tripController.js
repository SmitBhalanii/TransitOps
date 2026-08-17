import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/appError.js';

// Retrieve all trips with populated references
export const getAllTrips = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: trips.length,
      data: {
        trips,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a single trip by ID
export const getTripById = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver');

    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        trip,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new trip in Draft status
export const createTrip = async (req, res, next) => {
  try {
    const { tripCode, source, destination, vehicle, driver, cargoWeight, plannedDistance, revenue, eta } = req.body;

    if (!tripCode || !source || !destination || !vehicle || !driver || cargoWeight === undefined || plannedDistance === undefined || revenue === undefined) {
      return next(new AppError('Please provide all required trip details', 400));
    }

    // Verify trip code uniqueness
    const tripExists = await Trip.findOne({ tripCode: tripCode.toUpperCase() });
    if (tripExists) {
      return next(new AppError('A trip with this code already exists', 400));
    }

    // Create Draft trip
    const newTrip = await Trip.create({
      tripCode: tripCode.toUpperCase(),
      source,
      destination,
      vehicle,
      driver,
      cargoWeight,
      plannedDistance,
      revenue,
      eta,
      status: 'Draft',
    });

    res.status(201).json({
      status: 'success',
      data: {
        trip: newTrip,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update details of a Draft trip
export const updateTrip = async (req, res, next) => {
  try {
    const { source, destination, vehicle, driver, cargoWeight, plannedDistance, revenue, eta } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    if (trip.status !== 'Draft') {
      return next(new AppError('Only Draft trips can be modified', 400));
    }

    if (source) trip.source = source;
    if (destination) trip.destination = destination;
    if (vehicle) trip.vehicle = vehicle;
    if (driver) trip.driver = driver;
    if (cargoWeight !== undefined) trip.cargoWeight = cargoWeight;
    if (plannedDistance !== undefined) trip.plannedDistance = plannedDistance;
    if (revenue !== undefined) trip.revenue = revenue;
    if (eta) trip.eta = eta;

    const updatedTrip = await trip.save();

    res.status(200).json({
      status: 'success',
      data: {
        trip: updatedTrip,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a trip (Admin only)
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    // If dispatched, we must revert vehicle and driver status
    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Trip record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DISPATCH TRANSACTION
export const dispatchTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    if (trip.status !== 'Draft') {
      return next(new AppError('Only Draft trips can be dispatched', 400));
    }

    // 1) Fetch and validate vehicle state
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (!vehicle) {
      return next(new AppError('Assigned vehicle does not exist', 400));
    }
    if (vehicle.status !== 'Available') {
      return next(new AppError(`Vehicle is currently: ${vehicle.status}. Cannot dispatch.`, 400));
    }

    // 2) Fetch and validate driver state
    const driver = await Driver.findById(trip.driver);
    if (!driver) {
      return next(new AppError('Assigned driver does not exist', 400));
    }
    if (driver.status !== 'Available') {
      return next(new AppError(`Driver is currently: ${driver.status}. Cannot dispatch.`, 400));
    }

    // 3) Validate driver license validity (not expired)
    const isLicenseExpired = new Date(driver.licenseExpiryDate) < new Date();
    if (isLicenseExpired) {
      return next(new AppError('Driver license has expired. Dispatch blocked.', 400));
    }

    // 4) Validate driver suspension state
    if (driver.status === 'Suspended') {
      return next(new AppError('Driver is suspended. Dispatch blocked.', 400));
    }

    // 5) Validate cargo capacity limits
    if (trip.cargoWeight > vehicle.capacity) {
      return next(
        new AppError(
          `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.capacity} kg). Dispatch blocked.`,
          400
        )
      );
    }

    // Transaction execution: Update Trip, Vehicle, and Driver statuses
    trip.status = 'Dispatched';
    trip.dispatchedAt = new Date();
    await trip.save();

    vehicle.status = 'On Trip';
    await vehicle.save();

    driver.status = 'On Trip';
    await driver.save();

    res.status(200).json({
      status: 'success',
      message: 'Trip successfully dispatched!',
      data: {
        trip,
      },
    });
  } catch (error) {
    next(error);
  }
};

// COMPLETE TRIP
export const completeTrip = async (req, res, next) => {
  try {
    const { actualDistance, fuelLiters, fuelCost, tollAmount, otherAmount, description } = req.body;

    if (actualDistance === undefined || actualDistance <= 0) {
      return next(new AppError('Please provide a valid actual distance traveled', 400));
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    if (trip.status !== 'Dispatched') {
      return next(new AppError('Only Dispatched trips can be marked as completed', 400));
    }

    // 1) Update Trip state
    trip.status = 'Completed';
    trip.actualDistance = actualDistance;
    trip.completedAt = new Date();
    await trip.save();

    // 2) Update Vehicle state and increment odometer
    const vehicle = await Vehicle.findById(trip.vehicle);
    if (vehicle) {
      vehicle.status = 'Available';
      vehicle.odometer += Number(actualDistance);
      await vehicle.save();
    }

    // 3) Update Driver state
    const driver = await Driver.findById(trip.driver);
    if (driver) {
      driver.status = 'Available';
      await driver.save();
    }

    // 4) Log Fuel Log and Fuel Expense
    if (fuelLiters && fuelLiters > 0 && fuelCost && fuelCost > 0) {
      await FuelLog.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        liters: Number(fuelLiters),
        fuelCost: Number(fuelCost),
        date: new Date(),
      });

      await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        expenseType: 'Fuel',
        amount: Number(fuelCost),
        date: new Date(),
        description: 'Fuel logged at trip completion',
      });
    }

    // 5) Log Toll Expense
    if (tollAmount && tollAmount > 0) {
      await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        expenseType: 'Toll',
        amount: Number(tollAmount),
        date: new Date(),
        description: 'Toll fees logged at trip completion',
      });
    }

    // 6) Log Other Expense
    if (otherAmount && otherAmount > 0) {
      await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        expenseType: 'Other',
        amount: Number(otherAmount),
        date: new Date(),
        description: description || 'Other expenses logged at trip completion',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Trip successfully completed!',
      data: {
        trip,
      },
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL TRIP
export const cancelTrip = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return next(new AppError('Trip not found with that ID', 404));
    }

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return next(new AppError(`Trip is already ${trip.status}. Cannot cancel.`, 400));
    }

    // If previously dispatched, release vehicle and driver back to Available
    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
    }

    trip.status = 'Cancelled';
    trip.cancelledAt = new Date();
    trip.cancellationReason = cancellationReason || 'No reason provided';
    await trip.save();

    res.status(200).json({
      status: 'success',
      message: 'Trip successfully cancelled',
      data: {
        trip,
      },
    });
  } catch (error) {
    next(error);
  }
};
