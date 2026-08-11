import { Router } from 'express';
import { listInvoices, getInvoice, createInvoice, recordPayment, getSummary } from './accounts.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

// View: admin, accounts, sales
const canView = requireRole('admin', 'accounts', 'sales');
// Manage: admin, accounts
const canManage = requireRole('admin', 'accounts');

router.get('/invoices', canView, listInvoices);
router.get('/invoices/:id', canView, getInvoice);
router.post('/invoices', canManage, createInvoice);
router.post('/payments', canManage, recordPayment);
router.get('/summary', requireRole('admin', 'accounts'), getSummary);

export default router;
