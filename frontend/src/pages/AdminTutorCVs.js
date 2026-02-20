import React, { useEffect, useState, useCallback } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../lib/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * ADMIN TUTOR CV MANAGEMENT PAGE
 * View and download tutor CVs for approval process
 */
const AdminTutorCVs = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTutorsWithCVs = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/admin/tutors?limit=1000'; // Get all tutors
      if (filter !== 'all') {
        url += `&status=${filter}`;
      }
      const res = await api.get(url);
      setTutors(res.data.tutors || []);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTutorsWithCVs();
  }, [fetchTutorsWithCVs]);

  const filteredTutors = tutors.filter(tutor => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tutor.name?.toLowerCase().includes(searchLower) ||
      tutor.email?.toLowerCase().includes(searchLower) ||
      tutor.qualifications?.toLowerCase().includes(searchLower)
    );
  });

  const handleDownloadCV = async (tutor) => {
    if (tutor.cvPath) {
      try {
        // Get the backend base URL (strip /api suffix)
        const apiBaseUrl = api.defaults.baseURL || '';
        const backendBase = apiBaseUrl.replace(/\/api\/?$/, '');
        
        // Build full CV URL using the static file path
        const cvUrl = tutor.cvPath.startsWith('http') 
          ? tutor.cvPath 
          : `${backendBase}${tutor.cvPath}`;
        
        // Fetch as blob for proper download
        const response = await fetch(cvUrl, { credentials: 'include' });
        if (!response.ok) throw new Error('CV file not found on server');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ext = tutor.cvPath.split('.').pop() || 'pdf';
        link.setAttribute('download', `${tutor.name}_CV.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Failed to download CV:', err);
        // Fallback: open in new tab
        try {
          const apiBaseUrl = api.defaults.baseURL || '';
          const backendBase = apiBaseUrl.replace(/\/api\/?$/, '');
          const cvUrl = tutor.cvPath.startsWith('http') 
            ? tutor.cvPath 
            : `${backendBase}${tutor.cvPath}`;
          window.open(cvUrl, '_blank');
        } catch (fallbackErr) {
          alert('Failed to download CV. The file may no longer exist on the server.');
        }
      }
    }
  };

  const handleApprove = async (tutorId) => {
    try {
      await api.put(`/admin/tutors/${tutorId}/approve`);
      fetchTutorsWithCVs();
    } catch (err) {
      console.error('Failed to approve tutor:', err);
      alert('Failed to approve tutor. Please try again.');
    }
  };

  const handleReject = async (tutorId) => {
    try {
      const reason = prompt('Enter rejection reason (optional):');
      await api.put(`/admin/tutors/${tutorId}/reject`, { reason });
      fetchTutorsWithCVs();
    } catch (err) {
      console.error('Failed to reject tutor:', err);
      alert('Failed to reject tutor. Please try again.');
    }
  };

  return (
    <AdminDashboardLayout>
      <div style={{ padding: spacing['3xl'] }}>
        {/* Header */}
        <div style={{ marginBottom: spacing['2xl'] }}>
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.sm
          }}>
            📄 Tutor CVs & Management
          </h1>
          <p style={{ color: colors.textSecondary }}>
            View tutor CVs and approve/reject applications
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing.lg,
          marginBottom: spacing['2xl'],
          backgroundColor: 'white',
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.sm
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.textPrimary
            }}>
              Search Tutor
            </label>
            <input
              type="text"
              placeholder="Name, email, or qualifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.accent}
              onBlur={(e) => e.target.style.borderColor = colors.gray300}
            />
          </div>

          {/* Filter by Status */}
          <div>
            <label style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.textPrimary
            }}>
              Filter by Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                outline: 'none'
              }}
            >
              <option value="all">All Tutors</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Tutors Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
            <p style={{ color: colors.textSecondary }}>Loading tutors...</p>
          </div>
        ) : filteredTutors.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: spacing['2xl'],
            backgroundColor: 'white',
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm
          }}>
            <p style={{ color: colors.textSecondary }}>No tutors found</p>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.gray200}` }}>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    Name
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    Qualifications
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'left',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    CV
                  </th>
                  <th style={{
                    padding: spacing.md,
                    textAlign: 'center',
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    fontSize: typography.fontSize.sm
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTutors.map((tutor) => (
                  <tr
                    key={tutor._id}
                    style={{
                      borderBottom: `1px solid ${colors.gray200}`,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <td style={{
                      padding: spacing.md,
                      fontSize: typography.fontSize.sm,
                      color: colors.textPrimary,
                      fontWeight: typography.fontWeight.semibold
                    }}>
                      {tutor.name}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary
                    }}>
                      {tutor.email}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      fontSize: typography.fontSize.sm,
                      color: colors.textSecondary
                    }}>
                      {tutor.qualifications}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      fontSize: typography.fontSize.sm
                    }}>
                      <span style={{
                        padding: `${spacing.xs} ${spacing.sm}`,
                        borderRadius: borderRadius.sm,
                        fontSize: typography.fontSize.xs,
                        fontWeight: typography.fontWeight.semibold,
                        backgroundColor: tutor.status === 'approved' ? '#d1fae5' :
                                         tutor.status === 'pending' ? '#fef3c7' :
                                         '#fee2e2',
                        color: tutor.status === 'approved' ? '#065f46' :
                               tutor.status === 'pending' ? '#92400e' :
                               '#991b1b'
                      }}>
                        {tutor.status?.charAt(0).toUpperCase() + tutor.status?.slice(1)}
                      </span>
                    </td>
                    <td style={{
                      padding: spacing.md,
                      textAlign: 'center'
                    }}>
                      {tutor.cvPath ? (
                        <button
                          onClick={() => handleDownloadCV(tutor)}
                          style={{
                            padding: `${spacing.xs} ${spacing.sm}`,
                            backgroundColor: colors.accent,
                            color: 'white',
                            border: 'none',
                            borderRadius: borderRadius.sm,
                            cursor: 'pointer',
                            fontSize: typography.fontSize.xs,
                            fontWeight: typography.fontWeight.semibold,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          📥 Download
                        </button>
                      ) : (
                        <span style={{
                          fontSize: typography.fontSize.xs,
                          color: colors.textTertiary
                        }}>
                          No CV
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: spacing.md,
                      textAlign: 'center'
                    }}>
                      <div style={{ display: 'flex', gap: spacing.sm, justifyContent: 'center' }}>
                        {tutor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(tutor._id)}
                              style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.sm,
                                cursor: 'pointer',
                                fontSize: typography.fontSize.xs,
                                fontWeight: typography.fontWeight.semibold
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReject(tutor._id)}
                              style={{
                                padding: `${spacing.xs} ${spacing.sm}`,
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: borderRadius.sm,
                                cursor: 'pointer',
                                fontSize: typography.fontSize.xs,
                                fontWeight: typography.fontWeight.semibold
                              }}
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminTutorCVs;
