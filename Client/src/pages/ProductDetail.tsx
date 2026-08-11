import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import { Product, StockMovement } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit3, Sliders, History, Info } from 'lucide-react';

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
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const loadMovements = async (page = 1) => {
    if (!id) return;
    try {
      const res = await productsApi.getStockLog(id, { page, limit: 10 });
      setMovements(res.data.data);
      setMovMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages });
    } catch {
      setToast({ message: 'Failed to load stock log.', type: 'error' });
    }
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([productsApi.get(id), productsApi.getStockLog(id, { page: 1, limit: 10 })])
      .then(([p, m]) => {
        setProduct(p.data.data);
        setMovements(m.data.data);
        setMovMeta({ page: m.data.meta.page, totalPages: m.data.meta.totalPages });
      })
      .catch(() => {
        setToast({ message: 'Failed to load product details.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (adjustForm.quantity <= 0) {
      setToast({ message: 'Quantity must be greater than 0.', type: 'warning' });
      return;
    }
    if (!adjustForm.reason.trim()) {
      setToast({ message: 'Reason is required for stock adjustments.', type: 'warning' });
      return;
    }

    setAdjustLoading(true);
    try {
      await productsApi.adjustStock(id, adjustForm);
      const p = await productsApi.get(id);
      setProduct(p.data.data);
      await loadMovements(1);
      setAdjustModal(false);
      setAdjustForm({ quantity: 1, movement_type: 'IN', reason: '' });
      setToast({ message: 'Stock adjusted successfully.', type: 'success' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Stock adjustment failed.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setAdjustLoading(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{ padding: '80px' }}>
          <div className="skeleton-line" style={{ width: '120px', height: '24px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="skeleton-line" style={{ height: '320px' }} />
            <div className="skeleton-line" style={{ height: '320px' }} />
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) return <div className="page"><p className="empty">Product not found.</p></div>;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/products')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2 style={{ fontSize: '22px' }}>{product.name}</h2>
        </div>
        <div className="btn-group">
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => navigate(`/products/${id}/edit`)}>
                <Edit3 size={15} /> Edit Product
              </button>
              <button className="btn btn-primary" onClick={() => setAdjustModal(true)}>
                <Sliders size={15} /> Adjust Stock
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3><Info size={16} /> Product Information</h3>
          <dl className="detail-list">
            <dt>SKU</dt><dd><code>{product.sku}</code></dd>
            <dt>Category</dt><dd>{product.category ?? <span className="text-muted">—</span>}</dd>
            <dt>Unit Price</dt><dd>₹{Number(product.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</dd>
            <dt>Current Stock</dt>
            <dd>
              <span style={{ fontWeight: 700 }} className={product.current_stock <= product.min_stock_alert ? 'text-warning' : ''}>
                {product.current_stock}
              </span>
              {product.current_stock <= product.min_stock_alert && (
                <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 600 }}>
                  ⚠️ Low Stock
                </span>
              )}
            </dd>
            <dt>Min Stock Alert</dt><dd>{product.min_stock_alert}</dd>
            <dt>Location</dt><dd>{product.warehouse_loc ?? <span className="text-muted">—</span>}</dd>
            <dt>Active Status</dt><dd>{product.is_active ? 'Active' : 'Inactive'}</dd>
          </dl>
        </div>

        <div className="detail-card">
          <h3><History size={16} /> Stock Movement Log</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Authorized By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">No stock movements recorded.</td>
                  </tr>
                )}
                {movements.map(m => (
                  <tr key={m.id}>
                    <td><StatusBadge status={m.movement_type} /></td>
                    <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                    <td>{m.reason ?? <span className="text-muted">—</span>}</td>
                    <td>{m.created_by_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={movMeta.page} totalPages={movMeta.totalPages} onPageChange={loadMovements} />
        </div>
      </div>

      <Modal isOpen={adjustModal} title="Adjust Stock Inventory" onClose={() => setAdjustModal(false)}>
        <form onSubmit={handleAdjust} noValidate>
          <div className="form-group">
            <label>Movement Type</label>
            <select 
              value={adjustForm.movement_type} 
              onChange={e => setAdjustForm(f => ({ ...f, movement_type: e.target.value as 'IN' | 'OUT' }))}
            >
              <option value="IN">IN (Receive / Add Stock)</option>
              <option value="OUT">OUT (Issue / Remove Stock)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity <span className="required">*</span></label>
            <input 
              type="number" 
              min={1} 
              value={adjustForm.quantity}
              onChange={e => setAdjustForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Reason / Reference <span className="required">*</span></label>
            <input 
              value={adjustForm.reason} 
              onChange={e => setAdjustForm(f => ({ ...f, reason: e.target.value }))} 
              placeholder="e.g. Purchase invoice, damaged stock correction"
              required 
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdjustModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={adjustLoading}>
              {adjustLoading ? 'Adjusting...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductDetail;
