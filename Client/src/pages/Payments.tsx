import React, { useEffect, useState } from 'react';
import { accountsApi, Payment } from '../api/accounts';
import { DollarSign, ArrowDownCircle } from 'lucide-react';

const methodLabel = (m: string) => {
  const map: Record<string, string> = { cash: 'Cash', bank_transfer: 'Bank Transfer', upi: 'UPI', cheque: 'Cheque', card: 'Card' };
  return map[m] || m;
};

const methodColor = (m: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    cash: { bg: '#E7F4EC', color: '#2E7D5B' },
    upi: { bg: '#E0EDFB', color: '#1E5FAF' },
    bank_transfer: { bg: '#EDE9FE', color: '#6D28D9' },
    cheque: { bg: '#FFF4D6', color: '#9A6700' },
    card: { bg: '#FCE7F3', color: '#9D174D' },
  };
  return map[m] || { bg: '#F5F6F8', color: '#6B7280' };
};

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total_revenue: 0, total_paid: 0, total_outstanding: 0, total_invoices: 0 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sumRes] = await Promise.allSettled([
          accountsApi.getSummary(),
        ]);
        if (sumRes.status === 'fulfilled') {
          const d = sumRes.value.data.data;
          setSummary({ total_revenue: d.total_revenue, total_paid: d.total_paid, total_outstanding: d.total_outstanding, total_invoices: d.total_invoices });
          setPayments(d.recentPayments || []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const statCards = [
    { label: 'Total Revenue', value: fmt(summary.total_revenue), color: '#1E3A5F', bg: '#E8EEF5' },
    { label: 'Amount Collected', value: fmt(summary.total_paid), color: '#2E7D5B', bg: '#E7F4EC' },
    { label: 'Outstanding', value: fmt(summary.total_outstanding), color: '#C94C4C', bg: '#FBEAEA' },
    { label: 'Total Invoices', value: String(summary.total_invoices), color: '#B7791F', bg: '#FFF4D6' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Payments</h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {statCards.map(c => (
          <div key={c.label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '12.5px', color: '#6B7280', fontWeight: 500 }}>{c.label}</p>
            <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: c.color }}>{loading ? '—' : c.value}</p>
          </div>
        ))}
      </div>

      {/* Payment Log */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <DollarSign size={16} color="#1E3A5F" />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>Recent Payment Records</h3>
        </div>
        {loading ? (
          <div style={{ padding: '40px 20px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton-line" style={{ width: `${90-i*5}%`, height: '16px', marginBottom: '12px' }} />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state" style={{ padding: '48px' }}>
            <ArrowDownCircle className="empty-state-icon" size={40} />
            <h3>No payments recorded</h3>
            <p>Payment records will appear here.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Recorded By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const mc = methodColor(p.payment_method);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>#{p.invoice_number || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{p.customer_name || '—'}</td>
                    <td style={{ fontWeight: 700, color: '#2E7D5B', fontSize: '14px' }}>{fmt(p.amount)}</td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: mc.bg, color: mc.color }}>
                        {methodLabel(p.payment_method)}
                      </span>
                    </td>
                    <td className="text-muted">{p.reference_number || '—'}</td>
                    <td className="text-muted">{p.notes || '—'}</td>
                    <td className="text-muted">{p.created_by_name || '—'}</td>
                    <td className="text-muted" style={{ fontSize: '12px' }}>{fmtDate(p.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Payments;
