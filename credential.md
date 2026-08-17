# TransitOps — Development & Test Credentials

This document outlines the default user accounts, passwords, and roles defined for local development, verification, and testing of TransitOps. It also details the files where these credentials and user schemas are referenced and implemented.

---

## Default User Accounts

The system seeds the following default accounts for testing Role-Based Access Control (RBAC):

| Role | Username / Email | Password | Assigned Permissions / Access Scopes |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@transitops.in` | `AdminSecure2026!` | Full platform access, User management, Settings configuration |
| **Fleet Manager** | `fleet.manager@transitops.in` | `FleetSecure2026!` | Read/Write access to Fleet (Vehicles) and Maintenance |
| **Dispatcher** | `raven.k@transitops.in` | `DispatchSecure2026!` | Read/Write access to Trips, Read access to Fleet |
| **Safety Officer** | `safety.officer@transitops.in` | `SafetySecure2026!` | Read/Write access to Drivers, Read access to Trips |
| **Financial Analyst** | `financial.analyst@transitops.in` | `FinanceSecure2026!` | Read/Write access to Fuel, Expenses, and Analytics |

---

## File References & Implementations

These credentials and authentication behaviors are defined, registered, and validated across the following files:

### 1. Database Seeding File
*   **Path**: `backend/config/seed.js`
*   **Description**: Contains the script to populate the MongoDB database with these default users. It imports the `User` model, hashes the passwords using `bcrypt`, and inserts the documents if they do not already exist.

### 2. User Schema Definition
*   **Path**: `backend/models/User.js`
*   **Description**: Declares the Mongoose schema for users, containing validation logic (unique, lowercase emails), roles enums, password pre-save hashing middleware, and helper methods (e.g. `comparePassword`).

### 3. Authentication Controller
*   **Path**: `backend/controllers/authController.js`
*   **Description**: Handles `/api/auth/login` requests, compares passwords, manages failed login counter increments, sets locking timers after 5 failed attempts, and generates JWT tokens.

### 4. Client API Auth Service
*   **Path**: `frontend/src/services/authService.js`
*   **Description**: Client-side axios interface responsible for sending requests to `/api/auth/login` and handling response data.

---

## Account Lockout Rule

If any of these accounts exceed **5 consecutive failed login attempts**, the user status transitions to locked.
*   **Implementation File**: `backend/models/User.js` & `backend/controllers/authController.js`
*   **State fields**: `failedLoginAttempts: Number` and `lockUntil: Date`.
