import { Request, Response } from 'express';
import { usersService } from './users.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await usersService.list(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getById(req.params['id'] as string);
  res.json(ApiResponse.success(user));
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.create(req.body);
  res.status(201).json(ApiResponse.success(user, 'User / Employee created successfully'));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { role, permissions, is_active } = req.body;
  const user = await usersService.updateUser(req.params['id'] as string, {
    role,
    permissions: permissions !== undefined ? permissions : undefined,
    is_active,
  });
  res.json(ApiResponse.success(user, 'User updated successfully'));
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.toggleActive(req.params['id'] as string);
  res.json(ApiResponse.success(user, `User ${user.is_active ? 'activated' : 'deactivated'} successfully`));
});

export const resetUserPassword = asyncHandler(async (req: Request, res: Response) => {
  await usersService.resetPassword(req.params['id'] as string, req.body.password);
  res.json(ApiResponse.success(null, 'Password reset successfully'));
});
