# ERP-CRM Operations Portal

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env: REACT_APP_API_URL=http://localhost:4000/api
npm install
npm start
```

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default 4000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Min 32-char random secret |
| `NODE_ENV` | development / production |

### Frontend `.env`
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

## Test Credentials (after seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@erp.com | Admin@123 |
| Sales | sales@erp.com | Sales@123 |
| Warehouse | warehouse@erp.com | Warehouse@123 |
| Accounts | accounts@erp.com | Accounts@123 |

## Running Tests
```bash
cd backend
npm test
```
Tests cover:
- `challanNumber.test.ts` — challan number generator
- `challanConfirm.test.ts` — transactional stock deduction, rollback on insufficient stock, no partial deduction
- `stockDeduction.test.ts` — manual stock adjust validation

## API Reference
Import `postman/ERP-CRM.postman_collection.json` into Postman.

The collection has 9 variables. To populate them:
1. Run each role's login request and paste the returned `token` into the matching collection variable (`token`, `salesToken`, `warehouseToken`, `accountsToken`).
2. After creating a customer/product/challan, paste the returned `id` into `customerId`, `productId`, `challanId`.
3. For the insufficient-stock 409 test, create a draft challan whose item quantity exceeds the product's stock, then paste that challan's `id` into `challanIdHighQty`.

## Deployment

### Database (Neon / Supabase / Render Postgres)
1. Create a PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run migrate` then `npm run seed`

### Backend (Render / Railway)
1. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Set env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`
2. Build command: `npm run build`
3. Publish directory: `build`

## Assumptions
- SKU is immutable after product creation (enforced in UI, not DB)
- Challan cancellation only works on draft status (confirmed challans are final — no stock reversal in scope)
- `follow_up_date` is a date-only field (no time component)
- Product list only shows `is_active = true` items

## Known Limitations
- No JWT refresh tokens — users must re-login after 8h
- Challan number generation uses a count-based sequence; under simultaneous concurrent creates in the same year there is a small chance of a unique-constraint retry. Acceptable at this project's scale; a production version would use a DB sequence or advisory lock.
- Deactivated products (`is_active=false`) are not visible via `GET /api/products` in this version; there is no admin view for inactive inventory.
- No PDF/invoice export
- No multi-warehouse support
- No Docker/CI pipeline
- ChallanForm customer/product dropdowns are capped at 100 records; a production version would use a type-ahead async select.
