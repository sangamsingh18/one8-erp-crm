import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface NavItem { label: string; path: string; roles: UserRole[]; }

const navItems: NavItem[] = [
  { label: '📊 Dashboard', path: '/dashboard', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { label: '👥 Customers', path: '/customers', roles: ['admin', 'sales', 'accounts'] },
  { label: '📦 Products', path: '/products', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { label: '🧾 Challans', path: '/challans', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ERP-CRM</div>
      <nav className="sidebar-nav">
        {navItems
          .filter(item => user && item.roles.includes(user.role))
          .map(item => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {item.label}
            </NavLink>
          ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span>{user?.name}</span>
          <span className="role-badge">{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
