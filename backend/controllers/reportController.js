import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Trip from '../models/Trip.js';
import FuelLog from '../models/FuelLog.js';
import Maintenance from '../models/Maintenance.js';
import Expense from '../models/Expense.js';
import AppError from '../utils/appError.js';

// 1. Get Analytics Overview Metrics & Trends
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    // A. Overall Fuel Efficiency
    // Sum of actualDistance from completed trips
    const tripDistSum = await Trip.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalDistance: { $sum: '$actualDistance' } } },
    ]);
    const totalDistance = tripDistSum[0]?.totalDistance || 0;

    // Sum of liters from fuel logs
    const fuelLitersSum = await FuelLog.aggregate([
      { $group: { _id: null, totalLiters: { $sum: '$liters' } } },
    ]);
    const totalLiters = fuelLitersSum[0]?.totalLiters || 0;

    const overallFuelEfficiency = totalLiters > 0 
      ? Number((totalDistance / totalLiters).toFixed(2)) 
      : 0;

    // B. Fleet Utilization
    const vehicles = await Vehicle.find();
    let activeVehicles = 0;
    let availableVehicles = 0;
    let vehiclesInMaintenance = 0;
    vehicles.forEach((v) => {
      if (v.status === 'On Trip') activeVehicles++;
      else if (v.status === 'Available') availableVehicles++;
      else if (v.status === 'In Shop') vehiclesInMaintenance++;
    });
    const activeFleetSize = activeVehicles + availableVehicles + vehiclesInMaintenance;
    const fleetUtilization = activeFleetSize > 0 
      ? Number(((activeVehicles / activeFleetSize) * 100).toFixed(1)) 
      : 0;

    // C. Overall Operational Costs
    const expensesGrouped = await Expense.aggregate([
      { $group: { _id: '$expenseType', totalAmount: { $sum: '$amount' } } },
    ]);
    const breakdown = { Fuel: 0, Maintenance: 0, Toll: 0, Other: 0 };
    let totalOperationalCost = 0;
    expensesGrouped.forEach((item) => {
      if (breakdown[item._id] !== undefined) {
        breakdown[item._id] = item.totalAmount;
      }
      totalOperationalCost += item.totalAmount;
    });

    // D. Monthly Revenue Trend (Last 6 months)
    const monthlyRevenue = await Trip.aggregate([
      { $match: { status: 'Completed', completedAt: { $ne: null } } },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' },
          },
          revenue: { $sum: '$revenue' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    const formattedTrend = monthlyRevenue.map((item) => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.revenue,
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          overallFuelEfficiency,
          fleetUtilization,
          totalOperationalCost,
          distanceTraveled: totalDistance,
          fuelConsumed: totalLiters,
        },
        costBreakdown: breakdown,
        monthlyRevenueTrend: formattedTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Calculate Vehicle ROI (using the approved ROI formula)
export const getVehicleRoiReport = async (req, res, next) => {
  try {
    const vehiclesList = await Vehicle.find({ status: { $ne: 'Retired' } });
    const roiReport = [];

    for (const vehicle of vehiclesList) {
      // Sum revenue of completed trips
      const tripRevenue = await Trip.aggregate([
        { $match: { vehicle: vehicle._id, status: 'Completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } },
      ]);
      const revenue = tripRevenue[0]?.totalRevenue || 0;

      // Sum maintenance costs
      const maintenanceCosts = await Maintenance.aggregate([
        { $match: { vehicle: vehicle._id } },
        { $group: { _id: null, totalCost: { $sum: '$cost' } } },
      ]);
      const maintenanceCost = maintenanceCosts[0]?.totalCost || 0;

      // Sum fuel costs
      const fuelCosts = await FuelLog.aggregate([
        { $match: { vehicle: vehicle._id } },
        { $group: { _id: null, totalCost: { $sum: '$fuelCost' } } },
      ]);
      const fuelCost = fuelCosts[0]?.totalCost || 0;

      const acquisitionCost = vehicle.acquisitionCost;

      // Approved Formula: ROI = ((Revenue - (Maintenance + Fuel)) / AcquisitionCost) * 100
      const roi = acquisitionCost > 0 
        ? Number((((revenue - (maintenanceCost + fuelCost)) / acquisitionCost) * 100).toFixed(2)) 
        : 0;

      roiReport.push({
        _id: vehicle._id,
        registrationNumber: vehicle.registrationNumber,
        nameModel: vehicle.nameModel,
        acquisitionCost,
        revenue,
        maintenanceCost,
        fuelCost,
        roi,
      });
    }

    res.status(200).json({
      status: 'success',
      results: roiReport.length,
      data: {
        roiReport,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Top Costliest Vehicles (highest total expenses in shop / fuel / tolls)
export const getCostliestVehiclesReport = async (req, res, next) => {
  try {
    const costliest = await Expense.aggregate([
      {
        $group: {
          _id: '$vehicle',
          totalExpense: { $sum: '$amount' },
        },
      },
      { $sort: { totalExpense: -1 } },
      { $limit: 5 },
    ]);

    // Populate vehicle details manually since it's an aggregation query
    const populatedReport = [];
    for (const item of costliest) {
      if (item._id) {
        const vehicle = await Vehicle.findById(item._id);
        if (vehicle) {
          populatedReport.push({
            registrationNumber: vehicle.registrationNumber,
            nameModel: vehicle.nameModel,
            type: vehicle.type,
            totalExpense: item.totalExpense,
          });
        }
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        costliestVehicles: populatedReport,
      },
    });
  } catch (error) {
    next(error);
  }
};
