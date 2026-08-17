# TransitOps — Smart Transport Operations Platform

TransitOps is an internal, production-quality transport operations platform built using the MERN stack (MongoDB, Express, React, Node.js). It provides fleet registry, driver compliance monitoring, trip dispatcher lifecycles, maintenance logging, expense tracking, and operational analytics under a secure Role-Based Access Control (RBAC) architecture.

---

## Folder Structure

```
TransitOps/
├── backend/             # Node.js Express server
│   ├── config/          # DB connections and configurations
│   ├── controllers/     # Controllers with business rules
│   ├── middleware/      # Authentication, RBAC, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route declarations
│   └── utils/           # Helper functions and classes
├── frontend/            # React Single Page Application (Vite)
│   ├── src/
│   │   ├── components/  # Layout, Sidebar, Top bar, UI controls
│   │   ├── context/     # Auth and state contexts
│   │   ├── pages/       # Dashboard, Fleet, Trips, etc.
│   │   └── services/    # Client API services
└── docs/                # Project references, wireframes, and design specs
```

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm
- MongoDB running locally or on Atlas

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SmitBhalanii/TransitOps.git
   cd TransitOps
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` in the root to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your local MongoDB URI connection string and a secret string for JWT signatures.

3. **Install Dependencies**:
   Install root, backend, and frontend dependencies:
   ```bash
   npm run install-all
   ```

4. **Seed the Database**:
   Populate the collections with mock fleet data, safety profiles, and role-based test users:
   ```bash
   npm run seed
   ```

5. **Run in Development**:
   Start both backend and frontend servers concurrently:
   ```bash
   npm run dev
   ```

---

## Testing & Roles
The application enforces strict **Role-Based Access Control (RBAC)**.
For default testing credentials (emails, passwords, and permissions) for the Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst roles, please refer to the detailed [credential.md](credential.md) file.

## Design and Plan
For details on system design, Mongoose database schemas, and Express API routes, refer to the [PLAN.md](PLAN.md) document in the workspace.