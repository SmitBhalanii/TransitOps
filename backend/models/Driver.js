import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    licenseCategory: {
      type: String,
      required: [true, 'License category is required'],
      enum: {
        values: ['LMV', 'HMV'],
        message: 'License category must be LMV or HMV',
      },
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, 'License expiry date is required'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    tripCompletionRate: {
      type: Number,
      default: 100,
      min: [0, 'Trip completion rate cannot be below 0'],
      max: [100, 'Trip completion rate cannot exceed 100'],
    },
    safetyScore: {
      type: Number,
      default: 10.0,
      min: [0, 'Safety score cannot be below 0'],
      max: [10, 'Safety score cannot exceed 10'],
    },
    status: {
      type: String,
      required: [true, 'Driver status is required'],
      enum: {
        values: ['Available', 'On Trip', 'Suspended', 'Off Duty'],
        message: 'Status must be: Available, On Trip, Suspended, or Off Duty',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
