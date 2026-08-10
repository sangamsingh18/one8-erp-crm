import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { JwtPayload } from '../types';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new ApiError(401, 'No token provided'));

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};
