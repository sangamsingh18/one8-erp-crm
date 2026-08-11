import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { ApiError } from '../utils/ApiError';

// Role-based default permissions (used when user.permissions is NULL)
const ROLE_DEFAULTS: Record<string, string[]> = {
  admin: [
    'dashboard','customers','products','inventory','stock-movements','low-stock',
    'challans','invoices','payments','reports','employees','settings',
  ],
  sales: ['dashboard','customers','challans','invoices','reports'],
  warehouse: ['dashboard','products','inventory','stock-movements','low-stock','reports'],
  accounts: ['dashboard','customers','invoices','payments','reports'],
};

/**
 * Middleware factory: checks if the logged-in user has access to a given permission key.
 * Admin role always passes without a DB lookup.
 * Others: fetches permissions from DB (custom or role default).
 */
export const checkPermission = (permissionKey: string) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'Unauthenticated'));

    // Admin always has full access
    if (req.user.role === 'admin') return next();

    try {
      const result = await pool.query(
        `SELECT permissions, role FROM users WHERE id = $1`,
        [req.user.userId]
      );
      const user = result.rows[0];
      if (!user) return next(new ApiError(401, 'User not found'));

      // Resolve effective permissions: custom array OR role defaults
      const effective: string[] = user.permissions
        ? (user.permissions as string[])
        : (ROLE_DEFAULTS[user.role] || []);

      if (!effective.includes(permissionKey)) {
        return next(new ApiError(403, 'You do not have permission to access this module.'));
      }
      next();
    } catch {
      return next(new ApiError(500, 'Permission check failed.'));
    }
  };

export { ROLE_DEFAULTS };
