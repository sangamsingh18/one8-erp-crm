import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { challansApi } from '../api/challans';
import { Challan } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const Challans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(searchParams.get('status') ?? '');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await challansApi.list({ page, limit: 20, status: status || undefined });
      setChallans(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(1); }, [load]);

  const canCreate = user?.role === 'admin' || user?.role === 'sales';

  return (
    <div className="page">
      <div className="page-header">
        <h2>Challans <span className="count-badge">{meta.total}</span></h2>
        {canCreate && <button className="btn btn-primary" onClick={() => navigate('/challans/new')}>+ New Challan</button>}
      </div>
      <div className="filters">
        <select value={status} onChange={e => { setStatus(e.target.value); setSearchParams(e.target.value ? { status: e.target.value } : {}); }}>
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead><tr><th>Challan #</th><th>Customer</th><th>Status</th><th>Total Qty</th><th>Created By</th><th>Date</th></tr></thead>
            <tbody>
              {challans.length === 0 && <tr><td colSpan={6} className="empty">No challans found</td></tr>}
              {challans.map(c => (
                <tr key={c.id} onClick={() => navigate(`/challans/${c.id}`)} className="clickable-row">
                  <td><strong>{c.challan_number}</strong></td>
                  <td>{c.customer_name}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.total_quantity}</td>
                  <td>{c.created_by_name}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default Challans;
