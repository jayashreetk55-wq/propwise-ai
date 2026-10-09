# PropWise AI — Intelligent Real Estate Discovery, Investment & Risk Analysis Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-lightgrey.svg)](https://expressjs.com/)
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
[ Database: PostgreSQL ]      [ AI Service: Python + FastAPI + scikit-learn ]
```

* **Frontend Client** *(Developed in parallel by teammate)*: React 19, Vite, TypeScript, and Tailwind CSS.
* **Core Backend** *(Current Module)*: Node.js, Express.js, TypeScript, Zod, and Helmet. Serves as the central API gateway, orchestrator, and business logic engine.
* **Persistence Tier**: PostgreSQL with Prisma ORM for structured listing and user data.
* **AI/ML Service Tier**: Python, FastAPI, and scikit-learn for NLP embeddings, anomaly detection, and regression scoring.
* **Architecture Documentation**: Complete architectural specifications and data flow diagrams are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend Core** | Node.js, Express.js, TypeScript |
| **Validation & Schemas** | Zod |
| **Security & Utilities** | Helmet, CORS, Dotenv, Custom Structured Logger |
| **Testing** | Vitest, Supertest |
| **Planned Persistence** | PostgreSQL, Prisma ORM |
| **Planned AI / ML** | Python, FastAPI, scikit-learn |
| **Planned Client** | React, Vite, TypeScript, Tailwind CSS |
| **API Documentation** | OpenAPI 3.0 / Swagger (Planned Phase) |

---

## 📁 Repository Structure

```
propwise-ai/
├── backend/                   # Core Express + TypeScript application
│   ├── src/
│   │   ├── config/            # Strongly-typed environment variables (Zod)
│   │   ├── constants/         # HTTP status codes & system constants
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── errors/            # Custom AppError classes
│   │   ├── middleware/        # Request logger, validation, 404, error handler
│   │   ├── routes/            # Versioned API routes (/api/v1/*)
│   │   │   └── v1/            # v1 route aggregators and endpoints
│   │   ├── services/          # Pure domain & business logic
│   │   ├── types/             # Common TypeScript interfaces
│   │   ├── utils/             # Standardized API response helpers & logger
│   │   ├── app.ts             # Express app setup (decoupled from socket listener)
│   │   └── server.ts          # Server entry point & graceful shutdown
│   ├── tests/                 # Automated test suite
│   │   ├── health.test.ts     # Health endpoint integration tests
│   │   └── error.test.ts      # Error handling & validation tests
│   ├── .env.example           # Safe environment variables template
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript compiler configuration
│   └── vitest.config.mts      # Vitest test runner configuration
├── docs/
│   └── ARCHITECTURE.md        # Comprehensive system architecture & communication flows
├── .gitignore                 # Ignore rules for Node, Python, caches, OS files
└── README.md                  # Project overview and startup guide
```

---

## 🚀 Backend Getting Started Guide

### Prerequisites
* **macOS** or Linux / Windows with Node.js **v20.x or higher** installed.
* **npm** v10+ (or pnpm/yarn).

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
```

### 3. Run in Development Mode
Start the backend with TypeScript hot-reloading using `tsx`:

```bash
npm run dev
```

The server will boot and display the startup banner:
```
========================================================
  PropWise AI Backend Service Running
  Environment : development
  Port        : 5000
  Health Check: http://localhost:5000/api/v1/health
========================================================
```

### 4. Verify Health Endpoint
You can test the health endpoint using `curl` or opening the link in your browser:

```bash
curl http://localhost:5000/api/v1/health
```

**Expected JSON Response (HTTP 200 OK):**
```json
{
  "success": true,
  "message": "PropWise AI backend service is healthy",
  "data": {
    "status": "healthy",
    "service": "propwise-backend",
    "version": "1.0.0",
    "environment": "development",
    "uptimeSeconds": 42,
    "uptimeFormatted": "42s",
    "timestamp": "2026-10-09T14:16:27.912Z",
    "system": {
      "nodeVersion": "v26.9.0",
      "platform": "darwin",
      "memoryUsageMB": {
        "rss": 67.95,
        "heapTotal": 16.84,
        "heapUsed": 10.73
      }
    }
  },
  "timestamp": "2026-10-09T14:16:27.912Z"
}
```

---

## 🧪 Testing & Quality Assurance

The codebase includes automated tests covering health diagnostics, centralized error handling, and request validation:

```bash
# Run all automated tests with Vitest
npm test

# Run tests in interactive watch mode
npm run test:watch

# Run TypeScript type-checking without emitting files
npm run typecheck

# Build compiled JavaScript output to dist/
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

- [x] **Phase 1: Architecture & Backend Foundation** *(Current)*
  - Modular Express + TypeScript architecture
  - Versioned API (`/api/v1`) & Health check endpoint (`/api/v1/health`)
  - Centralized error pipeline & Zod schema validation
  - Safe environment configuration & automated tests
  - System architecture specification (`docs/ARCHITECTURE.md`)
- [ ] **Phase 2**: PostgreSQL Database Modeling & Prisma ORM
- [ ] **Phase 3**: Property Search & Discovery APIs
- [ ] **Phase 4**: Python / FastAPI AI Microservice (NLP & Anomaly Detection)
- [ ] **Phase 5**: Investment & Rental-Yield Calculators
- [ ] **Phase 6**: Neighborhood Intelligence & Comparison Engine
- [ ] **Phase 7**: End-to-End Testing & Deployment

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
