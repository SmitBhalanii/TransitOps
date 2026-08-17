import SystemSettings from '../models/SystemSettings.js';
import AppError from '../utils/appError.js';

// Retrieve global system settings (Auto-initializes if database is empty)
export const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      // Auto-initialize system settings with defaults
      settings = await SystemSettings.create({
        depotName: 'Gandhinagar Depot GJ4',
        currency: 'INR (Rs)',
        distanceUnit: 'Kilometers',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update global system settings (Admin only)
export const updateSettings = async (req, res, next) => {
  try {
    const { depotName, currency, distanceUnit } = req.body;

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    if (depotName) settings.depotName = depotName;
    if (currency) settings.currency = currency;
    if (distanceUnit) settings.distanceUnit = distanceUnit;

    const updatedSettings = await settings.save();

    res.status(200).json({
      status: 'success',
      data: {
        settings: updatedSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};
