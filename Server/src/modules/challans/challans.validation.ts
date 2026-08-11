import { body } from 'express-validator';

export const createChallanValidation = [
  body('customer_id')
    .isUUID().withMessage('Please select a customer.'),
  body('items')
    .isArray({ min: 1 }).withMessage('Please add at least one product.'),
  body('items.*.product_id')
    .isUUID().withMessage('Please complete all required product fields.'),
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be greater than 0.'),
];

export const updateChallanValidation = [
  body('customer_id')
    .optional()
    .isUUID().withMessage('Please select a customer.'),
  body('items')
    .optional()
    .isArray({ min: 1 }).withMessage('Please add at least one product.'),
  body('items.*.product_id')
    .optional()
    .isUUID().withMessage('Please complete all required product fields.'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be greater than 0.'),
];
