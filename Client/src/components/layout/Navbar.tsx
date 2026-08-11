import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { hasPermission } from '../common/ProtectedRoute';
import {
  LogOut, ChevronDown, Menu, X, Settings,
  Bell, CheckCircle, XCircle, AlertTriangle, Info, Trash2, CheckCheck,
  Shield, TrendingUp, Warehouse, BookOpen
} from 'lucide-react';

const roleIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  admin: Shield,
  sales: TrendingUp,
  warehouse: Warehouse,
  accounts: BookOpen,
};

const notificationIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={14} style={{ color: '#2E7D5B' }} />,
  error:   <XCircle     size={14} style={{ color: '#C94C4C' }} />,
  warning: <AlertTriangle size={14} style={{ color: '#B7791F' }} />,
  info:    <Info        size={14} style={{ color: '#1E3A5F' }} />,
};

interface NavbarProps {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

const Navbar = ({ mobileSidebarOpen, onToggleMobileSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen,     setBellOpen]     = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const bellRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (bellRef.current     && !bellRef.current.contains(e.target as Node))     setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const formatTime = (date: Date) => {
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 60) return 'Just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  };

  const RoleIcon = roleIcons[user?.role ?? 'accounts'] ?? Shield;

  return (
    <header className="topnav">
      {/* Mobile hamburger menu to toggle Left Sidebar */}
      <button
        className="topnav-hamburger"
        onClick={onToggleMobileSidebar}
        aria-label="Toggle menu"
        style={{ display: 'flex' }}
      >
        {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Brand logo shown on Topbar for Mobile only (hidden on desktop via css or style) */}
      <div className="topnav-brand" onClick={() => navigate('/dashboard')} style={{ margin: '0 auto 0 12px' }}>
        <img src="/logo.svg" alt="One8 CRM" className="topnav-logo-img" style={{ height: '30px', width: '30px' }} />
        <span className="topnav-brand-text" style={{ fontSize: '17px' }}>One8 <strong>CRM</strong></span>
      </div>

      {/* Right controls */}
      <div className="topnav-right" style={{ marginLeft: 'auto' }}>

        {/* Bell */}
        <div className="topnav-bell-wrapper" ref={bellRef}>
          <button
            className={`topnav-icon-btn${bellOpen ? ' active' : ''}`}
            onClick={() => { setBellOpen(p => !p); setDropdownOpen(false); }}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="topnav-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {bellOpen && (
            <div className="topnav-bell-dropdown">
              <div className="topnav-bell-header">
                <h4>Notifications</h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="btn-bell-action" onClick={() => markAllAsRead()} disabled={unreadCount === 0} title="Mark all read">
                    <CheckCheck size={13} />
                  </button>
                  <button className="btn-bell-action" onClick={() => clearAll()} disabled={notifications.length === 0} title="Clear all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="topnav-bell-list">
                {notifications.length === 0 ? (
                  <div className="topnav-bell-empty">
                    <Bell size={22} style={{ opacity: 0.25, marginBottom: '8px' }} />
                    <p>All caught up</p>
                    <span>No new notifications</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`topnav-bell-item${n.read ? '' : ' unread'}`}>
                      <span className="bell-item-icon">{notificationIcons[n.type]}</span>
                      <div className="bell-item-body">
                        <p>{n.message}</p>
                        <span>{formatTime(n.timestamp)}</span>
                      </div>
                      {!n.read && <span className="bell-unread-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="topnav-user-dropdown" ref={dropdownRef}>
          <button
            className="topnav-user-btn"
            onClick={() => { setDropdownOpen(p => !p); setBellOpen(false); }}
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            <div className="topnav-avatar">
              <RoleIcon size={16} />
            </div>
            <div className="topnav-user-info">
              <span className="topnav-user-name">{user?.name}</span>
              <span className="topnav-role-pill">{user?.role}</span>
            </div>
            <ChevronDown
              size={13}
              className="topnav-chevron"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.18s ease' }}
            />
          </button>

          {dropdownOpen && (
            <div className="topnav-dropdown-menu">
              {/* Profile header */}
              <div className="topnav-dropdown-header">
                <div className="topnav-avatar topnav-avatar-lg">
                  <RoleIcon size={20} />
                </div>
                <div>
                  <p className="dropdown-name">{user?.name}</p>
                  <p className="dropdown-email">{user?.email}</p>
                  <span className="topnav-role-pill" style={{ marginTop: '4px', display: 'inline-block' }}>{user?.role}</span>
                </div>
              </div>

              <div className="topnav-dropdown-divider" />

              {hasPermission(user, 'settings') ? (
                <div className="topnav-dropdown-item" onClick={() => { setDropdownOpen(false); navigate('/settings'); }} style={{ cursor: 'pointer' }}>
                  <Settings size={14} />
                  <span>Settings</span>
                </div>
              ) : (
                <div className="topnav-dropdown-item disabled">
                  <Settings size={14} />
                  <span>Settings</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#9CA3AF' }}>No Permission</span>
                </div>
              )}

              <div className="topnav-dropdown-divider" />

              <button className="topnav-dropdown-item topnav-logout-item" onClick={handleLogout}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
