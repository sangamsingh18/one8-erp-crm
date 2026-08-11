import { Request, Response } from 'express';
import { authService } from './auth.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(ApiResponse.success(result, 'Login successful'));
  } catch (err) {
    // Translate ACCOUNT_INACTIVE to a user-friendly message
    if (err instanceof ApiError && err.message === 'ACCOUNT_INACTIVE') {
      throw new ApiError(403, 'Your account is currently inactive. Please contact an administrator.');
    }
    throw err;
  }
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(
    req.body.name, req.body.email, req.body.password, req.body.role
  );
  res.status(201).json(ApiResponse.success(user, 'User registered'));
});

export const selfRegister = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await authService.selfRegister(name, email, password);
  res.status(201).json(ApiResponse.success(user, 'Account created successfully. You can now sign in.'));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.userId);
  res.json(ApiResponse.success(user));
});
