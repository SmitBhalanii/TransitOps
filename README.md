# TransitOps — Smart Transport Operations Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#license)

---

## 1. Project Title
**TransitOps — Centralized Smart Transport & Fleet Operations Management Platform**

---

## 2. Project Overview
TransitOps is an enterprise-grade Transport Operations System developed using the full **MERN (MongoDB, Express.js, React.js, Node.js)** architecture. Designed specifically for commercial transport hubs, logistics providers, and depot dispatch centers, TransitOps unifies fleet tracking, driver compliance, multi-stage trip lifecycles, maintenance workflows, refueling ledgers, operational expenses, live dashboard KPIs, and financial ROI analytics under a strictly enforced **Role-Based Access Control (RBAC)** security layer.

---

## 3. Problem Statement
Commercial transport operations struggle with disparate, uncoordinated systems:
- **Manual & Error-Prone Dispatching**: Overloaded vehicles, uninspected/broken trucks dispatched on highways, and operators with expired or suspended licenses driving illegally.
- **Disconnected Maintenance Logs**: Vehicles scheduled for critical shop maintenance are inadvertently dispatched because the garage and dispatch teams operate in silos.
- **Financial Double-Counting & Cost Blindspots**: Fuel logs, garage maintenance bills, highway tolls, and trip revenue are logged across different spreadsheets, leading to skewed operational calculations and zero visibility into asset-level Return on Investment (ROI).
- **Security & Authorization Vulnerabilities**: Operations personnel possessing unrestricted database access or relying entirely on client-side frontend security locks.

---

## 4. Objectives
- **End-to-End Operational Safety**: Enforce strict server-side validation rejecting any dispatch of overloaded vehicles, suspended drivers, expired licenses, or vehicles undergoing active maintenance.
- **Transactional State Management**: Automatically coordinate vehicle and driver availability when trips or maintenance records transition across states.
- **Authoritative Operational Accounting**: Provide server-side aggregation pipelines calculating total operational costs (`Fuel + Maintenance + Tolls + Misc`) with mathematical zero double-counting.
- **Dynamic Real-Time Analytics**: Compute vehicle-level Return on Investment (`ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost`), fleet utilization %, fuel efficiency (km/L), and monthly revenue trends.
- **Strict Role-Based Security**: Isolate user capabilities across 5 distinct organizational roles, protecting endpoints with JWTs, bcrypt password hashing, and brute-force account lockout protections.

---

## 5. Key Features

| Module | Core Capabilities |
| :--- | :--- |
| **Authentication & RBAC** | JWT session authentication, bcrypt salt hashing, 5-attempt brute-force account lockouts (15-minute timer), and server-enforced route authorization. |
| **Fleet / Vehicle Registry** | Full CRUD, unique registration numbers, capacity thresholds (kg), odometer tracking, acquisition cost recording, and live status (`Available`, `On Trip`, `In Shop`, `Retired`). |
| **Driver & Compliance Management** | License validation, category classification (`LMV`, `HMV`), expiry tracking, contact profiles, safety score metrics, and quick suspension toggles. |
| **Trip Dispatcher Engine** | Controlled status pipeline (`Draft` $\rightarrow$ `Dispatched` $\rightarrow$ `Completed` / `Cancelled`), cargo vs capacity verification, license expiration checks, and automatic asset availability locking. |
| **Maintenance Workflow** | Reactive state transitions (scheduling active maintenance sets vehicle to `In Shop`; completing maintenance sets vehicle to `Available` while preserving `Retired` locks), and auto-synced expense ledgers. |
| **Fuel & Expense Ledger** | Liters/cost tracking, trip toll logging, unified operational expenditure calculation with zero double-counting, and cascade cleanups. |
| **Live Operations Dashboard** | Real-time MongoDB aggregations for Active/Available/In Shop vehicles, Active/Pending dispatches, on-duty drivers, fleet utilization %, and recent trip feeds with type filtering. |
| **Reports & Financial Analytics** | Overall fuel efficiency (km/L), vehicle-level ROI performance table, monthly revenue trend visualizations via custom SVG charts, top costliest vehicle rankings, and client-side CSV exports. |
| **System Settings** | Global depot identifier, currency notation (`INR ₹`, `USD $`), and distance measurement units (`Kilometers`, `Miles`) persisted server-side with RBAC matrix inspector. |

---

## 6. Roles & Access Matrix

TransitOps enforces **5 distinct organizational personas** with authoritatively guarded API routes and adapted frontend navigation:

