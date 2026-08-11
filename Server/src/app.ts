import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customers.routes';
import productRoutes from './modules/products/products.routes';
import challanRoutes from './modules/challans/challans.routes';
import accountsRoutes from './modules/accounts/accounts.routes';
import usersRoutes from './modules/users/users.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/auth.middleware';
import { checkPermission } from './middlewares/permission.middleware';

const app = express();

app.use(helmet());
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'https://sangamone8crm.onrender.com'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Auth (partially public)
app.use('/api/auth', authRoutes);

// Permission-protected module routes
// Each module is guarded by authMiddleware + checkPermission for its key
app.use('/api/customers',  authMiddleware, checkPermission('customers'),      customerRoutes);
app.use('/api/products',   authMiddleware, checkPermission('products'),        productRoutes);
app.use('/api/challans',   authMiddleware, checkPermission('challans'),        challanRoutes);
app.use('/api/accounts',   authMiddleware, checkPermission('invoices'),        accountsRoutes);
app.use('/api/users',      usersRoutes);  // has its own authMiddleware + requireRole('admin')

app.use(notFound);
app.use(errorHandler);

export default app;
