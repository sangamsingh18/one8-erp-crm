import { body } from 'express-validator';

export const createProductValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required.'),
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required.'),
  body('unit_price')
    .isFloat({ min: 0 }).withMessage('Please enter a valid unit price.'),
  body('current_stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock quantity cannot be negative.'),
  body('min_stock_alert')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock quantity cannot be negative.'),
];

export const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Product name is required.'),
  body('unit_price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Please enter a valid unit price.'),
  body('min_stock_alert')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum stock quantity cannot be negative.'),
];

export const stockAdjustValidation = [
  body('quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be greater than 0.'),
  body('movement_type')
    .isIn(['IN', 'OUT']).withMessage('Invalid movement type.'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required.'),
];
