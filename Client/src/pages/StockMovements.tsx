import React, { useEffect, useState, useCallback } from 'react';
import { StockMovement, PaginatedResponse } from '../types';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { Activity, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const StockMovements = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'IN' | 'OUT'>('');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get<PaginatedResponse<StockMovement & { product_name?: string; product_sku?: string }>>(
        '/products/movements',
        { params: { page, limit: 25, search: search || undefined, movement_type: typeFilter || undefined } }
      );
      setMovements(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } catch {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { load(1); }, [load]);

  const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h2>Stock Movements</h2>
          <span className="count-badge">{meta.total} records</span>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search by product, reason..." />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['', 'IN', 'OUT'] as const).map(t => (
            <button
              key={t || 'all'}
              onClick={() => setTypeFilter(t)}
              style={{
                padding: '6px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: '1px solid',
                background: typeFilter === t ? '#1E3A5F' : '#fff',
                color: typeFilter === t ? '#fff' : '#1F2937',
                borderColor: typeFilter === t ? '#1E3A5F' : '#E5E7EB',
              }}
            >
              {t === '' ? 'All' : t === 'IN' ? 'Stock In' : 'Stock Out'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton-line" style={{ width: `${95 - i * 4}%`, height: '16px', marginBottom: '12px' }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Done By</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <Activity className="empty-state-icon" size={40} />
                        <h3>No movements found</h3>
                        <p>Stock movement records will appear here.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {movements.map(m => {
                  const mv = m as StockMovement & { product_name?: string; product_sku?: string };
                  return (
                    <tr key={m.id}>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 700,
                          background: m.movement_type === 'IN' ? '#E7F4EC' : '#FBEAEA',
                          color: m.movement_type === 'IN' ? '#2E7D5B' : '#C94C4C',
                        }}>
                          {m.movement_type === 'IN' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                          {m.movement_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{mv.product_name || m.product_id}</td>
                      <td><code style={{ fontSize: '12px' }}>{mv.product_sku || '—'}</code></td>
                      <td style={{ fontWeight: 700, color: m.movement_type === 'IN' ? '#2E7D5B' : '#C94C4C' }}>
                        {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                      </td>
                      <td className="text-muted">{m.reason || '—'}</td>
                      <td className="text-muted">{m.created_by_name || '—'}</td>
                      <td className="text-muted" style={{ fontSize: '12px' }}>{fmtDate(m.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={meta.page} totalPages={meta.totalPages} onPageChange={load} />
        </>
      )}
    </div>
  );
};

export default StockMovements;
