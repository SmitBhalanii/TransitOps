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
   Copy `.env.example` in the root (or in the `backend/` directory) to `.env` and fill in your database connections and secrets:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   Install root, backend, and frontend dependencies:
   ```bash
   # From root:
   npm install
   ```

4. **Run in Development**:
   To start both backend and frontend concurrently:
   ```bash
   npm run dev
   ```

---

## Design and Plan
For details on system design, database models, and API endpoints, check out the [PLAN.md](PLAN.md) document in the root workspace.