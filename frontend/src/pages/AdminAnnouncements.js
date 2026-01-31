import React, { useEffect, useState } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../lib/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * ADMIN ANNOUNCEMENTS MANAGEMENT
 * Create, edit, and manage platform-wide announcements
 */
const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    content: '',
    targetRole: 'all',
    priority: 'medium',
    category: 'general',
    isPinned: false,
    publishNow: false,
    expiresAt: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      // Get all announcements including drafts
      const res = await api.get('/announcements?limit=100');
      setAnnouncements(res.data.data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const resetForm = () => {
    setForm({
      title: '',
      content: '',
      targetRole: 'all',
      priority: 'medium',
      category: 'general',
      isPinned: false,
      publishNow: false,
      expiresAt: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const data = { ...form };
      if (data.expiresAt) {
        data.expiresAt = new Date(data.expiresAt).toISOString();
      }
      
      if (editingId) {
        await api.put(`/announcements/${editingId}`, data);
        setMessage('Announcement updated successfully');
      } else {
        await api.post('/announcements', data);
        setMessage('Announcement created successfully');
      }
      
      resetForm();
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    }
  };

  const editAnnouncement = (announcement) => {
    setForm({
      title: announcement.title,
      content: announcement.content,
      targetRole: announcement.targetRole,
      priority: announcement.priority,
      category: announcement.category || 'general',
      isPinned: announcement.isPinned || false,
      publishNow: announcement.status === 'published',
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingId(announcement._id);
    setShowForm(true);
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    
    try {
      await api.delete(`/announcements/${id}`);
      setMessage('Announcement deleted');
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    const styles = {
      low: { backgroundColor: '#f3f4f6', color: '#1f2937' },
      medium: { backgroundColor: '#dbeafe', color: '#1e40af' },
      high: { backgroundColor: '#fed7aa', color: '#9a3412' },
      urgent: { backgroundColor: '#fecaca', color: '#991b1b' }
    };
    return {
      ...styles[priority] || styles.medium,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      display: 'inline-block'
    };
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      draft: { backgroundColor: '#f3f4f6', color: '#1f2937' },
      published: { backgroundColor: '#d1fae5', color: '#065f46' },
      archived: { backgroundColor: '#f1f5f9', color: '#475569' }
    };
    return {
      ...styles[status] || styles.draft,
      padding: `${spacing.xs} ${spacing.md}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      display: 'inline-block'
    };
  };

  return (
    <AdminDashboardLayout>
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'clamp(1rem, 2vw, 1.5rem)', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
              Announcements Management
            </h1>
            <p style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
              Create and manage platform announcements
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            style={{
              padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
              borderRadius: borderRadius.md,
              backgroundColor: colors.primary,
              color: colors.white,
              fontWeight: typography.fontWeight.medium,
              border: 'none',
              cursor: 'pointer',
              minHeight: '44px',
              width: '100%',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            {showForm ? 'Cancel' : '+ Create Announcement'}
          </button>
        </div>

        {message && (
          <div style={{ marginBottom: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.md, backgroundColor: '#d1fae5', border: `1px solid #059669`, color: '#065f46' }}>
            {message}
          </div>
        )}
        
        {error && (
          <div style={{ marginBottom: spacing.lg, padding: spacing.lg, borderRadius: borderRadius.md, backgroundColor: '#fee2e2', border: `1px solid #dc2626`, color: '#991b1b' }}>
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <form onSubmit={createAnnouncement} style={{ marginBottom: spacing['3xl'], padding: spacing['2xl'], borderRadius: borderRadius.lg, backgroundColor: colors.white, boxShadow: shadows.md }}>
            <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.lg }}>
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            
            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                required
                placeholder="Announcement title"
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  color: colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Content *</label>
              <textarea
                name="content"
                value={form.content}
                onChange={onChange}
                required
                rows="5"
                placeholder="Announcement content..."
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  color: colors.textPrimary,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg, marginBottom: spacing.lg }}>
              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Target Audience</label>
                <select
                  name="targetRole"
                  value={form.targetRole}
                  onChange={onChange}
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray300}`,
                    color: colors.textPrimary,
                    outline: 'none'
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="student">Students Only</option>
                  <option value="tutor">Tutors Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={onChange}
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray300}`,
                    color: colors.textPrimary,
                    outline: 'none'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={onChange}
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray300}`,
                    color: colors.textPrimary,
                    outline: 'none'
                  }}
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="feature">New Feature</option>
                  <option value="policy">Policy Update</option>
                  <option value="event">Event</option>
                  <option value="holiday">Holiday</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>Expires At (Optional)</label>
              <input
                type="datetime-local"
                name="expiresAt"
                value={form.expiresAt}
                onChange={onChange}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  color: colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: spacing['2xl'], marginBottom: spacing.lg }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <input
                  type="checkbox"
                  name="isPinned"
                  checked={form.isPinned}
                  onChange={onChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary }}>Pin to top</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
                <input
                  type="checkbox"
                  name="publishNow"
                  checked={form.publishNow}
                  onChange={onChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary }}>Publish immediately</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: spacing.md }}>
              <button
                type="submit"
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.primary,
                  color: colors.white,
                  fontWeight: typography.fontWeight.medium,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
              >
                {editingId ? 'Update' : 'Create'} Announcement
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.gray200,
                  color: colors.textPrimary,
                  fontWeight: typography.fontWeight.medium,
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray300}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray200}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Announcements List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['4xl'], color: colors.textSecondary }}>Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: spacing['4xl'], backgroundColor: colors.white, borderRadius: borderRadius.lg, boxShadow: shadows.md }}>
            <p style={{ color: colors.textSecondary }}>No announcements yet</p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.textTertiary, marginTop: spacing.sm }}>Create your first announcement to get started</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
            {announcements.map(announcement => (
              <div
                key={announcement._id}
                style={{
                  backgroundColor: colors.white,
                  borderRadius: borderRadius.lg,
                  padding: spacing['2xl'],
                  boxShadow: shadows.md,
                  border: `1px solid ${colors.gray200}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                      <h3 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>
                        {announcement.isPinned && '📌 '}
                        {announcement.title}
                      </h3>
                      <span style={getStatusBadgeStyle(announcement.status)}>
                        {announcement.status}
                      </span>
                      <span style={getPriorityBadgeStyle(announcement.priority)}>
                        {announcement.priority}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.md }}>
                      {announcement.content}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
                      <span>Target: {announcement.targetRole}</span>
                      <span>Category: {announcement.category || 'general'}</span>
                      <span>Views: {announcement.viewCount || 0}</span>
                      <span>Read by: {announcement.readBy?.length || 0}</span>
                      {announcement.expiresAt && (
                        <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.textTertiary, marginTop: spacing.sm }}>
                      Created: {new Date(announcement.createdAt).toLocaleString()}
                      {announcement.publishedAt && ` • Published: ${new Date(announcement.publishedAt).toLocaleString()}`}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: spacing.sm }}>
                    <button
                      onClick={() => editAnnouncement(announcement)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: '#dbeafe',
                        border: `1px solid #3b82f6`,
                        color: '#1e40af',
                        fontSize: typography.fontSize.sm,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bfdbfe'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(announcement._id)}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: '#fee2e2',
                        border: `1px solid #ef4444`,
                        color: '#991b1b',
                        fontSize: typography.fontSize.sm,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAnnouncements;
