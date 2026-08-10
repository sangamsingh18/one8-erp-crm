import { Router } from 'express';
import { listProducts, getProduct, createProduct, updateProduct, getStockLog, adjustStock } from './products.controller';
import { createProductValidation, updateProductValidation, stockAdjustValidation } from './products.validation';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware);

const canView = requireRole('admin', 'sales', 'warehouse', 'accounts');
const canEdit = requireRole('admin', 'warehouse');

router.get('/', canView, listProducts);
router.get('/:id', canView, getProduct);
router.post('/', canEdit, createProductValidation, validate, createProduct);
router.put('/:id', canEdit, updateProductValidation, validate, updateProduct);
router.get('/:id/stock-log', canView, getStockLog);
router.post('/:id/stock-adjust', canEdit, stockAdjustValidation, validate, adjustStock);

export default router;
