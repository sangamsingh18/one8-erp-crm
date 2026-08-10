import { Router } from 'express';
import { login, register, getMe } from './auth.controller';
import { loginValidation, registerValidation } from './auth.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();

router.post('/login', loginValidation, validate, login);
router.post('/register', authMiddleware, requireRole('admin'), registerValidation, validate, register);
router.get('/me', authMiddleware, getMe);

export default router;
