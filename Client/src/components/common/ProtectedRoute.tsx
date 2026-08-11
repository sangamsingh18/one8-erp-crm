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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F172A',
        color: '#94A3B8',
        fontSize: '15px',
        fontWeight: 500
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: '32px',
            height: '32px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#38BDF8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px auto'
          }} />
          Loading One8 CRM...
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  if (permissionKey && !hasPermission(user, permissionKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
