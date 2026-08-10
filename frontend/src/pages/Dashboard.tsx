import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { productsApi } from '../api/products';
import { customersApi } from '../api/customers';
import { challansApi } from '../api/challans';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  lowStockCount: number;
  pendingFollowUps: number;
  draftChallans: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ lowStockCount: 0, pendingFollowUps: 0, draftChallans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lowStock, followUps, drafts] = await Promise.allSettled([
          productsApi.list({ lowStock: 'true', limit: 1 }),
          customersApi.list({ status: 'lead', limit: 1 }),
          challansApi.list({ status: 'draft', limit: 1 }),
        ]);
        setStats({
          lowStockCount: lowStock.status === 'fulfilled' ? lowStock.value.data.meta.total : 0,
          pendingFollowUps: followUps.status === 'fulfilled' ? followUps.value.data.meta.total : 0,
          draftChallans: drafts.status === 'fulfilled' ? drafts.value.data.meta.total : 0,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="page">
      <h2>Welcome, {user?.name}</h2>
      <p className="text-muted">Role: <strong>{user?.role}</strong></p>
      {loading ? <div className="loading">Loading stats...</div> : (
        <div className="dashboard-grid">
          {(user?.role === 'admin' || user?.role === 'warehouse') && (
            <div className={`stat-card ${stats.lowStockCount > 0 ? 'stat-card-warning' : ''}`}
              onClick={() => navigate('/products?lowStock=true')} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{stats.lowStockCount}</div>
              <div className="stat-label">⚠️ Low Stock Products</div>
            </div>
          )}
          {(user?.role === 'admin' || user?.role === 'sales') && (
            <div className="stat-card" onClick={() => navigate('/customers?status=lead')} style={{ cursor: 'pointer' }}>
              <div className="stat-value">{stats.pendingFollowUps}</div>
              <div className="stat-label">📋 Pending Follow-ups</div>
            </div>
          )}
          <div className="stat-card" onClick={() => navigate('/challans?status=draft')} style={{ cursor: 'pointer' }}>
            <div className="stat-value">{stats.draftChallans}</div>
            <div className="stat-label">🧾 Draft Challans</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
