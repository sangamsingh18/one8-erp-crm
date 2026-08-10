import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body.email, req.body.password);
  res.json(ApiResponse.success(result, 'Login successful'));
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(
    req.body.name, req.body.email, req.body.password, req.body.role
  );
  res.status(201).json(ApiResponse.success(user, 'User registered'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json(ApiResponse.success(user));
});
