import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { Product } from '../types';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(searchParams.get('lowStock') === 'true');

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await productsApi.list({ page, limit: 20, search: search || undefined, lowStock: lowStock ? 'true' : undefined });
      setProducts(res.data.data);
      setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages, total: res.data.meta.total });
    } finally { setLoading(false); }
  }, [search, lowStock]);

  useEffect(() => { load(1); }, [load]);

  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';

  return (
    <div className="page">
      <div className="page-header">
        <h2>Products <span className="count-badge">{meta.total}</span></h2>
        {canEdit && <button className="btn btn-primary" onClick={() => navigate('/products/new')}>+ Add Product</button>}
      </div>
      <div className="filters">
        <SearchBar onSearch={setSearch} placeholder="Search name, SKU..." />
        <label className="checkbox-label">
          <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)} />
          Low Stock Only
        </label>
      </div>
      {loading ? <div className="loading">Loading...</div> : (
        <>
          <table className="data-table">
            <thead><tr><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Min Alert</th><th>Location</th></tr></thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={7} className="empty">No products found</td></tr>}
              {products.map(p => (
                <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="clickable-row">
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>{p.category ?? '—'}</td>
                  <td>₹{Number(p.unit_price).toFixed(2)}</td>
                  <td className={p.current_stock <= p.min_stock_alert ? 'text-warning' : ''}>
                    {p.current_stock} {p.current_stock <= p.min_stock_alert && '⚠️'}
                  </td>
                  <td>{p.min_stock_alert}</td>
                  <td>{p.warehouse_loc ?? '—'}</td>
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

export default Products;
