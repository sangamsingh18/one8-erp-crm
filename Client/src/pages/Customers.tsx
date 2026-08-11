import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customersApi } from '../api/customers';
import { Customer } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import ActionMenu from '../components/common/ActionMenu';
import DeleteModal from '../components/common/DeleteModal';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Search, Calendar, Phone, Briefcase, Eye, Pencil, Trash2 } from 'lucide-react';

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Custom Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deactivateMode, setDeactivateMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await customersApi.list({ page, limit: 20, search: search || undefined, status: status || undefined });
      setCustomers(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { load(1); }, [load]);

  const canEdit = user?.role === 'admin' || user?.role === 'sales';
  const canDelete = user?.role === 'admin';

  const triggerDeleteConfirm = (id: string, name: string) => {
    setCustomerToDelete({ id, name });
    setDeactivateMode(false);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      await customersApi.delete(customerToDelete.id, deactivateMode);
      setToast({ message: 'Customer deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      setDeactivateMode(false);
      // Remove immediately from UI state or mark status as inactive if soft deleted
      if (deactivateMode) {
        setCustomers(prev => prev.map(c => c.id === customerToDelete.id ? { ...c, status: 'inactive' } : c));
      } else {
        setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
        setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }
    } catch (err: any) {
      if (err.response?.status === 409 && !deactivateMode) {
        setDeactivateMode(true);
      } else {
        setToast({ message: 'Unable to delete customer. Please try again.', type: 'error' });
        setDeleteModalOpen(false);
        setCustomerToDelete(null);
        setDeactivateMode(false);
      }
    } finally {
      setDeleting(false);
    }
  };

  const modalTitle = 'Delete Customer?';
  const modalMessage = deactivateMode
    ? 'This customer has existing business records. Deactivating the customer will preserve historical records.'
    : 'Are you sure you want to delete this customer?';
  const modalConfirmLabel = deactivateMode ? 'Deactivate Customer' : 'Delete Customer';

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DeleteModal
        isOpen={deleteModalOpen}
        title={modalTitle}
        message={modalMessage}
        confirmLabel={modalConfirmLabel}
        loading={deleting}
        onClose={() => {
          setDeleteModalOpen(false);
          setCustomerToDelete(null);
          setDeactivateMode(false);
        }}
        onConfirm={handleConfirmDelete}
      />
      
      <div className="page-header">
        <div className="page-header-title">
          <h2>Customers</h2>
          <span className="count-badge">{meta.total} total</span>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search by name, mobile..." />
        </div>
        
        <select 
          value={status} 
          onChange={e => { 
            setStatus(e.target.value); 
            setSearchParams(e.target.value ? { status: e.target.value } : {}); 
          }}
        >
          <option value="">All Statuses</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '90%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '95%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '80%', height: '16px' }} />
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Business</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th style={{ width: '48px' }}></th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <Users className="empty-state-icon" size={40} />
                        <h3>No customers found</h3>
                        <p>Customers added to One8 CRM will appear here.</p>
                        {canEdit && (
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/customers/new')}>
                            <Plus size={14} /> Add Customer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {customers.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    className="clickable-row"
                    style={{ opacity: deleting && customerToDelete?.id === c.id ? 0.5 : 1 }}
                  >
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {c.mobile}
                      </span>
                    </td>
                    <td>
                      {c.business_name ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={12} className="text-muted" /> {c.business_name}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td><StatusBadge status={c.customer_type} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.follow_up_date ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                          <Calendar size={12} className="text-muted" /> {new Date(c.follow_up_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye size={14} />,
                            onClick: () => navigate(`/customers/${c.id}`),
                          },
                          ...(canEdit ? [{
                            label: 'Edit',
                            icon: <Pencil size={14} />,
                            onClick: () => navigate(`/customers/${c.id}/edit`),
                          }] : []),
                          ...(canDelete ? [{
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            onClick: () => triggerDeleteConfirm(c.id, c.name),
                            variant: 'danger' as const,
                            dividerBefore: true,
                          }] : []),
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default Customers;
