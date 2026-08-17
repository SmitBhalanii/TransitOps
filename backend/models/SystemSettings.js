import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    depotName: {
      type: String,
      required: [true, 'Depot name is required'],
      default: 'Gandhinagar Depot GJ4',
      trim: true,
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR (Rs)',
      trim: true,
    },
    distanceUnit: {
      type: String,
      required: [true, 'Distance unit is required'],
      default: 'Kilometers',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
