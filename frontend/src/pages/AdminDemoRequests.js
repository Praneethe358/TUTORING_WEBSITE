import React, { useState, useEffect, useCallback } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../lib/api';
import { colors, borderRadius, shadows } from '../theme/designSystem';

const statusColors = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  scheduled: { bg: '#DBEAFE', text: '#1E40AF', label: 'Scheduled' },
  completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' },
  converted: { bg: '#EDE9FE', text: '#5B21B6', label: 'Converted' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' }
};

const AdminDemoRequests = () => {
  const [requests, setRequests] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modal, setModal] = useState(null); // 'edit' | 'convert' | null
  const [editForm, setEditForm] = useState({});
  const [convertForm, setConvertForm] = useState({ email: '', password: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/admin/demo-requests', { params });
      setRequests(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching demo requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  const fetchTutors = useCallback(async () => {
    try {
      const res = await api.get('/admin/tutors');
      setTutors(res.data.data || res.data.tutors || []);
    } catch (err) {
      console.error('Error fetching tutors:', err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchTutors();
  }, [fetchRequests, fetchTutors]);

  const openEdit = (req) => {
    setSelectedRequest(req);
    setEditForm({
      status: req.status,
      assignedTutor: req.assignedTutor?._id || '',
      scheduledDate: req.scheduledDate ? req.scheduledDate.split('T')[0] : '',
      scheduledTime: req.scheduledTime || '',
      adminNotes: req.adminNotes || ''
    });
    setModal('edit');
  };

  const openConvert = (req) => {
    setSelectedRequest(req);
    setConvertForm({ email: req.contactEmail || '', password: '' });
    setModal('convert');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/admin/demo-requests/${selectedRequest._id}`, editForm);
      setModal(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post(`/admin/demo-requests/${selectedRequest._id}/convert`, convertForm);
      setModal(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Conversion failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this demo request?')) return;
    try {
      await api.delete(`/admin/demo-requests/${id}`);
      fetchRequests();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md, fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: colors.textSecondary, marginBottom: '4px'
  };

  return (
    <AdminDashboardLayout>
      <style>{`
        .demo-table { display: table; }
        .demo-cards { display: none; }
        @media (max-width: 768px) {
          .demo-table { display: none !important; }
          .demo-cards { display: grid !important; }
          .demo-filter-tabs { gap: 6px !important; }
          .demo-filter-tabs button { padding: 6px 12px !important; font-size: 12px !important; }
          .demo-modal-content { padding: 20px !important; }
          .demo-modal-actions { flex-direction: column !important; }
          .demo-modal-actions button { width: 100% !important; }
        }
      `}</style>
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>
            🎯 Demo Requests
          </h1>
          <p style={{ color: colors.textSecondary, marginTop: '4px', fontSize: '14px' }}>
            Manage demo class bookings — assign tutors, schedule, and convert to students
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="demo-filter-tabs" style={{
          display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap'
        }}>
          {['all', 'pending', 'scheduled', 'completed', 'converted', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1); }}
              style={{
                padding: '8px 18px', borderRadius: '20px', border: 'none',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                background: filter === s ? colors.primary : '#f3f4f6',
                color: filter === s ? 'white' : colors.textSecondary,
                transition: 'all 0.2s'
              }}
            >
              {s === 'all' ? '📋 All' : `${statusColors[s]?.label || s}`}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            background: 'white', borderRadius: borderRadius.lg, boxShadow: shadows.sm
          }}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p style={{ color: colors.textSecondary, marginTop: '12px' }}>No demo requests found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="demo-table" style={{
              background: 'white', borderRadius: borderRadius.lg,
              boxShadow: shadows.sm, overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: `2px solid ${colors.border}` }}>
                      {['Student', 'Grade', 'Subjects', 'Contact', 'Time Slot', 'Status', 'Tutor', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '12px 14px', textAlign: 'left', fontWeight: '600',
                          color: colors.textSecondary, fontSize: '12px', textTransform: 'uppercase',
                          letterSpacing: '0.5px', whiteSpace: 'nowrap'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const sc = statusColors[req.status] || statusColors.pending;
                      return (
                        <tr key={req._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                          <td style={{ padding: '12px 14px', fontWeight: '500' }}>{req.studentName}</td>
                          <td style={{ padding: '12px 14px' }}>{req.classGrade}</td>
                          <td style={{ padding: '12px 14px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {req.subjects}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontSize: '13px' }}>{req.contactPhone}</div>
                            {req.contactEmail && <div style={{ fontSize: '12px', color: colors.textSecondary }}>{req.contactEmail}</div>}
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontSize: '13px' }}>{req.preferredTimeSlot}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
                              fontSize: '12px', fontWeight: '600',
                              background: sc.bg, color: sc.text
                            }}>
                              {sc.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '13px' }}>
                            {req.assignedTutor?.name || '—'}
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => openEdit(req)} style={{
                              padding: '5px 10px', fontSize: '12px', border: `1px solid ${colors.primary}`,
                              background: 'white', color: colors.primary, borderRadius: '6px',
                              cursor: 'pointer', marginRight: '6px', fontWeight: '500'
                            }}>✏️ Edit</button>
                            {req.status === 'completed' && (
                              <button onClick={() => openConvert(req)} style={{
                                padding: '5px 10px', fontSize: '12px', border: 'none',
                                background: '#7C3AED', color: 'white', borderRadius: '6px',
                                cursor: 'pointer', marginRight: '6px', fontWeight: '500'
                              }}>🎓 Convert</button>
                            )}
                            <button onClick={() => handleDelete(req._id)} style={{
                              padding: '5px 10px', fontSize: '12px', border: `1px solid #EF4444`,
                              background: 'white', color: '#EF4444', borderRadius: '6px',
                              cursor: 'pointer', fontWeight: '500'
                            }}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="demo-cards" style={{ display: 'none', gridTemplateColumns: '1fr', gap: '12px' }}>
              {requests.map((req) => {
                const sc = statusColors[req.status] || statusColors.pending;
                return (
                  <div key={req._id} style={{
                    background: 'white', borderRadius: borderRadius.lg, boxShadow: shadows.sm,
                    padding: '16px', border: `1px solid ${colors.border}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: colors.textPrimary }}>{req.studentName}</div>
                        <div style={{ fontSize: '13px', color: colors.textSecondary }}>{req.classGrade} • {req.subjects}</div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
                        background: sc.bg, color: sc.text, whiteSpace: 'nowrap'
                      }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
                      📞 {req.contactPhone}
                      {req.contactEmail && <span> • ✉️ {req.contactEmail}</span>}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '6px' }}>
                      ⏰ {req.preferredTimeSlot}
                      {req.assignedTutor?.name && <span> • 👨‍🏫 {req.assignedTutor.name}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(req)} style={{
                        padding: '7px 14px', fontSize: '12px', border: `1px solid ${colors.primary}`,
                        background: 'white', color: colors.primary, borderRadius: '6px',
                        cursor: 'pointer', fontWeight: '500', flex: 1
                      }}>✏️ Edit</button>
                      {req.status === 'completed' && (
                        <button onClick={() => openConvert(req)} style={{
                          padding: '7px 14px', fontSize: '12px', border: 'none',
                          background: '#7C3AED', color: 'white', borderRadius: '6px',
                          cursor: 'pointer', fontWeight: '500', flex: 1
                        }}>🎓 Convert</button>
                      )}
                      <button onClick={() => handleDelete(req._id)} style={{
                        padding: '7px 14px', fontSize: '12px', border: `1px solid #EF4444`,
                        background: 'white', color: '#EF4444', borderRadius: '6px',
                        cursor: 'pointer', fontWeight: '500'
                      }}>🗑️</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px',
                padding: '16px', marginTop: '8px'
              }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
                <span style={{ padding: '6px 14px', fontSize: '14px', color: colors.textSecondary }}>
                  Page {page} of {totalPages}
                </span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>Next →</button>
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        {modal === 'edit' && selectedRequest && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }} onClick={() => setModal(null)}>
            <div style={{
              background: 'white', borderRadius: borderRadius.lg, padding: '28px',
              width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto',
              boxShadow: shadows.xl
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: colors.textPrimary }}>
                Edit Demo Request
              </h2>
              <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '20px' }}>
                {selectedRequest.studentName} — {selectedRequest.classGrade}
              </p>

              <form onSubmit={handleUpdate}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Status</label>
                  <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                    style={{ ...inputStyle, background: 'white' }}>
                    {Object.entries(statusColors).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Assign Tutor</label>
                  <select value={editForm.assignedTutor} onChange={e => setEditForm(f => ({ ...f, assignedTutor: e.target.value }))}
                    style={{ ...inputStyle, background: 'white' }}>
                    <option value="">— Not Assigned —</option>
                    {tutors.map(t => (
                      <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Scheduled Date</label>
                    <input type="date" value={editForm.scheduledDate}
                      onChange={e => setEditForm(f => ({ ...f, scheduledDate: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Scheduled Time</label>
                    <input type="time" value={editForm.scheduledTime}
                      onChange={e => setEditForm(f => ({ ...f, scheduledTime: e.target.value }))}
                      style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Admin Notes</label>
                  <textarea value={editForm.adminNotes}
                    onChange={e => setEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="Internal notes..." />
                </div>

                <div className="demo-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModal(null)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'white', cursor: 'pointer', fontWeight: '500' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none',
                      background: colors.primary, color: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600', opacity: actionLoading ? 0.7 : 1
                    }}>
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Convert Modal */}
        {modal === 'convert' && selectedRequest && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }} onClick={() => setModal(null)}>
            <div style={{
              background: 'white', borderRadius: borderRadius.lg, padding: '28px',
              width: '90%', maxWidth: '450px', boxShadow: shadows.xl
            }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: colors.textPrimary }}>
                🎓 Convert to Student
              </h2>
              <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '20px' }}>
                Create a student account for <strong>{selectedRequest.studentName}</strong>
              </p>

              <form onSubmit={handleConvert}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Email (for login)</label>
                  <input type="email" required value={convertForm.email}
                    onChange={e => setConvertForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle} placeholder="student@example.com" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" required value={convertForm.password}
                    onChange={e => setConvertForm(f => ({ ...f, password: e.target.value }))}
                    style={inputStyle} placeholder="Create a password" minLength={6} />
                </div>

                <div style={{
                  background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '8px',
                  padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#92400E'
                }}>
                  <strong>ℹ️ Note:</strong> This will create a student account with the name "{selectedRequest.studentName}" and the phone number from the demo request.
                </div>

                <div className="demo-modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setModal(null)}
                    style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'white', cursor: 'pointer', fontWeight: '500' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={actionLoading}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none',
                      background: '#7C3AED', color: 'white', cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontWeight: '600', opacity: actionLoading ? 0.7 : 1
                    }}>
                    {actionLoading ? 'Converting...' : '🎓 Create Student Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDemoRequests;
