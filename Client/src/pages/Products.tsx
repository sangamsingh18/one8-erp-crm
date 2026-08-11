import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import { Product } from '../types';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import ActionMenu from '../components/common/ActionMenu';
import DeleteModal from '../components/common/DeleteModal';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Search, AlertTriangle, MapPin, Tag, Eye, Pencil, Trash2 } from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(searchParams.get('lowStock') === 'true');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Custom Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await productsApi.list({ page, limit: 20, search: search || undefined, lowStock: lowStock ? 'true' : undefined });
      if (res?.data?.data) {
        setProducts(res.data.data);
        setMeta({ 
          page: res.data.meta?.page || 1, 
          totalPages: res.data.meta?.totalPages || 1, 
          total: res.data.meta?.total || 0 
        });
      }
    } catch {
      setToast({ message: 'Failed to load products. Please check server connection.', type: 'error' });
    } finally { setLoading(false); }
  }, [search, lowStock]);

  useEffect(() => { load(1); }, [load]);

  const canEdit = user?.role === 'admin' || user?.role === 'warehouse';
  const canDelete = user?.role === 'admin';

  const triggerDeleteConfirm = (id: string, name: string) => {
    setProductToDelete({ id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await productsApi.delete(productToDelete.id);
      setToast({ message: 'Product deleted successfully.', type: 'success' });
      setDeleteModalOpen(false);
      setProductToDelete(null);
      load(meta.page);
    } catch {
      setToast({ message: 'Unable to delete product. Please try again.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const getStockBadge = (stock: number, minAlert: number) => {
    if (stock === 0) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: '#FBEAEA', color: '#B23A3A' }}>
          Out of Stock
        </span>
      );
    }
    if (stock <= minAlert) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: '#FFF4D6', color: '#9A6700' }}>
          <AlertTriangle size={12} /> Low Stock
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: 600, background: '#E7F4EC', color: '#28734D' }}>
        In Stock
      </span>
    );
  };

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DeleteModal
        isOpen={deleteModalOpen}
        title="Delete Product?"
        message={productToDelete ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.` : ''}
        confirmLabel="Delete Product"
        loading={deleting}
        onClose={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <div className="page-header">
        <div className="page-header-title">
          <h2>Products</h2>
          <span className="count-badge">{meta.total} items</span>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            <Plus size={16} /> Add Product
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <SearchBar onSearch={setSearch} placeholder="Search by name, SKU..." />
        </div>
        
        <label className="checkbox-label" style={{ marginLeft: '12px' }}>
          <input 
            type="checkbox" 
            checked={lowStock} 
            onChange={e => setLowStock(e.target.checked)} 
          />
          Show Low Stock Only
        </label>
      </div>

      {loading ? (
        <div className="table-wrapper">
          <div className="loading" style={{ padding: '60px' }}>
            <div className="skeleton-line" style={{ width: '100%', height: '20px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '95%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '98%', height: '16px', marginBottom: '12px' }} />
            <div className="skeleton-line" style={{ width: '85%', height: '16px' }} />
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th style={{ width: '48px' }}></th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <div className="empty-state">
                        <Package className="empty-state-icon" size={40} />
                        <h3>No products found</h3>
                        <p>Start by adding your first product to One8 CRM.</p>
                        {canEdit && (
                          <button className="btn btn-primary btn-sm" onClick={() => navigate('/products/new')}>
                            <Plus size={14} /> Add Product
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {Array.isArray(products) && products.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="clickable-row"
                    style={{ opacity: deleting && productToDelete?.id === p.id ? 0.5 : 1 }}
                  >
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><code style={{ fontSize: '12px' }}>{p.sku}</code></td>
                    <td>
                      {p.category ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={12} className="text-muted" /> {p.category}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{Number(p.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontWeight: 600 }} className={p.current_stock <= p.min_stock_alert ? 'text-warning' : ''}>
                      {p.current_stock}
                    </td>
                    <td>{getStockBadge(p.current_stock, p.min_stock_alert)}</td>
                    <td>
                      {p.warehouse_loc ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                          <MapPin size={12} /> {p.warehouse_loc}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: <Eye size={14} />,
                            onClick: () => navigate(`/products/${p.id}`),
                          },
                          ...(canEdit ? [{
                            label: 'Edit Product',
                            icon: <Pencil size={14} />,
                            onClick: () => navigate(`/products/${p.id}/edit`),
                          }] : []),
                          ...(canDelete ? [{
                            label: 'Delete',
                            icon: <Trash2 size={14} />,
                            onClick: () => triggerDeleteConfirm(p.id, p.name),
                            variant: 'danger' as const,
                            dividerBefore: true,
                          }] : []),
                        ]}
                      />
                    </td>
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

export default Products;
