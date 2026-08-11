import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import Toast from '../components/common/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const emptyForm = { 
  name: '', 
  sku: '', 
  category: '', 
  unit_price: '', 
  current_stock: '0', 
  min_stock_alert: '0', 
  warehouse_loc: '' 
};

type FormFields = keyof typeof emptyForm;

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormFields, string>>>({});

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

  const set = (field: FormFields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errors: Partial<Record<FormFields, string>> = {};
    
    if (!form.name.trim()) {
      errors.name = 'Product name is required.';
    }
    
    if (!form.sku.trim()) {
      errors.sku = 'SKU is required.';
    }

    if (form.unit_price === '' || isNaN(Number(form.unit_price))) {
      errors.unit_price = 'Please enter a valid unit price.';
    } else if (Number(form.unit_price) < 0) {
      errors.unit_price = 'Unit price cannot be negative.';
    }

    if (!isEdit) {
      if (form.current_stock === '' || isNaN(Number(form.current_stock))) {
        errors.current_stock = 'Initial stock quantity is required.';
      } else if (Number(form.current_stock) < 0) {
        errors.current_stock = 'Stock quantity cannot be negative.';
      }
    }

    if (form.min_stock_alert === '' || isNaN(Number(form.min_stock_alert))) {
      errors.min_stock_alert = 'Minimum stock alert quantity is required.';
    } else if (Number(form.min_stock_alert) < 0) {
      errors.min_stock_alert = 'Minimum stock alert quantity cannot be negative.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ message: 'Please check the highlighted fields.', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name, sku: form.sku, category: form.category || undefined,
        unit_price: parseFloat(form.unit_price), current_stock: parseInt(form.current_stock),
        min_stock_alert: parseInt(form.min_stock_alert), warehouse_loc: form.warehouse_loc || undefined,
      };
      if (isEdit && id) {
        await productsApi.update(id, payload);
        setToast({ message: 'Product updated successfully.', type: 'success' });
        setTimeout(() => navigate(`/products/${id}`), 1000);
      } else {
        const res = await productsApi.create(payload);
        setToast({ message: 'Product created successfully.', type: 'success' });
        setTimeout(() => navigate(`/products/${res.data.data.id}`), 1000);
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string; errors?: Array<{ msg: string; path?: string }> } } })?.response?.data;
      
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const errorsObj: Partial<Record<FormFields, string>> = {};
        responseData.errors.forEach(e => {
          if (e.path) {
            errorsObj[e.path as FormFields] = e.msg;
          }
        });
        setFieldErrors(errorsObj);
        setToast({ message: 'Validation failed. Please review field errors.', type: 'error' });
      } else {
        const msg = responseData?.message ?? 'Failed to save product.';
        setToast({ message: msg, type: 'error' });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2>{isEdit ? 'Edit Product' : 'New Product'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-card" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input 
              value={form.name} 
              onChange={set('name')} 
              className={fieldErrors.name ? 'field-error' : ''} 
              placeholder="e.g. Cardboard Box"
              required 
            />
            {fieldErrors.name && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.name}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>SKU <span className="required">*</span></label>
            <input 
              value={form.sku} 
              onChange={set('sku')} 
              className={fieldErrors.sku ? 'field-error' : ''} 
              placeholder="e.g. BOX-001"
              required 
              disabled={isEdit} 
            />
            {fieldErrors.sku && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.sku}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <input 
              value={form.category} 
              onChange={set('category')} 
              placeholder="e.g. Packaging"
            />
          </div>
          <div className="form-group">
            <label>Unit Price (₹) <span className="required">*</span></label>
            <input 
              type="number" 
              min={0} 
              step="0.01" 
              value={form.unit_price} 
              onChange={set('unit_price')} 
              className={fieldErrors.unit_price ? 'field-error' : ''} 
              placeholder="0.00"
              required 
            />
            {fieldErrors.unit_price && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.unit_price}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Initial Stock</label>
            <input 
              type="number" 
              min={0} 
              value={form.current_stock} 
              onChange={set('current_stock')} 
              className={fieldErrors.current_stock ? 'field-error' : ''} 
              disabled={isEdit} 
            />
            {fieldErrors.current_stock && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.current_stock}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Min Stock Alert</label>
            <input 
              type="number" 
              min={0} 
              value={form.min_stock_alert} 
              onChange={set('min_stock_alert')} 
              className={fieldErrors.min_stock_alert ? 'field-error' : ''} 
            />
            {fieldErrors.min_stock_alert && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.min_stock_alert}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Warehouse Location</label>
          <input 
            value={form.warehouse_loc} 
            onChange={set('warehouse_loc')} 
            placeholder="e.g. Shelf A-4, Bin 2"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Saving...') : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
