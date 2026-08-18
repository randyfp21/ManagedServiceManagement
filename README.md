# Resource & Revenue Management System (Managed Services)

A comprehensive Resource Management & Profitability Tracking System designed for Managed Service Providers. The system tracks employee allocations across Enterprise Banking Customers, calculates Cost of Goods Sold (COGS), Direct Costs, Net Revenue, and Profitability Margins with real-time analytics.

---

## 🚀 Application Ports

| Component | Default URL / Port | Description |
|---|---|---|
| **Backend API** | `http://localhost:8080` | Go (Gin Framework) REST API (configurable via `PORT` environment variable) |
| **Frontend Web App** | `http://localhost:3001` | React + Vite Single Page Application (with automatic proxy for `/api` to port 8080) |

---

## 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Manager`

---

## 🗄️ Database Access & Configuration

### 1. Default Storage (SQLite)
By default, if PostgreSQL environment variables are not present, the system automatically falls back to an embedded **SQLite** database:
- **Database File**: `backend/resource_management.db`
- **Auto Seeding**: On first run, the system automatically migrates tables and seeds:
  - `1` Admin User (`admin` / `admin123`)
  - `4` Specialized Groups (*Enterprise Banking Solutions, Core Banking & Digital Finance, Infrastructure & Cloud Managed Services, Cybersecurity & IT Risk Management*)
  - `9` Indonesian Banking Customers (*BCA, Mandiri, BRI, BNI, BTN, CIMB Niaga, Permata, Danamon, Maybank*)
  - `50` Real Karyawan/Employees with realistic roles, contract periods, gross salary, placement/skill allowances, coefficient, and net revenue.
  - `17` Personal Notes reference salary tiers.

### 2. SQLite Inspection Tools
You can inspect the local SQLite database using standard SQLite tools:
```bash
# Access database via sqlite3 CLI
sqlite3 backend/resource_management.db

# View tables
.tables

# Query employees count
SELECT COUNT(*) FROM employees;

# Query customers list
SELECT id_customer, customer_name FROM customers;
```

### 3. PostgreSQL Configuration (Optional)
To use a production PostgreSQL database, set the following environment variables before starting the backend:
```bash
export DB_HOST="localhost"
export DB_PORT="5432"
export DB_USER="postgres"
export DB_NAME="resource_management_db"
export DB_SSLMODE="disable"

# Or supply a full DSN connection string:
export DATABASE_URL="postgres://postgres:password@localhost:5432/resource_management_db?sslmode=disable"
```

---

## 📌 Database Tables Schema

1. `users`: Stores system users, bcrypt hashed passwords, roles.
2. `groups`: Master data for specialized technical groups.
3. `customers`: Master data for Banking enterprise clients and contract periods.
4. `employees`: Employee records linked to groups and banking customers (`IDGroup`, `IDCustomer`), gross salary, placement allowance (`TunjanganPenempatan`), skill allowance (`TunjanganKeahlian`), coefficient (`Koefisien`: 1.3, 1.4, 1.5), and net revenue (`RevenueNett`).
5. `personal_notes`: Reference table for net salary tiers and tax status breakdowns.

---

## 💻 How to Run (Cara Jalankan Aplikasi)

### Prerequisites
- **Go** version `1.20+` installed.
- **Node.js** version `18+` and `npm` installed.

---

### Step 1: Run Backend Server

```bash
# 1. Navigate to backend directory
cd backend

# 2. Run backend (Dependencies will be auto-resolved)
go run main.go
```
*Backend server will start listening on `http://localhost:8080`.*

---

### Step 2: Run Frontend Application

Open a new terminal window/tab:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install Node dependencies (if not installed)
npm install

# 3. Start Vite development server
npm run dev
```
*Frontend web application will be accessible at `http://localhost:3001`.*

---

## 🧪 How to Run Unit Tests (Cara Jalankan Unit Test)

Both backend and frontend are equipped with comprehensive unit testing suites.

### 1. Run Backend Unit Tests (Go)
```bash
cd backend

# Run all package unit tests with verbose coverage
go test -v -cover ./...
```
*Coverage includes models (100%), auth middleware (96.7%), database init/seeding, and all CRUD & analytical API handlers (80.3%).*

### 2. Run Frontend Unit Tests (Vitest)
```bash
cd frontend

# Run frontend vitest suite
npm test
```
*Tests formatters, API utility layer, localStorage authentication management, protected routes, and LoginPage rendering/actions.*
