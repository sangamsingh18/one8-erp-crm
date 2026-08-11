import { Router } from 'express';
import { listCustomers, getCustomer, createCustomer, updateCustomer, getNotes, addNote, deleteCustomer } from './customers.controller';
import { createCustomerValidation, updateCustomerValidation, noteValidation } from './customers.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

// View: admin, sales, accounts
const canView = requireRole('admin', 'sales', 'accounts');
// Edit: admin, sales
const canEdit = requireRole('admin', 'sales');

router.get('/', canView, listCustomers);
router.get('/:id', canView, getCustomer);
router.post('/', canEdit, createCustomerValidation, validate, createCustomer);
router.put('/:id', canEdit, updateCustomerValidation, validate, updateCustomer);
router.get('/:id/notes', canView, getNotes);
router.post('/:id/notes', canEdit, noteValidation, validate, addNote);
router.delete('/:id', requireRole('admin'), deleteCustomer);

export default router;
