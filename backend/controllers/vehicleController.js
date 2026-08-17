import Vehicle from '../models/Vehicle.js';
import AppError from '../utils/appError.js';

// Retrieve all vehicles with optional filters
export const getAllVehicles = async (req, res, next) => {
  try {
    const { type, status, search } = req.query;
    const filter = {};

    // 1) Filter by vehicle type
    if (type && type !== 'All') {
      filter.type = type;
    }

    // 2) Filter by vehicle status
    if (status && status !== 'All') {
      filter.status = status;
    }

    // 3) Search by registration number or model name
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { nameModel: { $regex: search, $options: 'i' } },
      ];
    }

    const vehicles = await Vehicle.find(filter);

    res.status(200).json({
      status: 'success',
      results: vehicles.length,
      data: {
        vehicles,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a specific vehicle
export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        vehicle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new vehicle
export const createVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, nameModel, type, capacity, odometer, acquisitionCost, status } = req.body;

    if (!registrationNumber || !nameModel || !type || capacity === undefined || odometer === undefined || acquisitionCost === undefined) {
      return next(new AppError('Please provide all required vehicle details', 400));
    }

    // Enforce registration number uniqueness
    const regExists = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
    if (regExists) {
      return next(new AppError('A vehicle with this registration number already exists', 400));
    }

    const newVehicle = await Vehicle.create({
      registrationNumber: registrationNumber.toUpperCase(),
      nameModel,
      type,
      capacity,
      odometer,
      acquisitionCost,
      status: status || 'Available',
    });

    res.status(201).json({
      status: 'success',
      data: {
        vehicle: newVehicle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing vehicle
export const updateVehicle = async (req, res, next) => {
  try {
    const { registrationNumber, nameModel, type, capacity, odometer, acquisitionCost, status } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return next(new AppError('Vehicle not found with that ID', 404));
    }

    // Check registration number uniqueness if updated
    if (registrationNumber && registrationNumber.toUpperCase() !== vehicle.registrationNumber) {
      const regExists = await Vehicle.findOne({ registrationNumber: registrationNumber.toUpperCase() });
      if (regExists) {
        return next(new AppError('A vehicle with this registration number already exists', 400));
      }
      vehicle.registrationNumber = registrationNumber.toUpperCase();
    }

    if (nameModel) vehicle.nameModel = nameModel;
    if (type) vehicle.type = type;
    if (capacity !== undefined) vehicle.capacity = capacity;
    if (odometer !== undefined) vehicle.odometer = odometer;
    if (acquisitionCost !== undefined) vehicle.acquisitionCost = acquisitionCost;
    if (status) vehicle.status = status;

    const updatedVehicle = await vehicle.save();

    res.status(200).json({
      status: 'success',
      data: {
        vehicle: updatedVehicle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a vehicle (or archive it)
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

    if (!vehicle) {
      return next(new AppError('Vehicle not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Vehicle removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