| Capability / Module | Administrator | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **User Management** | Full CRUD | — | — | — | — |
| **System Settings** | Full CRUD | View | View | View | View |
| **Fleet / Vehicles** | Full CRUD | Full CRUD | View Only | — | View Only |
| **Drivers & Safety** | Full CRUD | Full CRUD | — | Full CRUD | — |
| **Trip Dispatcher** | Full CRUD | — | Full CRUD | View Only | — |
| **Maintenance Logs** | Full CRUD | Full CRUD | — | — | — |
| **Fuel Refills** | Full CRUD | Full CRUD | — | — | Full CRUD |
| **Toll & Misc Expenses**| Full CRUD | — | Full CRUD | — | Full CRUD |
| **Reports & Analytics** | Full CRUD | View Only | — | — | Full CRUD |

---

## 7. Technology Stack

### **Backend**
- **Runtime**: Node.js (ES Modules syntax)
- **Framework**: Express.js (v4)
- **Database**: MongoDB with Mongoose ODM (v8)
- **Security & Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Architecture**: Modular Controller-Service-Model-Route pattern with centralized `AppError` operational error handling.

### **Frontend**
- **Core**: React 18 with Vite build tooling
- **Routing**: React Router DOM (v6) with declarative `ProtectedRoute` RBAC guards
- **HTTP Client**: Axios with centralized request/response interceptors
- **Icons**: Lucide React
- **Design System**: Vanilla CSS with dark theme tokens, Outfit and Inter typography, responsive auto-fit grids, and custom glassmorphism components.

---

## 8. Architecture

```
                                  ┌─────────────────────────────────┐
                                  │      React SPA (Vite + CSS)     │
                                  └────────────────┬────────────────┘
                                                   │ HTTPS / REST (Axios)
                                                   ▼
                                  ┌─────────────────────────────────┐
                                  │       Express API Gateway       │
                                  └────────────────┬────────────────┘
                                                   │
                ┌──────────────────────────────────┼──────────────────────────────────┐
                │                                  │                                  │
                ▼                                  ▼                                  ▼
      ┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
      │  Auth & Security │               │ Business Modules │               │ Analytics Engine │
      │  - JWT Protect   │               │ - Vehicles/Fleet │               │ - Live Dashboard │
      │  - RBAC Authorize│               │ - Drivers/Safety │               │ - ROI Calculator │
      │  - Rate/Lockouts │               │ - Trip Workflow  │               │ - Expense Ledger │
      │                  │               │ - Maintenance    │               │ - CSV Exporters  │
      └─────────┬────────┘               └─────────┬────────┘               └─────────┬────────┘
                │                                  │                                  │
                └──────────────────────────────────┼──────────────────────────────────┘
                                                   │ Mongoose ODM
                                                   ▼
                                  ┌─────────────────────────────────┐
                                  │      MongoDB Atlas / Local      │
                                  │ (Vehicles, Drivers, Trips, etc) │
                                  └─────────────────────────────────┘
```

---

## 9. Database Entities

- **`User`**: `name`, `email` (unique, lowercase), `password` (bcrypt hashed), `role` (`admin`, `fleet_manager`, `dispatcher`, `safety_officer`, `financial_analyst`), `failedLoginAttempts`, `lockUntil`.
- **`Vehicle`**: `registrationNumber` (unique), `nameModel`, `type` (`Van`, `Truck`, `Mini`), `capacity` (kg), `odometer` (km), `status` (`Available`, `On Trip`, `In Shop`, `Retired`), `acquisitionCost`.
- **`Driver`**: `name`, `licenseNumber` (unique), `licenseCategory` (`LMV`, `HMV`), `licenseExpiryDate`, `contactNumber`, `tripCompletionRate`, `safetyScore`, `status` (`Available`, `On Trip`, `Suspended`, `Off Duty`).
- **`Trip`**: `tripCode` (unique), `source`, `destination`, `vehicle` (ref), `driver` (ref), `cargoWeight`, `plannedDistance`, `actualDistance`, `revenue`, `status` (`Draft`, `Dispatched`, `Completed`, `Cancelled`), `dispatchedAt`, `completedAt`.
- **`Maintenance`**: `vehicle` (ref), `serviceType`, `cost`, `date`, `status` (`Active`, `Completed`), `notes`.
- **`FuelLog`**: `vehicle` (ref), `trip` (ref, optional), `liters`, `fuelCost`, `date`.
- **`Expense`**: `vehicle` (ref), `trip` (ref, optional), `expenseType` (`Toll`, `Other`, `Maintenance`, `Fuel`), `amount`, `date`, `description`.
- **`SystemSettings`**: `depotName`, `currency`, `distanceUnit`.

---

## 10. API Overview

