import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [viewTutor, setViewTutor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page, search]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/tutors', {
        params: { status: filter || undefined, search: search || undefined, page, limit: 10 }
      });
      setTutors(res.data.tutors || []);
    } catch (err) {
      console.error('Failed to load tutors:', err);
      setError(err.response?.data?.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (tutorId, act, msg = '') => {
    try {
      if (act === 'approve') {
        await api.put(`/admin/tutors/${tutorId}/approve`);
      } else if (act === 'reject') {
        if (!msg.trim()) {
          alert('Please provide a reason for rejection');
          return;
        }
        await api.put(`/admin/tutors/${tutorId}/reject`, { reason: msg });
      } else if (act === 'block') {
        if (!msg.trim()) {
          alert('Please provide a reason for blocking');
          return;
        }
        await api.put(`/admin/tutors/${tutorId}/block`, { reason: msg });
      } else if (act === 'delete') {
        if (!window.confirm('Are you sure you want to DELETE this tutor? This will permanently remove:\n\n• Tutor account\n• All courses created by tutor\n• All bookings\n• All assignments\n\nThe email can be used for new registration after deletion.\n\nThis action CANNOT be undone!')) {
          return;
        }
        await api.delete(`/admin/tutors/${tutorId}`);
        alert('Tutor deleted successfully. Email can now be reused.');
      }
      loadTutors();
      setSelectedTutor(null);
      setReason('');
      setAction('');
    } catch (err) {
      alert('Action failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewProfile = async (tutor) => {
    try {
      const res = await api.get(`/admin/tutors/${tutor._id}/profile`);
      setViewTutor(res.data.tutor || tutor);
      setShowProfileModal(true);
    } catch (err) {
      console.log('Profile details not available, using basic info');
      setViewTutor(tutor);
      setShowProfileModal(true);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/admin/export/tutors', { 
        responseType: 'blob',
        params: { 
          search: search || undefined,
          status: filter || undefined
        }
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tutors_${new Date().toISOString().split('T')[0]}.csv`);
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
    switch(status) {
      case 'approved':
        return { backgroundColor: colors.success, color: colors.white };
      case 'pending':
        return { backgroundColor: colors.warning, color: colors.white };
      case 'rejected':
        return { backgroundColor: colors.error, color: colors.white };
      case 'blocked':
        return { backgroundColor: '#64748b', color: colors.white };
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
            Tutor Management
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            Review and manage tutor applications and accounts
          </p>
        </div>

        <div style={{ marginBottom: spacing.xl, display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap' }}>
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
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
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
            <option value="">All Tutors</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
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
              Loading tutors...
            </div>
          ) : tutors.length === 0 ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              No tutors found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray100, borderBottom: `2px solid ${colors.gray200}` }}>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Name</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Email</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Status</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((tutor, idx) => (
                    <tr key={tutor._id} style={{ 
                      borderBottom: `1px solid ${colors.gray200}`,
                      backgroundColor: idx % 2 === 0 ? colors.white : colors.gray50
                    }}>
                      <td style={{ padding: spacing.lg, fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{tutor.name}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{tutor.email}</td>
                      <td style={{ padding: spacing.lg }}>
                        <span style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyle(tutor.status)
                        }}>
                          {tutor.status}
                        </span>
                      </td>
                      <td style={{ padding: spacing.lg }}>
                        <div style={{ display: 'flex', gap: spacing.sm }}>
                          <button 
                            onClick={() => handleViewProfile(tutor)}
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
                            View
                          </button>
                          {tutor.status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(tutor._id, 'approve')} 
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
                              <button onClick={() => { setSelectedTutor(tutor._id); setAction('reject'); }} 
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
                            </>
                          )}
                          {tutor.status === 'approved' && (
                            <button onClick={() => { setSelectedTutor(tutor._id); setAction('block'); }} 
                              style={{
                                padding: `${spacing.sm} ${spacing.md}`,
                                backgroundColor: colors.warning,
                                color: colors.white,
                                border: 'none',
                                borderRadius: borderRadius.md,
                                fontWeight: typography.fontWeight.medium,
                                cursor: 'pointer',
                                fontSize: typography.fontSize.sm
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.warning}
                            >
                              Block
                            </button>
                          )}
                          <button 
                            onClick={() => handleAction(tutor._id, 'delete')}
                            style={{
                              padding: `${spacing.sm} ${spacing.md}`,
                              backgroundColor: '#dc2626',
                              color: colors.white,
                              border: 'none',
                              borderRadius: borderRadius.md,
                              fontWeight: typography.fontWeight.medium,
                              cursor: 'pointer',
                              fontSize: typography.fontSize.sm
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991b1b'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
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

        {/* Profile Modal */}
        {showProfileModal && viewTutor && (
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
              maxWidth: '700px',
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
                  Tutor Profile
                </h2>
                <button
                  onClick={() => { setShowProfileModal(false); setViewTutor(null); }}
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
                {/* Tutor Info */}
                <div style={{ marginBottom: spacing.xl }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.lg,
                    marginBottom: spacing.lg
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontSize: typography.fontSize['2xl'],
                      fontWeight: typography.fontWeight.bold
                    }}>
                      {viewTutor.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <h3 style={{
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.bold,
                        color: colors.textPrimary,
                        marginBottom: spacing.xs
                      }}>
                        {viewTutor.name}
                      </h3>
                      <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center' }}>
                        <span style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyle(viewTutor.status)
                        }}>
                          {viewTutor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: spacing.lg,
                  marginBottom: spacing.xl
                }}>
                  <ProfileField label="Email" value={viewTutor.email} />
                  <ProfileField label="Phone" value={viewTutor.phone || 'Not provided'} />
                  <ProfileField label="Subjects" value={viewTutor.subjects?.join(', ') || 'Not specified'} />
                  <ProfileField label="Experience" value={viewTutor.experienceYears ? `${viewTutor.experienceYears} years` : 'Not specified'} />
                  <ProfileField label="Qualification" value={viewTutor.qualifications || 'Not specified'} />
                  <ProfileField 
                    label="Joined" 
                    value={viewTutor.createdAt ? new Date(viewTutor.createdAt).toLocaleDateString() : 'Unknown'} 
                  />
                </div>

                {/* Performance Metrics */}
                <div style={{
                  backgroundColor: colors.gray50,
                  padding: spacing.lg,
                  borderRadius: borderRadius.lg,
                  marginBottom: spacing.xl
                }}>
                  <h4 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    marginBottom: spacing.md
                  }}>
                    Performance Metrics
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: spacing.md
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
                        {viewTutor.totalCourses || 0}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Courses Created
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
                        {viewTutor.totalStudents || 0}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Students Taught
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
                        {viewTutor.rating || 'N/A'}
                      </div>
                      <div style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.textSecondary
                      }}>
                        Avg Rating
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {viewTutor.bio && (
                  <div style={{ marginBottom: spacing.xl }}>
                    <h4 style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.textPrimary,
                      marginBottom: spacing.md
                    }}>
                      About
                    </h4>
                    <p style={{
                      fontSize: typography.fontSize.base,
                      color: colors.textSecondary,
                      lineHeight: '1.6'
                    }}>
                      {viewTutor.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {selectedTutor && (
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
                {action === 'reject' ? 'Reject Tutor Application' : 'Block Tutor Account'}
              </h2>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md, fontSize: typography.fontSize.sm }}>
                Please provide a reason for this action. This will be communicated to the tutor.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
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
                  onClick={() => handleAction(selectedTutor, action, reason)}
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
                  Confirm
                </button>
                <button
                  onClick={() => { setSelectedTutor(null); setAction(''); setReason(''); }}
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

// Helper component for profile fields
const ProfileField = ({ label, value }) => (
  <div>
    <div style={{
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: spacing.xs
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

export default AdminTutors;
