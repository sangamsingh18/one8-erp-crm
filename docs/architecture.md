# Architecture

## Overview
Mini ERP + CRM Operations Portal for wholesale/distribution companies.

## Stack
- **Backend**: Node.js + TypeScript + Express.js
- **Database**: PostgreSQL (UUID PKs, CHECK constraints)
- **Auth**: JWT (8h expiry, bcrypt cost 10)
- **Frontend**: React + TypeScript, plain CSS

## Module Structure
```
auth → login/register/me
customers → CRUD + notes timeline
products → CRUD + stock movements + manual adjust
challans → draft → confirm (transactional) → cancel
```

## Critical: Challan Confirm Transaction
1. `BEGIN`
2. `SELECT ... FOR UPDATE` on all product rows (prevents race conditions)
3. Validate ALL items have sufficient stock — if any fail, `ROLLBACK` with HTTP 409
4. Only after all checks pass: decrement stock + insert stock_movements for each item
5. Set challan status = confirmed, confirmed_at = NOW()
6. `COMMIT`

No partial deductions are possible. The DB CHECK constraint `current_stock >= 0` is a backstop.

## Role Permissions
| Action | Admin | Sales | Warehouse | Accounts |
|---|---|---|---|---|
| Manage users | ✅ | ❌ | ❌ | ❌ |
| View customers | ✅ | ✅ | ❌ | ✅ |
| Add/edit customers | ✅ | ✅ | ❌ | ❌ |
| View products | ✅ | ✅ | ✅ | ✅ |
| Add/edit products | ✅ | ❌ | ✅ | ❌ |
| Manual stock adjust | ✅ | ❌ | ✅ | ❌ |
| Create/edit draft challan | ✅ | ✅ | ❌ | ❌ |
| Confirm challan | ✅ | ✅ | ✅ | ❌ |
| Cancel challan | ✅ | ✅ | ❌ | ❌ |
| View challans | ✅ | ✅ | ✅ | ✅ |

## Known Limitations
- No refresh token rotation (document as limitation)
- No PDF export
- No multi-warehouse transfers
- Challan number generator uses COUNT — not gap-safe under extreme concurrent creates (acceptable for this scale)
