import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { Customer, Product } from '../types';
import Toast from '../components/common/Toast';

interface LineItem { product_id: string; quantity: number; product?: Product; }

const ChallanForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1 }]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    customersApi.list({ limit: 100 }).then(r => setCustomers(r.data.data));
    productsApi.list({ limit: 100 }).then(r => setProducts(r.data.data));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      challansApi.get(id).then(res => {
        const c = res.data.data;
        setCustomerId(c.customer_id);
        setItems((c.items ?? []).map(i => ({ product_id: i.product_id, quantity: i.quantity })));
      });
    }
  }, [id, isEdit]);

  const filteredProducts = products.filter(p =>
    !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addLine = () => setItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeLine = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: 'product_id' | 'quantity', value: string | number) =>
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const getProduct = (pid: string) => products.find(p => p.id === pid);

  const lineTotal = (item: LineItem) => {
    const p = getProduct(item.product_id);
    return p ? Number(p.unit_price) * item.quantity : 0;
  };

  const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setToast({ message: 'Select a customer', type: 'error' }); return; }
    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (!validItems.length) { setToast({ message: 'Add at least one item', type: 'error' }); return; }

    setLoading(true);
    try {
      const payload = { customer_id: customerId, items: validItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })) };
      if (isEdit && id) {
        await challansApi.update(id, payload);
        setToast({ message: 'Challan updated', type: 'success' });
        setTimeout(() => navigate(`/challans/${id}`), 1000);
      } else {
        const res = await challansApi.create(payload);
        setToast({ message: 'Challan created as draft', type: 'success' });
        setTimeout(() => navigate(`/challans/${res.data.data.id}`), 1000);
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
        <button className="btn btn-ghost" onClick={() => navigate('/challans')}>← Back</button>
        <h2>{isEdit ? 'Edit Challan' : 'New Challan'}</h2>
      </div>
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Customer *</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.business_name ? `(${c.business_name})` : ''}</option>)}
          </select>
        </div>

        <div className="section-header">
          <h3>Line Items</h3>
          <input className="search-bar" placeholder="Filter products..." value={productSearch}
            onChange={e => setProductSearch(e.target.value)} style={{ width: '200px' }} />
        </div>

        <table className="data-table">
          <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Line Total</th><th></th></tr></thead>
          <tbody>
            {items.map((item, i) => {
              const prod = getProduct(item.product_id);
              return (
                <tr key={i}>
                  <td>
                    <select value={item.product_id} onChange={e => updateLine(i, 'product_id', e.target.value)} required>
                      <option value="">Select product...</option>
                      {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td><code>{prod?.sku ?? '—'}</code></td>
                  <td>{prod ? `₹${Number(prod.unit_price).toFixed(2)}` : '—'}</td>
                  <td>
                    <input type="number" min={1} value={item.quantity}
                      onChange={e => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                      style={{ width: '70px' }} />
                  </td>
                  <td>₹{lineTotal(item).toFixed(2)}</td>
                  <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeLine(i)} disabled={items.length === 1}>✕</button></td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td colSpan={4}><strong>Grand Total</strong></td>
              <td><strong>₹{grandTotal.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        <button type="button" className="btn btn-secondary" onClick={addLine}>+ Add Line</button>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/challans')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save as Draft'}</button>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;
