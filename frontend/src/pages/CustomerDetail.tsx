import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersApi } from '../api/customers';
import { Customer, CustomerNote } from '../types';
import StatusBadge from '../components/common/StatusBadge';
import Toast from '../components/common/Toast';
import { useAuth } from '../context/AuthContext';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([customersApi.get(id), customersApi.getNotes(id)])
      .then(([c, n]) => { setCustomer(c.data.data); setNotes(n.data.data); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newNote.trim()) return;
    try {
      const res = await customersApi.addNote(id, newNote);
      setNotes([res.data.data, ...notes]);
      setNewNote('');
      setToast({ message: 'Note added', type: 'success' });
    } catch {
      setToast({ message: 'Failed to add note', type: 'error' });
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'sales';

  if (loading) return <div className="loading">Loading...</div>;
  if (!customer) return <div className="page"><p>Customer not found.</p></div>;

  return (
    <div className="page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/customers')}>← Back</button>
          <h2>{customer.name}</h2>
        </div>
        {canEdit && <button className="btn btn-secondary" onClick={() => navigate(`/customers/${id}/edit`)}>Edit</button>}
      </div>
      <div className="detail-grid">
        <div className="detail-card">
          <h3>Profile</h3>
          <dl>
            <dt>Mobile</dt><dd>{customer.mobile}</dd>
            <dt>Email</dt><dd>{customer.email ?? '—'}</dd>
            <dt>Business</dt><dd>{customer.business_name ?? '—'}</dd>
            <dt>GST</dt><dd>{customer.gst_number ?? '—'}</dd>
            <dt>Type</dt><dd><StatusBadge status={customer.customer_type} /></dd>
            <dt>Status</dt><dd><StatusBadge status={customer.status} /></dd>
            <dt>Follow-up</dt><dd>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '—'}</dd>
            <dt>Address</dt><dd>{customer.address ?? '—'}</dd>
          </dl>
        </div>
        <div className="detail-card">
          <h3>Notes Timeline</h3>
          {canEdit && (
            <form onSubmit={handleAddNote} className="note-form">
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." rows={3} />
              <button type="submit" className="btn btn-primary" disabled={!newNote.trim()}>Add Note</button>
            </form>
          )}
          <div className="notes-list">
            {notes.length === 0 && <p className="empty">No notes yet.</p>}
            {notes.map(n => (
              <div key={n.id} className="note-item">
                <p>{n.note}</p>
                <small>{n.created_by_name} · {new Date(n.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
