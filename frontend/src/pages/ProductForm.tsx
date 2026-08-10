import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import Toast from '../components/common/Toast';

const emptyForm = { name: '', sku: '', category: '', unit_price: '', current_stock: '0', min_stock_alert: '0', warehouse_loc: '' };

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      productsApi.get(id).then(res => {
        const p = res.data.data;
        setForm({
          name: p.name, sku: p.sku, category: p.category ?? '',
          unit_price: String(p.unit_price), current_stock: String(p.current_stock),
          min_stock_alert: String(p.min_stock_alert), warehouse_loc: p.warehouse_loc ?? '',
        });
      });
    }
  }, [id, isEdit]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name, sku: form.sku, category: form.category || undefined,
        unit_price: parseFloat(form.unit_price), current_stock: parseInt(form.current_stock),
        min_stock_alert: parseInt(form.min_stock_alert), warehouse_loc: form.warehouse_loc || undefined,
      };
      if (isEdit && id) {
        await productsApi.update(id, payload);
        setToast({ message: 'Product updated', type: 'success' });
        setTimeout(() => navigate(`/products/${id}`), 1000);
      } else {
        const res = await productsApi.create(payload);
        setToast({ message: 'Product created', type: 'success' });
        setTimeout(() => navigate(`/products/${res.data.data.id}`), 1000);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed';
      setToast({ message: msg, type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/products')}>← Back</button>
        <h2>{isEdit ? 'Edit Product' : 'New Product'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group"><label>Name *</label><input value={form.name} onChange={set('name')} required /></div>
          <div className="form-group"><label>SKU *</label><input value={form.sku} onChange={set('sku')} required disabled={isEdit} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Category</label><input value={form.category} onChange={set('category')} /></div>
          <div className="form-group"><label>Unit Price *</label><input type="number" min={0} step="0.01" value={form.unit_price} onChange={set('unit_price')} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Initial Stock</label><input type="number" min={0} value={form.current_stock} onChange={set('current_stock')} disabled={isEdit} /></div>
          <div className="form-group"><label>Min Stock Alert</label><input type="number" min={0} value={form.min_stock_alert} onChange={set('min_stock_alert')} /></div>
        </div>
        <div className="form-group"><label>Warehouse Location</label><input value={form.warehouse_loc} onChange={set('warehouse_loc')} /></div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
