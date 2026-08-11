import React, { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../api/users';
import { User, UserRole, UserPermission } from '../types';
import { useAuth } from '../context/AuthContext';
import { ROLE_DEFAULTS } from '../components/common/ProtectedRoute';
import Toast from '../components/common/Toast';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import {
  Users as UsersIcon, Plus, Search, X, Shield, TrendingUp,
  Warehouse, BookOpen, ToggleLeft, ToggleRight, Pencil, Key
} from 'lucide-react';

const roleIcon = (role: string) => {
  const icons: Record<string, React.ReactNode> = {
    admin: <Shield size={14} />,
    sales: <TrendingUp size={14} />,
    warehouse: <Warehouse size={14} />,
    accounts: <BookOpen size={14} />,
  };
  return icons[role] || <UsersIcon size={14} />;
};

const roleBadge = (role: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    admin: { bg: '#FBEAEA', color: '#C94C4C' },
    sales: { bg: '#E7F4EC', color: '#2E7D5B' },
    warehouse: { bg: '#FFF4D6', color: '#9A6700' },
    accounts: { bg: '#EDE9FE', color: '#6D28D9' },
  };
  const s = map[role] || { bg: '#F5F6F8', color: '#6B7280' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: s.bg, color: s.color }}>
      {roleIcon(role)} {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

const PERMISSION_LABELS: Record<UserPermission, string> = {
  dashboard: 'Dashboard',
  customers: 'Customers',
  products: 'Products',
  inventory: 'Inventory',
  'stock-movements': 'Stock Movements',
  'low-stock': 'Low Stock Alerts',
  challans: 'Challans',
  invoices: 'Invoices',
  payments: 'Payments',
  reports: 'Reports',
  employees: 'Employees / Users',
  settings: 'Settings',
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS) as UserPermission[];

const Employees = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [pwdResetUser, setPwdResetUser] = useState<User | null>(null);

  // Forms state
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'sales' as UserRole, is_active: true });
  const [createErrors, setCreateErrors] = useState<Partial<typeof createForm>>({});

  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    role: 'sales' as UserRole,
    is_active: true,
    useDefaults: true,
    permissions: [] as UserPermission[],
  });

  const [resettingPwd, setResettingPwd] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await usersApi.list({ page, limit: 20, search: search || undefined });
      setUsers(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const handleToggle = async (id: string) => {
    if (id === currentUser?.id) {
      setToast({ message: 'You cannot deactivate your own account.', type: 'error' });
      return;
    }
    setToggling(id);
    try {
      const res = await usersApi.toggleActive(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: res.data.data.is_active } : u));
      setToast({ message: 'User status updated.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to update user status.', type: 'error' });
    } finally { setToggling(null); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof createErrors = {};
    if (!createForm.name.trim()) errors.name = 'Full name is required.';
    if (!createForm.email.trim()) errors.email = 'Please enter a valid One8 email address.';
    if (createForm.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setCreating(true);
    try {
      await usersApi.create(createForm);
      setToast({ message: 'User created successfully.', type: 'success' });
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', role: 'sales', is_active: true });
      setCreateErrors({});
      load(1);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create user.';
      setToast({ message: msg, type: 'error' });
    } finally { setCreating(false); }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    const hasCustom = Array.isArray(u.permissions);
    setEditForm({
      role: u.role,
      is_active: u.is_active !== false,
      useDefaults: !hasCustom,
      permissions: hasCustom ? (u.permissions as UserPermission[]) : (ROLE_DEFAULTS[u.role] as UserPermission[] || []),
    });
  };

  const handleRoleChangeInEdit = (role: UserRole) => {
    setEditForm(prev => {
      const newPerms = prev.useDefaults 
        ? (ROLE_DEFAULTS[role] as UserPermission[] || [])
        : prev.permissions;
      return { ...prev, role, permissions: newPerms };
    });
  };

  const handleUseDefaultsChange = (checked: boolean) => {
    setEditForm(prev => {
      const newPerms = checked 
        ? (ROLE_DEFAULTS[prev.role] as UserPermission[] || [])
        : prev.permissions;
      return { ...prev, useDefaults: checked, permissions: newPerms };
    });
  };

  const handlePermissionCheckboxChange = (perm: UserPermission, checked: boolean) => {
    setEditForm(prev => {
      const updated = checked 
        ? [...prev.permissions, perm]
        : prev.permissions.filter(p => p !== perm);
      return { ...prev, useDefaults: false, permissions: updated };
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    try {
      await usersApi.update(editingUser.id, {
        role: editForm.role,
        is_active: editForm.is_active,
        permissions: editForm.useDefaults ? null : editForm.permissions,
      });
      setToast({ message: 'User updated successfully.', type: 'success' });
      setEditingUser(null);
      load(meta.page);
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || 'Failed to update user.', type: 'error' });
    } finally { setSavingEdit(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdResetUser) return;
    if (newPassword.length < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }

    setResettingPwd(true);
    try {
      await usersApi.resetPassword(pwdResetUser.id, newPassword);
      setToast({ message: 'Password reset successfully.', type: 'success' });
      setPwdResetUser(null);
      setNewPassword('');
      setPwdError('');
    } catch (err: any) {
      setToast({ message: err?.response?.data?.message || 'Failed to reset password.', type: 'error' });
    } finally { setResettingPwd(false); }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Create User Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Add New Employee</h3>
              <button onClick={() => { setShowCreate(false); setCreateErrors({}); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Full Name *</label>
                <input className={`form-input ${createErrors.name ? 'input-error' : ''}`} placeholder="e.g. Rahul Sharma" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} required />
                {createErrors.name && <p className="form-error">{createErrors.name}</p>}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Email Address *</label>
                <input className={`form-input ${createErrors.email ? 'input-error' : ''}`} type="email" placeholder="e.g. rahul@one8.com" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} required />
                {createErrors.email && <p className="form-error">{createErrors.email}</p>}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label">Password *</label>
                <input className={`form-input ${createErrors.password ? 'input-error' : ''}`} type="password" placeholder="Min. 8 characters" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} required />
                {createErrors.password && <p className="form-error">{createErrors.password}</p>}
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">Role *</label>
                <select className="form-select" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                  <option value="sales">Sales</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="accounts">Accounts</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowCreate(false); setCreateErrors({}); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '560px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Edit Employee — {editingUser.name}</h3>
              <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">Role</label>
                <select className="form-select" value={editForm.role} onChange={e => handleRoleChangeInEdit(e.target.value as UserRole)}>
                  <option value="admin">Admin</option>
                  <option value="sales">Sales</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="accounts">Accounts</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))} />
                  Active User Account
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={editForm.useDefaults} onChange={e => handleUseDefaultsChange(e.target.checked)} />
                  Use Default Role Permissions
                </label>
              </div>

              {/* Custom Permissions Checklist */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', marginBottom: '24px', background: '#F9FAFB' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13.5px', fontWeight: 700 }}>Custom Permissions</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {ALL_PERMISSIONS.map(perm => {
                    const isChecked = editForm.permissions.includes(perm);
                    return (
                      <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '4px 0' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handlePermissionCheckboxChange(perm, e.target.checked)}
                          disabled={editForm.useDefaults}
                        />
                        <span style={{ color: editForm.useDefaults ? '#9CA3AF' : '#1F2937' }}>
                          {PERMISSION_LABELS[perm]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {pwdResetUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '400px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Reset Password</h3>
              <button type="button" onClick={() => { setPwdResetUser(null); setNewPassword(''); setPwdError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', marginBottom: '16px' }}>
              Reset password for employee <strong>{pwdResetUser.name}</strong>.
            </p>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className={`form-input ${pwdError ? 'input-error' : ''}`}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPwdError(''); }}
                  required
                  autoFocus
                />
                {pwdError && <p className="form-error">{pwdError}</p>}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setPwdResetUser(null); setNewPassword(''); setPwdError(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={resettingPwd}>
                  {resettingPwd ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h2>Employees</h2>
          <span className="count-badge">{meta.total} users</span>
        </div>
        {currentUser?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search by name or email..." />
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton-line" style={{ width: `${90-i*5}%`, height: '16px', marginBottom: '12px' }} />)}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  {currentUser?.role === 'admin' && <th style={{ width: '220px', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={currentUser?.role === 'admin' ? 5 : 4} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <UsersIcon className="empty-state-icon" size={40} />
                        <h3>No users found</h3>
                        <p>Add employees to give them CRM access.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {users.map(u => {
                  const uExt = u as User & { is_active?: boolean };
                  const isActive = uExt.is_active !== false;
                  const hasCustom = Array.isArray(u.permissions);
                  
                  return (
                    <tr key={u.id} style={{ opacity: !isActive ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 600 }}>
                        {u.name}
                        {u.id === currentUser?.id && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#E8EEF5', color: '#1E3A5F', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>You</span>}
                      </td>
                      <td className="text-muted">{u.email}</td>
                      <td>{roleBadge(u.role)}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: '4px',
                          fontSize: '11.5px', fontWeight: 600,
                          background: isActive ? '#E7F4EC' : '#F5F6F8',
                          color: isActive ? '#2E7D5B' : '#6B7280'
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: hasCustom ? '#1E3A5F' : '#6B7280', fontWeight: hasCustom ? 600 : 400 }}>
                          {hasCustom ? 'Custom' : 'Role Default'}
                        </span>
                      </td>
                      {currentUser?.role === 'admin' && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              onClick={() => openEditModal(u)}
                              style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#1F2937', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              onClick={() => setPwdResetUser(u)}
                              style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#1F2937', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}
                            >
                              <Key size={13} /> Pwd
                            </button>
                            <button
                              onClick={() => handleToggle(u.id)}
                              disabled={toggling === u.id || u.id === currentUser?.id}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280' }}
                            >
                              {isActive ? <ToggleRight size={14} color="#2E7D5B" /> : <ToggleLeft size={14} />}
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default Employees;
