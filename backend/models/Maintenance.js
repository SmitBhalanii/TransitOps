import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      trim: true,
    },
    cost: {
      type: Number,
      required: [true, 'Maintenance cost is required'],
      min: [0, 'Cost cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Maintenance date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      required: [true, 'Maintenance status is required'],
      enum: {
        values: ['Active', 'Completed'],
        message: 'Status must be: Active or Completed',
      },
      default: 'Active',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
