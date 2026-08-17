import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from './db.js';

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

    // 2) Clean existing users
    await User.deleteMany();
    console.log('Existing users cleared.');

    // 3) Create seeded users (this runs the pre-save hooks for password hashing!)
    await User.create(users);
    console.log('Test users successfully seeded!');

    // 4) Disconnect
    await mongoose.disconnect();
    console.log('DB disconnected. Seeding finished.');
    process.exit(0);
  } catch (error) {
    console.error(`Error during data seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
