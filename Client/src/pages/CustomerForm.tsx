import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api/customers';
import Toast from '../components/common/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface CustomerFormState {
  name: string;
  mobile: string;
  email: string;
  business_name: string;
  gst_number: string;
  customer_type: 'retail' | 'wholesale' | 'distributor';
  address: string;
  status: 'lead' | 'active' | 'inactive';
  follow_up_date: string;
}

const emptyForm: CustomerFormState = {
  name: '', mobile: '', email: '', business_name: '', gst_number: '',
  customer_type: 'retail', address: '', status: 'lead', follow_up_date: '',
};

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerFormState, string>>>({});

  useEffect(() => {
    if (isEdit && id) {
      customersApi.get(id).then(res => {
        const c = res.data.data;
        setForm({
          name: c.name, mobile: c.mobile, email: c.email ?? '',
          business_name: c.business_name ?? '', gst_number: c.gst_number ?? '',
          customer_type: c.customer_type, address: c.address ?? '',
          status: c.status, follow_up_date: c.follow_up_date?.slice(0, 10) ?? '',
        });
      });
    }
  }, [id, isEdit]);

  const set = (field: keyof CustomerFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const errors: Partial<Record<keyof CustomerFormState, string>> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      errors.name = 'Customer name is required.';
    }

    if (!form.mobile.trim()) {
      errors.mobile = 'Please enter a valid mobile number.';
    } else if (form.mobile.trim().length < 8) {
      errors.mobile = 'Mobile number must be at least 8 digits.';
    }

    if (form.email && !emailRegex.test(form.email)) {
      errors.email = 'Please enter a valid email address.';
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
      const payload = { ...form, email: form.email || undefined, follow_up_date: form.follow_up_date || undefined };
      if (isEdit && id) {
        await customersApi.update(id, payload);
        setToast({ message: 'Customer updated successfully.', type: 'success' });
        setTimeout(() => navigate(`/customers/${id}`), 1000);
      } else {
        const res = await customersApi.create(payload);
        setToast({ message: 'Customer created successfully.', type: 'success' });
        setTimeout(() => navigate(`/customers/${res.data.data.id}`), 1000);
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: { message?: string; errors?: Array<{ msg: string; path?: string }> } } })?.response?.data;

      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const errorsObj: Partial<Record<keyof CustomerFormState, string>> = {};
        responseData.errors.forEach(e => {
          if (e.path) {
            errorsObj[e.path as keyof CustomerFormState] = e.msg;
          }
        });
        setFieldErrors(errorsObj);
        setToast({ message: 'Validation failed. Please review field errors.', type: 'error' });
      } else {
        const msg = responseData?.message ?? 'Failed to save customer.';
        setToast({ message: msg, type: 'error' });
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h2>{isEdit ? 'Edit Customer' : 'New Customer'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-card" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input
              value={form.name}
              onChange={set('name')}
              className={fieldErrors.name ? 'field-error' : ''}
              placeholder="e.g. Sangam Singh"
              required
            />
            {fieldErrors.name && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.name}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Mobile <span className="required">*</span></label>
            <input
              value={form.mobile}
              onChange={set('mobile')}
              className={fieldErrors.mobile ? 'field-error' : ''}
              placeholder="e.g. +91 9988776655"
              required
            />
            {fieldErrors.mobile && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.mobile}
              </span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              className={fieldErrors.email ? 'field-error' : ''}
              placeholder="e.g. sangam@example.com"
            />
            {fieldErrors.email && (
              <span className="validation-error-msg">
                <AlertCircle size={12} /> {fieldErrors.email}
              </span>
            )}
          </div>
          <div className="form-group">
            <label>Business Name</label>
            <input
              value={form.business_name}
              onChange={set('business_name')}
              placeholder="e.g. Acme Corp"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>GST Number</label>
            <input
              value={form.gst_number}
              onChange={set('gst_number')}
              placeholder="e.g. 22AAAAA0000A1Z5"
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <select value={form.customer_type} onChange={set('customer_type')}>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="distributor">Distributor</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Follow-up Date</label>
            <input
              type="date"
              value={form.follow_up_date}
              onChange={set('follow_up_date')}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            value={form.address}
            onChange={set('address')}
            placeholder="Enter customer billing/shipping address..."
            rows={2}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/customers')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isEdit ? 'Updating...' : 'Saving...') : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
