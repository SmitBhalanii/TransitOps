import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';

// Load env variables
dotenv.config();

const users = [
  {
    name: 'System Administrator',
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
  },
  {
    name: 'Fleet Manager',
    email: 'fleet.manager@transitops.in',
    password: 'FleetSecure2026!',
    role: 'fleet_manager',
  },
  {
    name: 'Raven K.',
    email: 'raven.k@transitops.in',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
  },
  {
    name: 'Safety Officer',
    email: 'safety.officer@transitops.in',
    password: 'SafetySecure2026!',
    role: 'safety_officer',
  },
  {
    name: 'Financial Analyst',
    email: 'financial.analyst@transitops.in',
    password: 'FinanceSecure2026!',
    role: 'financial_analyst',
  },
];

const seedData = async () => {
  try {
    // 1) Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // 2) Clean existing data across all collections
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Trip.deleteMany();
    await Maintenance.deleteMany();
    await FuelLog.deleteMany();
    await Expense.deleteMany();
    console.log('All existing collections cleared.');

    // 3) Drop indexes to prevent duplicate key errors from stale schemas
    try {
      await Vehicle.collection.dropIndexes();
      console.log('Dropped Vehicle collection indexes.');
    } catch (e) {
      console.log('No Vehicle indexes to drop.');
    }
    try {
      await Driver.collection.dropIndexes();
      console.log('Dropped Driver collection indexes.');
    } catch (e) {
      console.log('No Driver indexes to drop.');
    }
    try {
      await User.collection.dropIndexes();
      console.log('Dropped User collection indexes.');
    } catch (e) {
      console.log('No User indexes to drop.');
    }

    // 4) Create seeded users (this runs the pre-save hooks for password hashing!)
    await User.create(users);
    console.log('Test users successfully seeded!');

    // 5) Disconnect
    await mongoose.disconnect();
    console.log('DB disconnected. Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
