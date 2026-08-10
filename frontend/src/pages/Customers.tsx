import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customersApi } from '../api/customers';
import { Customer } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') ?? '');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await customersApi.list({ page, limit: 20, search: search || undefined, status: status || undefined });
      setCustomers(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [search, status]);

  useEffect(() => { load(1); }, [load]);

  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  return (
    <div className="page">
      <div className="page-header">
        <h2>Customers <span className="count-badge">{meta.total}</span></h2>
        {canEdit && <button className="btn btn-primary" onClick={() => navigate('/customers/new')}>+ Add Customer</button>}
      </div>
      <div className="filters">
        <SearchBar onSearch={setSearch} placeholder="Search name, mobile..." />
        <select value={status} onChange={e => { setStatus(e.target.value); setSearchParams(e.target.value ? { status: e.target.value } : {}); }}>
          <option value="">All Status</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Mobile</th><th>Business</th><th>Type</th><th>Status</th><th>Follow-up</th></tr></thead>
            <tbody>
              {customers.length === 0 && <tr><td colSpan={6} className="empty">No customers found</td></tr>}
              {customers.map(c => (
                <tr key={c.id} onClick={() => navigate(`/customers/${c.id}`)} className="clickable-row">
                  <td>{c.name}</td>
                  <td>{c.mobile}</td>
                  <td>{c.business_name ?? '—'}</td>
                  <td><StatusBadge status={c.customer_type} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : '—'}</td>
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

export default Customers;
