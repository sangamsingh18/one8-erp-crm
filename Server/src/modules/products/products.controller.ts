import { Request, Response } from 'express';
import { productService } from './products.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await productService.list(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(await productService.getById(req.params['id'] as string)));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(ApiResponse.success(await productService.create(req.body), 'Product created'));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(await productService.update(req.params['id'] as string, req.body), 'Product updated'));
});

export const getStockLog = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await productService.getStockLog(req.params['id'] as string, req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const adjustStock = asyncHandler(async (req: Request, res: Response) => {
  const movement = await productService.adjustStock(
    req.params['id'] as string, req.body.quantity, req.body.movement_type, req.body.reason, req.user!.userId
  );
  res.status(201).json(ApiResponse.success(movement, 'Stock adjusted'));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.delete(req.params['id'] as string);
  res.json(ApiResponse.success(null, 'Product deactivated successfully'));
});

export const listAllMovements = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await productService.listAllMovements(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});
