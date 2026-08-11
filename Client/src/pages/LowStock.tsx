import React, { useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const LowStock = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ lowStock: 'true', limit: 100 });
        setProducts(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={22} color="#B7791F" /> Low Stock Alerts
          </h2>
          <span className="count-badge" style={{ background: '#FFF4D6', color: '#9A6700', border: '1px solid #f0d78a' }}>
            {products.length} items
          </span>
        </div>
      </div>

      <div style={{
        background: '#FFF4D6', border: '1px solid #f0d78a', borderRadius: '8px',
        padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
        color: '#9A6700', fontSize: '13.5px', fontWeight: 500
      }}>
        <AlertTriangle size={16} />
        Products listed below have stock at or below their minimum alert level. Restock them promptly.
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-line" style={{ width: `${90 - i * 5}%`, height: '16px', marginBottom: '12px' }} />
            ))}
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Minimum Alert</th>
                <th>Shortage</th>
                <th>Warehouse</th>
                <th>Unit Price</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 0 }}>
                    <div className="empty-state">
                      <AlertTriangle className="empty-state-icon" size={40} style={{ color: '#2E7D5B' }} />
                      <h3 style={{ color: '#2E7D5B' }}>All products are well stocked!</h3>
                      <p>No products are currently below the minimum stock alert level.</p>
                    </div>
                  </td>
                </tr>
              )}
              {products.map(p => {
                const shortage = p.min_stock_alert - p.current_stock;
                return (
                  <tr key={p.id} className="clickable-row" onClick={() => navigate(`/products/${p.id}`)}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                    <td className="text-muted">{p.category || '—'}</td>
                    <td>
                      <span style={{
                        fontWeight: 700, fontSize: '15px',
                        color: p.current_stock === 0 ? '#C94C4C' : '#B7791F'
                      }}>
                        {p.current_stock}
                      </span>
                    </td>
                    <td className="text-muted">{p.min_stock_alert}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600,
                        background: '#FBEAEA', color: '#C94C4C'
                      }}>
                        -{shortage > 0 ? shortage : 0}
                      </span>
                    </td>
                    <td className="text-muted">{p.warehouse_loc || '—'}</td>
                    <td style={{ fontWeight: 600 }}>₹{Number(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStock;
