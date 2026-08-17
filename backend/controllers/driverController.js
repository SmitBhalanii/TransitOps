import Driver from '../models/Driver.js';
import AppError from '../utils/appError.js';

// Retrieve all drivers with optional filters
export const getAllDrivers = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    // 1) Filter by driver status
    if (status && status !== 'All') {
      filter.status = status;
    }

    // 2) Search by driver name or license number
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { licenseNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await Driver.find(filter);

    res.status(200).json({
      status: 'success',
      results: drivers.length,
      data: {
        drivers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a specific driver
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return next(new AppError('Driver not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        driver,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Register a new driver
export const createDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, tripCompletionRate, safetyScore, status } = req.body;

    if (!name || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      return next(new AppError('Please provide all required driver credentials', 400));
    }

    // Check license uniqueness
    const licenseExists = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (licenseExists) {
      return next(new AppError('A driver with this license number already exists', 400));
    }

    const newDriver = await Driver.create({
      name,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber,
      tripCompletionRate: tripCompletionRate || 100,
      safetyScore: safetyScore || 10.0,
      status: status || 'Available',
    });

    res.status(201).json({
      status: 'success',
      data: {
        driver: newDriver,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing driver
export const updateDriver = async (req, res, next) => {
  try {
    const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, tripCompletionRate, safetyScore, status } = req.body;

    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return next(new AppError('Driver not found with that ID', 404));
    }

    // Check license uniqueness if updated
    if (licenseNumber && licenseNumber.toUpperCase() !== driver.licenseNumber) {
      const licenseExists = await Driver.findOne({ licenseNumber: licenseNumber.toUpperCase() });
      if (licenseExists) {
        return next(new AppError('A driver with this license number already exists', 400));
      }
      driver.licenseNumber = licenseNumber.toUpperCase();
    }

    if (name) driver.name = name;
    if (licenseCategory) driver.licenseCategory = licenseCategory;
    if (licenseExpiryDate) driver.licenseExpiryDate = licenseExpiryDate;
    if (contactNumber) driver.contactNumber = contactNumber;
    if (tripCompletionRate !== undefined) driver.tripCompletionRate = tripCompletionRate;
    if (safetyScore !== undefined) driver.safetyScore = safetyScore;
    if (status) driver.status = status;

    const updatedDriver = await driver.save();

    res.status(200).json({
      status: 'success',
      data: {
        driver: updatedDriver,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Suspend a driver (Quick Status Toggle)
export const suspendDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return next(new AppError('Driver not found with that ID', 404));
    }

    driver.status = 'Suspended';
    const updatedDriver = await driver.save();

    res.status(200).json({
      status: 'success',
      data: {
        driver: updatedDriver,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a driver record
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return next(new AppError('Driver not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
