import { Request, Response } from 'express';
import { challanService } from './challans.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await challanService.list(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const getChallan = asyncHandler(async (req: Request, res: Response) => {
  res.json(ApiResponse.success(await challanService.getById(req.params['id'] as string)));
});

export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.create(req.body.customer_id, req.body.items, req.user!.userId);
  res.status(201).json(ApiResponse.success(challan, 'Challan created'));
});

export const updateChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.update(req.params['id'] as string, req.body.customer_id, req.body.items);
  res.json(ApiResponse.success(challan, 'Challan updated'));
});

export const confirmChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.confirm(req.params['id'] as string, req.user!.userId);
  res.json(ApiResponse.success(challan, 'Challan confirmed'));
});

export const cancelChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.cancel(req.params['id'] as string);
  res.json(ApiResponse.success(challan, 'Challan cancelled'));
});
