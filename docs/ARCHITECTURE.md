# PropWise AI — System Architecture & Design Specification

> **Platform Vision**: Intelligent Real Estate Discovery, Investment & Risk Analysis Platform  
> **Author**: Senior Backend & Systems Architect  
> **Status**: Phase 2 Database Foundation Complete  

---

## 1. Executive Overview

PropWise AI is an enterprise-grade platform designed to transform real estate discovery from simple keyword filtering into an intelligent, data-driven investment analysis experience. Moving far beyond traditional CRUD listing directories, PropWise AI combines modern full-stack web engineering with applied machine learning to deliver:

1. **Natural-language property discovery** (semantic intent matching).
2. **Explainable property recommendations** (transparent matching scores).
3. **Investment & rental-yield forecasting** (cash flow, cap rate, ROI analytics).
4. **Listing anomaly detection** (identifying fraudulent, mispriced, or outlier listings).
5. **Neighborhood intelligence** (walkability, crime, schools, demographic trends).
6. **Side-by-side property comparison matrices**.
7. **Personalized investor profiles and portfolio tracking**.

---

## 2. High-Level System Architecture

PropWise AI is structured as a decoupled, multi-tier distributed architecture designed for maintainability, horizontal scalability, and clear separation of concerns between web presentation, core business logic, relational persistence, and machine-learning model serving.

```mermaid
graph TB
    subgraph Client Tier ["Client Tier (Teammate Laptop)"]
        UI["React 19 + Vite SPA<br/>(TypeScript + Tailwind CSS)"]
    end

    subgraph Gateway & Core Backend ["Application Tier (Node.js / Express)"]
        API["Express.js API Gateway<br/>/api/v1/* (TypeScript)"]
        VAL["Validation & Sanitization<br/>(Zod Middleware)"]
        CTRL["Controllers & Routing"]
        SRV["Business Service Layer"]
        DBMOD["Database Layer<br/>(Prisma Client Singleton)"]
        ERR["Centralized Error Pipeline"]
        
        API --> VAL --> CTRL --> SRV --> DBMOD
        CTRL -.-> ERR
    end

    subgraph Data Tier ["Persistence Tier (PostgreSQL)"]
        DB[("PostgreSQL 16+<br/>Normalized Real Estate Schema")]
        DBMOD --> DB
    end

    subgraph AI Service Tier ["Intelligence Tier (Python / FastAPI)"]
        FAST["FastAPI Microservice<br/>(Python 3.11+)"]
        NLP["Semantic Search Engine<br/>(Embeddings / Vector Ranker)"]
        ANOM["Anomaly Detection<br/>(IsolationForest / scikit-learn)"]
        VALU["Valuation & Yield Predictor<br/>(Regressors / Analytics)"]
        
        SRV -- "Internal REST / JSON" --> FAST
        FAST --> NLP
        FAST --> ANOM
        FAST --> VALU
    end

    UI -- "HTTPS / JSON (REST)" --> API
```

---

## 3. Component Responsibilities & Boundaries

### 3.1 Frontend Client (React + Vite + TypeScript + Tailwind CSS)
* **Scope**: Developed independently on a separate workstation.
* **Responsibilities**:
  * Rich user interface, interactive maps, responsive dashboards.
  * Real-time client-side filter manipulation, chart visualizations (investment curves, cap rates).
  * Consuming versioned REST APIs (`/api/v1/*`) using typed contracts.
  * State management for user sessions, search criteria, saved properties, and comparison drawers.

### 3.2 Core Backend (Node.js + Express + TypeScript)
* **Scope**: Primary orchestration hub and API boundary.
* **Responsibilities**:
  * **API Gateway & Routing**: Exposes modular, versioned REST endpoints (`/api/v1`).
  * **Input Validation & Sanitization**: Validates all headers, query parameters, URL params, and JSON payloads via Zod before hitting business logic.
  * **Business Logic & Workflow Orchestration**: Executes domain rules (investment calculators, comparison logic, user workflows).
  * **Data Access & Abstraction**: Interfaces with PostgreSQL via Prisma ORM for ACID transactions, pagination, and relations.
  * **AI Service Client**: Acts as an HTTP client proxying requests to the Python AI service, enforcing timeouts, fallbacks, and caching.
  * **Cross-Cutting Concerns**: Centralized error mapping, request logging, security headers (Helmet), CORS policies, and non-blocking database health monitoring.

### 3.3 Relational Database (PostgreSQL 16+ & Prisma ORM)
* **Scope**: Persistent system of record.
* **Responsibilities**:
  * Normalized data modeling across 10 core real estate entities.
  * Strict decimal-safe representation of currency and property dimensions.
  * Enforcing unique constraints (e.g., duplicate favorite prevention).
  * Geospatial coordinate storage and compound indexing for multi-attribute property search.
  * Reproducible schema migrations managed via Prisma Migration Engine.

