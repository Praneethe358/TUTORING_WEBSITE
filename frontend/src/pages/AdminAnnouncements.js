import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';
import api from '../lib/api';

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

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-slate-100 text-slate-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Announcements Management</h1>
          <p className="text-slate-400 mt-1">Create and manage platform announcements</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Announcement'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-300">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <form onSubmit={createAnnouncement} className="mb-8 p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={onChange}
              required
              placeholder="Announcement title"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Content *</label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              required
              rows="5"
              placeholder="Announcement content..."
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Target Audience</label>
              <select
                name="targetRole"
                value={form.targetRole}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="tutor">Tutors Only</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
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

          <div>
            <label className="block text-sm text-slate-300 mb-2">Expires At (Optional)</label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPinned"
                checked={form.isPinned}
                onChange={onChange}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">Pin to top</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="publishNow"
                checked={form.publishNow}
                onChange={onChange}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">Publish immediately</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              {editingId ? 'Update' : 'Create'} Announcement
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading announcements...</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400">No announcements yet</p>
          <p className="text-sm text-slate-500 mt-2">Create your first announcement to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div
              key={announcement._id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {announcement.isPinned && '📌 '}
                      {announcement.title}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                      {announcement.status}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-3">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Target: {announcement.targetRole}</span>
                    <span>Category: {announcement.category || 'general'}</span>
                    <span>Views: {announcement.viewCount || 0}</span>
                    <span>Read by: {announcement.readBy?.length || 0}</span>
                    {announcement.expiresAt && (
                      <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500 mt-2">
                    Created: {new Date(announcement.createdAt).toLocaleString()}
                    {announcement.publishedAt && ` • Published: ${new Date(announcement.publishedAt).toLocaleString()}`}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => editAnnouncement(announcement)}
                    className="px-3 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAnnouncement(announcement._id)}
                    className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminAnnouncements;
