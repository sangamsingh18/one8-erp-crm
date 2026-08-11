import { Request, Response } from 'express';
import { accountsService } from './accounts.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { rows, total, page, limit } = await accountsService.listInvoices(req.query as Record<string, unknown>);
  res.json(ApiResponse.list(rows, { page, limit, total }));
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await accountsService.getInvoiceById(req.params['id'] as string);
  res.json(ApiResponse.success(invoice));
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await accountsService.createInvoice(req.body, req.user!.userId);
  res.status(201).json(ApiResponse.success(invoice, 'Invoice created successfully'));
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await accountsService.recordPayment(req.body, req.user!.userId);
  res.status(201).json(ApiResponse.success(payment, 'Payment recorded successfully'));
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await accountsService.getFinancialSummary();
  res.json(ApiResponse.success(summary));
});
