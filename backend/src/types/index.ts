export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface AuthUser {
  userId: string;
  role: UserRole;
}

// Augment Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
