import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../common/ProtectedRoute';
import { UserPermission } from '../../types';
import {
  LayoutDashboard, Users, Package, ClipboardList, RefreshCw,
  AlertTriangle, FileSpreadsheet, FileText, Coins, BarChart2,
  Users2, Settings, LogOut, Shield, TrendingUp, Warehouse, BookOpen
} from 'lucide-react';

const roleIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  admin: Shield,
  sales: TrendingUp,
  warehouse: Warehouse,
  accounts: BookOpen,
};

interface NavItem {
  label: string;
  path: string;
  permissionKey: UserPermission;
  icon: React.ComponentType<{ size?: number }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',       path: '/dashboard',       permissionKey: 'dashboard',       icon: LayoutDashboard },
  { label: 'Customers',       path: '/customers',       permissionKey: 'customers',       icon: Users },
  { label: 'Products',        path: '/products',        permissionKey: 'products',        icon: Package },
  { label: 'Inventory',       path: '/inventory',       permissionKey: 'inventory',       icon: ClipboardList },
  { label: 'Stock Movements', path: '/stock-movements', permissionKey: 'stock-movements', icon: RefreshCw },
  { label: 'Low Stock',       path: '/low-stock',       permissionKey: 'low-stock',       icon: AlertTriangle },
  { label: 'Challans',        path: '/challans',        permissionKey: 'challans',        icon: FileSpreadsheet },
  { label: 'Invoices',        path: '/invoices',        permissionKey: 'invoices',        icon: FileText },
  { label: 'Payments',        path: '/payments',        permissionKey: 'payments',        icon: Coins },
  { label: 'Reports',         path: '/reports',         permissionKey: 'reports',         icon: BarChart2 },
  { label: 'Employees',       path: '/employees',       permissionKey: 'employees',       icon: Users2 },
  { label: 'Settings',        path: '/settings',        permissionKey: 'settings',        icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const RoleIcon = roleIcons[user?.role ?? 'sales'] || Shield;

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <img src="/logo.svg" alt="One8 CRM" className="sidebar-logo-img" style={{ height: '32px', width: '32px' }} />
        <span className="sidebar-brand-text">One8 <strong style={{ color: '#3B82F6' }}>CRM</strong></span>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto' }}>
        {navItems
          .filter(item => hasPermission(user, item.permissionKey))
          .map(item => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                <IconComponent size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div className="sidebar-avatar" style={{
            width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}>
            <RoleIcon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="user-name" style={{ color: '#fff', fontSize: '13.5px', fontWeight: 600 }}>{user?.name}</span>
            <span className="role-badge" style={{
              fontSize: '10px', textTransform: 'uppercase', color: '#94A3B8', fontWeight: 700, marginTop: '2px'
            }}>{user?.role}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
