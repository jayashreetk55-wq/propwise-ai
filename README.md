# PropWise AI — Intelligent Real Estate Discovery, Investment & Risk Analysis Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4+-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-336791.svg)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0+-purple.svg)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**PropWise AI** is an intelligent real estate discovery, investment forecasting, and risk analysis platform built for modern homebuyers, property investors, and market analysts. 

Rather than functioning as a standard listing directory with basic CRUD filters, PropWise AI integrates advanced software engineering architecture with applied machine learning to deliver semantic search, explainable recommendation scoring, financial yield modeling, and listing anomaly detection.

---

## 🌟 Key Product Capabilities

1. **Natural-Language Property Discovery**: Conversational and semantic search capturing nuanced homebuyer criteria and lifestyle preferences beyond simple rigid filters.
2. **Explainable Recommendations**: Transparent recommendation scoring highlighting *why* a property matches investor criteria (e.g., price-to-rent ratio, school district quality, projected appreciation).
3. **Investment & Rental-Yield Analytics**: Real-time cash flow estimation, capitalization rate (Cap Rate), net operating income (NOI), and cash-on-cash return forecasts.
4. **Listing Anomaly & Fraud Detection**: Automated machine learning outlier detection to flag mispriced properties, unrealistic rental yields, and suspect listing data.
5. **Neighborhood Intelligence**: Deep neighborhood insights incorporating transit, walk scores, school rankings, and historical appreciation trends.
6. **Side-by-Side Property Comparison**: Multi-dimensional attribute and financial metric comparison matrices.
7. **Personalized Profiles & Portfolios**: Investor preference tracking, saved properties, and customized risk tolerance settings.

---

## 🏗️ System Architecture Overview

PropWise AI adopts a decoupled, multi-tier architecture ensuring separation of concerns, horizontal scalability, and independent deployment cycles:

```
[ Frontend: React + Vite + Tailwind CSS ]  (Client Tier)
                   │
                   ▼ (HTTPS / JSON REST API)
[ Backend: Node.js + Express + TypeScript ] (Gateway & Application Core)
        │                             │
        ▼ (Prisma ORM)                ▼ (Internal REST / JSON)
[ Database: PostgreSQL 16+ ]   [ AI Service: Python + FastAPI + scikit-learn ]
```

* **Frontend Client** *(Developed in parallel by teammate)*: React 19, Vite, TypeScript, and Tailwind CSS.
* **Core Backend** *(Phase 1 & 2)*: Node.js, Express.js, TypeScript, Prisma ORM, Zod, and Helmet. Serves as the central API gateway, orchestrator, and business logic engine.
* **Persistence Tier** *(Phase 2)*: Normalized PostgreSQL relational database managed with Prisma ORM.
* **AI/ML Service Tier** *(Upcoming Phase)*: Python, FastAPI, and scikit-learn for NLP embeddings, anomaly detection, and regression scoring.
* **Architecture & ERD Documentation**: Complete architectural specifications and data flow diagrams are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Core** | Node.js (v20+), Express.js (v4.21+), TypeScript (v5.7+) |
| **Persistence & ORM** | PostgreSQL (v16+), Prisma ORM (v6.4+) |
| **Validation & Schemas** | Zod |
| **Security & Utilities** | Helmet, CORS, Dotenv, Custom Structured Logger |
| **Testing** | Vitest (v5.0+), Supertest |
| **Planned AI / ML** | Python (v3.11+), FastAPI, scikit-learn |
| **Planned Client** | React 19, Vite, TypeScript, Tailwind CSS |
| **API Documentation** | OpenAPI 3.0 / Swagger (Planned Phase) |

---

## 📁 Repository Structure

```
propwise-ai/
├── backend/                   # Core Express + TypeScript application
│   ├── prisma/                # Database schema, migrations, and seeds
│   │   ├── migrations/        # Reproducible SQL migration history
│   │   │   └── 20261009000000_init_database_schema/
│   │   │       └── migration.sql
│   │   ├── schema.prisma      # Normalized Prisma schema (10 entities)
│   │   └── seed.ts            # Master amenities & demo property seed
│   ├── src/
│   │   ├── config/            # Strongly-typed environment variables (Zod)
│   │   ├── constants/         # HTTP status codes & system constants
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── database/          # Prisma client singleton & non-blocking health probe
│   │   ├── errors/            # Custom AppError hierarchy
│   │   ├── middleware/        # Request logger, validation, 404, error handler
│   │   ├── routes/            # Versioned API routes (/api/v1/*)
│   │   │   └── v1/            # v1 route aggregators and endpoints
│   │   ├── services/          # Pure domain & business logic
│   │   ├── types/             # Common TypeScript interfaces
│   │   ├── utils/             # Standardized API response helpers & logger
│   │   ├── app.ts             # Express app setup (decoupled from socket listener)
│   │   └── server.ts          # Server entry point & graceful shutdown
│   ├── tests/                 # Automated test suite
│   │   ├── health.test.ts     # Health endpoint & database probe integration tests
│   │   └── error.test.ts      # Error handling & validation tests
│   ├── .env.example           # Safe environment variables template
│   ├── package.json           # Dependencies, Prisma scripts, engines
│   ├── tsconfig.json          # TypeScript compiler configuration
│   └── vitest.config.mts      # Vitest test runner configuration
├── docs/
│   └── ARCHITECTURE.md        # Comprehensive system architecture, ERD & communication flows
├── .gitignore                 # Ignore rules for Node, Python, caches, OS files
└── README.md                  # Project overview and startup guide
```

