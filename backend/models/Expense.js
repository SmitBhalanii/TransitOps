import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    expenseType: {
      type: String,
      required: [true, 'Expense type is required'],
      enum: {
        values: ['Toll', 'Other', 'Maintenance', 'Fuel'],
        message: 'Expense type must be Toll, Other, Maintenance, or Fuel',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
