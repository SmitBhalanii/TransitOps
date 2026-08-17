import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    nameModel: {
      type: String,
      required: [true, 'Vehicle model/name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: {
        values: ['Van', 'Truck', 'Mini'],
        message: 'Type must be: Van, Truck, or Mini',
      },
    },
    capacity: {
      type: Number,
      required: [true, 'Maximum cargo capacity is required'],
      min: [0, 'Capacity cannot be negative'],
    },
    odometer: {
      type: Number,
      required: [true, 'Odometer reading is required'],
      min: [0, 'Odometer reading cannot be negative'],
    },
    acquisitionCost: {
      type: Number,
      required: [true, 'Acquisition cost is required'],
      min: [0, 'Acquisition cost cannot be negative'],
    },
    status: {
      type: String,
      required: [true, 'Vehicle status is required'],
      enum: {
        values: ['Available', 'On Trip', 'In Shop', 'Retired'],
        message: 'Status must be: Available, On Trip, In Shop, or Retired',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
