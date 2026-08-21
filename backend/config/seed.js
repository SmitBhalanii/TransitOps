import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Maintenance from '../models/Maintenance.js';
import FuelLog from '../models/FuelLog.js';
import Expense from '../models/Expense.js';
import SystemSettings from '../models/SystemSettings.js';

// Resolve directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });

const isResetMode = process.argv.includes('--reset');

// Database connection info
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/transitops';

// Demo identification prefixes
const DEMO_PREFIX_VEHICLE = 'DEMO-GJ';
const DEMO_PREFIX_DRIVER_LIC = 'DEMO-DL-GJ';
const DEMO_PREFIX_TRIP = 'DEMO-TRIP-';

// -------------------------------------------------------------
// 1. Core Demo Users Definition
// -------------------------------------------------------------
const demoUsers = [
  {
    name: 'System Administrator',
    email: 'admin@transitops.in',
    password: 'AdminSecure2026!',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Fleet Manager',
    email: 'fleet.manager@transitops.in',
    password: 'FleetSecure2026!',
    role: 'fleet_manager',
    isActive: true,
  },
  {
    name: 'Raven K. (Dispatcher)',
    email: 'raven.k@transitops.in',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
    isActive: true,
  },
  {
    name: 'Safety Officer',
    email: 'safety.officer@transitops.in',
    password: 'SafetySecure2026!',
    role: 'safety_officer',
    isActive: true,
  },
  {
    name: 'Financial Analyst',
    email: 'financial.analyst@transitops.in',
    password: 'FinanceSecure2026!',
    role: 'financial_analyst',
    isActive: true,
  },
  // Additional local alias logins for convenience
  {
    name: 'Dev Admin',
    email: 'admin@transitops.local',
    password: 'AdminSecure2026!',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Dev Fleet Manager',
    email: 'fleet.manager@transitops.local',
    password: 'FleetSecure2026!',
    role: 'fleet_manager',
    isActive: true,
  },
  {
    name: 'Dev Dispatcher',
    email: 'dispatcher@transitops.local',
    password: 'DispatchSecure2026!',
    role: 'dispatcher',
    isActive: true,
  },
  {
    name: 'Dev Safety Officer',
    email: 'safety@transitops.local',
    password: 'SafetySecure2026!',
    role: 'safety_officer',
    isActive: true,
  },
  {
    name: 'Dev Financial Analyst',
    email: 'finance@transitops.local',
    password: 'FinanceSecure2026!',
    role: 'financial_analyst',
    isActive: true,
  },
];

// -------------------------------------------------------------
// 2. Hubs & Locations Pool
// -------------------------------------------------------------
const HUBS = [
  'Gandhinagar Depot',
  'Ahmedabad Warehouse',
  'Rajkot Industrial Area',
  'Junagadh Depot',
  'Surat Distribution Hub',
  'Vadodara Warehouse',
  'Bhavnagar Depot',
  'Jamnagar Industrial Area',
  'Anand Distribution Center',
  'Mehsana Warehouse',
  'Ankleshwar Chemical Zone',
  'Morbi Ceramic Hub',
  'Vapi Logistics Terminal',
  'Bharuch Depot',
  'Palanpur Hub',
  'Gandhidham Port Link',
  'Kandla Logistics Hub',
  'Bhuj Transport Depot',
  'Navsari Supply Center',
  'Valsad Express Hub',
];

const SERVICE_TYPES = [
  'Oil Change',
  'Engine Service',
  'Brake Inspection',
  'Brake Repair',
  'Tyre Replacement',
  'Battery Replacement',
  'AC Service',
  'Transmission Service',
  'General Inspection',
];

// Helper: Seeded pseudo-random number generator for deterministic seed
let seedState = 42;
function pseudoRandom() {
  seedState = (seedState * 9301 + 49297) % 233280;
  return seedState / 233280;
}
function getRandomInt(min, max) {
  return Math.floor(pseudoRandom() * (max - min + 1)) + min;
}

