import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, toggleUserActive, resetUserPassword } from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

// Only admins can manage users
router.use(requireRole('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/toggle-active', toggleUserActive);
router.post('/:id/reset-password', resetUserPassword);

export default router;
