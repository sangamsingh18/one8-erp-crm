import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api/customers';
import { Customer, CustomerNote } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Edit3, MessageSquare, User, FileText } from 'lucide-react';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([customersApi.get(id), customersApi.getNotes(id)])
      .then(([c, n]) => { 
        setCustomer(c.data.data); 
        setNotes(n.data.data); 
      })
      .catch(() => {
        setToast({ message: 'Failed to load customer details.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    
    setNoteSaving(true);
    try {
      const res = await customersApi.addNote(id, newNote);
      setNotes([res.data.data, ...notes]);
      setNewNote('');
      setToast({ message: 'Note added successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to add note.', type: 'error' });
    } finally {
      setNoteSaving(false);
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  if (loading) {
    return (
      <div className="page">
        <div className="loading" style={{ padding: '80px' }}>
          <div className="skeleton-line" style={{ width: '120px', height: '24px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="skeleton-line" style={{ height: '300px' }} />
            <div className="skeleton-line" style={{ height: '300px' }} />
          </div>
        </div>
      </div>
    );
  }
  
  if (!customer) return <div className="page"><p className="empty">Customer not found.</p></div>;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} /> Back
          </button>
          <h2 style={{ fontSize: '22px' }}>{customer.name}</h2>
        </div>
        {canEdit && (
          <button className="btn btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}>
            <Edit3 size={15} /> Edit Customer
          </button>
        )}
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3><User size={16} /> Customer Profile</h3>
          <dl className="detail-list">
            <dt>Mobile</dt><dd>{customer.mobile}</dd>
            <dt>Email</dt><dd>{customer.email ?? <span className="text-muted">—</span>}</dd>
            <dt>Business</dt><dd>{customer.business_name ?? <span className="text-muted">—</span>}</dd>
            <dt>GST ID</dt><dd>{customer.gst_number ?? <span className="text-muted">—</span>}</dd>
            <dt>Type</dt><dd><StatusBadge status={customer.customer_type} /></dd>
            <dt>Status</dt><dd><StatusBadge status={customer.status} /></dd>
            <dt>Follow-up</dt>
            <dd>
              {customer.follow_up_date ? (
                <strong>{new Date(customer.follow_up_date).toLocaleDateString()}</strong>
              ) : (
                <span className="text-muted">—</span>
              )}
            </dd>
            <dt>Address</dt><dd style={{ fontSize: '13px' }}>{customer.address ?? <span className="text-muted">—</span>}</dd>
          </dl>
        </div>

        <div className="detail-card">
          <h3><MessageSquare size={16} /> Timeline Notes</h3>
          {canEdit && (
            <form onSubmit={handleAddNote} className="note-form">
              <textarea 
                value={newNote} 
                onChange={e => setNewNote(e.target.value)} 
                placeholder="Write a timeline note about follow-up, meeting details, call summary..." 
                rows={3} 
                required
              />
              <button type="submit" className="btn btn-primary" disabled={noteSaving || !newNote.trim()}>
                {noteSaving ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          )}
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '20px 0' }} />
          
          <div className="notes-list">
            {notes.length === 0 && (
              <div className="empty-state" style={{ padding: '24px' }}>
                <FileText className="empty-state-icon" size={32} />
                <p className="text-muted">No notes yet. Add one to track communication timeline.</p>
              </div>
            )}
            {notes.map(n => (
              <div key={n.id} className="note-item">
                <p>{n.note}</p>
                <div className="note-item-meta">
                  <span style={{ fontWeight: 600, color: 'var(--text)' }}>{n.created_by_name}</span>
                  <span>·</span>
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