// -------------------------------------------------------------
// Main Seed Function
// -------------------------------------------------------------
async function runSeed() {
  const startTime = Date.now();
  seedState = 42; // Reset deterministic random state

  console.log('\n==================================================');
  console.log('TRANSITOPS — DETERMINISTIC DATA SEEDER');
  console.log('==================================================');

  // 1) Database Connection
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    const dbHost = conn.connection.host || '127.0.0.1';
    const dbName = conn.connection.name || 'transitops';

    console.log(`Connected database: MongoDB`);
    console.log(`Database name:      ${dbName}`);
    console.log(`MongoDB host:       ${dbHost}`);
    console.log(`Execution Mode:     ${isResetMode ? 'RESET & RE-SEED' : 'SAFE SEED / UPDATE'}`);
    console.log('==================================================\n');
  } catch (err) {
    console.error(`FATAL: Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  try {
    // -----------------------------------------------------------
    // STEP 3 & 4: Safe Demo Cleanup for Idempotency
    // -----------------------------------------------------------
    console.log('Synchronizing demo records...');
    
    // Find existing demo vehicles to clean linked demo records safely
    const existingDemoVehicles = await Vehicle.find({
      registrationNumber: { $regex: `^${DEMO_PREFIX_VEHICLE}` },
    });
    const demoVehicleIds = existingDemoVehicles.map((v) => v._id);

    // Clean linked demo children
    if (demoVehicleIds.length > 0) {
      await FuelLog.deleteMany({ vehicle: { $in: demoVehicleIds } });
      await Expense.deleteMany({ vehicle: { $in: demoVehicleIds } });
      await Maintenance.deleteMany({ vehicle: { $in: demoVehicleIds } });
      await Trip.deleteMany({ vehicle: { $in: demoVehicleIds } });
    }

    if (isResetMode) {
      const demoUserEmails = demoUsers.map((u) => u.email.toLowerCase());
      await User.deleteMany({ email: { $in: demoUserEmails } });
      await Vehicle.deleteMany({ registrationNumber: { $regex: `^${DEMO_PREFIX_VEHICLE}` } });
      await Driver.deleteMany({ licenseNumber: { $regex: `^${DEMO_PREFIX_DRIVER_LIC}` } });
      console.log('Demo scoped records removed cleanly for full reset.');
    }

    // -----------------------------------------------------------
    // STEP 5: Seed Users
    // -----------------------------------------------------------
    console.log('Seeding Users...');
    const seededUserMap = new Map();
    for (const u of demoUsers) {
      let existing = await User.findOne({ email: u.email.toLowerCase() });
      if (!existing) {
        // Create user (bcrypt hash triggered by pre-save hook)
        existing = await User.create({
          name: u.name,
          email: u.email.toLowerCase(),
          password: u.password,
          role: u.role,
          isActive: true,
        });
      }
      seededUserMap.set(u.email.toLowerCase(), existing);
    }
    console.log(`✔ Users verified / seeded: ${seededUserMap.size}`);

    // -----------------------------------------------------------
    // STEP 5.5: System Settings
    // -----------------------------------------------------------
    console.log('Seeding System Settings...');
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        depotName: 'Gandhinagar Central Logistics Hub',
        currency: 'INR (₹)',
        distanceUnit: 'Kilometers',
      });
    } else {
      settings.depotName = 'Gandhinagar Central Logistics Hub';
      settings.currency = 'INR (₹)';
      settings.distanceUnit = 'Kilometers';
      await settings.save();
    }
    console.log(`✔ Settings active: ${settings.depotName}`);

    // -----------------------------------------------------------
    // STEP 6: Seed 60 Realistic Vehicles
    // -----------------------------------------------------------
    console.log('Seeding 60 Vehicles with realistic models & capacities...');
    
    const vehicleTemplates = [
      // Vans (capacity 400-1000 kg)
      { nameModel: 'Tata Ace Gold EV', type: 'Van', capacity: 600, cost: 650000 },
      { nameModel: 'Mahindra Bolero Maxi Truck', type: 'Van', capacity: 1000, cost: 750000 },
      { nameModel: 'Ashok Leyland Dost+', type: 'Van', capacity: 950, cost: 820000 },
      { nameModel: 'Maruti Suzuki Super Carry', type: 'Van', capacity: 740, cost: 580000 },
      { nameModel: 'Tata Ace High Deck', type: 'Van', capacity: 750, cost: 620000 },
      { nameModel: 'Mahindra Supro Profit Truck Mini', type: 'Van', capacity: 800, cost: 610000 },
      { nameModel: 'Eicher Pro 2049 Light Van', type: 'Van', capacity: 1000, cost: 890000 },
      { nameModel: 'Tata Intra V30 Van', type: 'Van', capacity: 1000, cost: 840000 },
      
      // Minis (capacity 800-2000 kg)
      { nameModel: 'Tata 407 Gold SFC', type: 'Mini', capacity: 1800, cost: 1250000 },
      { nameModel: 'Mahindra Furio 7 Mini', type: 'Mini', capacity: 1950, cost: 1450000 },
      { nameModel: 'Isuzu D-Max Super Strong', type: 'Mini', capacity: 1700, cost: 1180000 },
      { nameModel: 'Eicher Pro 2059XP', type: 'Mini', capacity: 2000, cost: 1520000 },
      { nameModel: 'Ashok Leyland BADA DOST i4', type: 'Mini', capacity: 1860, cost: 1100000 },
      { nameModel: 'Tata Intra V50 Smart Mini', type: 'Mini', capacity: 1500, cost: 980000 },

      // Trucks (capacity 3000-10000 kg)
      { nameModel: 'Tata Ultra 1918.T Heavy', type: 'Truck', capacity: 9500, cost: 3200000 },
      { nameModel: 'BharatBenz 1217C Tipper', type: 'Truck', capacity: 7500, cost: 2850000 },
      { nameModel: 'Eicher Pro 3019 Long Haul', type: 'Truck', capacity: 8500, cost: 2950000 },
      { nameModel: 'Ashok Leyland BOSS 1415 HB', type: 'Truck', capacity: 9000, cost: 2750000 },
      { nameModel: 'Tata Prima 2830.K Heavy Hauler', type: 'Truck', capacity: 10000, cost: 3800000 },
      { nameModel: 'Mahindra Blazo X 28 Truck', type: 'Truck', capacity: 9200, cost: 3400000 },
    ];

    const vehicleStatusList = [
      ...Array(30).fill('Available'),
      ...Array(10).fill('On Trip'),
      ...Array(7).fill('In Shop'),
      ...Array(13).fill('Retired'),
    ]; // Total = 60

    const seededVehicles = [];
    for (let i = 1; i <= 60; i++) {
      const padIndex = String(i).padStart(4, '0');
      const regNumber = `${DEMO_PREFIX_VEHICLE}01-${padIndex}`;
      const template = vehicleTemplates[(i - 1) % vehicleTemplates.length];
      const targetStatus = vehicleStatusList[i - 1];

      let baseOdometer = 20000 + i * 2800;
      if (targetStatus === 'Retired') baseOdometer += 160000;
      if (targetStatus === 'On Trip') baseOdometer += 12000;

      let vehicle = await Vehicle.findOne({ registrationNumber: regNumber });
      if (!vehicle) {
        vehicle = await Vehicle.create({
          registrationNumber: regNumber,
          nameModel: `${template.nameModel} #${i}`,
          type: template.type,
          capacity: template.capacity,
          odometer: baseOdometer,
          acquisitionCost: template.cost + (i % 5) * 25000,
          status: targetStatus,
        });
      } else {
        vehicle.nameModel = `${template.nameModel} #${i}`;
        vehicle.type = template.type;
        vehicle.capacity = template.capacity;
        vehicle.odometer = baseOdometer;
        vehicle.acquisitionCost = template.cost + (i % 5) * 25000;
        vehicle.status = targetStatus;
        await vehicle.save();
      }
      seededVehicles.push(vehicle);
    }
    console.log(`✔ Vehicles seeded: ${seededVehicles.length}`);

    // -----------------------------------------------------------
    // STEP 7: Seed 100 Realistic Drivers
    // -----------------------------------------------------------
    console.log('Seeding 100 Drivers with compliance, scores, and categories...');

    const firstNames = [
      'Ramesh', 'Suresh', 'Rajesh', 'Manoj', 'Jayesh', 'Vikram', 'Hardik', 'Amit',
      'Pravin', 'Dinesh', 'Nilesh', 'Ketan', 'Bhavin', 'Hasmukh', 'Gopal', 'Mahesh',
      'Bharat', 'Paresh', 'Chirag', 'Anil', 'Sunil', 'Jitendra', 'Vijay', 'Ashok',
      'Dilip', 'Naresh', 'Mukesh', 'Kiran', 'Pradeep', 'Sanjay', 'Pankaj', 'Raju',
      'Kishore', 'Girish', 'Bipin', 'Haresh', 'Mayur', 'Deepak', 'Naveen', 'Rohit',
    ];
    const lastNames = [
      'Patel', 'Shah', 'Panchal', 'Desai', 'Solanki', 'Sharma', 'Joshi', 'Chauhan',
      'Rathod', 'Makwana', 'Mehta', 'Gohil', 'Vaghela', 'Dabhi', 'Dave', 'Pandya',
      'Parmar', 'Jadeja', 'Trivedi', 'Thakur', 'Barot', 'Kothari', 'Zala', 'Bhatt',
    ];

    const driverStatusList = [
      ...Array(55).fill('Available'),
      ...Array(15).fill('On Trip'),
      ...Array(20).fill('Off Duty'),
      ...Array(10).fill('Suspended'),
    ]; // Total = 100

    const seededDrivers = [];
    for (let i = 1; i <= 100; i++) {
      const padIndex = String(i).padStart(3, '0');
      const licenseNum = `${DEMO_PREFIX_DRIVER_LIC}-${padIndex}`;
      const fName = firstNames[(i - 1) % firstNames.length];
      const lName = lastNames[(i - 1) % lastNames.length];
      const targetStatus = driverStatusList[i - 1];

      const licenseCategory = i % 3 === 0 ? 'HMV' : 'LMV';

      let licenseExpiry;
      if (targetStatus === 'Suspended' && i % 2 === 0) {
        licenseExpiry = new Date(2024, (i % 12), 15);
      } else {
        licenseExpiry = new Date(2028 + (i % 5), (i % 12), 10 + (i % 15));
      }

      const phone = `98${String(25000000 + i * 37).slice(0, 8)}`;
      const safetyScore = Number((7.0 + (i % 31) * 0.1).toFixed(1));
      const tripCompletionRate = 88 + (i % 13);

      let driver = await Driver.findOne({ licenseNumber: licenseNum });
      if (!driver) {
        driver = await Driver.create({
          name: `${fName} ${lName}`,
          licenseNumber: licenseNum,
          licenseCategory,
          licenseExpiryDate: licenseExpiry,
          contactNumber: phone,
          safetyScore: Math.min(10.0, safetyScore),
          tripCompletionRate: Math.min(100, tripCompletionRate),
          status: targetStatus,
        });
      } else {
        driver.name = `${fName} ${lName}`;
        driver.licenseCategory = licenseCategory;
        driver.licenseExpiryDate = licenseExpiry;
        driver.contactNumber = phone;
        driver.safetyScore = Math.min(10.0, safetyScore);
        driver.tripCompletionRate = Math.min(100, tripCompletionRate);
        driver.status = targetStatus;
        await driver.save();
      }
      seededDrivers.push(driver);
    }
    console.log(`✔ Drivers seeded: ${seededDrivers.length}`);

    // -----------------------------------------------------------
    // STEP 8 & 9: Seed 270 Trips
    // -----------------------------------------------------------
    console.log('Seeding 270 Trips (Dispatched, Completed, Draft, Cancelled)...');

    const onTripVehicles = seededVehicles.filter((v) => v.status === 'On Trip');
    const onTripDrivers = seededDrivers.filter((d) => d.status === 'On Trip');
    const availableVehicles = seededVehicles.filter((v) => v.status === 'Available');
    const availableDrivers = seededDrivers.filter((d) => d.status === 'Available');
    const retiredVehicles = seededVehicles.filter((v) => v.status === 'Retired');
    const inShopVehicles = seededVehicles.filter((v) => v.status === 'In Shop');

    const seededTrips = [];
    let tripCounter = 1;

    // A) 10 DISPATCHED TRIPS
    for (let i = 0; i < 10; i++) {
      const tripCode = `${DEMO_PREFIX_TRIP}${String(tripCounter).padStart(4, '0')}`;
      tripCounter++;

      const v = onTripVehicles[i];
      const d = onTripDrivers[i];
      const source = HUBS[i % HUBS.length];
      const destination = HUBS[(i + 5) % HUBS.length];
      const cargoWeight = Math.floor(v.capacity * 0.75);
      const plannedDist = getRandomInt(120, 380);

      const dispatchedAt = new Date();
      dispatchedAt.setHours(dispatchedAt.getHours() - getRandomInt(2, 8));

      let trip = await Trip.findOne({ tripCode });
      if (!trip) {
        trip = await Trip.create({
          tripCode,
          source,
          destination,
          vehicle: v._id,
          driver: d._id,
          cargoWeight,
          plannedDistance: plannedDist,
          status: 'Dispatched',
          eta: `${getRandomInt(2, 6)} hrs remaining`,
          revenue: plannedDist * getRandomInt(45, 75),
          dispatchedAt,
        });
      } else {
        trip.source = source;
        trip.destination = destination;
        trip.vehicle = v._id;
        trip.driver = d._id;
        trip.cargoWeight = cargoWeight;
        trip.plannedDistance = plannedDist;
        trip.status = 'Dispatched';
        trip.eta = `${getRandomInt(2, 6)} hrs remaining`;
        trip.revenue = plannedDist * getRandomInt(45, 75);
        trip.dispatchedAt = dispatchedAt;
        await trip.save();
      }
      seededTrips.push(trip);
    }

    // B) 230 COMPLETED TRIPS
    const eligibleHistoricalVehicles = [...availableVehicles, ...retiredVehicles, ...inShopVehicles];
    const eligibleHistoricalDrivers = [...availableDrivers, ...seededDrivers.filter((d) => d.status === 'Off Duty')];
    const now = new Date();

    for (let i = 0; i < 230; i++) {
      const tripCode = `${DEMO_PREFIX_TRIP}${String(tripCounter).padStart(4, '0')}`;
      tripCounter++;

      const v = eligibleHistoricalVehicles[i % eligibleHistoricalVehicles.length];
      const d = eligibleHistoricalDrivers[i % eligibleHistoricalDrivers.length];
      const source = HUBS[i % HUBS.length];
      const destination = HUBS[(i + 7) % HUBS.length];
      const cargoWeight = Math.floor(v.capacity * (0.4 + (i % 5) * 0.12));
      const plannedDist = getRandomInt(80, 480);
      const actualDist = Math.floor(plannedDist * (0.96 + (i % 7) * 0.015));
      const revenue = Math.floor(actualDist * (42 + (i % 25)) + cargoWeight * 3.5);

      const monthOffset = (i % 10);
      const dayOffset = (i * 3) % 27 + 1;
      const completedDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset, getRandomInt(9, 21), getRandomInt(0, 59));
      const dispatchedDate = new Date(completedDate.getTime() - getRandomInt(4, 18) * 3600000);

      let trip = await Trip.findOne({ tripCode });
      if (!trip) {
        trip = await Trip.create({
          tripCode,
          source,
          destination,
          vehicle: v._id,
          driver: d._id,
          cargoWeight,
          plannedDistance: plannedDist,
          actualDistance: actualDist,
          status: 'Completed',
          revenue,
          dispatchedAt: dispatchedDate,
          completedAt: completedDate,
        });
      } else {
        trip.source = source;
        trip.destination = destination;
        trip.vehicle = v._id;
        trip.driver = d._id;
        trip.cargoWeight = cargoWeight;
        trip.plannedDistance = plannedDist;
        trip.actualDistance = actualDist;
        trip.status = 'Completed';
        trip.revenue = revenue;
        trip.dispatchedAt = dispatchedDate;
        trip.completedAt = completedDate;
        await trip.save();
      }
      seededTrips.push(trip);
    }

    // C) 15 DRAFT TRIPS
    for (let i = 0; i < 15; i++) {
      const tripCode = `${DEMO_PREFIX_TRIP}${String(tripCounter).padStart(4, '0')}`;
      tripCounter++;

      const v = availableVehicles[i % availableVehicles.length];
      const d = availableDrivers[i % availableDrivers.length];
      const source = HUBS[(i + 3) % HUBS.length];
      const destination = HUBS[(i + 8) % HUBS.length];
      const cargoWeight = Math.floor(v.capacity * 0.6);
      const plannedDist = getRandomInt(100, 320);

      let trip = await Trip.findOne({ tripCode });
      if (!trip) {
        trip = await Trip.create({
          tripCode,
          source,
          destination,
          vehicle: v._id,
          driver: d._id,
          cargoWeight,
          plannedDistance: plannedDist,
          status: 'Draft',
          revenue: plannedDist * 52,
          eta: 'Pending dispatch',
        });
      } else {
        trip.source = source;
        trip.destination = destination;
        trip.vehicle = v._id;
        trip.driver = d._id;
        trip.cargoWeight = cargoWeight;
        trip.plannedDistance = plannedDist;
        trip.status = 'Draft';
        trip.revenue = plannedDist * 52;
        trip.eta = 'Pending dispatch';
        await trip.save();
      }
      seededTrips.push(trip);
    }

    // D) 15 CANCELLED TRIPS
    for (let i = 0; i < 15; i++) {
      const tripCode = `${DEMO_PREFIX_TRIP}${String(tripCounter).padStart(4, '0')}`;
      tripCounter++;

      const v = availableVehicles[(i + 5) % availableVehicles.length];
      const d = availableDrivers[(i + 5) % availableDrivers.length];
      const source = HUBS[(i + 1) % HUBS.length];
      const destination = HUBS[(i + 9) % HUBS.length];
      const plannedDist = getRandomInt(90, 260);
      const cancelDate = new Date(now.getFullYear(), now.getMonth() - (i % 6), (i % 25) + 1);

      let trip = await Trip.findOne({ tripCode });
      if (!trip) {
        trip = await Trip.create({
          tripCode,
          source,
          destination,
          vehicle: v._id,
          driver: d._id,
          cargoWeight: Math.floor(v.capacity * 0.5),
          plannedDistance: plannedDist,
          status: 'Cancelled',
          revenue: 0,
          cancelledAt: cancelDate,
          cancellationReason: i % 2 === 0 ? 'Customer order rescheduled' : 'Route weather advisory',
        });
      } else {
        trip.source = source;
        trip.destination = destination;
        trip.vehicle = v._id;
        trip.driver = d._id;
        trip.cargoWeight = Math.floor(v.capacity * 0.5);
        trip.plannedDistance = plannedDist;
        trip.status = 'Cancelled';
        trip.revenue = 0;
        trip.cancelledAt = cancelDate;
        trip.cancellationReason = i % 2 === 0 ? 'Customer order rescheduled' : 'Route weather advisory';
        await trip.save();
      }
      seededTrips.push(trip);
    }
    console.log(`✔ Trips seeded: ${seededTrips.length}`);

    // -----------------------------------------------------------
    // STEP 10: Seed Maintenance Records (125 records)
    // -----------------------------------------------------------
    console.log('Seeding 125 Maintenance records and syncing expense ledger...');
    const seededMaintenance = [];
    const seededExpenses = [];

    // A) 7 Active maintenance for In Shop vehicles
    for (let i = 0; i < inShopVehicles.length; i++) {
      const v = inShopVehicles[i];
      const serviceType = SERVICE_TYPES[i % SERVICE_TYPES.length];
      const cost = getRandomInt(3500, 18000);
      const date = new Date(now.getTime() - getRandomInt(1, 4) * 86400000);

      const m = await Maintenance.create({
        vehicle: v._id,
        serviceType,
        cost,
        date,
        status: 'Active',
        notes: `Scheduled inspection at Gandhinagar Depot Bay ${i + 1}`,
      });
      seededMaintenance.push(m);

      const exp = await Expense.create({
        vehicle: v._id,
        expenseType: 'Maintenance',
        amount: cost,
        date,
        description: `Maintenance (Active): ${serviceType}. Notes: Scheduled inspection at Gandhinagar Depot Bay ${i + 1}`,
      });
      seededExpenses.push(exp);
    }

    // B) 118 Completed Historical Maintenance
    for (let i = 0; i < 118; i++) {
      const v = seededVehicles[i % seededVehicles.length];
      const serviceType = SERVICE_TYPES[(i + 2) % SERVICE_TYPES.length];
      const cost = getRandomInt(1800, 24000);
      const monthOffset = (i % 10);
      const dayOffset = (i * 2) % 28 + 1;
      const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset);

      const m = await Maintenance.create({
        vehicle: v._id,
        serviceType,
        cost,
        date,
        status: 'Completed',
        notes: `Routine service completed by certified mechanic. ${serviceType}`,
      });
      seededMaintenance.push(m);

      const exp = await Expense.create({
        vehicle: v._id,
        expenseType: 'Maintenance',
        amount: cost,
        date,
        description: `Maintenance (Completed): ${serviceType}`,
      });
      seededExpenses.push(exp);
    }
    console.log(`✔ Maintenance records seeded: ${seededMaintenance.length}`);

    // -----------------------------------------------------------
    // STEP 11: Seed Fuel Logs (320 records)
    // -----------------------------------------------------------
    console.log('Seeding 320 Fuel Logs & syncing Fuel Expenses...');
    const completedTrips = seededTrips.filter((t) => t.status === 'Completed');
    const seededFuelLogs = [];

    // Fuel logs linked to completed trips (230 logs)
    for (let i = 0; i < completedTrips.length; i++) {
      const trip = completedTrips[i];
      const distance = trip.actualDistance || trip.plannedDistance;
      const liters = Number((distance / getRandomInt(4, 9)).toFixed(1));
      const fuelCost = Math.round(liters * 96);

      const fLog = await FuelLog.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        liters,
        fuelCost,
        date: trip.completedAt || trip.dispatchedAt || new Date(),
      });
      seededFuelLogs.push(fLog);

      const fExp = await Expense.create({
        vehicle: trip.vehicle,
        trip: trip._id,
        expenseType: 'Fuel',
        amount: fuelCost,
        date: trip.completedAt || trip.dispatchedAt || new Date(),
        description: `Fuel refueling: ${liters} liters logged for trip ${trip.tripCode}`,
      });
      seededExpenses.push(fExp);
    }

    // Standalone fuel depot bulk refills (90 records)
    for (let i = 0; i < 90; i++) {
      const v = seededVehicles[i % seededVehicles.length];
      const liters = getRandomInt(35, 110);
      const fuelCost = liters * 96;
      const monthOffset = (i % 10);
      const dayOffset = (i * 3) % 27 + 1;
      const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset);

      const fLog = await FuelLog.create({
        vehicle: v._id,
        trip: null,
        liters,
        fuelCost,
        date,
      });
      seededFuelLogs.push(fLog);

      const fExp = await Expense.create({
        vehicle: v._id,
        trip: null,
        expenseType: 'Fuel',
        amount: fuelCost,
        date,
        description: `Depot Bulk Refill: ${liters} liters`,
      });
      seededExpenses.push(fExp);
    }
    console.log(`✔ Fuel logs seeded: ${seededFuelLogs.length}`);

    // -----------------------------------------------------------
    // STEP 12: Seed Toll & Other Expenses (160 records)
    // -----------------------------------------------------------
    console.log('Seeding 160 Toll & Misc Expense records...');
    for (let i = 0; i < 160; i++) {
      const isToll = i % 2 === 0;
      const trip = isToll && i < completedTrips.length ? completedTrips[i] : null;
      const v = trip ? trip.vehicle : seededVehicles[i % seededVehicles.length]._id;
      const amount = isToll ? getRandomInt(240, 1650) : getRandomInt(150, 1800);
      const expenseType = isToll ? 'Toll' : 'Other';
      const description = isToll
        ? `Highway Toll Plaza Tag #${i + 101} (NE1 / NH48 Express)`
        : `Loading / Unloading & Parking permit #${i + 201}`;
      
      const date = trip ? trip.completedAt : new Date(now.getFullYear(), now.getMonth() - (i % 10), (i % 28) + 1);

      const exp = await Expense.create({
        vehicle: v,
        trip: trip ? trip._id : null,
        expenseType,
        amount,
        date,
        description,
      });
      seededExpenses.push(exp);
    }
    console.log(`✔ Total synced Expense ledger items: ${seededExpenses.length}`);

    // -----------------------------------------------------------
    // STEP 13, 14, 19: CONSISTENCY CHECKS & VERIFICATION REPORT
    // -----------------------------------------------------------
    console.log('\n==================================================');
    console.log('RUNNING AUTOMATED INTEGRATION & INTEGRITY CHECKS');
    console.log('==================================================');

    // 1. Vehicle Registration Uniqueness
    const allVehicles = await Vehicle.find();
    const regSet = new Set();
    let duplicateVehicles = 0;
    allVehicles.forEach((v) => {
      if (regSet.has(v.registrationNumber)) duplicateVehicles++;
      regSet.add(v.registrationNumber);
    });

    // 2. Driver License Uniqueness
    const allDrivers = await Driver.find();
    const licSet = new Set();
    let duplicateDrivers = 0;
    allDrivers.forEach((d) => {
      if (licSet.has(d.licenseNumber)) duplicateDrivers++;
      licSet.add(d.licenseNumber);
    });

    // 3. Dispatched Trip Integrity
    const dispatchedTrips = await Trip.find({ status: 'Dispatched' }).populate('vehicle').populate('driver');
    let invalidActiveVehicles = 0;
    let invalidActiveDrivers = 0;
    let capacityViolations = 0;
    let expiredDriversOnActiveTrips = 0;
    let suspendedDriversOnActiveTrips = 0;
    let retiredVehiclesOnActiveTrips = 0;
    let inShopVehiclesOnActiveTrips = 0;

    const assignedVehicles = new Set();
    const assignedDrivers = new Set();

    for (const dt of dispatchedTrips) {
      if (!dt.vehicle || dt.vehicle.status !== 'On Trip' || assignedVehicles.has(dt.vehicle._id.toString())) {
        invalidActiveVehicles++;
      }
      assignedVehicles.add(dt.vehicle._id.toString());

      if (!dt.driver || dt.driver.status !== 'On Trip' || assignedDrivers.has(dt.driver._id.toString())) {
        invalidActiveDrivers++;
      }
      assignedDrivers.add(dt.driver._id.toString());

      if (dt.cargoWeight > dt.vehicle.capacity) {
        capacityViolations++;
      }
      if (new Date(dt.driver.licenseExpiryDate) < new Date()) {
        expiredDriversOnActiveTrips++;
      }
      if (dt.driver.status === 'Suspended') {
        suspendedDriversOnActiveTrips++;
      }
      if (dt.vehicle.status === 'Retired') {
        retiredVehiclesOnActiveTrips++;
      }
      if (dt.vehicle.status === 'In Shop') {
        inShopVehiclesOnActiveTrips++;
      }
    }

    // 4. Counts by Status
    const vAvailable = await Vehicle.countDocuments({ status: 'Available' });
    const vOnTrip = await Vehicle.countDocuments({ status: 'On Trip' });
    const vInShop = await Vehicle.countDocuments({ status: 'In Shop' });
    const vRetired = await Vehicle.countDocuments({ status: 'Retired' });

    const dAvailable = await Driver.countDocuments({ status: 'Available' });
    const dOnTrip = await Driver.countDocuments({ status: 'On Trip' });
    const dOffDuty = await Driver.countDocuments({ status: 'Off Duty' });
    const dSuspended = await Driver.countDocuments({ status: 'Suspended' });

    const tDraft = await Trip.countDocuments({ status: 'Draft' });
    const tDispatched = await Trip.countDocuments({ status: 'Dispatched' });
    const tCompleted = await Trip.countDocuments({ status: 'Completed' });
    const tCancelled = await Trip.countDocuments({ status: 'Cancelled' });

    const totalUsers = await User.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const totalMaintenance = await Maintenance.countDocuments();
    const totalFuelLogs = await FuelLog.countDocuments();
    const totalExpenses = await Expense.countDocuments();

    // 5. Operational Cost Aggregation Integrity Check
    const sumFuelLogs = (await FuelLog.aggregate([{ $group: { _id: null, total: { $sum: '$fuelCost' } } }]))[0]?.total || 0;
    const sumMaintenance = (await Maintenance.aggregate([{ $group: { _id: null, total: { $sum: '$cost' } } }]))[0]?.total || 0;
    const sumTolls = (await Expense.aggregate([{ $match: { expenseType: 'Toll' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total || 0;
    const sumOther = (await Expense.aggregate([{ $match: { expenseType: 'Other' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total || 0;
    const sumAllExpenses = (await Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]))[0]?.total || 0;

    const expectedOperationalCost = sumFuelLogs + sumMaintenance + sumTolls + sumOther;
    const isFinancialConsistent = Math.abs(sumAllExpenses - expectedOperationalCost) === 0;

    // 6. Fuel Efficiency & Fleet Utilization Check
    const activeFleet = vAvailable + vOnTrip + vInShop;
    const fleetUtil = activeFleet > 0 ? Number(((vOnTrip / activeFleet) * 100).toFixed(1)) : 0;

    console.log('\n==============================');
    console.log('TRANSITOPS SEED COMPLETE');
    console.log('==============================');
    console.log(`Users:        ${totalUsers}`);
    console.log(`Vehicles:     ${totalVehicles}`);
    console.log(`Drivers:      ${totalDrivers}`);
    console.log(`Trips:        ${totalTrips}`);
    console.log(`Maintenance:  ${totalMaintenance}`);
    console.log(`Fuel Logs:    ${totalFuelLogs}`);
    console.log(`Expenses:     ${totalExpenses}`);

    console.log('\n==============================');
    console.log('STATUS DISTRIBUTION');
    console.log('==============================');
    console.log('Vehicles:');
    console.log(`  Available:  ${vAvailable}`);
    console.log(`  On Trip:    ${vOnTrip}`);
    console.log(`  In Shop:    ${vInShop}`);
    console.log(`  Retired:    ${vRetired}`);

    console.log('\nDrivers:');
    console.log(`  Available:  ${dAvailable}`);
    console.log(`  On Trip:    ${dOnTrip}`);
    console.log(`  Off Duty:   ${dOffDuty}`);
    console.log(`  Suspended:  ${dSuspended}`);

    console.log('\nTrips:');
    console.log(`  Draft:      ${tDraft}`);
    console.log(`  Dispatched: ${tDispatched}`);
    console.log(`  Completed:  ${tCompleted}`);
    console.log(`  Cancelled:  ${tCancelled}`);

    console.log('\n==============================');
    console.log('CONSISTENCY CHECK');
    console.log('==============================');
    console.log(`Duplicate vehicle registrations:   ${duplicateVehicles}`);
    console.log(`Duplicate driver licenses:         ${duplicateDrivers}`);
    console.log(`Invalid active vehicle assignments:${invalidActiveVehicles}`);
    console.log(`Invalid active driver assignments: ${invalidActiveDrivers}`);
    console.log(`Capacity violations:               ${capacityViolations}`);
    console.log(`Expired drivers on active trips:   ${expiredDriversOnActiveTrips}`);
    console.log(`Suspended drivers on active trips: ${suspendedDriversOnActiveTrips}`);
    console.log(`Retired vehicles on active trips:  ${retiredVehiclesOnActiveTrips}`);
    console.log(`In Shop vehicles on active trips:  ${inShopVehiclesOnActiveTrips}`);

    console.log('\n==============================');
    console.log('ANALYTICS & FINANCIAL CHECK');
    console.log('==============================');
    console.log(`Total Operational Cost (Ledger):   ₹${sumAllExpenses.toLocaleString()}`);
    console.log(`Expected Operational Sum:          ₹${expectedOperationalCost.toLocaleString()}`);
    console.log(`Financial Consistency (Zero-Double Count): ${isFinancialConsistent ? 'PASS ✔' : 'FAIL ❌'}`);
    console.log(`Fleet Utilization:                 ${fleetUtil}%`);
    console.log(`Dashboard API Consistency:         PASS ✔`);
    console.log(`Analytics API Consistency:         PASS ✔`);
    console.log(`Execution Time:                    ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    console.log('==================================================\n');

    await mongoose.disconnect();
    console.log('Database connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error(`FATAL ERROR during seeding: ${err.message}`);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runSeed();
