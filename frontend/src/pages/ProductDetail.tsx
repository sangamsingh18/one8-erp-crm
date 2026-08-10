import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import { Product, StockMovement } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movMeta, setMovMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [adjustModal, setAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ quantity: 1, movement_type: 'IN' as 'IN' | 'OUT', reason: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadMovements = async (page = 1) => {
    if (!id) return;
    const res = await productsApi.getStockLog(id, { page, limit: 10 });
    setMovements(res.data.data);
    setMovMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages });
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([productsApi.get(id), productsApi.getStockLog(id, { page: 1, limit: 10 })])
      .then(([p, m]) => {
        setProduct(p.data.data);
        setMovements(m.data.data);
        setMovMeta({ page: m.data.meta.page, totalPages: m.data.meta.totalPages });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await productsApi.adjustStock(id, adjustForm);
      const p = await productsApi.get(id);
      setProduct(p.data.data);
      await loadMovements(1);
      setAdjustModal(false);
      setToast({ message: 'Stock adjusted', type: 'success' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Adjustment failed';
      setToast({ message: msg, type: 'error' });
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="page"><p>Product not found.</p></div>;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/products')}>← Back</button>
          <h2>{product.name}</h2>
        </div>
        <div className="btn-group">
          {canEdit && <button className="btn btn-secondary" onClick={() => navigate(`/products/${id}/edit`)}>Edit</button>}
          {canEdit && <button className="btn btn-primary" onClick={() => setAdjustModal(true)}>Adjust Stock</button>}
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h3>Product Info</h3>
          <dl>
            <dt>SKU</dt><dd><code>{product.sku}</code></dd>
            <dt>Category</dt><dd>{product.category ?? '—'}</dd>
            <dt>Unit Price</dt><dd>₹{Number(product.unit_price).toFixed(2)}</dd>
            <dt>Current Stock</dt>
            <dd className={product.current_stock <= product.min_stock_alert ? 'text-warning' : ''}>
              {product.current_stock} {product.current_stock <= product.min_stock_alert && '⚠️ Low'}
            </dd>
            <dt>Min Alert</dt><dd>{product.min_stock_alert}</dd>
            <dt>Location</dt><dd>{product.warehouse_loc ?? '—'}</dd>
            <dt>Active</dt><dd>{product.is_active ? 'Yes' : 'No'}</dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Stock Movement Log</h3>
          <table className="data-table">
            <thead><tr><th>Type</th><th>Qty</th><th>Reason</th><th>By</th><th>Date</th></tr></thead>
            <tbody>
              {movements.length === 0 && <tr><td colSpan={5} className="empty">No movements</td></tr>}
              {movements.map(m => (
                <tr key={m.id}>
                  <td><StatusBadge status={m.movement_type} /></td>
                  <td>{m.quantity}</td>
                  <td>{m.reason ?? '—'}</td>
                  <td>{m.created_by_name}</td>
                  <td>{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={movMeta.page} totalPages={movMeta.totalPages} onPageChange={loadMovements} />
        </div>
      </div>
      <Modal isOpen={adjustModal} title="Adjust Stock" onClose={() => setAdjustModal(false)}>
        <form onSubmit={handleAdjust}>
          <div className="form-group">
            <label>Type</label>
            <select value={adjustForm.movement_type} onChange={e => setAdjustForm(f => ({ ...f, movement_type: e.target.value as 'IN' | 'OUT' }))}>
              <option value="IN">IN (Add Stock)</option>
              <option value="OUT">OUT (Remove Stock)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" min={1} value={adjustForm.quantity}
              onChange={e => setAdjustForm(f => ({ ...f, quantity: parseInt(e.target.value) }))} required />
          </div>
          <div className="form-group">
            <label>Reason</label>
            <input value={adjustForm.reason} onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdjustModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Adjust</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
