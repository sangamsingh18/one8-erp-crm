# One8 ERP-CRM Operations Portal

> A full-stack, multi-role ERP + CRM operations portal for Indian B2B businesses — built to manage customers, delivery challans, inventory, invoices, and payments with fine-grained role-based access control.

---

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [Application Modules](#-application-modules)
- [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
- [Admin Capabilities](#-admin-capabilities)
- [Role-wise Dashboard](#-role-wise-dashboard)
- [Security & Authorization](#-security--authorization)
- [Project Highlights](#-project-highlights-recruiter--interview-ready)
- [Setup & Run](#-setup--run)
- [API Reference](#-api-reference)
- [Known Limitations](#-known-limitations)
- [Future Scope](#-future-scope)

---

## 🏢 Project Description

**One8 ERP-CRM** is a production-grade internal operations portal designed for Indian B2B distribution and trading businesses. It unifies four core business functions — **Sales (CRM)**, **Warehouse (Inventory)**, **Accounts (Finance)**, and **Admin (User Management)** — into a single, role-controlled web application.

The system enforces **JWT-based authentication** and a **dual-layer permission model** (role defaults + per-user custom overrides) so that each employee only sees and accesses the modules relevant to their function. All business entities are connected: customers generate challans, challans link to invoices, and invoices track payments — giving management a live, end-to-end view of the business.

---

## 🛠 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | PostgreSQL 14+ (hosted on Supabase) |
| Auth | JSON Web Tokens (JWT) via `jsonwebtoken` |
| Password Hashing | `bcryptjs` |
| Validation | `express-validator` |
| Security Headers | `helmet`, `cors` |
| ORM / Query | Raw `pg` (node-postgres) — no ORM |
| Dev Server | `nodemon` + `ts-node` |
| Testing | Jest + `ts-jest` + Supertest |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (Create React App) |
| Language | TypeScript 4 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API (Auth + Notifications) |

---

## ✅ Key Features

- 🔐 **JWT Authentication** with 8-hour token expiry
- 🛡️ **Dual-layer RBAC** — role defaults + admin-overridable per-user permissions
- 👥 **Customer CRM** — leads, follow-up dates, active/inactive lifecycle, notes
- 📦 **Product & Inventory Management** — SKU, category, pricing, warehouse location, stock levels
- 📋 **Delivery Challans** — draft → confirmed → cancelled lifecycle with atomic stock deduction
- 🏦 **Accounts Receivable** — invoices linked to challans, partial/full payment tracking
- 💳 **Payments** — NEFT, UPI, Cheque, Bank Transfer with reference numbers
- 📉 **Low Stock Alerts** — products falling below configurable minimum stock threshold
- 📊 **Reports** — role-filtered financial, customer, inventory, and challan summaries
- 👨‍💼 **Employee Management** — create users, change roles, activate/deactivate, reset passwords, customize module permissions
- ⚙️ **Settings** — company profile (name, GST, currency, timezone) editable by Admin only
- 🔔 **In-app Notifications** — context-level notification system
- 📱 **Responsive Sidebar** — mobile-friendly collapsible navigation

---

## 📂 Application Modules

| Module | Route | Description |
|---|---|---|
| Dashboard | `/dashboard` | Role-filtered KPI cards and quick actions |
| Customers | `/customers` | CRM — leads, active clients, follow-ups, notes |
| Products | `/products` | Catalogue — SKU, pricing, stock, warehouse location |
| Inventory | `/inventory` | Stock adjustment (IN/OUT) with reason logging |
| Stock Movements | `/stock-movements` | Audit log of all stock IN/OUT transactions |
| Low Stock | `/low-stock` | Alert list of products below `min_stock_alert` |
| Challans | `/challans` | Delivery challans — draft, confirm, cancel |
| Invoices | `/invoices` | Linked invoices with outstanding tracking |
| Payments | `/payments` | Payment ledger with method and reference |
| Reports | `/reports` | Role-scoped summary statistics |
| Employees | `/employees` | Admin-only user management |
| Settings | `/settings` | Company info — Admin edit, others read-only |

---

## 🛡️ Role-Based Access Control (RBAC)

The system implements a **dual-layer permission model**:
1. **Role Defaults** — each role has a preset set of permitted modules
2. **Custom Overrides** — admins can grant or restrict specific modules per individual user (stored as a JSONB array in the `users` table)

If a user has a custom `permissions` array set, it overrides the role defaults entirely. Otherwise, role defaults apply.

### Default Permissions by Role

| Module | Admin | Sales | Warehouse | Accounts |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ❌ | ✅ |
| Products | ✅ | ❌ | ✅ | ❌ |
| Inventory | ✅ | ❌ | ✅ | ❌ |
| Stock Movements | ✅ | ❌ | ✅ | ❌ |
| Low Stock Alerts | ✅ | ❌ | ✅ | ❌ |
| Challans | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ❌ | ✅ |
| Payments | ✅ | ❌ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ |
| Employees | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

> ✅ = Default access granted &nbsp; ❌ = Default access denied (can be granted by Admin via custom permissions)

---

## 👨‍💼 Admin Capabilities

The **Admin** role has unrestricted access to all modules and the following exclusive management capabilities via the **Employees** page:

| Action | Description |
|---|---|
| **Create User** | Add new users with name, email, password, and role |
| **Change Role** | Promote or demote any user to a different role |
| **Activate / Deactivate** | Toggle user account status (deactivated users cannot log in) |
| **Reset Password** | Set a new password for any user account |
| **Customize Permissions** | Override role defaults by granting or restricting specific modules per user |
| **Edit Company Settings** | Update company name, GST, contact info, currency, and timezone |

---

## 📊 Role-wise Dashboard

Each role sees a dashboard tailored to their responsibilities:

### 🔴 Admin
Full visibility: Total Revenue, Amount Collected, Outstanding Receivables, Pending Follow-ups, Draft Challans, Confirmed Challans, Low Stock Count.

### 🟢 Sales
Customer-focused: Pending Follow-ups (leads), Draft Challans, Confirmed Challans, Total Customers.

### 🟡 Warehouse
Inventory-focused: Low Stock Count + quick navigation to Inventory, Stock Movements, Low Stock alerts.

### 🟣 Accounts
Finance-focused: Total Revenue, Amount Collected, Outstanding Receivables, Total Customers.

> Quick Action buttons on the dashboard provide role-relevant shortcuts (e.g., "New Customer", "New Challan", "Adjust Stock", "Record Payment").

---

## 🔒 Security & Authorization

### Authentication
- Login issues a signed **JWT** (HS256) stored in the client and sent via `Authorization: Bearer <token>` on every request
- Tokens expire after **8 hours** — users must re-login
- Passwords are hashed with **bcryptjs** (salt rounds: 10) before storage; plain-text passwords are never persisted

### Authorization (Backend)
- Every protected API route is guarded by `authMiddleware` (token verification) followed by `checkPermission(key)` (module access check)
- `checkPermission` resolves effective permissions: **Admin always passes**; others check the user's custom JSONB array or fall back to role defaults
- A 403 is returned immediately if the permission key is not present — no partial data leakage

### Authorization (Frontend)
- `ProtectedRoute` wraps every page component — unauthenticated users are redirected to `/login`
- The sidebar only renders navigation links for modules the current user has permission to access (`hasPermission` helper)
- Even if a URL is manually entered, the server-side permission check ensures no data is returned

### Other Security Measures
- `helmet` sets HTTP security headers (CSP, HSTS, etc.)
- `cors` is configured (configurable per environment)
- All user inputs are validated via `express-validator` before reaching service logic

---

## 🌟 Project Highlights (Recruiter / Interview Ready)

| Area | What it demonstrates |
|---|---|
| **RBAC Architecture** | Dual-layer permission model (role defaults + per-user JSONB overrides) enforced on both server and client simultaneously |
| **Transactional Integrity** | Challan confirmation uses PostgreSQL transactions with `FOR UPDATE` row locks — prevents race conditions on stock deduction and guarantees no partial mutations on failure |
| **TypeScript Full Stack** | End-to-end TypeScript: typed API payloads, typed React state, typed middleware — minimizes runtime errors |
| **Clean API Design** | RESTful Express API with consistent `ApiResponse` wrapper, centralized error handler, and pagination utility |
| **No ORM** | Raw `pg` queries give full control over SQL, joins, and transactions — demonstrates SQL proficiency |
| **Test Coverage** | Jest + Supertest unit tests covering: challan number generation, transactional stock deduction, rollback on insufficient stock, and no partial deduction guarantee |
| **Role-scoped UI** | Dashboard stats, sidebar links, and action buttons all adapt dynamically based on the logged-in user's role and permissions |
| **Linked Data Model** | Customers → Challans → Invoices → Payments forms a coherent financial trail end-to-end |
| **Stock Audit Trail** | Every stock change (challan confirm or manual adjust) inserts a `stock_movements` record — full inventory history preserved |

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or a cloud PostgreSQL like Supabase, Neon, or Render)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/erp-crm-ops-portal.git
cd erp-crm-ops-portal
```

### 2. Backend Setup

```bash
cd Server
cp .env.example .env
# Edit .env with your values:
#   PORT=4000
#   DATABASE_URL=postgresql://user:password@host:5432/dbname
#   JWT_SECRET=<min-32-char-random-secret>
#   NODE_ENV=development

npm install
npm run migrate   # Creates all tables
npm run seed      # Seeds default users and sample data
npm run dev       # Starts backend on http://localhost:4000
```

### 3. Frontend Setup

```bash
cd ../Client
cp .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:4000/api

npm install
npm start         # Starts frontend on http://localhost:3000
```

### 4. Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@erp.com` | `Admin@123` |
| Sales | `sales@erp.com` | `Sales@123` |
| Warehouse | `warehouse@erp.com` | `Warehouse@123` |
| Accounts | `accounts@erp.com` | `Accounts@123` |

### 5. Running Tests

```bash
cd Server
npm test
```

Tests cover:
- `challanNumber.test.ts` — unique challan number generation
- `challanConfirm.test.ts` — transactional stock deduction, rollback on insufficient stock, no partial deduction
- `stockDeduction.test.ts` — manual stock adjustment validation

---

## 📮 API Reference

Import `postman/ERP-CRM.postman_collection.json` into Postman.

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/customers` | List customers (filterable by status) |
| `POST` | `/api/customers` | Create customer |
| `GET` | `/api/products` | List products (filterable by low stock) |
| `POST` | `/api/challans` | Create draft challan |
| `POST` | `/api/challans/:id/confirm` | Confirm challan (deducts stock atomically) |
| `POST` | `/api/challans/:id/cancel` | Cancel draft challan |
| `GET` | `/api/accounts/invoices` | List invoices with payment status |
| `POST` | `/api/accounts/invoices` | Create invoice |
| `POST` | `/api/accounts/payments` | Record payment against invoice |
| `GET` | `/api/accounts/summary` | Financial KPI summary |
| `POST` | `/api/stock/adjust` | Manual stock IN/OUT adjustment |
| `GET` | `/api/users` | List all users (Admin only) |
| `POST` | `/api/users` | Create new user (Admin only) |
| `PATCH` | `/api/users/:id` | Edit role, status, or permissions (Admin only) |
| `POST` | `/api/users/:id/reset-password` | Reset user password (Admin only) |

---

## ⚠️ Known Limitations

- No JWT refresh tokens — users must re-login after 8 hours
- Challan cancellation only works on `draft` status — confirmed challans are final (no stock reversal)
- Challan number uses a count-based sequence; simultaneous creates in the same year have a small chance of collision (acceptable at this scale; production would use a DB sequence or advisory lock)
- Customer and product dropdowns in ChallanForm are capped at 100 records
- No PDF / invoice export
- No multi-warehouse support
- No Docker or CI/CD pipeline
- `Settings` page company data is currently stored in component state only (no backend persistence)

---

## 🔭 Future Scope

| Feature | Description |
|---|---|
| **JWT Refresh Tokens** | Silent re-authentication without forcing re-login |
| **PDF Export** | Generate printable challan and invoice PDFs |
| **Email Notifications** | Automated follow-up reminders and invoice delivery |
| **GST / Tax Calculation** | Built-in CGST/SGST/IGST computation on invoices |
| **Multi-warehouse** | Location-based stock management |
| **Analytics Dashboard** | Charts for revenue trends, top customers, and stock velocity |
| **Audit Log** | Admin-viewable log of all data mutations with user attribution |
| **Docker + CI/CD** | Containerized deployment with GitHub Actions pipeline |
| **Settings Persistence** | Store company settings in the database |
| **Bulk Import** | CSV upload for customers and products |

---

## 📄 License

This project is intended for demonstration and portfolio purposes.

---

*Built with ❤️ for Indian B2B operations — One8 ERP-CRM Portal*
