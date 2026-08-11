import React, { useEffect, useState, useCallback } from 'react';
import { accountsApi, Invoice } from '../api/accounts';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import { FileText, Search, X, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusBadge = (status: Invoice['status']) => {
  const map = {
    paid: { bg: '#E7F4EC', color: '#2E7D5B', label: 'Paid' },
    partially_paid: { bg: '#E0EDFB', color: '#1E5FAF', label: 'Partial' },
    pending: { bg: '#FFF4D6', color: '#9A6700', label: 'Pending' },
    overdue: { bg: '#FBEAEA', color: '#C94C4C', label: 'Overdue' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: s.bg, color: s.color }}>
      {status === 'paid' && <CheckCircle size={11} />}
      {status === 'overdue' && <AlertCircle size={11} />}
      {status === 'pending' && <Clock size={11} />}
      {s.label}
    </span>
  );
};

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Payment modal
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const canRecord = user?.role === 'admin' || user?.role === 'accounts';

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await accountsApi.listInvoices({ page, limit: 20, search: search || undefined, status: statusFilter || undefined });
      setInvoices(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const handleRecordPayment = async () => {
    if (!payModal) return;
    const amt = parseFloat(payAmt);
    if (!amt || amt <= 0) { setToast({ message: 'Enter a valid payment amount.', type: 'error' }); return; }
    if (amt > payModal.outstanding_amount) { setToast({ message: 'Amount exceeds outstanding balance.', type: 'error' }); return; }
    setPaying(true);
    try {
      await accountsApi.recordPayment({ invoice_id: payModal.id, amount: amt, payment_method: payMethod, reference_number: payRef || undefined, notes: payNotes || undefined });
      setToast({ message: 'Payment recorded successfully.', type: 'success' });
      setPayModal(null);
      load(meta.page);
    } catch {
      setToast({ message: 'Failed to record payment. Please try again.', type: 'error' });
    } finally { setPaying(false); }
  };

  const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Payment Modal */}
      {payModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', width: '440px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>Record Payment</h3>
              <button onClick={() => setPayModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><X size={18} /></button>
            </div>
            <div style={{ background: '#F5F6F8', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#6B7280' }}>Invoice #{payModal.invoice_number}</p>
              <p style={{ margin: '0 0 2px 0', fontWeight: 600, fontSize: '14px' }}>{payModal.customer_name}</p>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <div><p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280' }}>Total</p><p style={{ margin: 0, fontWeight: 700 }}>{fmt(payModal.total_amount)}</p></div>
                <div><p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280' }}>Paid</p><p style={{ margin: 0, fontWeight: 700, color: '#2E7D5B' }}>{fmt(payModal.paid_amount)}</p></div>
                <div><p style={{ margin: 0, fontSize: '11.5px', color: '#6B7280' }}>Outstanding</p><p style={{ margin: 0, fontWeight: 700, color: '#C94C4C' }}>{fmt(payModal.outstanding_amount)}</p></div>
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Amount *</label>
              <input type="number" className="form-input" placeholder="Enter amount" value={payAmt} onChange={e => setPayAmt(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Reference No. (optional)</label>
              <input type="text" className="form-input" placeholder="UTR / Cheque No." value={payRef} onChange={e => setPayRef(e.target.value)} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Notes (optional)</label>
              <input type="text" className="form-input" placeholder="Any note" value={payNotes} onChange={e => setPayNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setPayModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRecordPayment} disabled={paying}>
                {paying ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h2>Invoices</h2>
          <span className="count-badge">{meta.total} invoices</span>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search invoices..." />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { val: '', label: 'All' },
            { val: 'pending', label: 'Pending' },
            { val: 'partially_paid', label: 'Partial' },
            { val: 'overdue', label: 'Overdue' },
            { val: 'paid', label: 'Paid' },
          ].map(f => (
            <button key={f.val} onClick={() => setStatusFilter(f.val)} style={{
              padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: statusFilter === f.val ? '#1E3A5F' : '#fff',
              color: statusFilter === f.val ? '#fff' : '#1F2937',
              borderColor: statusFilter === f.val ? '#1E3A5F' : '#E5E7EB',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton-line" style={{ width: `${95-i*4}%`, height: '16px', marginBottom: '12px' }} />)}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Challan Ref</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  {canRecord && <th style={{ width: '100px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 && (
                  <tr><td colSpan={canRecord ? 9 : 8} style={{ padding: 0 }}>
                    <div className="empty-state">
                      <FileText className="empty-state-icon" size={40} />
                      <h3>No invoices found</h3>
                      <p>Invoices will appear here once created.</p>
                    </div>
                  </td></tr>
                )}
                {invoices.map(inv => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700 }}>#{inv.invoice_number}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_name}{inv.customer_business_name && <><br /><span style={{ fontSize: '11.5px', color: '#6B7280' }}>{inv.customer_business_name}</span></>}</td>
                    <td className="text-muted">{inv.challan_number ? `#${inv.challan_number}` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{fmt(inv.total_amount)}</td>
                    <td style={{ color: '#2E7D5B', fontWeight: 600 }}>{fmt(inv.paid_amount)}</td>
                    <td style={{ color: inv.outstanding_amount > 0 ? '#C94C4C' : '#2E7D5B', fontWeight: 600 }}>{fmt(inv.outstanding_amount)}</td>
                    <td className="text-muted" style={{ fontSize: '12.5px' }}>{fmtDate(inv.due_date)}</td>
                    <td>{statusBadge(inv.status)}</td>
                    {canRecord && (
                      <td>
                        {inv.outstanding_amount > 0 && (
                          <button
                            onClick={() => { setPayModal(inv); setPayAmt(''); setPayMethod('cash'); setPayRef(''); setPayNotes(''); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: '#E8EEF5', color: '#1E3A5F', border: '1px solid #d0dbed' }}
                          >
                            <DollarSign size={12} /> Pay
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default Invoices;
