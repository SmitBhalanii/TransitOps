import Maintenance from '../models/Maintenance.js';
import Vehicle from '../models/Vehicle.js';
import AppError from '../utils/appError.js';

// Retrieve all maintenance records
export const getAllMaintenance = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    const records = await Maintenance.find(filter)
      .populate('vehicle')
      .sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      results: records.length,
      data: {
        records,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Retrieve a specific maintenance record
export const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id).populate('vehicle');

    if (!record) {
      return next(new AppError('Maintenance log not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        record,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new maintenance record (Starts active -> puts vehicle In Shop)
export const createMaintenance = async (req, res, next) => {
  try {
    const { vehicle, serviceType, cost, date, notes, status } = req.body;

    if (!vehicle || !serviceType || cost === undefined) {
      return next(new AppError('Please provide vehicle reference, service type, and cost', 400));
    }

    // 1) Fetch and validate vehicle state
    const targetVehicle = await Vehicle.findById(vehicle);
    if (!targetVehicle) {
      return next(new AppError('Vehicle reference does not exist', 400));
    }

    // A vehicle on an active trip cannot go directly to the shop
    if (targetVehicle.status === 'On Trip') {
      return next(new AppError('Vehicle is currently on an active trip and cannot enter maintenance.', 400));
    }

    const initialStatus = status || 'Active';

    // 2) Create the log
    const newRecord = await Maintenance.create({
      vehicle,
      serviceType,
      cost,
      date: date || new Date(),
      notes,
      status: initialStatus,
    });

    // 3) Re-evaluate and toggle vehicle status automatically
    if (initialStatus === 'Active') {
      targetVehicle.status = 'In Shop';
      await targetVehicle.save();
    }

    res.status(201).json({
      status: 'success',
      data: {
        record: newRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing maintenance record
export const updateMaintenance = async (req, res, next) => {
  try {
    const { serviceType, cost, date, notes, status } = req.body;

    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return next(new AppError('Maintenance log not found with that ID', 404));
    }

    const previousStatus = record.status;

    if (serviceType) record.serviceType = serviceType;
    if (cost !== undefined) record.cost = cost;
    if (date) record.date = date;
    if (notes !== undefined) record.notes = notes;
    if (status) record.status = status;

    const updatedRecord = await record.save();

    // Re-evaluate vehicle status upon transitioning from Active -> Completed
    if (previousStatus === 'Active' && status === 'Completed') {
      const targetVehicle = await Vehicle.findById(record.vehicle);
      if (targetVehicle) {
        // EXCEPTION: Retired vehicles must remain Retired and not incorrectly become Available
        if (targetVehicle.status !== 'Retired') {
          targetVehicle.status = 'Available';
          await targetVehicle.save();
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        record: updatedRecord,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a maintenance record
export const deleteMaintenance = async (req, res, next) => {
  try {
    const record = await Maintenance.findById(req.params.id);
    if (!record) {
      return next(new AppError('Maintenance log not found with that ID', 404));
    }

    // Revert vehicle back to Available if record was still Active (unless Retired)
    if (record.status === 'Active') {
      const targetVehicle = await Vehicle.findById(record.vehicle);
      if (targetVehicle && targetVehicle.status !== 'Retired') {
        targetVehicle.status = 'Available';
        await targetVehicle.save();
      }
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Maintenance log removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
