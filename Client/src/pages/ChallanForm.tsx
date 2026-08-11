import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { Customer, Product } from '../types';
import Toast from '../components/common/Toast';
import { ArrowLeft, Trash2, Plus, Search, AlertCircle } from 'lucide-react';

interface LineItem { product_id: string; quantity: number; product?: Product; }

const ChallanForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ product_id: '', quantity: 1 }]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ customer?: string; items?: string }>({});

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
  
  const updateLine = (i: number, field: 'product_id' | 'quantity', value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
    if (fieldErrors.items) {
      setFieldErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  const getProduct = (pid: string) => products.find(p => p.id === pid);

  const lineTotal = (item: LineItem) => {
    const p = getProduct(item.product_id);
    return p ? Number(p.unit_price) * item.quantity : 0;
  };

  const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

  const validate = () => {
    const errors: { customer?: string; items?: string } = {};
    if (!customerId) {
      errors.customer = 'Please select a customer.';
    }
    
    const hasEmptyItem = items.some(item => !item.product_id);
    const hasInvalidQty = items.some(item => item.quantity <= 0);
    
    if (hasEmptyItem) {
      errors.items = 'Please select a product for all lines.';
    } else if (hasInvalidQty) {
      errors.items = 'Quantity must be 1 or more for all lines.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please review line item errors.', type: 'warning' });
      return;
    }

    const validItems = items.filter(i => i.product_id && i.quantity > 0);
    if (!validItems.length) { 
      setToast({ message: 'Add at least one product item.', type: 'warning' }); 
      return; 
    }

    setLoading(true);
    try {
      const payload = { customer_id: customerId, items: validItems.map(i => ({ product_id: i.product_id, quantity: i.quantity })) };
      if (isEdit && id) {
        await challansApi.update(id, payload);
        setToast({ message: 'Challan updated successfully.', type: 'success' });
        setTimeout(() => navigate(`/challans/${id}`), 1000);
      } else {
        const res = await challansApi.create(payload);
        setToast({ message: 'Challan created successfully as draft.', type: 'success' });
        setTimeout(() => navigate(`/challans/${res.data.data.id}`), 1000);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save Challan.';
      setToast({ message: msg, type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/challans')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2>{isEdit ? 'Edit Challan' : 'New Challan'}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: '100%' }} noValidate>
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label>Customer <span className="required">*</span></label>
          <select 
            value={customerId} 
            onChange={e => {
              setCustomerId(e.target.value);
              if (fieldErrors.customer) setFieldErrors(prev => ({ ...prev, customer: undefined }));
            }} 
            className={fieldErrors.customer ? 'field-error' : ''}
            required
          >
            <option value="">Select customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.business_name ? `(${c.business_name})` : ''}</option>)}
          </select>
          {fieldErrors.customer && (
            <span className="validation-error-msg">
              <AlertCircle size={12} /> {fieldErrors.customer}
            </span>
          )}
        </div>

        <div className="section-header" style={{ marginTop: '32px' }}>
          <h3>Line Items</h3>
          <div className="search-container" style={{ minWidth: '220px', maxWidth: '300px', margin: 0 }}>
            <Search size={14} className="search-icon" />
            <input 
              className="search-bar" 
              placeholder="Filter product options..." 
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)} 
            />
          </div>
        </div>

        {fieldErrors.items && (
          <div className="alert alert-error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={16} />
            <span>{fieldErrors.items}</span>
          </div>
        )}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Product</th>
                <th>SKU</th>
                <th>Unit Price</th>
                <th style={{ width: '120px' }}>Quantity</th>
                <th>Line Total</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                const prod = getProduct(item.product_id);
                return (
                  <tr key={i}>
                    <td>
                      <select 
                        value={item.product_id} 
                        onChange={e => updateLine(i, 'product_id', e.target.value)} 
                        required
                      >
                        <option value="">Select product...</option>
                        {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td><code>{prod?.sku ?? '—'}</code></td>
                    <td style={{ fontWeight: 600 }}>{prod ? `₹${Number(prod.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}</td>
                    <td>
                      <input 
                        type="number" 
                        min={1} 
                        value={item.quantity}
                        onChange={e => updateLine(i, 'quantity', parseInt(e.target.value) || 0)}
                        style={{ padding: '8px 12px' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{lineTotal(item).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <button 
                        type="button" 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: 'var(--danger)', padding: '8px' }} 
                        onClick={() => removeLine(i)} 
                        disabled={items.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="total-row">
                <td colSpan={4}><strong>Grand Total</strong></td>
                <td style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                  <strong>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <button 
          type="button" 
          className="btn btn-secondary btn-sm" 
          onClick={addLine}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} /> Add Line Item
        </button>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/challans')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChallanForm;
