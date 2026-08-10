import { body } from 'express-validator';

export const createChallanValidation = [
  body('customer_id').isUUID(),
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isUUID(),
  body('items.*.quantity').isInt({ min: 1 }),
];

export const updateChallanValidation = [
  body('customer_id').optional().isUUID(),
  body('items').optional().isArray({ min: 1 }),
  body('items.*.product_id').optional().isUUID(),
  body('items.*.quantity').optional().isInt({ min: 1 }),
];
