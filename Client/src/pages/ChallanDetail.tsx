import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { Challan } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Check, X, Edit3, Info, List, Calendar, User } from 'lucide-react';

const ChallanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      const res = await challansApi.get(id);
      setChallan(res.data.data);
    } catch {
      setToast({ message: 'Failed to load challan.', type: 'error' });
    }
  };

  useEffect(() => {
    if (!id) return;
    load().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (!id) return;
    setActionLoading(true);
    try {
      if (action === 'confirm') {
        await challansApi.confirm(id);
        setToast({ message: 'Challan confirmed successfully.', type: 'success' });
      } else {
        await challansApi.cancel(id);
        setToast({ message: 'Challan cancelled.', type: 'success' });
      }
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? `${action} failed`;
      setToast({ message: msg, type: 'error' });
    } finally { setActionLoading(false); }
  };

  const canConfirm = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'warehouse';
  const canCancel = user?.role === 'admin' || user?.role === 'sales';
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{ padding: '80px' }}>
          <div className="skeleton-line" style={{ width: '150px', height: '24px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="skeleton-line" style={{ height: '260px' }} />
            <div className="skeleton-line" style={{ height: '260px' }} />
          </div>
        </div>
      </div>
    );
  }
  
  if (!challan) return <div className="page"><p className="empty">Challan not found.</p></div>;

  const grandTotal = challan.items?.reduce((sum, i) => sum + Number(i.line_total), 0) ?? 0;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/challans')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px' }}>
            {challan.challan_number} 
            <StatusBadge status={challan.status} />
          </h2>
        </div>
        
        <div className="btn-group">
          {challan.status === 'draft' && canEdit && (
            <button className="btn btn-secondary" onClick={() => navigate(`/challans/${id}/edit`)}>
              <Edit3 size={15} /> Edit
            </button>
          )}
          {challan.status === 'draft' && canConfirm && (
            <button className="btn btn-success" onClick={() => handleAction('confirm')} disabled={actionLoading}>
              <Check size={15} /> {actionLoading ? 'Confirming...' : 'Confirm'}
            </button>
          )}
          {challan.status === 'draft' && canCancel && (
            <button className="btn btn-danger" onClick={() => handleAction('cancel')} disabled={actionLoading}>
              <X size={15} /> {actionLoading ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3><Info size={16} /> Challan Summary</h3>
          <dl className="detail-list">
            <dt>Customer</dt><dd style={{ fontWeight: 600 }}>{challan.customer_name}</dd>
            <dt>Status</dt><dd><StatusBadge status={challan.status} /></dd>
            <dt>Total Qty</dt><dd style={{ fontWeight: 600 }}>{challan.total_quantity} items</dd>
            <dt>Created By</dt>
            <dd>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} className="text-muted" /> {challan.created_by_name}
              </span>
            </dd>
            <dt>Date Created</dt>
            <dd>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} className="text-muted" /> {new Date(challan.created_at).toLocaleString()}
              </span>
            </dd>
            {challan.confirmed_at && (
              <>
                <dt>Confirmed At</dt>
                <dd>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                    <Check size={13} /> {new Date(challan.confirmed_at).toLocaleString()}
                  </span>
                </dd>
              </>
            )}
          </dl>
        </div>

        <div className="detail-card">
          <h3><List size={16} /> Line Items Snapshot</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Unit Price</th>
                  <th>Qty</th>
                  <th>Line Total</th>
                </tr>
              </thead>
              <tbody>
                {(challan.items ?? []).map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                    <td><code>{item.product_sku}</code></td>
                    <td>₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td colSpan={4}><strong>Grand Total</strong></td>
                  <td style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>
                    <strong>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetail;
