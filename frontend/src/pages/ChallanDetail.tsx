import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { Challan } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

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
    const res = await challansApi.get(id);
    setChallan(res.data.data);
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
      if (action === 'confirm') await challansApi.confirm(id);
      else await challansApi.cancel(id);
      await load();
      setToast({ message: `Challan ${action}ed`, type: 'success' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? `${action} failed`;
      setToast({ message: msg, type: 'error' });
    } finally { setActionLoading(false); }
  };

  const canConfirm = user?.role === 'admin' || user?.role === 'sales' || user?.role === 'warehouse';
  const canCancel = user?.role === 'admin' || user?.role === 'sales';
  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  if (loading) return <div className="loading">Loading...</div>;
  if (!challan) return <div className="page"><p>Challan not found.</p></div>;

  const grandTotal = challan.items?.reduce((sum, i) => sum + Number(i.line_total), 0) ?? 0;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/challans')}>← Back</button>
          <h2>{challan.challan_number} <StatusBadge status={challan.status} /></h2>
        </div>
        <div className="btn-group">
          {challan.status === 'draft' && canEdit && (
            <button className="btn btn-secondary" onClick={() => navigate(`/challans/${id}/edit`)}>Edit</button>
          )}
          {challan.status === 'draft' && canConfirm && (
            <button className="btn btn-success" onClick={() => handleAction('confirm')} disabled={actionLoading}>
              {actionLoading ? '...' : 'Confirm'}
            </button>
          )}
          {challan.status === 'draft' && canCancel && (
            <button className="btn btn-danger" onClick={() => handleAction('cancel')} disabled={actionLoading}>
              {actionLoading ? '...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h3>Challan Info</h3>
          <dl>
            <dt>Customer</dt><dd>{challan.customer_name}</dd>
            <dt>Status</dt><dd><StatusBadge status={challan.status} /></dd>
            <dt>Total Qty</dt><dd>{challan.total_quantity}</dd>
            <dt>Created By</dt><dd>{challan.created_by_name}</dd>
            <dt>Created</dt><dd>{new Date(challan.created_at).toLocaleString()}</dd>
            {challan.confirmed_at && <><dt>Confirmed</dt><dd>{new Date(challan.confirmed_at).toLocaleString()}</dd></>}
          </dl>
        </div>
        <div className="detail-card">
          <h3>Line Items (snapshot pricing)</h3>
          <table className="data-table">
            <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Line Total</th></tr></thead>
            <tbody>
              {(challan.items ?? []).map(item => (
                <tr key={item.id}>
                  <td>{item.product_name}</td>
                  <td><code>{item.product_sku}</code></td>
                  <td>₹{Number(item.unit_price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>₹{Number(item.line_total).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={4}><strong>Grand Total</strong></td>
                <td><strong>₹{grandTotal.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallanDetail;
