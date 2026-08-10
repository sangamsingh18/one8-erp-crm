import { body } from 'express-validator';

export const createCustomerValidation = [
  body('name').trim().notEmpty(),
  body('mobile').trim().notEmpty(),
  body('customer_type').optional().isIn(['retail', 'wholesale', 'distributor']),
  body('status').optional().isIn(['lead', 'active', 'inactive']),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('follow_up_date').optional({ nullable: true }).isISO8601(),
];

export const updateCustomerValidation = [
  body('name').optional().trim().notEmpty(),
  body('mobile').optional().trim().notEmpty(),
  body('customer_type').optional().isIn(['retail', 'wholesale', 'distributor']),
  body('status').optional().isIn(['lead', 'active', 'inactive']),
  body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
  body('follow_up_date').optional({ nullable: true }).isISO8601(),
];

export const noteValidation = [body('note').trim().notEmpty()];
