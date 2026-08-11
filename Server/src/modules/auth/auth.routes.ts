import { Router } from 'express';
import { login, register, selfRegister, getMe } from './auth.controller';
import { loginValidation, registerValidation } from './auth.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/login', loginValidation, validate, login);

// Public self-registration (creates as sales role)
router.post('/self-register', [
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match.');
    return true;
  }),
], validate, selfRegister);

// Admin-only: create user with specific role
router.post('/register', authMiddleware, requireRole('admin'), registerValidation, validate, register);

// Protected
router.get('/me', authMiddleware, getMe);

export default router;
