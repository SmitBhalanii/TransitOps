import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import AppError from '../utils/appError.js';

// Get Dynamic Operational Dashboard Statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const { type } = req.query;

    // 1) Set up vehicle query filter
    const vehicleFilter = {};
    if (type && type !== 'All') {
      vehicleFilter.type = type;
    }

    // 2) Fetch all vehicles matching filters
    const vehicles = await Vehicle.find(vehicleFilter);

    // Calculate vehicle status aggregates
    let activeVehicles = 0;
    let availableVehicles = 0;
    let vehiclesInMaintenance = 0;
    let retiredVehicles = 0;

    vehicles.forEach((v) => {
      if (v.status === 'On Trip') activeVehicles++;
      else if (v.status === 'Available') availableVehicles++;
      else if (v.status === 'In Shop') vehiclesInMaintenance++;
      else if (v.status === 'Retired') retiredVehicles++;
    });

    const totalVehicles = vehicles.length;
    const activeFleetSize = activeVehicles + availableVehicles + vehiclesInMaintenance;

    // Fleet utilization formula: (Active / Active Fleet Size) * 100
    const fleetUtilization = activeFleetSize > 0 
      ? Number(((activeVehicles / activeFleetSize) * 100).toFixed(1)) 
      : 0;

    // 3) Set up trip query filter (limit by vehicle type if selected)
    const tripFilter = {};
    if (type && type !== 'All') {
      const matchingVehicleIds = vehicles.map((v) => v._id);
      tripFilter.vehicle = { $in: matchingVehicleIds };
    }

    // Count trips by status
    const activeTripsCount = await Trip.countDocuments({ ...tripFilter, status: 'Dispatched' });
    const pendingTripsCount = await Trip.countDocuments({ ...tripFilter, status: 'Draft' });

    // Fetch the 5 most recent trips (populated)
    const recentTrips = await Trip.find(tripFilter)
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 })
      .limit(5);

    // 4) Count drivers currently on duty (Available or On Trip)
    const driversOnDutyCount = await Driver.countDocuments({
      status: { $in: ['Available', 'On Trip'] },
    });

    res.status(200).json({
      status: 'success',
      data: {
        kpis: {
          activeVehicles,
          availableVehicles,
          vehiclesInMaintenance,
          totalVehicles,
          activeTrips: activeTripsCount,
          pendingTrips: pendingTripsCount,
          driversOnDuty: driversOnDutyCount,
          fleetUtilization,
        },
        vehicleStatusCounts: {
          Available: availableVehicles,
          'On Trip': activeVehicles,
          'In Shop': vehiclesInMaintenance,
          Retired: retiredVehicles,
        },
        recentTrips,
      },
    });
  } catch (error) {
    next(error);
  }
};
