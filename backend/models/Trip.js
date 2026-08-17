import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripCode: {
      type: String,
      required: [true, 'Trip code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Source location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination location is required'],
      trim: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Assigned vehicle is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: [true, 'Assigned driver is required'],
    },
    cargoWeight: {
      type: Number,
      required: [true, 'Cargo weight is required'],
      min: [0, 'Cargo weight cannot be negative'],
    },
    plannedDistance: {
      type: Number,
      required: [true, 'Planned distance is required'],
      min: [0, 'Planned distance cannot be negative'],
    },
    actualDistance: {
      type: Number,
      min: [0, 'Actual distance cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Trip status is required'],
      enum: {
        values: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
        message: 'Status must be: Draft, Dispatched, Completed, or Cancelled',
      },
      default: 'Draft',
    },
    eta: {
      type: String,
      trim: true,
    },
    revenue: {
      type: Number,
      required: [true, 'Revenue is required'],
      min: [0, 'Revenue cannot be negative'],
    },
    dispatchedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
