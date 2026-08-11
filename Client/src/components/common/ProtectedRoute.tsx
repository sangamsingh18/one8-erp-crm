import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

export const ROLE_DEFAULTS: Record<string, string[]> = {
  admin: [
    'dashboard', 'customers', 'products', 'inventory', 'stock-movements', 'low-stock',
    'challans', 'invoices', 'payments', 'reports', 'employees', 'settings',
  ],
  sales: ['dashboard', 'customers', 'challans', 'invoices', 'reports'],
  warehouse: ['dashboard', 'products', 'inventory', 'stock-movements', 'low-stock', 'reports'],
  accounts: ['dashboard', 'customers', 'invoices', 'payments', 'reports'],
};

export const hasPermission = (user: User | null, key: string): boolean => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  const userPerms = user.permissions;
  if (Array.isArray(userPerms)) {
    return userPerms.includes(key as any);
  }
  
  const defaults = ROLE_DEFAULTS[user.role] || [];
  return defaults.includes(key);
};

interface Props {
  children: React.ReactNode;
  permissionKey?: string;
}

const ProtectedRoute = ({ children, permissionKey }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (permissionKey && !hasPermission(user, permissionKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
