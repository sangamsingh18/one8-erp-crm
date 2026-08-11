import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.'),
  body('email')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('role')
    .isIn(['admin', 'sales', 'warehouse', 'accounts']).withMessage('Please select a valid role.'),
];
