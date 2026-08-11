import { Router } from 'express';
import { listChallans, getChallan, createChallan, updateChallan, confirmChallan, cancelChallan } from './challans.controller';
import { createChallanValidation, updateChallanValidation } from './challans.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

const canView = requireRole('admin', 'sales', 'warehouse', 'accounts');
const canCreateEdit = requireRole('admin', 'sales');
const canConfirm = requireRole('admin', 'sales', 'warehouse');
const canCancel = requireRole('admin', 'sales');

router.get('/', canView, listChallans);
router.get('/:id', canView, getChallan);
router.post('/', canCreateEdit, createChallanValidation, validate, createChallan);
router.put('/:id', canCreateEdit, updateChallanValidation, validate, updateChallan);
router.post('/:id/confirm', canConfirm, confirmChallan);
router.post('/:id/cancel', canCancel, cancelChallan);

export default router;
