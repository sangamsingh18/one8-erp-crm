import React, { useEffect, useState } from 'react';
import { accountsApi } from '../api/accounts';
import { productsApi } from '../api/products';
import { customersApi } from '../api/customers';
import { challansApi } from '../api/challans';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Package, Users, FileText, DollarSign } from 'lucide-react';

interface ReportStats {
  totalRevenue: number;
  totalOutstanding: number;
  totalPaid: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  totalCustomers: number;
  activeCustomers: number;
  leadCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  confirmedChallans: number;
  draftChallans: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Partial<ReportStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          accountsApi.getSummary(),
          customersApi.list({ limit: 1 }),
          customersApi.list({ status: 'active', limit: 1 }),
          customersApi.list({ status: 'lead', limit: 1 }),
          productsApi.list({ limit: 1 }),
          productsApi.list({ lowStock: 'true', limit: 1 }),
          challansApi.list({ limit: 1 }),
          challansApi.list({ status: 'confirmed', limit: 1 }),
          challansApi.list({ status: 'draft', limit: 1 }),
        ]);

        const [sumR, custR, activeCR, leadCR, prodR, lowR, chalR, confCR, draftCR] = results;

        const newStats: Partial<ReportStats> = {};
        if (sumR.status === 'fulfilled') {
          const d = sumR.value.data.data;
          newStats.totalRevenue = d.total_revenue;
          newStats.totalOutstanding = d.total_outstanding;
          newStats.totalPaid = d.total_paid;
          newStats.paidCount = d.paid_count;
          newStats.pendingCount = d.pending_count;
          newStats.overdueCount = d.total_invoices - d.paid_count - d.partial_count - d.pending_count;
        }
        if (custR.status === 'fulfilled') newStats.totalCustomers = custR.value.data.meta.total;
        if (activeCR.status === 'fulfilled') newStats.activeCustomers = activeCR.value.data.meta.total;
        if (leadCR.status === 'fulfilled') newStats.leadCustomers = leadCR.value.data.meta.total;
        if (prodR.status === 'fulfilled') newStats.totalProducts = prodR.value.data.meta.total;
        if (lowR.status === 'fulfilled') newStats.lowStockProducts = lowR.value.data.meta.total;
        if (chalR.status === 'fulfilled') newStats.totalChallans = chalR.value.data.meta.total;
        if (confCR.status === 'fulfilled') newStats.confirmedChallans = confCR.value.data.meta.total;
        if (draftCR.status === 'fulfilled') newStats.draftChallans = draftCR.value.data.meta.total;
        setStats(newStats);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n?: number) => n != null ? '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—';
  const num = (n?: number) => n != null ? n.toString() : '—';

  const sections = [
    {
      title: 'Financial Overview',
      icon: <DollarSign size={18} color="#1E3A5F" />,
      visible: user?.role === 'admin' || user?.role === 'accounts',
      rows: [
        { label: 'Total Revenue', value: fmt(stats.totalRevenue), color: '#1E3A5F' },
        { label: 'Amount Collected', value: fmt(stats.totalPaid), color: '#2E7D5B' },
        { label: 'Outstanding Receivables', value: fmt(stats.totalOutstanding), color: '#C94C4C' },
        { label: 'Paid Invoices', value: num(stats.paidCount) },
        { label: 'Pending Invoices', value: num(stats.pendingCount), color: '#B7791F' },
      ],
    },
    {
      title: 'Customer Summary',
      icon: <Users size={18} color="#1E3A5F" />,
      visible: user?.role === 'admin' || user?.role === 'sales',
      rows: [
        { label: 'Total Customers', value: num(stats.totalCustomers) },
        { label: 'Active Customers', value: num(stats.activeCustomers), color: '#2E7D5B' },
        { label: 'Leads / Follow-ups', value: num(stats.leadCustomers), color: '#B7791F' },
      ],
    },
    {
      title: 'Inventory & Stock',
      icon: <Package size={18} color="#1E3A5F" />,
      visible: user?.role === 'admin' || user?.role === 'warehouse',
      rows: [
        { label: 'Total Products', value: num(stats.totalProducts) },
        { label: 'Low Stock Items', value: num(stats.lowStockProducts), color: '#C94C4C' },
      ],
    },
    {
      title: 'Challans',
      icon: <FileText size={18} color="#1E3A5F" />,
      visible: true,
      rows: [
        { label: 'Total Challans', value: num(stats.totalChallans) },
        { label: 'Confirmed', value: num(stats.confirmedChallans), color: '#2E7D5B' },
        { label: 'Drafts', value: num(stats.draftChallans), color: '#B7791F' },
      ],
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={22} /> Reports
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {sections.filter(s => s.visible).map(section => (
          <div key={section.title} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {section.icon}
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1F2937' }}>{section.title}</h3>
            </div>
            <div style={{ padding: '8px 0' }}>
              {section.rows.map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #F5F6F8' }}>
                  <span style={{ fontSize: '13.5px', color: '#6B7280' }}>{row.label}</span>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: row.color || '#1F2937' }}>
                    {loading ? '...' : row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', background: '#E8EEF5', border: '1px solid #d0dbed', borderRadius: '10px', padding: '16px 20px', fontSize: '13px', color: '#1E3A5F' }}>
        <strong>Note:</strong> All figures are real-time from the database. For detailed analysis and exports, please contact the system administrator.
      </div>
    </div>
  );
};

export default Reports;
