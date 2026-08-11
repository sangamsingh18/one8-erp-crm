import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import { Settings as SettingsIcon, Building2, Globe, Shield, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState({
    name: 'One8 Enterprises',
    email: 'contact@one8.in',
    phone: '+91 98765 43210',
    gst: '29ABCDE1234F1Z5',
    address: '12, Industrial Area, Sector 5, Delhi - 110001',
    website: 'https://www.one8.in',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setToast({ message: 'Settings saved successfully.', type: 'success' });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div className="page-header-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={22} /> Settings
          </h2>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Company Info */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', gridColumn: '1 / -1' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#1E3A5F" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Company Information</h3>
          </div>
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Company Name</label>
              <input className="form-input" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} disabled={!isAdmin} />
            </div>
            <div>
              <label className="form-label">GST Number</label>
              <input className="form-input" value={company.gst} onChange={e => setCompany(c => ({ ...c, gst: e.target.value }))} disabled={!isAdmin} />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} disabled={!isAdmin} />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} disabled={!isAdmin} />
            </div>
            <div>
              <label className="form-label">Website</label>
              <input className="form-input" value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} disabled={!isAdmin} />
            </div>
            <div>
              <label className="form-label">Currency</label>
              <select className="form-select" value={company.currency} onChange={e => setCompany(c => ({ ...c, currency: e.target.value }))} disabled={!isAdmin}>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
                <option value="EUR">EUR — Euro (€)</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Business Address</label>
              <textarea className="form-input" rows={2} value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} disabled={!isAdmin} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* System Info */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={16} color="#1E3A5F" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>System Preferences</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="form-label">Timezone</label>
              <select className="form-select" value={company.timezone} onChange={e => setCompany(c => ({ ...c, timezone: e.target.value }))} disabled={!isAdmin}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC +0:00</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
              </select>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: '8px', padding: '14px 16px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Application Version</p>
              <p style={{ margin: 0, fontWeight: 700, color: '#1F2937' }}>One8 CRM v1.0.0</p>
            </div>
          </div>
        </div>

        {/* Your Account */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="#1E3A5F" />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>Your Account</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', fontWeight: 700, flexShrink: 0 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{user?.name}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6B7280' }}>{user?.email}</p>
              </div>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Role</span>
                <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'capitalize', color: '#1E3A5F' }}>{user?.role}</span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280' }}>
              To change your password or update account details, please contact your system administrator.
            </p>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div style={{ marginTop: '20px', background: '#FFF4D6', border: '1px solid #f0d78a', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#9A6700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={15} />
          Settings are read-only for your role. Contact an Admin to make changes.
        </div>
      )}
    </div>
  );
};

export default Settings;
