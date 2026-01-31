import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';
import { useToast } from '../context/ToastContext';

const AdminStudents = () => {
  const { success, error: showError } = useToast();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/students', {
        params: { 
          search: search || undefined, 
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page, 
          limit: 10 
        }
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (studentId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.patch(`/admin/users/${studentId}/status`, { status: newStatus });
      loadStudents();
    } catch (err) {
      alert('Status update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewProfile = async (student) => {
    try {
      const res = await api.get(`/admin/students/${student._id}/profile`);
      setSelectedStudent(res.data.student || student);
      setShowProfileModal(true);
    } catch (err) {
      console.log('Profile details not available, using basic info');
      setSelectedStudent(student);
      setShowProfileModal(true);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/admin/export/students', { 
        responseType: 'blob',
        params: { 
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Students exported successfully!');
    } catch (err) {
      showError('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/admin/users/student/${studentId}`);
      loadStudents();
      setDeleteStudent(null);
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <AdminDashboardLayout>
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
          <h1 style={{ 
            fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.sm
          }}>
            Student Management
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            View and manage all registered students
          </p>
        </div>

        <div style={{ marginBottom: spacing.xl }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)', marginBottom: spacing.md }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                flex: 1,
                minWidth: '100%',
                padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.white,
                border: `1px solid ${colors.gray300}`,
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                color: colors.textPrimary,
                minHeight: '44px'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.white,
                border: `1px solid ${colors.gray300}`,
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                color: colors.textPrimary,
                cursor: 'pointer',
                minHeight: '44px'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              style={{
                padding: `${spacing.md} ${spacing.lg}`,
                backgroundColor: colors.accent,
                color: colors.white,
                border: 'none',
                borderRadius: borderRadius.lg,
                fontWeight: typography.fontWeight.semibold,
                cursor: exportLoading ? 'not-allowed' : 'pointer',
                fontSize: typography.fontSize.base,
                opacity: exportLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !exportLoading && (e.currentTarget.style.backgroundColor = '#5b4bcd')}
              onMouseLeave={(e) => !exportLoading && (e.currentTarget.style.backgroundColor = colors.accent)}
            >
              {exportLoading ? '📥 Exporting...' : '📥 Export CSV'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            padding: spacing.lg,
            backgroundColor: '#fee2e2',
            border: `1px solid #fca5a5`,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg,
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        <div style={{
          backgroundColor: colors.white,
          borderRadius: borderRadius.xl,
          boxShadow: shadows.sm,
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              Loading students...
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              No students found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray100, borderBottom: `2px solid ${colors.gray200}` }}>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Name</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Email</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Phone</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Status</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Joined</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student._id} style={{ 
                      borderBottom: `1px solid ${colors.gray200}`,
                      backgroundColor: idx % 2 === 0 ? colors.white : colors.gray50
                    }}>
                      <td style={{ padding: spacing.lg, fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{student.name}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{student.email}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{student.phone || 'N/A'}</td>
                      <td style={{ padding: spacing.lg }}>
                        <button
                          onClick={() => handleToggleStatus(student._id, student.status || 'active')}
                          style={{
                            padding: `${spacing.xs} ${spacing.md}`,
                            borderRadius: borderRadius.full,
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.semibold,
                            textTransform: 'capitalize',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: (student.status || 'active') === 'active' ? '#d1fae5' : '#fee2e2',
                            color: (student.status || 'active') === 'active' ? '#065f46' : '#991b1b'
                          }}
                        >
                          {(student.status || 'active') === 'active' ? '✓ Active' : '✗ Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: spacing.lg }}>
                        <div style={{ display: 'flex', gap: spacing.sm }}>
                          <button
                            onClick={() => handleViewProfile(student)}
                            style={{
                              padding: `${spacing.sm} ${spacing.md}`,
                              backgroundColor: colors.info,
                              color: colors.white,
                              border: 'none',
                              borderRadius: borderRadius.md,
                              fontWeight: typography.fontWeight.medium,
                              cursor: 'pointer',
                              fontSize: typography.fontSize.sm
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.info}
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteStudent(student._id)}
                            style={{
                              padding: `${spacing.sm} ${spacing.md}`,
                              backgroundColor: colors.error,
                              color: colors.white,
                              border: 'none',
                              borderRadius: borderRadius.md,
                              fontWeight: typography.fontWeight.medium,
                              cursor: 'pointer',
                              fontSize: typography.fontSize.sm
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.error}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {deleteStudent && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}>
            <div style={{
              backgroundColor: colors.white,
              padding: spacing['2xl'],
              borderRadius: borderRadius.xl,
              maxWidth: '400px',
              width: '90%',
              boxShadow: shadows.lg
            }}>
              <h2 style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.lg
              }}>
                Confirm Deletion
              </h2>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: spacing.md }}>
                <button
                  onClick={() => handleDelete(deleteStudent)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: colors.error,
                    color: colors.white,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.error}
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteStudent(null)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: colors.gray200,
                    color: colors.textPrimary,
                    border: 'none',
                    borderRadius: borderRadius.md,
                    fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray300}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray200}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedStudent && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: spacing.xl
          }}>
            <div style={{
              backgroundColor: colors.white,
              padding: spacing['2xl'],
              borderRadius: borderRadius.xl,
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: shadows.lg
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
                <h2 style={{ 
                  fontSize: typography.fontSize['2xl'], 
                  fontWeight: typography.fontWeight.bold,
                  color: colors.textPrimary
                }}>
                  Student Profile
                </h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: typography.fontSize.xl,
                    cursor: 'pointer',
                    color: colors.textSecondary
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Profile Picture */}
              <div style={{ textAlign: 'center', marginBottom: spacing.xl }}>
                {selectedStudent.avatar ? (
                  <img
                    src={selectedStudent.avatar.startsWith('http') ? selectedStudent.avatar : `http://localhost:5000${selectedStudent.avatar}`}
                    alt={selectedStudent.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `4px solid ${colors.accent}`,
                      margin: '0 auto'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: colors.accent,
                    color: colors.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: typography.fontSize['4xl'],
                    fontWeight: typography.fontWeight.bold,
                    margin: '0 auto'
                  }}>
                    {selectedStudent.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div style={{ display: 'grid', gap: spacing.lg }}>
                <ProfileField label="Name" value={selectedStudent.name} />
                <ProfileField label="Email" value={selectedStudent.email} />
                <ProfileField label="Phone" value={selectedStudent.phone || 'Not provided'} />
                <ProfileField label="Father's Name" value={selectedStudent.fatherName || 'Not provided'} />
                <ProfileField label="Blood Group" value={selectedStudent.bloodGroup || 'Not provided'} />
                <ProfileField label="School/College" value={selectedStudent.school || 'Not provided'} />
                <ProfileField label="Status" value={(selectedStudent.status || 'active')} 
                  valueStyle={{ 
                    textTransform: 'capitalize',
                    color: (selectedStudent.status || 'active') === 'active' ? colors.success : colors.error,
                    fontWeight: typography.fontWeight.semibold
                  }} 
                />
                <ProfileField label="Joined Date" value={new Date(selectedStudent.createdAt).toLocaleDateString()} />
                
                {/* Enrollment Info */}
                {selectedStudent.enrollments && (
                  <div style={{ 
                    padding: spacing.lg, 
                    backgroundColor: colors.gray50, 
                    borderRadius: borderRadius.lg,
                    marginTop: spacing.md
                  }}>
                    <h3 style={{ 
                      fontSize: typography.fontSize.lg, 
                      fontWeight: typography.fontWeight.bold,
                      color: colors.textPrimary,
                      marginBottom: spacing.md
                    }}>
                      Enrollment Summary
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing.md }}>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Total Courses</p>
                        <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.accent }}>
                          {selectedStudent.enrollments.total || 0}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>In Progress</p>
                        <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.info }}>
                          {selectedStudent.enrollments.active || 0}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>Completed</p>
                        <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.success }}>
                          {selectedStudent.enrollments.completed || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                style={{
                  marginTop: spacing.xl,
                  width: '100%',
                  padding: `${spacing.md} ${spacing.lg}`,
                  backgroundColor: colors.accent,
                  color: colors.white,
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5b4bcd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

const ProfileField = ({ label, value, valueStyle = {} }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: '140px 1fr', 
    gap: spacing.md,
    padding: spacing.md,
    borderBottom: `1px solid ${colors.gray200}`
  }}>
    <span style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, fontWeight: typography.fontWeight.medium }}>
      {label}:
    </span>
    <span style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary, ...valueStyle }}>
      {value}
    </span>
  </div>
);

export default AdminStudents;