---

## 🚀 Backend Getting Started Guide

### Prerequisites
* **macOS**, Linux, or Windows with Node.js **v20.x or higher** installed.
* **npm** v10+ (or pnpm/yarn).
* *(Optional for Phase 2)* **Docker** or a local PostgreSQL 16+ instance.

### 1. Installation
Navigate into the `backend` directory and install project dependencies:

```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a local `.env` configuration file from the safe `.env.example` template:

```bash
cp .env.example .env
```

Default values in `.env`:
```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:5173
SERVICE_NAME=propwise-backend
SERVICE_VERSION=1.0.0
LOG_LEVEL=info

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/propwise_db?schema=public
```

> **Note on Database Availability**: PropWise AI is designed with an offline-resilient architecture. The backend service starts, builds, and runs all automated tests successfully even when PostgreSQL is offline or uninstalled.

---

## 🗄️ Database Setup & Migrations (PostgreSQL)

When you are ready to connect a live PostgreSQL instance, follow these steps:

### 1. Start a Local PostgreSQL Instance

**Option A: Using Docker (Quickest)**
```bash
docker run --name propwise-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=propwise_db \
  -p 5432:5432 -d postgres:16-alpine
```

**Option B: Using macOS Homebrew**
```bash
brew install postgresql@16
brew services start postgresql@16
createdb propwise_db
```

### 2. Run Prisma Database Commands

```bash
# Generate the Prisma Client types
npm run prisma:generate

# Apply pending migrations to the local database
npm run prisma:migrate:dev

# Seed catalog amenities and showcase listings
npm run prisma:seed

# Inspect database records via Prisma Studio GUI
npm run prisma:studio
```

---

## 💻 Running the Application

### Development Mode (with hot reloading)
```bash
npm run dev
```

The server boots with a clean startup banner:
```
========================================================
  PropWise AI Backend Service Running
  Environment : development
  Port        : 5000
  Health Check: http://localhost:5000/api/v1/health
========================================================
```

### Verify Health Endpoint
You can inspect service and database status using `curl` or a web browser:

```bash
curl http://localhost:5000/api/v1/health
```

**Response with Database Connected:**
```json
{
  "success": true,
  "message": "PropWise AI backend service is healthy",
  "data": {
    "status": "healthy",
    "service": "propwise-backend",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 12,
    "uptimeFormatted": "12s",
    "timestamp": "2026-10-09T14:41:18.996Z",
    "database": {
      "status": "connected",
      "latencyMs": 3.42,
      "message": "PostgreSQL connection active"
    },
    "system": {
      "nodeVersion": "v26.9.0",
      "platform": "darwin",
      "memoryUsageMB": {
        "rss": 74.36,
        "heapTotal": 18.55,
        "heapUsed": 12.05
      }
    }
  },
  "timestamp": "2026-10-09T14:41:18.996Z"
}
```

**Response with Database Offline (Graceful Degradation):**
```json
{
  "success": true,
  "message": "PropWise AI backend service is healthy",
  "data": {
    "status": "healthy",
    "service": "propwise-backend",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 8,
    "uptimeFormatted": "8s",
    "timestamp": "2026-10-09T14:41:18.996Z",
    "database": {
      "status": "disconnected",
      "message": "PostgreSQL unavailable or offline"
    },
    "system": {
      "nodeVersion": "v26.9.0",
      "platform": "darwin",
      "memoryUsageMB": {
        "rss": 74.36,
        "heapTotal": 18.55,
        "heapUsed": 12.05
      }
    }
  },
  "timestamp": "2026-10-09T14:41:18.996Z"
}
```

---

## 🧪 Testing & Quality Assurance

The test suite runs entirely offline without requiring a running database server:

```bash
# Run all automated tests with Vitest
npm test

# Run tests in interactive watch mode
npm run test:watch

# Run TypeScript type-checking without emitting files
npm run typecheck

# Build compiled JavaScript output to dist/ (includes prisma generate)
npm run build

# Start the compiled production build
npm start
```

---

## 📡 API Contract & Envelope Structure

All API responses follow a consistent envelope structure:

### Standard Success Envelope
```typescript
interface ApiResponseSuccess<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string; // ISO 8601
}
```

### Standard Error Envelope
```typescript
interface ApiResponseError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
    stack?: string; // Only included in non-production environments
  };
  timestamp: string; // ISO 8601
}
```

---

## 🗺️ Project Status & Roadmap

- [x] **Phase 1: Architecture & Backend Foundation**
  - Modular Express + TypeScript architecture
  - Versioned API (`/api/v1`) & Health check endpoint (`/api/v1/health`)
  - Centralized error pipeline & Zod schema validation
  - Safe environment configuration & automated tests
  - System architecture specification (`docs/ARCHITECTURE.md`)
- [x] **Phase 2: Database Foundation (PostgreSQL + Prisma ORM)** *(Current)*
  - Normalized schema for 10 entities (Properties, Users, Amenities, Pricing, AI Analyses)
  - Decimal-safe financial fields & unique constraints
  - Migration script (`20261009000000_init_database_schema`) & rich seed script
  - Offline-resilient database health probe
- [ ] **Phase 3**: Core Property Discovery & Filter APIs
- [ ] **Phase 4**: Python / FastAPI AI Microservice (NLP & Anomaly Detection)
- [ ] **Phase 5**: Financial & Investment Analytics Engine
- [ ] **Phase 6**: Neighborhood Intelligence & Comparison Engine
- [ ] **Phase 7**: End-to-End Testing & Deployment

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
