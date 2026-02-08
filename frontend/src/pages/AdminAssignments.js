import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * ADMIN TUTOR-STUDENT ASSIGNMENTS PAGE
 * Admin can assign tutors to students, view/edit/remove assignments
 */
const AdminAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [assignMode, setAssignMode] = useState('single'); // 'single' | 'bulk-students' | 'bulk-tutors'
  const [filterTutor, setFilterTutor] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [form, setForm] = useState({
    tutorId: '',
    studentId: '',
    studentIds: [],
    tutorIds: [],
    subject: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTutor, filterStudent]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filterTutor) params.tutor = filterTutor;
      if (filterStudent) params.student = filterStudent;

      const [assignRes, tutorRes, studentRes] = await Promise.all([
        api.get('/admin/assignments', { params }),
        api.get('/admin/tutors'),
        api.get('/admin/students')
      ]);

      setAssignments(assignRes.data?.data || []);
      // Only show approved tutors for assignment
      const allTutors = tutorRes.data?.tutors || tutorRes.data?.data || [];
      setTutors(allTutors.filter(t => t.status === 'approved'));
      setStudents(studentRes.data?.students || studentRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ tutorId: '', studentId: '', studentIds: [], tutorIds: [], subject: '', notes: '' });
    setEditingAssignment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      if (assignMode === 'single') {
        if (!form.tutorId || !form.studentId) {
          setError('Please select both a tutor and a student');
          return;
        }
        await api.post('/admin/assignments', {
          tutorId: form.tutorId,
          studentId: form.studentId,
          subject: form.subject,
          notes: form.notes
        });
        setMessage('Assignment created successfully!');
      } else if (assignMode === 'bulk-students') {
        if (!form.tutorId || form.studentIds.length === 0) {
          setError('Please select a tutor and at least one student');
          return;
        }
        const res = await api.post('/admin/assignments/bulk', {
          tutorId: form.tutorId,
          studentIds: form.studentIds,
          subject: form.subject,
          notes: form.notes
        });
        setMessage(res.data?.message || 'Bulk assignment complete');
      } else if (assignMode === 'bulk-tutors') {
        if (!form.studentId || form.tutorIds.length === 0) {
          setError('Please select a student and at least one tutor');
          return;
        }
        const res = await api.post('/admin/assignments/bulk', {
          studentId: form.studentId,
          tutorIds: form.tutorIds,
          subject: form.subject,
          notes: form.notes
        });
        setMessage(res.data?.message || 'Bulk assignment complete');
      }

      resetForm();
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleUpdate = async (id) => {
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/assignments/${id}`, {
        subject: editingAssignment.subject,
        notes: editingAssignment.notes,
        status: editingAssignment.status
      });
      setMessage('Assignment updated');
      setEditingAssignment(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this tutor-student assignment?')) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/assignments/${id}`);
      setMessage('Assignment removed');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleToggleStatus = async (assignment) => {
    try {
      const newStatus = assignment.status === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/assignments/${assignment._id}`, { status: newStatus });
      setMessage(`Assignment ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Styles
  const cardStyle = {
    background: colors.white,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.gray200}`,
    padding: spacing.xl,
    boxShadow: shadows.sm,
  };

  const inputStyle = {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.gray300}`,
    fontSize: typography.fontSize.sm,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const btnPrimary = {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    border: 'none',
    background: colors.accent,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const btnSecondary = {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.gray300}`,
    background: colors.white,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  const btnDanger = {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: 'none',
    background: colors.error,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.xs,
    cursor: 'pointer',
  };

  const badgeStyle = (status) => ({
    display: 'inline-block',
    padding: `2px ${spacing.sm}`,
    borderRadius: '999px',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    background: status === 'active' ? '#dcfce7' : '#fee2e2',
    color: status === 'active' ? '#166534' : '#991b1b',
  });

  const tabStyle = (active) => ({
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: borderRadius.md,
    border: 'none',
    background: active ? colors.accent : colors.gray100,
    color: active ? colors.white : colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <AdminDashboardLayout>
      <div style={{ padding: spacing.xl }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <div>
            <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, margin: 0 }}>
              🔗 Tutor–Student Assignments
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
              Assign tutors to students. Only assigned students will appear in tutor's class creation.
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
            style={btnPrimary}
          >
            {showForm ? 'Cancel' : '+ New Assignment'}
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div style={{ padding: spacing.md, borderRadius: borderRadius.md, background: '#dcfce7', color: '#166534', marginBottom: spacing.md, border: '1px solid #bbf7d0' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: spacing.md, borderRadius: borderRadius.md, background: '#fee2e2', color: '#991b1b', marginBottom: spacing.md, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Create Assignment Form */}
        {showForm && (
          <div style={{ ...cardStyle, marginBottom: spacing.xl }}>
            <h2 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.lg, color: colors.textPrimary }}>
              Create Assignment
            </h2>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.lg }}>
              <button style={tabStyle(assignMode === 'single')} onClick={() => setAssignMode('single')}>Single Assignment</button>
              <button style={tabStyle(assignMode === 'bulk-students')} onClick={() => setAssignMode('bulk-students')}>One Tutor → Many Students</button>
              <button style={tabStyle(assignMode === 'bulk-tutors')} onClick={() => setAssignMode('bulk-tutors')}>Many Tutors → One Student</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg }}>
                {/* Tutor Selection */}
                {(assignMode === 'single' || assignMode === 'bulk-students') && (
                  <div>
                    <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>
                      Tutor *
                    </label>
                    <select
                      value={form.tutorId}
                      onChange={e => setForm({ ...form, tutorId: e.target.value })}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select a tutor</option>
                      {tutors.map(t => (
                        <option key={t._id} value={t._id}>{t.name} — {t.email} ({(t.subjects || []).join(', ')})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Student Selection (single) */}
                {assignMode === 'single' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>
                      Student *
                    </label>
                    <select
                      value={form.studentId}
                      onChange={e => setForm({ ...form, studentId: e.target.value })}
                      style={inputStyle}
                      required
                    >
                      <option value="">Select a student</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Student Selection (bulk - multiple) */}
                {assignMode === 'bulk-students' && (
                  <div>
                    <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>
                      Students * (select multiple)
                    </label>
                    <select
                      multiple
                      value={form.studentIds}
                      onChange={e => setForm({ ...form, studentIds: Array.from(e.target.selectedOptions, o => o.value) })}
                      style={{ ...inputStyle, height: '150px' }}
                      required
                    >
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                      ))}
                    </select>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: '4px' }}>Hold Ctrl/Cmd to select multiple</p>
                  </div>
                )}

                {/* Tutor Selection (bulk - multiple tutors) */}
                {assignMode === 'bulk-tutors' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>
                        Tutors * (select multiple)
                      </label>
                      <select
                        multiple
                        value={form.tutorIds}
                        onChange={e => setForm({ ...form, tutorIds: Array.from(e.target.selectedOptions, o => o.value) })}
                        style={{ ...inputStyle, height: '150px' }}
                        required
                      >
                        {tutors.map(t => (
                          <option key={t._id} value={t._id}>{t.name} — {t.subjects?.join(', ')}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: '4px' }}>Hold Ctrl/Cmd to select multiple</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>
                        Student *
                      </label>
                      <select
                        value={form.studentId}
                        onChange={e => setForm({ ...form, studentId: e.target.value })}
                        style={inputStyle}
                        required
                      >
                        <option value="">Select a student</option>
                        {students.map(s => (
                          <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Subject & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing.lg, marginTop: spacing.lg }}>
                <div>
                  <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: typography.fontWeight.medium, fontSize: typography.fontSize.sm, marginBottom: spacing.xs, color: colors.textPrimary }}>Notes</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: spacing.md, marginTop: spacing.lg }}>
                <button type="submit" style={btnPrimary}>Create Assignment</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={btnSecondary}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ ...cardStyle, marginBottom: spacing.lg, display: 'flex', gap: spacing.lg, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: '4px' }}>Filter by Tutor</label>
            <select value={filterTutor} onChange={e => setFilterTutor(e.target.value)} style={inputStyle}>
              <option value="">All Tutors</option>
              {tutors.map(t => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: '4px' }}>Filter by Student</label>
            <select value={filterStudent} onChange={e => setFilterStudent(e.target.value)} style={inputStyle}>
              <option value="">All Students</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterTutor(''); setFilterStudent(''); }} style={btnSecondary}>Clear Filters</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: spacing.md, marginBottom: spacing.xl }}>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.accent }}>{assignments.length}</div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Total Assignments</div>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: '#16a34a' }}>{assignments.filter(a => a.status === 'active').length}</div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Active</div>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: '#dc2626' }}>{assignments.filter(a => a.status === 'inactive').length}</div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Inactive</div>
          </div>
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary }}>{new Set(assignments.map(a => a.tutor?._id)).size}</div>
            <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Tutors Assigned</div>
          </div>
        </div>

        {/* Assignments Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['3xl'], color: colors.textSecondary }}>Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: spacing['3xl'] }}>
            <div style={{ fontSize: '48px', marginBottom: spacing.md }}>🔗</div>
            <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.md }}>No assignments yet</p>
            <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm }}>Click "+ New Assignment" to assign tutors to students</p>
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.gray200}` }}>
                    {['Tutor', 'Student', 'Subject', 'Status', 'Assigned On', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: `${spacing.md} ${spacing.sm}`, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary, textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a._id} style={{ borderBottom: `1px solid ${colors.gray100}` }}>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}` }}>
                        <div style={{ fontWeight: typography.fontWeight.medium, color: colors.textPrimary, fontSize: typography.fontSize.sm }}>{a.tutor?.name || 'N/A'}</div>
                        <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>{a.tutor?.email}</div>
                      </td>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}` }}>
                        <div style={{ fontWeight: typography.fontWeight.medium, color: colors.textPrimary, fontSize: typography.fontSize.sm }}>{a.student?.name || 'N/A'}</div>
                        <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>{a.student?.email}</div>
                      </td>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}`, fontSize: typography.fontSize.sm, color: colors.textSecondary }}>
                        {editingAssignment?._id === a._id ? (
                          <input
                            value={editingAssignment.subject}
                            onChange={e => setEditingAssignment({ ...editingAssignment, subject: e.target.value })}
                            style={{ ...inputStyle, width: '140px' }}
                          />
                        ) : (a.subject || '—')}
                      </td>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}` }}>
                        <span
                          style={{ ...badgeStyle(a.status), cursor: 'pointer' }}
                          onClick={() => handleToggleStatus(a)}
                          title="Click to toggle status"
                        >
                          {a.status}
                        </span>
                      </td>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}`, fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: `${spacing.md} ${spacing.sm}` }}>
                        {editingAssignment?._id === a._id ? (
                          <div style={{ display: 'flex', gap: spacing.xs }}>
                            <button onClick={() => handleUpdate(a._id)} style={{ ...btnPrimary, padding: `${spacing.xs} ${spacing.sm}`, fontSize: typography.fontSize.xs }}>Save</button>
                            <button onClick={() => setEditingAssignment(null)} style={{ ...btnSecondary, padding: `${spacing.xs} ${spacing.sm}`, fontSize: typography.fontSize.xs }}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: spacing.xs }}>
                            <button onClick={() => setEditingAssignment({ ...a })} style={{ ...btnSecondary, padding: `${spacing.xs} ${spacing.sm}`, fontSize: typography.fontSize.xs }}>Edit</button>
                            <button onClick={() => handleDelete(a._id)} style={{ ...btnDanger, padding: `${spacing.xs} ${spacing.sm}` }}>Remove</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAssignments;