### 3.4 AI/ML Intelligence Service (Python + FastAPI + scikit-learn)
* **Scope**: Specialized microservice for heavy scientific computing and ML inferences.
* **Responsibilities**:
  * **Natural-Language Search**: Parsing unstructured user queries into semantic vector spaces.
  * **Anomaly Detection**: Training and serving Isolation Forest or autoencoder models to detect listing discrepancies.
  * **Valuation & Yield Modeling**: Running feature engineering pipelines and regression models to estimate fair market value and projected cap rates.
  * **Explainability Engine**: Providing feature importance attribution (e.g., SHAP values or score breakdowns) to explain *why* a property was recommended.

---

## 4. Database Architecture & Data Models (Phase 2 Foundation)

### 4.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Property : "creates / lists"
    User ||--o| UserPreference : "defines"
    User ||--o{ Favorite : "saves"
    User ||--o{ PropertyView : "views"

    Property ||--o{ PropertyImage : "contains"
    Property ||--o{ PropertyAmenity : "features"
    Amenity ||--o{ PropertyAmenity : "categorized in"
    Property ||--o{ Favorite : "saved by"
    Property ||--o{ PropertyView : "logs"
    Property ||--o{ PropertyPriceHistory : "tracks"
    Property ||--o{ PropertyAnalysis : "evaluated by"

    User {
        string id PK "UUID"
        string email UK
        string firstName
        string lastName
        string phone
        UserRole role "BUYER | INVESTOR | AGENT | ADMIN"
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    UserPreference {
        string id PK "UUID"
        string userId FK, UK
        ListingType listingType "SALE | RENT"
        decimal budgetMin "DECIMAL(14,2)"
        decimal budgetMax "DECIMAL(14,2)"
        string_array preferredCities
        string_array preferredLocalities
        int_array bedrooms
        PropertyType_array propertyTypes
        decimal minAreaSqFt "DECIMAL(10,2)"
        decimal maxAreaSqFt "DECIMAL(10,2)"
        jsonb lifestylePreferences
        jsonb investmentPreferences
        datetime createdAt
        datetime updatedAt
    }

    Property {
        string id PK "UUID"
        string title
        text description
        PropertyType propertyType "APARTMENT | VILLA | CONDO..."
        ListingType listingType "SALE | RENT"
        PropertyStatus status "AVAILABLE | SOLD | RENTED..."
        decimal price "DECIMAL(14,2)"
        string currency
        decimal areaSqFt "DECIMAL(10,2)"
        int bedrooms
        decimal bathrooms "DECIMAL(3,1)"
        FurnishingStatus furnishing "UNFURNISHED | SEMI | FULLY"
        string city
        string locality
        string address
        string zipCode
        decimal latitude "DECIMAL(10,7)"
        decimal longitude "DECIMAL(10,7)"
        int yearBuilt
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    PropertyImage {
        string id PK "UUID"
        string propertyId FK
        string url
        string caption
        boolean isPrimary
        int displayOrder
        datetime createdAt
    }

    Amenity {
        string id PK "UUID"
        string name UK
        string slug UK
        AmenityCategory category "LIFESTYLE | SECURITY | FITNESS..."
        string icon
        datetime createdAt
    }

    PropertyAmenity {
        string id PK "UUID"
        string propertyId FK
        string amenityId FK
        datetime createdAt
    }

    Favorite {
        string id PK "UUID"
        string userId FK
        string propertyId FK
        string notes
        datetime createdAt
    }

    PropertyView {
        string id PK "UUID"
        string propertyId FK
        string userId FK
        string ipAddress
        string userAgent
        int viewDurationSeconds
        datetime createdAt
    }

    PropertyPriceHistory {
        string id PK "UUID"
        string propertyId FK
        decimal previousPrice "DECIMAL(14,2)"
        decimal newPrice "DECIMAL(14,2)"
        decimal changePercentage "DECIMAL(6,2)"
        string reason
        datetime effectiveDate
        datetime createdAt
    }

    PropertyAnalysis {
        string id PK "UUID"
        string propertyId FK
        AnalysisType analysisType "INVESTMENT_YIELD | ANOMALY..."
        decimal score "DECIMAL(6,2)"
        decimal confidenceScore "DECIMAL(5,4)"
        boolean isAiEstimated "Default: true"
        boolean isVerified "Default: false"
        string modelVersion
        jsonb structuredExplanation
        datetime createdAt
        datetime updatedAt
    }
```

### 4.2 Key Architectural Decisions in Data Modeling

1. **Decimal-Safe Financial Representation**:
   * All monetary figures (`price`, `previousPrice`, `newPrice`, `budgetMin`, `budgetMax`) use `@db.Decimal(14, 2)`. This provides safe calculations up to $999 billion without binary floating-point rounding errors.
   * `areaSqFt` and `minAreaSqFt` use `@db.Decimal(10, 2)`.
   * `bathrooms` uses `@db.Decimal(3, 1)` to accurately record half-baths (e.g. `2.5`).
2. **Preventing Duplicate Favorites**:
   * The `Favorite` table enforces a compound unique constraint: `@@unique([userId, propertyId])`. This eliminates duplicate bookmarking at the database engine level.
3. **AI Estimation Boundary & Transparency**:
   * The `PropertyAnalysis` model explicitly features:
     * `isAiEstimated: Boolean @default(true)`
     * `isVerified: Boolean @default(false)`
     * `confidenceScore: Decimal(5, 4)`
     * `modelVersion: String`
     * `structuredExplanation: Json`
   * **Rule**: AI-generated scores and metrics are never treated as verified ground truth. The UI and consumers must always present them as statistical inferences with transparent explanations.
4. **Referential Integrity & Cascading Policies**:
   * When a `Property` is removed, all dependent `PropertyImage`, `PropertyAmenity`, `Favorite`, `PropertyView`, `PropertyPriceHistory`, and `PropertyAnalysis` records cascade deletion (`onDelete: Cascade`).
   * When a `User` is deleted, their `UserPreference` and `Favorite` records cascade, while created properties set their owner to `null` (`onDelete: SetNull`) to retain listing history.
5. **High-Performance Composite Indexing**:
   * `properties`: Indexed by `[city, locality]`, `[price]`, `[propertyType, listingType, status]`, and `[bedrooms, bathrooms]`.
   * `property_analyses`: Indexed by `[propertyId, analysisType]` and `[analysisType, score]`.

---

## 5. Database Operations, Migrations & Resilience

### 5.1 Environment Configuration
The database connection string is configured via the `DATABASE_URL` environment variable:

```env
# Format: postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=<SCHEMA>
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/propwise_db?schema=public
```

* Safe template: Provided in [`backend/.env.example`](backend/.env.example). Real database credentials must never be committed to Git.

### 5.2 Local PostgreSQL Setup Options

#### Option A: Docker (Recommended)
```bash
docker run --name propwise-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=propwise_db \
  -p 5432:5432 -d postgres:16-alpine
```

#### Option B: macOS Homebrew
```bash
brew install postgresql@16
brew services start postgresql@16
createdb propwise_db
```

### 5.3 Migration & Seeding Commands

```bash
# Generate Prisma Client (offline, zero DB connection required)
npm run prisma:generate

# Apply migrations in development (requires running PostgreSQL)
npm run prisma:migrate:dev

# Apply migrations in staging/production CI
npm run prisma:migrate:deploy

# Inspect migration status
npm run prisma:migrate:status

# Seed master amenities and sample properties
npm run prisma:seed

# Open interactive Prisma Studio GUI
npm run prisma:studio
```

### 5.4 Resilient Offline Database Handling

A critical architectural principle of PropWise AI is that **an unavailable database must never crash the backend or break test suites**:

1. **Lazy Connection Pool**: Prisma initializes database connections lazily upon query execution rather than at server boot.
2. **Non-Blocking Health Probe**: The `checkDatabaseHealth()` probe executes `SELECT 1` wrapped with a strict 2-second timeout and an isolated `try/catch`.
3. **Graceful Status Reporting**: When PostgreSQL is offline or unreachable:
   * The backend boots normally without unhandled exceptions.
   * `GET /api/v1/health` returns HTTP 200 OK with:
     ```json
     {
       "status": "healthy",
       "database": {
         "status": "disconnected",
         "message": "PostgreSQL unavailable or offline"
       }
     }
     ```
   * All unit and integration tests execute and pass without requiring a live PostgreSQL instance.

---

## 6. Inter-Service Communication Contract

### 6.1 Success Envelope (`ApiResponseSuccess<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-09T14:16:27.912Z"
}
```

### 6.2 Error Envelope (`ApiResponseError`)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "budgetMax",
        "message": "Budget must be a positive number"
      }
    ]
  },
  "timestamp": "2026-10-09T14:16:27.912Z"
}
```

---

## 7. Project Roadmap

- [x] **Phase 1: Architecture & Backend Foundation**
  - Modular Express + TypeScript architecture
  - Versioned API (`/api/v1`) & Health endpoint (`/api/v1/health`)
  - Centralized error pipeline & Zod schema validation
  - Safe environment configuration & automated tests
- [x] **Phase 2: Persistence & Data Modeling (PostgreSQL + Prisma ORM)**
  - Normalized schema for 10 entities (Properties, Users, Amenities, Pricing, AI Analyses)
  - Decimal-safe financial fields & unique constraints
  - Migration script (`20261009000000_init_database_schema`) & rich seed script
  - Offline-resilient database health probe
- [ ] **Phase 3: Core Property Discovery APIs**
  - Filtering, sorting, geospatial queries, pagination, property detail endpoints.
- [ ] **Phase 4: AI/ML Service Foundation (Python / FastAPI)**
  - Microservice setup, scikit-learn models for anomaly detection and pricing.
  - Backend-to-AI internal HTTP client with circuit breaking.
- [ ] **Phase 5: Financial & Investment Analytics Engine**
  - Net operating income (NOI), cap rate, cash-on-cash return, mortgage calculation.
- [ ] **Phase 6: Explainable AI & Comparison Modules**
  - Recommendation transparency, side-by-side listing comparison engine.
- [ ] **Phase 7: End-to-End Integration, OpenAPI/Swagger Documentation, CI/CD**
  - OpenAPI 3.0 specification, Docker compose orchestration, GitHub Actions CI.
