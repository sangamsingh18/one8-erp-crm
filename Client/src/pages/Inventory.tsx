import React, { useEffect, useState, useCallback } from 'react';
import { productsApi } from '../api/products';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/common/Toast';
import SearchBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import {
  Package, Search, ArrowUpCircle, ArrowDownCircle, AlertTriangle, X
} from 'lucide-react';

interface AdjustModal {
  product: Product;
  type: 'IN' | 'OUT';
}

const Inventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Adjust stock modal
  const [modal, setModal] = useState<AdjustModal | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const canAdjust = user?.role === 'admin' || user?.role === 'warehouse';

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await productsApi.list({ page, limit: 20, search: search || undefined });
      setProducts(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const openAdjust = (product: Product, type: 'IN' | 'OUT') => {
    setModal({ product, type });
    setAdjustQty('');
    setAdjustReason('');
  };

  const handleAdjust = async () => {
    if (!modal) return;
    const qty = parseInt(adjustQty);
    if (!qty || qty <= 0) {
      setToast({ message: 'Enter a valid quantity.', type: 'error' });
      return;
    }
    setAdjusting(true);
    try {
      await productsApi.adjustStock(modal.product.id, {
        quantity: qty,
        movement_type: modal.type,
        reason: adjustReason || (modal.type === 'IN' ? 'Stock received' : 'Stock issued'),
      });
      setToast({ message: `Stock ${modal.type === 'IN' ? 'added' : 'deducted'} successfully.`, type: 'success' });
      setModal(null);
      load(meta.page);
    } catch {
      setToast({ message: 'Failed to adjust stock. Please try again.', type: 'error' });
    } finally {
      setAdjusting(false);
    }
  };

  const getStockColor = (stock: number, min: number) => {
    if (stock === 0) return '#C94C4C';
    if (stock <= min) return '#B7791F';
    return '#2E7D5B';
  };

  const getStockBg = (stock: number, min: number) => {
    if (stock === 0) return '#FBEAEA';
    if (stock <= min) return '#FFF4D6';
    return '#E7F4EC';
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Adjust Modal */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '32px', width: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxWidth: '90vw'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
                {modal.type === 'IN' ? 'Stock In' : 'Stock Out'} — {modal.product.name}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#6B7280' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px 0' }}>Current Stock</p>
              <p style={{ fontSize: '22px', fontWeight: 700, color: getStockColor(modal.product.current_stock, modal.product.min_stock_alert), margin: 0 }}>
                {modal.product.current_stock} units
              </p>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label className="form-label">Quantity to {modal.type === 'IN' ? 'Add' : 'Deduct'} *</label>
              <input
                type="number"
                min={1}
                className="form-input"
                placeholder="e.g. 50"
                value={adjustQty}
                onChange={e => setAdjustQty(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Reason (optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder={modal.type === 'IN' ? 'e.g. Supplier delivery' : 'e.g. Challan #123'}
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={handleAdjust}
                disabled={adjusting}
                style={{
                  background: modal.type === 'IN' ? '#2E7D5B' : '#C94C4C',
                  borderColor: modal.type === 'IN' ? '#2E7D5B' : '#C94C4C'
                }}
              >
                {adjusting ? 'Saving...' : modal.type === 'IN' ? 'Add Stock' : 'Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="page-header-title">
          <h2>Inventory</h2>
          <span className="count-badge">{meta.total} products</span>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search products..." />
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="skeleton-line" style={{ width: `${95 - i * 5}%`, height: '16px', marginBottom: '12px' }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Min Alert</th>
                  <th>Status</th>
                  <th>Warehouse</th>
                  {canAdjust && <th style={{ width: '140px', textAlign: 'center' }}>Adjust</th>}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={canAdjust ? 9 : 8} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <Package className="empty-state-icon" size={40} />
                        <h3>No products found</h3>
                        <p>No inventory items match your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                    <td>{p.category || <span className="text-muted">—</span>}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: getStockColor(p.current_stock, p.min_stock_alert) }}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="text-muted">{p.min_stock_alert}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600,
                        background: getStockBg(p.current_stock, p.min_stock_alert),
                        color: getStockColor(p.current_stock, p.min_stock_alert)
                      }}>
                        {p.current_stock === 0 ? 'Out of Stock' : p.current_stock <= p.min_stock_alert ? (
                          <><AlertTriangle size={11} /> Low Stock</>
                        ) : 'In Stock'}
                      </span>
                    </td>
                    <td className="text-muted">{p.warehouse_loc || '—'}</td>
                    {canAdjust && (
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => openAdjust(p, 'IN')}
                            style={{ background: '#E7F4EC', color: '#2E7D5B', border: '1px solid #b6dfc8', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <ArrowUpCircle size={13} /> IN
                          </button>
                          <button
                            onClick={() => openAdjust(p, 'OUT')}
                            style={{ background: '#FBEAEA', color: '#C94C4C', border: '1px solid #f0b4b4', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 600 }}
                          >
                            <ArrowDownCircle size={13} /> OUT
                          </button>
                        </div>
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

export default Inventory;
