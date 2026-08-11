# 🏢 One8 ERP-CRM Operations Portal

> A full-stack, multi-role ERP + CRM operations portal for Indian B2B businesses — built to manage customers, delivery challans, inventory, invoices, and payments with fine-grained role-based access control.

| 🔗 Resource | Link |
|---|---|
| 🌐 **Live Frontend** | [sangamone8crm.onrender.com](https://sangamone8crm.onrender.com) |
| ⚙️ **Live Backend** | [one8-erp-crm-backend.onrender.com](https://one8-erp-crm-backend.onrender.com) |

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Node](https://img.shields.io/badge/node-20%2B-green)
![TypeScript](https://img.shields.io/badge/typescript-5-blue)
![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue)
![React](https://img.shields.io/badge/react-19-61DAFB)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📋 Table of Contents

- [🏢 Project Description](#-project-description)
- [🎯 Problem Statement](#-problem-statement)
- [🛠 Tech Stack](#-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [✅ Key Features](#-key-features)
- [📂 Application Modules](#-application-modules)
- [🛡️ Role-Based Access Control (RBAC)](#️-role-based-access-control-rbac)
- [👨‍💼 Admin Capabilities](#-admin-capabilities)
- [📊 Role-wise Dashboard](#-role-wise-dashboard)
- [🗃️ Database Schema Overview](#️-database-schema-overview)
- [🔒 Security & Authorization](#-security--authorization)
- [🌟 Project Highlights](#-project-highlights-recruiter--interview-ready)
- [🚀 Setup & Run](#-setup--run)
- [☁️ Deployment](#️-deployment)
- [📮 API Reference](#-api-reference)
- [🧪 Testing Strategy](#-testing-strategy)
- [📱 Screenshots & Demo Flow](#-screenshots--demo-flow)
- [⚠️ Known Limitations](#️-known-limitations)
- [🔭 Future Scope](#-future-scope)
- [🤝 Contributing](#-contributing)
- [❓ FAQ](#-faq)
- [📄 License](#-license)
- [🙌 Acknowledgements](#-acknowledgements)

---

## 🏢 Project Description

**One8 ERP-CRM** is a production-grade internal operations portal designed for Indian B2B distribution and trading businesses. It unifies four core business functions — **Sales (CRM)**, **Warehouse (Inventory)**, **Accounts (Finance)**, and **Admin (User Management)** — into a single, role-controlled web application.

The system enforces **JWT-based authentication** and a **dual-layer permission model** (role defaults + per-user custom overrides) so that each employee only sees and accesses the modules relevant to their function. All business entities are connected: customers generate challans, challans link to invoices, and invoices track payments — giving management a live, end-to-end view of the business.

This project was built to simulate a **real-world SaaS internal tool** — the kind of system a mid-sized Indian trading/distribution company would actually run their day-to-day operations on, from lead capture to delivery to cash collection.

---

## 🎯 Problem Statement

Many small and mid-sized B2B trading businesses in India still run their operations across **disconnected spreadsheets, WhatsApp messages, and paper challans** — leading to:

- 🚫 No single source of truth for customer status or outstanding dues
- 🚫 Manual, error-prone stock tracking with no audit trail
- 🚫 No visibility into who confirmed a delivery or adjusted inventory
- 🚫 Everyone having access to everything (or nothing), with no role boundaries
- 🚫 Delayed follow-ups on leads and overdue payments

**One8 ERP-CRM** solves this by centralizing customers, inventory, delivery, billing, and collections into one auditable, role-restricted system — so each department works in its own lane while management retains a unified, real-time view.

---

## 🛠 Tech Stack

### 🔧 Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| Database | PostgreSQL 14+ |
| Auth | JSON Web Tokens (JWT) via `jsonwebtoken` |
| Password Hashing | `bcryptjs` |
| Validation | `express-validator` |
| Security Headers | `helmet`, `cors` |
| ORM / Query | Raw `pg` (node-postgres) — no ORM |
| Dev Server | `nodemon` + `ts-node` |
| Testing | Jest + `ts-jest` + Supertest |

### 🎨 Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 (Create React App) |
| Language | TypeScript 4 |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API (Auth + Notifications) |

### ☁️ Infrastructure / Hosting
| Layer | Technology |
|---|---|
| Frontend Hosting | Render (Static Site) |
| Backend Hosting | Render (Web Service) |
| Database Hosting | PostgreSQL (Render / Supabase / Neon compatible) |
| API Testing | Postman Collection |

---

## 🏗️ System Architecture

```
                        ┌────────────────────────┐
                        │        Browser          │
                        │  (React 19 SPA - Client) │
                        └────────────┬─────────────┘
                                     │ Axios (HTTPS)
                                     ▼
                        ┌────────────────────────┐
                        │   Express + TypeScript   │
                        │        (Server)          │
                        │  ┌────────────────────┐  │
                        │  │  authMiddleware     │  │
                        │  │  (JWT verification) │  │
                        │  └─────────┬──────────┘  │
                        │  ┌─────────▼──────────┐  │
                        │  │  checkPermission()   │  │
                        │  │  (RBAC enforcement)  │  │
                        │  └─────────┬──────────┘  │
                        │  ┌─────────▼──────────┐  │
                        │  │  Route Controllers   │  │
                        │  └─────────┬──────────┘  │
                        └────────────┼─────────────┘
                                     │ raw pg queries / transactions
                                     ▼
                        ┌────────────────────────┐
                        │      PostgreSQL 14+       │
                        │  customers · products     │
                        │  challans · invoices       │
                        │  payments · stock_movements│
                        │  users (RBAC JSONB)         │
                        └────────────────────────┘
```

**Request flow:** every incoming API request passes through JWT verification → permission-key check → controller logic → parameterized SQL query/transaction → typed `ApiResponse` returned to the client.

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
- 🧾 **Consistent API Contracts** — every endpoint returns a typed `ApiResponse` wrapper for predictable frontend consumption
- 🔁 **Atomic Transactions** — challan confirmation locks rows (`FOR UPDATE`) to prevent race conditions during concurrent stock updates
- 🕵️ **Full Stock Audit Trail** — every inventory change (auto or manual) is logged with reason, quantity, and timestamp

---

## 📂 Application Modules

| Module | Route | Description |
|---|---|---|
| 🏠 Dashboard | `/dashboard` | Role-filtered KPI cards and quick actions |
| 👥 Customers | `/customers` | CRM — leads, active clients, follow-ups, notes |
| 📦 Products | `/products` | Catalogue — SKU, pricing, stock, warehouse location |
| 🔄 Inventory | `/inventory` | Stock adjustment (IN/OUT) with reason logging |
| 📜 Stock Movements | `/stock-movements` | Audit log of all stock IN/OUT transactions |
| ⚠️ Low Stock | `/low-stock` | Alert list of products below `min_stock_alert` |
| 📋 Challans | `/challans` | Delivery challans — draft, confirm, cancel |
| 🧾 Invoices | `/invoices` | Linked invoices with outstanding tracking |
| 💳 Payments | `/payments` | Payment ledger with method and reference |
| 📊 Reports | `/reports` | Role-scoped summary statistics |
| 👨‍💼 Employees | `/employees` | Admin-only user management |
| ⚙️ Settings | `/settings` | Company info — Admin edit, others read-only |

---

## 🛡️ Role-Based Access Control (RBAC)

The system implements a **dual-layer permission model**:
1. **Role Defaults** — each role has a preset set of permitted modules
2. **Custom Overrides** — admins can grant or restrict specific modules per individual user (stored as a JSONB array in the `users` table)

If a user has a custom `permissions` array set, it overrides the role defaults entirely. Otherwise, role defaults apply.

### 🔑 Default Permissions by Role

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

### 🧩 How Permission Resolution Works

1. Request hits a protected route with a `Bearer` token
2. `authMiddleware` verifies the JWT signature and expiry
3. `checkPermission(moduleKey)` looks up the authenticated user
4. If the user is **Admin** → automatically passes
5. Else if the user has a **custom `permissions` array** → checked against that array
6. Else → falls back to the **role default** table above
7. If the module key isn't present in the resolved set → **403 Forbidden**, no data returned

---

## 👨‍💼 Admin Capabilities

The **Admin** role has unrestricted access to all modules and the following exclusive management capabilities via the **Employees** page:

| Action | Description |
|---|---|
| ➕ **Create User** | Add new users with name, email, password, and role |
| 🔁 **Change Role** | Promote or demote any user to a different role |
| ⏻ **Activate / Deactivate** | Toggle user account status (deactivated users cannot log in) |
| 🔑 **Reset Password** | Set a new password for any user account |
| 🎛️ **Customize Permissions** | Override role defaults by granting or restricting specific modules per user |
| 🏢 **Edit Company Settings** | Update company name, GST, contact info, currency, and timezone |

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

> ⚡ Quick Action buttons on the dashboard provide role-relevant shortcuts (e.g., "New Customer", "New Challan", "Adjust Stock", "Record Payment").

---

## 🗃️ Database Schema Overview

Core entities and how they connect end-to-end:

```
users ─────────────┐
                    │ (created_by / role / permissions JSONB)
                    ▼
customers ───► challans ───► challan_items ───► products
                    │                              │
                    ▼                              ▼
                invoices ───► payments      stock_movements
```

| Table | Purpose |
|---|---|
| `users` | Employee accounts, roles, hashed passwords, custom permissions JSONB |
| `customers` | CRM records — leads and active clients, follow-up tracking |
| `products` | Catalogue items — SKU, pricing, warehouse location, min stock alert |
| `challans` | Delivery challans with lifecycle status (draft/confirmed/cancelled) |
| `challan_items` | Line items per challan, linked to products and quantities |
| `stock_movements` | Immutable audit log of every stock IN/OUT event |
| `invoices` | Billing documents generated against confirmed challans |
| `payments` | Payments recorded against invoices (method + reference number) |

> 🔒 Foreign keys tie every downstream record back to its origin, so a payment can always be traced back through its invoice → challan → customer chain.

---

## 🔒 Security & Authorization

### 🔐 Authentication
- Login issues a signed **JWT** (HS256) stored in the client and sent via `Authorization: Bearer <token>` on every request
- Tokens expire after **8 hours** — users must re-login
- Passwords are hashed with **bcryptjs** (salt rounds: 10) before storage; plain-text passwords are never persisted

### 🛡️ Authorization (Backend)
- Every protected API route is guarded by `authMiddleware` (token verification) followed by `checkPermission(key)` (module access check)
- `checkPermission` resolves effective permissions: **Admin always passes**; others check the user's custom JSONB array or fall back to role defaults
- A 403 is returned immediately if the permission key is not present — no partial data leakage

### 🖥️ Authorization (Frontend)
- `ProtectedRoute` wraps every page component — unauthenticated users are redirected to `/login`
- The sidebar only renders navigation links for modules the current user has permission to access (`hasPermission` helper)
- Even if a URL is manually entered, the server-side permission check ensures no data is returned

### 🧱 Other Security Measures
- `helmet` sets HTTP security headers (CSP, HSTS, etc.)
- `cors` is configured (configurable per environment)
- All user inputs are validated via `express-validator` before reaching service logic
- SQL queries are fully parameterized — no raw string interpolation, preventing SQL injection
- Sensitive config (JWT secret, DB URL) is kept out of source control via `.env` files

---

## 🌟 Project Highlights (Recruiter / Interview Ready)

| Area | What it demonstrates |
|---|---|
| 🏗️ **RBAC Architecture** | Dual-layer permission model (role defaults + per-user JSONB overrides) enforced on both server and client simultaneously |
| ⚛️ **Transactional Integrity** | Challan confirmation uses PostgreSQL transactions with `FOR UPDATE` row locks — prevents race conditions on stock deduction and guarantees no partial mutations on failure |
| 🧠 **TypeScript Full Stack** | End-to-end TypeScript: typed API payloads, typed React state, typed middleware — minimizes runtime errors |
| 🧰 **Clean API Design** | RESTful Express API with consistent `ApiResponse` wrapper, centralized error handler, and pagination utility |
| 🗄️ **No ORM** | Raw `pg` queries give full control over SQL, joins, and transactions — demonstrates SQL proficiency |
| 🧪 **Test Coverage** | Jest + Supertest unit tests covering: challan number generation, transactional stock deduction, rollback on insufficient stock, and no partial deduction guarantee |
| 🎭 **Role-scoped UI** | Dashboard stats, sidebar links, and action buttons all adapt dynamically based on the logged-in user's role and permissions |
| 🔗 **Linked Data Model** | Customers → Challans → Invoices → Payments forms a coherent financial trail end-to-end |
| 📜 **Stock Audit Trail** | Every stock change (challan confirm or manual adjust) inserts a `stock_movements` record — full inventory history preserved |
| ☁️ **Live Deployment** | Fully deployed and functional across separate frontend and backend Render services |

---

## 🚀 Setup & Run

### 📋 Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or a cloud PostgreSQL like Supabase, Neon, or Render)
- npm (comes with Node.js)
- Git

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/erp-crm-ops-portal.git
cd erp-crm-ops-portal
```

### 2️⃣ Backend Setup

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

### 3️⃣ Frontend Setup

```bash
cd ../Client
cp .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:4000/api

npm install
npm start         # Starts frontend on http://localhost:3000
```

### 4️⃣ Default Login Credentials

| Role | Email | Password |
|---|---|---|
| 🔴 Admin | `admin@erp.com` | `Admin@123` |
| 🟢 Sales | `sales@erp.com` | `Sales@123` |
| 🟡 Warehouse | `warehouse@erp.com` | `Warehouse@123` |
| 🟣 Accounts | `accounts@erp.com` | `Accounts@123` |

> ⚠️ These are seed/demo credentials for local development only — always rotate credentials before any production use.

### 5️⃣ Running Tests

```bash
cd Server
npm test
```

Tests cover:
- `challanNumber.test.ts` — unique challan number generation
- `challanConfirm.test.ts` — transactional stock deduction, rollback on insufficient stock, no partial deduction
- `stockDeduction.test.ts` — manual stock adjustment validation

---

## ☁️ Deployment

The project is deployed live using **Render**:

| Service | Type | URL |
|---|---|---|
| 🌐 Frontend | Static Site | [sangamone8crm.onrender.com](https://sangamone8crm.onrender.com) |
| ⚙️ Backend | Web Service | [one8-erp-crm-backend.onrender.com](https://one8-erp-crm-backend.onrender.com) |
| 🗄️ Database | Managed PostgreSQL | Render / Supabase / Neon compatible |

**Deployment notes:**
- Backend build command: `npm install && npm run build`, start command: `npm start`
- Frontend build command: `npm run build`, served as a static site with `REACT_APP_API_URL` pointed at the live backend
- Environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`) are configured directly in the Render dashboard, not committed to source
- ⏳ Free-tier Render services may spin down when idle — the first request after inactivity can take a few seconds to respond

---

## 📮 API Reference

Import `postman/ERP-CRM.postman_collection.json` into Postman.

### 🔑 Key Endpoints

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

### 📦 Response Format

All API responses follow a consistent `ApiResponse` envelope:

```json
{
  "success": true,
  "data": { },
  "message": "Request completed successfully"
}
```

On error:

```json
{
  "success": false,
  "data": null,
  "message": "Descriptive error message"
}
```

---

## 🧪 Testing Strategy

| Test File | What it Validates |
|---|---|
| `challanNumber.test.ts` | Uniqueness and correctness of generated challan numbers |
| `challanConfirm.test.ts` | Transactional stock deduction, rollback on insufficient stock, no partial deduction under concurrent load |
| `stockDeduction.test.ts` | Manual stock IN/OUT adjustment validation and edge cases |

**Framework:** Jest + `ts-jest` for TypeScript-aware unit testing, Supertest for HTTP-level integration testing against the Express app.

```bash
cd Server
npm test              # run full suite
npm test -- --watch   # watch mode during development
```

---

## 📱 Screenshots & Demo Flow

> 📸 Add screenshots or a short GIF walkthrough here to showcase: Login → Role-based Dashboard → Creating a Challan → Confirming Stock Deduction → Generating an Invoice → Recording a Payment.

**Suggested demo flow for reviewers:**
1. 🔑 Log in as **Admin** → view full dashboard and Employees page
2. 👥 Create a new **Customer** as Sales
3. 📦 Add/adjust a **Product's** stock as Warehouse
4. 📋 Create and **confirm a Challan** — watch stock auto-deduct
5. 🧾 Generate an **Invoice** linked to that challan
6. 💳 Record a **Payment** as Accounts and see outstanding balance update
7. 🔁 Log in as a restricted role (e.g., Warehouse) and confirm blocked modules return 403 / are hidden from the sidebar

---

## ⚠️ Known Limitations

- 🔁 No JWT refresh tokens — users must re-login after 8 hours
- 🚫 Challan cancellation only works on `draft` status — confirmed challans are final (no stock reversal)
- 🔢 Challan number uses a count-based sequence; simultaneous creates in the same year have a small chance of collision (acceptable at this scale; production would use a DB sequence or advisory lock)
- 📉 Customer and product dropdowns in ChallanForm are capped at 100 records
- 🧾 No PDF / invoice export
- 🏭 No multi-warehouse support
- 🐳 No Docker or CI/CD pipeline
- ⚙️ `Settings` page company data is currently stored in component state only (no backend persistence)

---

## 🔭 Future Scope

| Feature | Description |
|---|---|
| 🔁 **JWT Refresh Tokens** | Silent re-authentication without forcing re-login |
| 🧾 **PDF Export** | Generate printable challan and invoice PDFs |
| 📧 **Email Notifications** | Automated follow-up reminders and invoice delivery |
| 🧮 **GST / Tax Calculation** | Built-in CGST/SGST/IGST computation on invoices |
| 🏭 **Multi-warehouse** | Location-based stock management |
| 📈 **Analytics Dashboard** | Charts for revenue trends, top customers, and stock velocity |
| 🕵️ **Audit Log** | Admin-viewable log of all data mutations with user attribution |
| 🐳 **Docker + CI/CD** | Containerized deployment with GitHub Actions pipeline |
| 💾 **Settings Persistence** | Store company settings in the database |
| 📤 **Bulk Import** | CSV upload for customers and products |
| 🔔 **Push/SMS Notifications** | Real-time alerts for low stock and overdue invoices |
| 🌐 **Multi-language Support** | Regional language support for wider adoption across India |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔁 Open a Pull Request

Please make sure to update tests as appropriate and follow the existing TypeScript/code style conventions.

---

## ❓ FAQ

**Q: Can I add a new role beyond Admin/Sales/Warehouse/Accounts?**
A: The role default table and `checkPermission` logic are centralized, so a new role can be added by extending the role-defaults map and updating the `users.role` enum/check constraint.

**Q: What happens if a confirmed challan needs to be reversed?**
A: Currently not supported — confirmed challans are final by design to preserve audit integrity. Reversal support is tracked in Future Scope.

**Q: Is this connected to a real payment gateway?**
A: No — payments are recorded manually with method and reference number (NEFT, UPI, Cheque, Bank Transfer) for bookkeeping, not live gateway processing.

**Q: Does it support multiple companies/tenants?**
A: Not currently — it's single-tenant, single-company per deployment.

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute with attribution.

---

## 🙌 Acknowledgements

- Built with ❤️ for Indian B2B operations
- Inspired by real-world challenges faced by small and mid-sized trading/distribution businesses
- Thanks to the open-source community behind Express, React, PostgreSQL, and the broader Node.js ecosystem

---

*Built with ❤️ for Indian B2B operations — One8 ERP-CRM Portal*