All routes prefixed with `/api`:

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user & issue JWT | Public |
| `GET` | `/auth/me` | Retrieve authenticated profile | All Logged-in Roles |
| `GET` | `/vehicles` | List vehicles with filters | Admin, Fleet Mgr, Dispatcher, Analyst |
| `POST` | `/vehicles` | Register vehicle asset | Admin, Fleet Mgr |
| `GET` | `/drivers` | List drivers with safety search | Admin, Fleet Mgr, Safety Officer |
| `POST` | `/drivers` | Register driver profile | Admin, Fleet Mgr, Safety Officer |
| `PUT` | `/drivers/:id/suspend` | Toggle driver suspension | Admin, Safety Officer |
| `POST` | `/trips` | Create trip draft | Admin, Dispatcher |
| `PUT` | `/trips/:id/dispatch` | Dispatch trip & lock assets | Admin, Dispatcher |
| `PUT` | `/trips/:id/complete` | Complete trip & update odometer | Admin, Dispatcher |
| `POST` | `/maintenance` | Schedule vehicle service | Admin, Fleet Mgr |
| `PUT` | `/maintenance/:id` | Complete vehicle service | Admin, Fleet Mgr |
| `POST` | `/fuel` | Log refueling & sync expense | Admin, Fleet Mgr, Analyst |
| `GET` | `/expenses/operational-cost`| Calculate unified costs | Admin, Analyst |
| `GET` | `/dashboard` | Live operational KPIs | All Logged-in Roles |
| `GET` | `/reports/overview` | Fleet analytics & revenue trend | Admin, Fleet Mgr, Analyst |
| `GET` | `/reports/roi` | Calculate vehicle ROI ledger | Admin, Analyst |
| `GET/PUT` | `/settings` | Get / update system settings | All (GET), Admin Only (PUT) |

---

## 11. Authentication & RBAC

1. **Authentication Flow**: Users log in with email, password, and expected role. Passwords are verified with `bcrypt.compare`. On success, an encoded JWT token signed with `JWT_SECRET` is returned with a 7-day expiration.
2. **Brute-Force Account Protection**: Consecutive failed login attempts increment `failedLoginAttempts`. After 5 failures, `lockUntil` is set to `Date.now() + 15 * 60 * 1000` (15 minutes lockout).
3. **RBAC Middleware**: Protected routes pass through `protect` (verifying Bearer token headers) followed by `authorize(...roles)`. If a user's role is not within the authorized parameters, the request is rejected with `403 Forbidden`.

---

## 12. Business Rules & Enforcement

- **BR-1: Cargo Capacity Limits**: `trip.cargoWeight <= vehicle.capacity`. Dispatches exceeding vehicle payload capacity are rejected server-side with `400 Bad Request`.
- **BR-2: Driver License Expiry**: Drivers with `new Date(driver.licenseExpiryDate) < new Date()` are strictly blocked from dispatch.
- **BR-3: Driver Suspension Lock**: Drivers with status `Suspended` cannot be assigned or dispatched.
- **BR-4: Vehicle Maintenance State Lock**: Active maintenance sets vehicle to `In Shop`. In-shop vehicles are automatically rejected during dispatch attempts.
- **BR-5: Retired Asset State Preservation**: Completing maintenance on a `Retired` vehicle preserves the `Retired` status and does not revert it to `Available`.
- **BR-6: Double-Dispatch Immunity**: Once dispatched, vehicle and driver statuses transition to `On Trip`. Simultaneous dispatch attempts with active assets are rejected.
- **BR-7: Automatic Financial Ledger Sync**: Creating a `FuelLog` or `Maintenance` record automatically generates a synced `Expense` entry. Deleting either cascades and cleans up the associated expense entry.
- **BR-8: Non-Double-Counting Operational Cost**:
  $$\text{Operational Cost} = \text{Sum(FuelLog.fuelCost)} + \text{Sum(Maintenance.cost)} + \text{Sum(Expense[Toll + Other])}$$
- **BR-9: Approved Vehicle Return-on-Investment (ROI)**:
  $$\text{ROI (\%)} = \frac{\text{Trip Revenue} - (\text{Maintenance Cost} + \text{Fuel Cost})}{\text{Vehicle Acquisition Cost}} \times 100$$

---

## 13. Cross-Module Workflows

### Workflow 1: End-to-End Trip Lifecycle
$$\text{Create Draft} \longrightarrow \text{Validate Constraints} \longrightarrow \text{Dispatch (Lock to 'On Trip')} \longrightarrow \text{Complete (Revert to 'Available' + Add Odometer + Sync Fuel/Expense) } \longrightarrow \text{Update Dashboard \& ROI}$$

### Workflow 2: Maintenance Garage Cycle
$$\text{Vehicle 'Available'} \longrightarrow \text{Schedule Maintenance} \longrightarrow \text{Vehicle 'In Shop' (Excluded from Dispatch)} \longrightarrow \text{Service Finished} \longrightarrow \text{Vehicle 'Available'}$$

