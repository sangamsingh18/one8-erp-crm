import { body } from 'express-validator';

export const createProductValidation = [
  body('name').trim().notEmpty(),
  body('sku').trim().notEmpty(),
  body('unit_price').isFloat({ min: 0 }),
  body('current_stock').optional().isInt({ min: 0 }),
  body('min_stock_alert').optional().isInt({ min: 0 }),
];

export const updateProductValidation = [
  body('name').optional().trim().notEmpty(),
  body('unit_price').optional().isFloat({ min: 0 }),
  body('min_stock_alert').optional().isInt({ min: 0 }),
];

export const stockAdjustValidation = [
  body('quantity').isInt({ min: 1 }),
  body('movement_type').isIn(['IN', 'OUT']),
  body('reason').trim().notEmpty(),
];
