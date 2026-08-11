import { body } from 'express-validator';

export const createCustomerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Customer name is required.'),
  body('mobile')
    .trim()
    .notEmpty().withMessage('Please enter a valid mobile number.'),
  body('customer_type')
    .optional()
    .isIn(['retail', 'wholesale', 'distributor']).withMessage('Please select a valid customer type.'),
  body('status')
    .optional()
    .isIn(['lead', 'active', 'inactive']).withMessage('Please select a valid customer status.'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('follow_up_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Please enter a valid date (YYYY-MM-DD).'),
];

export const updateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Customer name is required.'),
  body('mobile')
    .optional()
    .trim()
    .notEmpty().withMessage('Please enter a valid mobile number.'),
  body('customer_type')
    .optional()
    .isIn(['retail', 'wholesale', 'distributor']).withMessage('Please select a valid customer type.'),
  body('status')
    .optional()
    .isIn(['lead', 'active', 'inactive']).withMessage('Please select a valid customer status.'),
  body('email')
    .optional({ nullable: true })
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('follow_up_date')
    .optional({ nullable: true })
    .isISO8601().withMessage('Please enter a valid date (YYYY-MM-DD).'),
];

export const noteValidation = [
  body('note')
    .trim()
    .notEmpty().withMessage('Note content cannot be empty.'),
];
