import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Refueling date is required'],
      default: Date.now,
    },
    liters: {
      type: Number,
      required: [true, 'Liters quantity is required'],
      min: [0, 'Liters cannot be negative'],
    },
    fuelCost: {
      type: Number,
      required: [true, 'Fuel cost is required'],
      min: [0, 'Fuel cost cannot be negative'],
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const FuelLog = mongoose.model('FuelLog', fuelLogSchema);

export default FuelLog;
