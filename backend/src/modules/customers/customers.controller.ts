import { Request, Response } from 'express';
import { customerService } from './customers.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await customerService.list(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getById(req.params['id'] as string);
  res.json(ApiResponse.success(customer));
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.create(req.body, req.user!.userId);
  res.status(201).json(ApiResponse.success(customer, 'Customer created'));
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.update(req.params['id'] as string, req.body);
  res.json(ApiResponse.success(customer, 'Customer updated'));
});

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await customerService.getNotes(req.params['id'] as string);
  res.json(ApiResponse.success(notes));
});

export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await customerService.addNote(req.params['id'] as string, req.body.note, req.user!.userId);
  res.status(201).json(ApiResponse.success(note, 'Note added'));
});
