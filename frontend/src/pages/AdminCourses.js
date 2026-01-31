import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState(null);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/courses', {
        params: { status: filter || undefined, page, limit: 10 }
      });
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.response?.data?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleAction = async (courseId, act, msg = '') => {
    try {
      if (act === 'approve') {
        await api.put(`/admin/courses/${courseId}/approve`);
      } else if (act === 'reject') {
        if (!msg.trim()) {
          alert('Please provide a rejection reason');
          return;
        }
        await api.put(`/admin/courses/${courseId}/reject`, { reason: msg });
      }
      loadCourses();
      setSelectedCourse(null);
      setReason('');
      setAction('');
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'approved':
        return { backgroundColor: colors.success, color: colors.white };
      case 'pending':
        return { backgroundColor: colors.warning, color: colors.white };
      case 'rejected':
        return { backgroundColor: colors.error, color: colors.white };
      default:
        return { backgroundColor: colors.gray300, color: colors.textPrimary };
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
            Course Moderation
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.base }}>
            Review and approve courses submitted by tutors
          </p>
        </div>

        <div style={{ marginBottom: spacing.xl }}>
          <label style={{ display: 'block', marginBottom: spacing.sm, fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>
            Filter by Status
          </label>
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: borderRadius.md,
              backgroundColor: colors.white,
              border: `1px solid ${colors.gray300}`,
              color: colors.textPrimary,
              fontSize: typography.fontSize.base,
              cursor: 'pointer'
            }}
          >
            <option value="">All Courses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
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
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              No courses found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray100, borderBottom: `2px solid ${colors.gray200}` }}>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Subject</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Tutor</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Duration</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Status</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, idx) => (
                    <tr key={course._id} style={{ 
                      borderBottom: `1px solid ${colors.gray200}`,
                      backgroundColor: idx % 2 === 0 ? colors.white : colors.gray50
                    }}>
                      <td style={{ padding: spacing.lg, color: colors.textPrimary, fontWeight: typography.fontWeight.medium }}>
                        {course.subject}
                        {course.description && (
                          <div style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs }}>
                            {course.description.substring(0, 60)}{course.description.length > 60 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{course.tutor?.name || 'N/A'}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{course.durationMinutes ? `${course.durationMinutes} min` : 'N/A'}</td>
                      <td style={{ padding: spacing.lg }}>
                        <span style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyle(course.status)
                        }}>
                          {course.status}
                        </span>
                      </td>
                      <td style={{ padding: spacing.lg }}>
                        {course.status === 'pending' && (
                          <div style={{ display: 'flex', gap: spacing.sm }}>
                            <button 
                              onClick={() => handleAction(course._id, 'approve')} 
                              style={{
                                padding: `${spacing.sm} ${spacing.md}`,
                                backgroundColor: colors.success,
                                color: colors.white,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                fontSize: typography.fontSize.sm
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.success}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => { setSelectedCourse(course._id); setAction('reject'); }} 
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
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {courses.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: spacing.md, marginTop: spacing.xl }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                backgroundColor: page === 1 ? colors.gray200 : colors.accent,
                color: page === 1 ? colors.textTertiary : colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                fontWeight: typography.fontWeight.medium,
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ padding: spacing.sm, color: colors.textSecondary }}>Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={courses.length < 10}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                backgroundColor: courses.length < 10 ? colors.gray200 : colors.accent,
                color: courses.length < 10 ? colors.textTertiary : colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                fontWeight: typography.fontWeight.medium,
                cursor: courses.length < 10 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}

        {selectedCourse && (
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
              maxWidth: '500px',
              width: '90%',
              boxShadow: shadows.lg
            }}>
              <h2 style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.lg
              }}>
                Reject Course
              </h2>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md, fontSize: typography.fontSize.sm }}>
                Please provide a reason for rejecting this course. This will be sent to the tutor.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  marginBottom: spacing.lg,
                  minHeight: '100px',
                  fontSize: typography.fontSize.base,
                  color: colors.textPrimary,
                  resize: 'vertical'
                }}
                rows={4}
              />
              <div style={{ display: 'flex', gap: spacing.md }}>
                <button
                  onClick={() => handleAction(selectedCourse, action, reason)}
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
                  Confirm Rejection
                </button>
                <button
                  onClick={() => { setSelectedCourse(null); setAction(''); setReason(''); }}
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
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminCourses;