---

## 14. Screenshots Section

| Screen | Description |
| :--- | :--- |
| **Login & Lockout** | Wireframe-accurate dark login modal with role selector, remember-me support, and security warning feedback. |
| **Live Dashboard** | Real-time operations board showing Active/Available counters, progress bar utilization indexes, status shares, and recent dispatches. |
| **Vehicle Registry** | Fleet management screen displaying capacities, odometers, status badges, filters, and create/update asset modals. |
| **Drivers & Safety** | Driver monitoring board with license validation, contact cards, safety scores, and instant suspension toggles. |
| **Trip Dispatcher** | Live dispatch board displaying cargo capacity bars, route details, available vehicle selectors, and completion modals. |
| **Maintenance Logs** | Garage service manager with cost records, service types, notes, and auto-state hooks. |
| **Fuel & Expense Ledger**| Unified financial ledger combining refueling logs, highway tolls, and operational cost breakdowns. |
| **Reports & Analytics** | Executive financial analytics screen with monthly revenue SVG charts, top costliest vehicle rankings, ROI performance tables, and CSV exports. |
| **System Settings** | Operational scope variables (Depot ID, Currency, Distance) and interactive RBAC permissions matrix. |

---

## 15. Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local Community Server (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string.

### Step-by-Step Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/SmitBhalanii/TransitOps.git
   cd TransitOps
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies across all workspaces**:
   ```bash
   npm run install-all
   ```

4. **Seed Database with Demo Operations Data**:
   ```bash
   npm run seed
   ```

5. **Start Development Environment (Backend & Frontend concurrently)**:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`.

---

## 16. Environment Variables

Configure the following variables in `.env`:

```env
# Server Port
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/transitops

# JWT Authentication Secret
JWT_SECRET=transitops_super_secret_jwt_key_2026_production_grade_token

# JWT Expiration Period
JWT_EXPIRES_IN=7d

# Environment Mode
NODE_ENV=development
```

---

## 17. Seed & Demo Credentials

The database seeder (`npm run seed` or `node backend/config/seed.js`) automatically populates 5 pre-configured demo user accounts:

| Role | Email | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@transitops.in` | `AdminSecure2026!` | Full platform administration, Settings, User accounts |
| **Fleet Manager** | `fleet.manager@transitops.in` | `FleetSecure2026!` | Vehicles / Fleet CRUD, Maintenance CRUD, Analytics View |
| **Dispatcher** | `raven.k@transitops.in` | `DispatchSecure2026!` | Trip Dispatcher CRUD, Fleet View |
| **Safety Officer** | `safety.officer@transitops.in` | `SafetySecure2026!` | Drivers & Safety CRUD, Trips View |
| **Financial Analyst** | `financial.analyst@transitops.in` | `FinanceSecure2026!` | Fuel & Expenses CRUD, Reports & Analytics View |

---

## 18. Testing Instructions

TransitOps includes 8 automated test suites containing over 50 test cases:

```bash
# Navigate to the backend directory
cd backend

# 1. Run Authentication & Lockout Tests
node testAuth.js

# 2. Run Vehicle & Driver CRUD / Uniqueness Tests
node testVehiclesDrivers.js

# 3. Run Trip Dispatcher & Capacity Enforcement Tests
node testTrips.js

# 4. Run Maintenance Workflow & Status Toggle Tests
node testMaintenance.js

# 5. Run Fuel & Expense Ledger Calculation Tests
node testFuelExpenses.js

# 6. Run Live Dashboard KPI Tests
node testDashboard.js

# 7. Run Settings & RBAC Authorization Tests
node testSettings.js

# 8. Run Master End-to-End System Integration Suite
node testSystemIntegration.js
```

---

## 19. Future Enhancements

- [ ] **GPS & Telematics Integration**: Live WebSocket stream for real-time truck coordinate tracking on Leaflet/Mapbox maps.
- [ ] **Automated Geofencing**: Automatic trip start/complete triggers when crossing depot geofences.
- [ ] **Predictive Maintenance with AI**: Machine learning engine forecasting engine servicing based on historical odometer increments and fuel consumption anomalies.
- [ ] **Multi-Depot Tenant Architecture**: Organization-level tenancy partitioning for global multi-hub logistics fleets.

---

## 20. Author Information

- **Developer**: Smit Bhalani
- **GitHub**: [@SmitBhalanii](https://github.com/SmitBhalanii)
- **Repository**: [https://github.com/SmitBhalanii/TransitOps](https://github.com/SmitBhalanii/TransitOps)
- **Project**: TransitOps — Smart Transport Operations Platform