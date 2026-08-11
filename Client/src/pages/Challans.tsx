import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { Challan } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ActionMenu from '../components/common/ActionMenu';
import DeleteModal from '../components/common/DeleteModal';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Plus, Calendar, User, ShoppingBag, Eye, Pencil, CheckCircle, XCircle } from 'lucide-react';

const Challans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') ?? '');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Custom Confirmation Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [challanToAction, setChallanToAction] = useState<{ id: string; action: 'confirm' | 'cancel'; num: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await challansApi.list({ page, limit: 20, status: status || undefined });
      setChallans(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(1); }, [load]);

  const canCreate = user?.role === 'admin' || user?.role === 'sales';
  const canConfirm = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'warehouse';
  const canCancel = user?.role === 'admin' || user?.role === 'sales';
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  const triggerActionConfirm = (id: string, action: 'confirm' | 'cancel', num: string) => {
    setChallanToAction({ id, action, num });
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!challanToAction) return;
    setProcessing(true);
    const { id, action, num } = challanToAction;
    try {
      if (action === 'confirm') {
        await challansApi.confirm(id);
        setToast({ message: 'Challan confirmed successfully.', type: 'success' });
      } else {
        await challansApi.cancel(id);
        setToast({ message: `Challan ${num} has been cancelled.`, type: 'warning' });
      }
      setModalOpen(false);
      setChallanToAction(null);
      load(meta.page);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? `${action} failed`;
      setToast({ message: msg, type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DeleteModal
        isOpen={modalOpen}
        title={challanToAction?.action === 'confirm' ? 'Confirm Challan?' : 'Cancel Challan?'}
        message={
          challanToAction?.action === 'confirm'
            ? `Are you sure you want to confirm challan "${challanToAction.num}"?`
            : `Are you sure you want to cancel challan "${challanToAction?.num}"? This action cannot be undone.`
        }
        confirmLabel={challanToAction?.action === 'confirm' ? 'Confirm' : 'Cancel Challan'}
        confirmVariant={challanToAction?.action === 'confirm' ? 'success' : 'danger'}
        loading={processing}
        onClose={() => {
          setModalOpen(false);
          setChallanToAction(null);
        }}
        onConfirm={handleConfirmAction}
      />

      <div className="page-header">
        <div className="page-header-title">
          <h2>Challans</h2>
          <span className="count-badge">{meta.total} total</span>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>
            <Plus size={16} /> New Challan
          </button>
        )}
      </div>

      <div className="filters">
        <select 
          value={status} 
          onChange={e => { 
            setStatus(e.target.value); 
            setSearchParams(e.target.value ? { status: e.target.value } : {}); 
          }}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '92%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '96%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '88%', height: '16px' }} />
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan Number</th>
                  <th>Customer Name</th>
                  <th>Status</th>
                  <th>Total Quantity</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th style={{ width: '48px' }}></th>
                </tr>
              </thead>
              <tbody>
                {challans.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <FileSpreadsheet className="empty-state-icon" size={40} />
                        <h3>No challans found</h3>
                        <p>Sales challans created in One8 CRM will be displayed here.</p>
                        {canCreate && (
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/challans/new')}>
                            <Plus size={14} /> New Challan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {challans.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/challans/${c.id}`)}
                    className="clickable-row"
                    style={{ opacity: processing && challanToAction?.id === c.id ? 0.5 : 1 }}
                  >
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.challan_number}</td>
                    <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <ShoppingBag size={12} className="text-muted" /> {c.total_quantity}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <User size={12} className="text-muted" /> {c.created_by_name}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye size={14} />,
                            onClick: () => navigate(`/challans/${c.id}`),
                          },
                          ...(canEdit && c.status === 'draft' ? [{
                            label: 'Edit Challan',
                            icon: <Pencil size={14} />,
                            onClick: () => navigate(`/challans/${c.id}/edit`),
                          }] : []),
                          ...(canConfirm && c.status === 'draft' ? [{
                            label: 'Confirm',
                            icon: <CheckCircle size={14} />,
                            onClick: () => triggerActionConfirm(c.id, 'confirm', c.challan_number),
                            dividerBefore: !canEdit || c.status !== 'draft',
                          }] : []),
                          ...(canCancel && c.status === 'draft' ? [{
                            label: 'Cancel Challan',
                            icon: <XCircle size={14} />,
                            onClick: () => triggerActionConfirm(c.id, 'cancel', c.challan_number),
                            variant: 'danger' as const,
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

export default Challans;
