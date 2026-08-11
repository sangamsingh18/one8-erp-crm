import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { productsApi } from '../api/products';
import { customersApi } from '../api/customers';
import { challansApi } from '../api/challans';
import { accountsApi, FinancialSummary } from '../api/accounts';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, FileText, BarChart3, ArrowRight, Activity,
  DollarSign, CheckCircle, Package, TrendingUp, Users
} from 'lucide-react';

interface DashboardStats {
  lowStockCount: number;
  pendingFollowUps: number;
  draftChallans: number;
  confirmedChallans: number;
  totalCustomers: number;
  financial: FinancialSummary | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    lowStockCount: 0, pendingFollowUps: 0, draftChallans: 0,
    confirmedChallans: 0, totalCustomers: 0, financial: null,
  });
  const [loading, setLoading] = useState(true);

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isSales = role === 'sales';
  const isWarehouse = role === 'warehouse';
  const isAccounts = role === 'accounts';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tasks = await Promise.allSettled([
          (isAdmin || isWarehouse) ? productsApi.list({ lowStock: 'true', limit: 1 }) : Promise.resolve(null),
          (isAdmin || isSales) ? customersApi.list({ status: 'lead', limit: 1 }) : Promise.resolve(null),
          (isAdmin || isSales) ? challansApi.list({ status: 'draft', limit: 1 }) : Promise.resolve(null),
          (isAdmin || isSales) ? challansApi.list({ status: 'confirmed', limit: 1 }) : Promise.resolve(null),
          (isAdmin || isSales || isAccounts) ? customersApi.list({ limit: 1 }) : Promise.resolve(null),
          (isAdmin || isAccounts) ? accountsApi.getSummary() : Promise.resolve(null),
        ]);
        const [lowStock, followUps, drafts, confirmed, totalCust, fin] = tasks;
        setStats({
          lowStockCount: lowStock.status === 'fulfilled' && lowStock.value ? (lowStock.value as { data: { meta: { total: number } } }).data.meta.total : 0,
          pendingFollowUps: followUps.status === 'fulfilled' && followUps.value ? (followUps.value as { data: { meta: { total: number } } }).data.meta.total : 0,
          draftChallans: drafts.status === 'fulfilled' && drafts.value ? (drafts.value as { data: { meta: { total: number } } }).data.meta.total : 0,
          confirmedChallans: confirmed.status === 'fulfilled' && confirmed.value ? (confirmed.value as { data: { meta: { total: number } } }).data.meta.total : 0,
          totalCustomers: totalCust.status === 'fulfilled' && totalCust.value ? (totalCust.value as { data: { meta: { total: number } } }).data.meta.total : 0,
          financial: fin.status === 'fulfilled' && fin.value ? (fin.value as { data: { data: FinancialSummary } }).data.data : null,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fmt = (n: number) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // Build stat cards based on role
  const statCards = [
    // Admin + Accounts
    ...(isAdmin || isAccounts) && stats.financial ? [
      {
        label: 'Total Revenue',
        value: loading ? '—' : fmt(stats.financial.total_revenue),
        icon: <DollarSign size={20} />,
        iconBg: '#E8EEF5', iconColor: '#1E3A5F',
        onClick: () => navigate('/invoices'),
        warning: false,
      },
      {
        label: 'Amount Collected',
        value: loading ? '—' : fmt(stats.financial.total_paid),
        icon: <CheckCircle size={20} />,
        iconBg: '#E7F4EC', iconColor: '#2E7D5B',
        onClick: () => navigate('/payments'),
        warning: false,
      },
      {
        label: 'Outstanding',
        value: loading ? '—' : fmt(stats.financial.total_outstanding),
        icon: <AlertTriangle size={20} />,
        iconBg: '#FBEAEA', iconColor: '#C94C4C',
        onClick: () => navigate('/invoices?status=pending'),
        warning: (stats.financial?.total_outstanding ?? 0) > 0,
      },
    ] : [],

    // Admin + Sales
    ...(isAdmin || isSales) ? [
      {
        label: 'Pending Follow-ups',
        value: loading ? '—' : String(stats.pendingFollowUps),
        icon: <Users size={20} />,
        iconBg: '#E0EDFB', iconColor: '#1E5FAF',
        onClick: () => navigate('/customers?status=lead'),
        warning: false,
      },
      {
        label: 'Draft Challans',
        value: loading ? '—' : String(stats.draftChallans),
        icon: <FileText size={20} />,
        iconBg: '#FFF4D6', iconColor: '#B7791F',
        onClick: () => navigate('/challans?status=draft'),
        warning: false,
      },
      {
        label: 'Confirmed Challans',
        value: loading ? '—' : String(stats.confirmedChallans),
        icon: <TrendingUp size={20} />,
        iconBg: '#E7F4EC', iconColor: '#2E7D5B',
        onClick: () => navigate('/challans?status=confirmed'),
        warning: false,
      },
    ] : [],

    // Admin + Warehouse
    ...(isAdmin || isWarehouse) ? [
      {
        label: 'Low Stock Products',
        value: loading ? '—' : String(stats.lowStockCount),
        icon: <Package size={20} />,
        iconBg: '#FBEAEA', iconColor: '#C94C4C',
        onClick: () => navigate('/low-stock'),
        warning: stats.lowStockCount > 0,
      },
    ] : [],
  ];

  // Quick actions by role
  const quickActions = [
    ...(isAdmin || isSales) ? [
      { label: 'New Challan', onClick: () => navigate('/challans/new') },
      { label: 'Add Customer', onClick: () => navigate('/customers/new') },
    ] : [],
    ...(isAdmin || isWarehouse) ? [
      { label: 'Manage Inventory', onClick: () => navigate('/inventory') },
      { label: 'View Low Stock', onClick: () => navigate('/low-stock') },
    ] : [],
    ...(isAdmin || isAccounts) ? [
      { label: 'View Invoices', onClick: () => navigate('/invoices') },
      { label: 'View Payments', onClick: () => navigate('/payments') },
    ] : [],
    { label: 'Reports', onClick: () => navigate('/reports') },
  ].slice(0, 4);

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '26px' }}>Welcome back, {user?.name}</h2>
          <p className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', marginTop: '4px' }}>
            Account Role: <span className="role-badge" style={{ margin: 0, background: '#e0e7ff', color: '#4f46e5' }}>{user?.role}</span>
          </p>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '24px 0' }} />

      {/* Stat Cards */}
      <div className="dashboard-grid">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="stat-card" style={{ height: '104px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton-line" style={{ width: '40px', height: '24px' }} />
              <div className="skeleton-line" style={{ width: '120px', height: '14px' }} />
            </div>
          ))
        ) : (
          statCards.map((card, i) => (
            <div
              key={i}
              className={`stat-card ${card.warning ? 'stat-card-warning' : ''}`}
              onClick={card.onClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="stat-icon-wrapper" style={{ background: card.iconBg, color: card.iconColor }}>
                {card.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{card.value}</div>
                <div className="stat-label">{card.label}</div>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
            </div>
          ))
        )}
      </div>

      {/* Bottom section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginTop: '32px' }}>
        <div className="detail-card">
          <h3><BarChart3 size={18} /> Quick Actions</h3>
          <p className="text-muted" style={{ fontSize: '13.5px', marginBottom: '16px' }}>
            Shortcuts for common tasks in your role.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {quickActions.map((a, i) => (
              <button key={i} className="btn btn-secondary btn-sm" onClick={a.onClick}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ background: '#f0fdf4', color: '#10b981', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Activity size={24} />
          </div>
          <h4 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>Active Connection</h4>
          <p className="text-muted" style={{ fontSize: '12.5px' }}>
            Database successfully synchronized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
