import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    dropped: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    courseId: '',
    studentId: ''
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/enrollments', {
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
          courseId: filters.courseId || undefined,
          page,
          limit: 20
        }
      });
      setEnrollments(res.data.enrollments || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadEnrollments();
    loadCourses();
    loadStats();
  }, [loadEnrollments]);

  const loadCourses = async () => {
    try {
      const res = await api.get('/lms/admin/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
      setCourses([]);
    }
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/admin/enrollment-stats');
      setStats(res.data.stats || { total: 0, active: 0, completed: 0, dropped: 0 });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleViewDetails = async (enrollment) => {
    try {
      const res = await api.get(`/admin/enrollments/${enrollment._id}/details`);
      setSelectedEnrollment(res.data.enrollment || enrollment);
      setShowDetailsModal(true);
    } catch (err) {
      console.log('Detailed data not available, using basic info');
      setSelectedEnrollment(enrollment);
      setShowDetailsModal(true);
    }
  };

  const handleUpdateStatus = async (enrollmentId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change enrollment status to ${newStatus}?`)) {
      return;
    }
    try {
      await api.put(`/admin/enrollments/${enrollmentId}/status`, { status: newStatus });
      loadEnrollments();
      loadStats();
      if (selectedEnrollment?._id === enrollmentId) {
        setShowDetailsModal(false);
        setSelectedEnrollment(null);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/admin/export/enrollments', {
        responseType: 'blob',
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
          courseId: filters.courseId || undefined
        }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `enrollments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      active: { backgroundColor: colors.success + '20', color: colors.success },
      completed: { backgroundColor: colors.accent + '20', color: colors.accent },
      dropped: { backgroundColor: colors.error + '20', color: colors.error },
      pending: { backgroundColor: colors.warning + '20', color: colors.warning }
    };
    return styles[status] || { backgroundColor: colors.gray200, color: colors.textSecondary };
  };

  const calculateProgress = (enrollment) => {
    if (!enrollment.progress) return 0;
    const { completedLessons = 0, totalLessons = 1 } = enrollment.progress;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <AdminDashboardLayout>
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 5vw, 2rem)',
              fontWeight: typography.fontWeight.bold,
              color: colors.textPrimary,
              marginBottom: spacing.sm
            }}>
              Enrollment Management
            </h1>
            <p style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', color: colors.textSecondary }}>
              Track and manage all course enrollments
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 100%, 250px), 1fr))',
            gap: 'clamp(0.75rem, 3vw, 1.5rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 2rem)'
          }}>
            <StatCard
              title="Total Enrollments"
              value={stats.total}
              icon="📚"
              color={colors.accent}
            />
            <StatCard
              title="Active"
              value={stats.active}
              icon="✅"
              color={colors.success}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon="🎓"
              color={colors.accent}
            />
            <StatCard
              title="Dropped"
              value={stats.dropped}
              icon="❌"
              color={colors.error}
            />
          </div>

          {/* Filters */}
          <div style={{
            backgroundColor: colors.white,
            padding: spacing.xl,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.sm,
            marginBottom: spacing.xl
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md }}>
              <input
                type="text"
                placeholder="Search student or course..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  fontSize: typography.fontSize.base,
                  color: colors.textPrimary
                }}
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  fontSize: typography.fontSize.base,
                  color: colors.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
              <select
                value={filters.courseId}
                onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                style={{
                  padding: `${spacing.md} ${spacing.lg}`,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  fontSize: typography.fontSize.base,
                  color: colors.textPrimary,
                  cursor: 'pointer'
                }}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
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
                {exportLoading ? '📥 Exporting...' : '📥 Export'}
              </button>
            </div>
          </div>

          {/* Enrollments Table */}
          <div style={{
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.sm,
            overflow: 'hidden'
          }}>
            {loading ? (
              <div style={{ padding: spacing['2xl'], textAlign: 'center', color: colors.textSecondary }}>
                Loading enrollments...
              </div>
            ) : enrollments.length === 0 ? (
              <div style={{ padding: spacing['2xl'], textAlign: 'center', color: colors.textSecondary }}>
                No enrollments found
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.gray50 }}>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Student
                        </th>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Course
                        </th>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Progress
                        </th>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Enrolled Date
                        </th>
                        <th style={{
                          padding: spacing.lg,
                          textAlign: 'left',
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.textSecondary,
                          textTransform: 'uppercase'
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((enrollment, index) => (
                        <tr
                          key={enrollment._id}
                          style={{
                            borderTop: `1px solid ${colors.gray200}`,
                            backgroundColor: index % 2 === 0 ? colors.white : colors.gray50
                          }}
                        >
                          <td style={{ padding: spacing.lg }}>
                            <div style={{
                              fontSize: typography.fontSize.base,
                              fontWeight: typography.fontWeight.medium,
                              color: colors.textPrimary
                            }}>
                              {enrollment.student?.name || 'Unknown'}
                            </div>
                            <div style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.textSecondary
                            }}>
                              {enrollment.student?.email || ''}
                            </div>
                          </td>
                          <td style={{ padding: spacing.lg }}>
                            <div style={{
                              fontSize: typography.fontSize.base,
                              fontWeight: typography.fontWeight.medium,
                              color: colors.textPrimary
                            }}>
                              {enrollment.course?.title || 'Unknown Course'}
                            </div>
                          </td>
                          <td style={{ padding: spacing.lg }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: spacing.sm
                            }}>
                              <div style={{
                                flex: 1,
                                height: '8px',
                                backgroundColor: colors.gray200,
                                borderRadius: borderRadius.full,
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${calculateProgress(enrollment)}%`,
                                  backgroundColor: colors.success,
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.medium,
                                color: colors.textPrimary,
                                minWidth: '45px'
                              }}>
                                {calculateProgress(enrollment)}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: spacing.lg }}>
                            <span style={{
                              padding: `${spacing.xs} ${spacing.md}`,
                              borderRadius: borderRadius.full,
                              fontSize: typography.fontSize.xs,
                              fontWeight: typography.fontWeight.semibold,
                              textTransform: 'capitalize',
                              ...getStatusBadgeStyle(enrollment.status)
                            }}>
                              {enrollment.status}
                            </span>
                          </td>
                          <td style={{ padding: spacing.lg }}>
                            <div style={{
                              fontSize: typography.fontSize.sm,
                              color: colors.textSecondary
                            }}>
                              {new Date(enrollment.enrolledAt || enrollment.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td style={{ padding: spacing.lg }}>
                            <button
                              onClick={() => handleViewDetails(enrollment)}
                              style={{
                                padding: `${spacing.sm} ${spacing.md}`,
                                backgroundColor: colors.accent,
                                color: colors.white,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                fontSize: typography.fontSize.sm
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5b4bcd'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.accent}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: spacing.md,
                    padding: spacing.xl,
                    borderTop: `1px solid ${colors.gray200}`
                  }}>
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        backgroundColor: page === 1 ? colors.gray200 : colors.accent,
                        color: page === 1 ? colors.textSecondary : colors.white,
                        border: 'none',
                        borderRadius: borderRadius.md,
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm
                      }}
                    >
                      Previous
                    </button>
                    <span style={{ color: colors.textSecondary }}>
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      style={{
                        padding: `${spacing.sm} ${spacing.md}`,
                        backgroundColor: page === totalPages ? colors.gray200 : colors.accent,
                        color: page === totalPages ? colors.textSecondary : colors.white,
                        border: 'none',
                        borderRadius: borderRadius.md,
                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: typography.fontSize.sm
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedEnrollment && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: spacing.lg
          }}>
            <div style={{
              backgroundColor: colors.white,
              borderRadius: borderRadius.xl,
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: shadows['2xl']
            }}>
              {/* Modal Header */}
              <div style={{
                padding: spacing.xl,
                borderBottom: `1px solid ${colors.gray200}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.textPrimary
                }}>
                  Enrollment Details
                </h2>
                <button
                  onClick={() => { setShowDetailsModal(false); setSelectedEnrollment(null); }}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: typography.fontSize.xl,
                    color: colors.textSecondary
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: spacing.xl }}>
                {/* Student & Course Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.xl,
                  marginBottom: spacing.xl,
                  padding: spacing.lg,
                  backgroundColor: colors.gray50,
                  borderRadius: borderRadius.lg
                }}>
                  <div>
                    <h3 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.textPrimary,
                      marginBottom: spacing.md
                    }}>
                      Student Information
                    </h3>
                    <DetailField label="Name" value={selectedEnrollment.student?.name} />
                    <DetailField label="Email" value={selectedEnrollment.student?.email} />
                    <DetailField label="Phone" value={selectedEnrollment.student?.phone || 'N/A'} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.textPrimary,
                      marginBottom: spacing.md
                    }}>
                      Course Information
                    </h3>
                    <DetailField label="Title" value={selectedEnrollment.course?.title} />
                    <DetailField label="Tutor" value={selectedEnrollment.course?.tutor?.name || 'N/A'} />
                    <DetailField label="Category" value={selectedEnrollment.course?.category || 'N/A'} />
                  </div>
                </div>

                {/* Progress & Status */}
                <div style={{
                  marginBottom: spacing.xl,
                  padding: spacing.lg,
                  backgroundColor: colors.gray50,
                  borderRadius: borderRadius.lg
                }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md
                  }}>
                    Progress Tracking
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing.md,
                    marginBottom: spacing.lg
                  }}>
                    <div style={{
                      backgroundColor: colors.white,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.bold,
                        color: colors.accent
                      }}>
                        {calculateProgress(selectedEnrollment)}%
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Overall Progress
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: colors.white,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.bold,
                        color: colors.success
                      }}>
                        {selectedEnrollment.progress?.completedLessons || 0}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Lessons Completed
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: colors.white,
                      padding: spacing.md,
                      borderRadius: borderRadius.md,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        fontSize: typography.fontSize['2xl'],
                        fontWeight: typography.fontWeight.bold,
                        color: colors.warning
                      }}>
                        {selectedEnrollment.progress?.totalLessons || 0}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Total Lessons
                      </div>
                    </div>
                  </div>

                  {/* Status Update */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.textSecondary,
                      marginBottom: spacing.sm
                    }}>
                      Enrollment Status
                    </label>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      {['active', 'completed', 'dropped'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(selectedEnrollment._id, status)}
                          disabled={selectedEnrollment.status === status}
                          style={{
                            padding: `${spacing.sm} ${spacing.md}`,
                            border: 'none',
                            borderRadius: borderRadius.md,
                            fontWeight: typography.fontWeight.medium,
                            fontSize: typography.fontSize.sm,
                            cursor: selectedEnrollment.status === status ? 'not-allowed' : 'pointer',
                            textTransform: 'capitalize',
                            ...(selectedEnrollment.status === status 
                              ? getStatusBadgeStyle(status)
                              : {
                                  backgroundColor: colors.gray200,
                                  color: colors.textSecondary
                                }
                            )
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md
                  }}>
                    Timeline
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                    <DetailField 
                      label="Enrolled On" 
                      value={new Date(selectedEnrollment.enrolledAt || selectedEnrollment.createdAt).toLocaleString()} 
                    />
                    {selectedEnrollment.completedAt && (
                      <DetailField 
                        label="Completed On" 
                        value={new Date(selectedEnrollment.completedAt).toLocaleString()} 
                      />
                    )}
                    {selectedEnrollment.lastAccessedAt && (
                      <DetailField 
                        label="Last Accessed" 
                        value={new Date(selectedEnrollment.lastAccessedAt).toLocaleString()} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

// Helper Components
const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.sm
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{
          fontSize: typography.fontSize.sm,
          color: colors.textSecondary,
          marginBottom: spacing.xs
        }}>
          {title}
        </div>
        <div style={{
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.bold,
          color: color
        }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: typography.fontSize['3xl'] }}>
        {icon}
      </div>
    </div>
  </div>
);

const DetailField = ({ label, value }) => (
  <div style={{ marginBottom: spacing.sm }}>
    <div style={{
      fontSize: typography.fontSize.xs,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      fontWeight: typography.fontWeight.medium
    }}>
      {label}
    </div>
    <div style={{
      fontSize: typography.fontSize.base,
      color: colors.textPrimary,
      fontWeight: typography.fontWeight.medium
    }}>
      {value || 'N/A'}
    </div>
  </div>
);

export default AdminEnrollments;
