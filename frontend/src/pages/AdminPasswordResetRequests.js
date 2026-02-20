import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { colors, typography, spacing, borderRadius } from '../theme/designSystem';

const AdminPasswordResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  ));

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/password-reset-requests', {
        params: { status: filter, page, limit: 20 }
      });
      setRequests(res.data.requests);
      setPagination(res.data.pagination);
      setTotal(res.data.pagination.total);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/admin/password-reset-requests/${requestId}/approve`, {
        adminNotes
      });
      setSuccessMessage(`Request approved! Reset token: ${res.data.resetToken}`);
      setAdminNotes('');
      setSelectedRequest(null);
      setTimeout(() => {
        setSuccessMessage('');
        fetchRequests();
      }, 2000);
    } catch (err) {
      alert('Failed to approve: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async (requestId) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for denial');
      return;
    }
    setActionLoading(true);
    try {
      await api.patch(`/admin/password-reset-requests/${requestId}/deny`, {
        adminNotes
      });
      setSuccessMessage('Request denied.');
      setAdminNotes('');
      setSelectedRequest(null);
      setTimeout(() => {
        setSuccessMessage('');
        fetchRequests();
      }, 2000);
    } catch (err) {
      alert('Failed to deny: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // amber
      case 'approved':
        return '#10b981'; // green
      case 'denied':
        return '#ef4444'; // red
      default:
        return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'pending':
        return '#fef3c7';
      case 'approved':
        return '#ecfdf5';
      case 'denied':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  };

  return (
    <div style={{ padding: isMobile ? spacing.md : spacing.xl }}>
      <div style={{ marginBottom: spacing.xl }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: colors.textPrimary,
          marginBottom: spacing.lg
        }}>
          Password Reset Requests
        </h1>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: spacing.md, marginBottom: spacing.lg, flexWrap: 'wrap' }}>
          {['pending', 'approved', 'denied'].map(status => (
            <button
              key={status}
              onClick={() => { setFilter(status); setPage(1); }}
              style={{
                padding: `${spacing.sm} ${spacing.md}`,
                borderRadius: borderRadius.md,
                border: 'none',
                cursor: 'pointer',
                fontWeight: typography.fontWeight.semibold,
                fontSize: typography.fontSize.sm,
                backgroundColor: filter === status ? getStatusColor(status) : colors.bgSecondary,
                color: filter === status ? 'white' : colors.textPrimary,
                transition: 'all 0.2s ease',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({
                filter === status ? total : '?'
              })
            </button>
          ))}
        </div>

        {successMessage && (
          <div style={{
            padding: spacing.md,
            backgroundColor: '#ecfdf5',
            border: '1px solid #d1fae5',
            borderRadius: borderRadius.md,
            color: '#047857',
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.semibold
          }}>
            ✓ {successMessage}
          </div>
        )}
      </div>

      {/* Table / Cards */}
      {isMobile ? (
        <div style={{ display: 'grid', gap: spacing.md }}>
          {loading ? (
            <div style={{ padding: spacing.lg, textAlign: 'center', color: colors.textSecondary }}>
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: spacing.lg, textAlign: 'center', color: colors.textSecondary }}>
              No requests found
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req._id}
                style={{
                  border: `1px solid ${colors.gray200}`,
                  borderRadius: borderRadius.md,
                  padding: spacing.md,
                  backgroundColor: colors.white
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <strong style={{ color: colors.textPrimary }}>{req.studentId?.name || 'Unknown'}</strong>
                  <span style={{
                    display: 'inline-block',
                    padding: `4px 8px`,
                    borderRadius: borderRadius.sm,
                    backgroundColor: getStatusBg(req.status),
                    color: getStatusColor(req.status),
                    fontWeight: typography.fontWeight.semibold,
                    fontSize: typography.fontSize.xs
                  }}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ color: colors.textSecondary, fontSize: typography.fontSize.xs, marginBottom: spacing.sm }}>
                  {req.email}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.sm }}>
                  {req.reason || 'No reason provided'}
                </div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm }}>
                  Submitted: {new Date(req.createdAt).toLocaleDateString()}
                </div>
                {req.status === 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(req)}
                    style={{
                      padding: `6px 14px`,
                      borderRadius: borderRadius.sm,
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: colors.accent,
                      color: 'white',
                      fontWeight: typography.fontWeight.semibold,
                      fontSize: typography.fontSize.xs
                    }}
                  >
                    Review
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: typography.fontSize.sm
          }}>
            <thead>
              <tr style={{ backgroundColor: colors.bgSecondary, borderBottom: `2px solid ${colors.gray200}` }}>
                <th style={{ padding: spacing.md, textAlign: 'left', fontWeight: typography.fontWeight.semibold }}>Student</th>
                <th style={{ padding: spacing.md, textAlign: 'left', fontWeight: typography.fontWeight.semibold }}>Email</th>
                <th style={{ padding: spacing.md, textAlign: 'left', fontWeight: typography.fontWeight.semibold }}>Reason</th>
                <th style={{ padding: spacing.md, textAlign: 'left', fontWeight: typography.fontWeight.semibold }}>Status</th>
                <th style={{ padding: spacing.md, textAlign: 'left', fontWeight: typography.fontWeight.semibold }}>Submitted</th>
                <th style={{ padding: spacing.md, textAlign: 'center', fontWeight: typography.fontWeight.semibold }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSecondary }}>Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: spacing.xl, textAlign: 'center', color: colors.textSecondary }}>No requests found</td></tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} style={{ borderBottom: `1px solid ${colors.gray200}` }}>
                    <td style={{ padding: spacing.md }}>
                      <strong>{req.studentId?.name || 'Unknown'}</strong>
                    </td>
                    <td style={{ padding: spacing.md }}>
                      {req.email}
                    </td>
                    <td style={{ padding: spacing.md, fontSize: typography.fontSize.xs }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: spacing.md }}>
                      <span style={{
                        display: 'inline-block',
                        padding: `4px 8px`,
                        borderRadius: borderRadius.sm,
                        backgroundColor: getStatusBg(req.status),
                        color: getStatusColor(req.status),
                        fontWeight: typography.fontWeight.semibold,
                        fontSize: typography.fontSize.xs
                      }}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: spacing.md, fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: spacing.md, textAlign: 'center' }}>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => setSelectedRequest(req)}
                          style={{
                            padding: `4px 12px`,
                            borderRadius: borderRadius.sm,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: colors.accent,
                            color: 'white',
                            fontWeight: typography.fontWeight.semibold,
                            fontSize: typography.fontSize.xs
                          }}
                        >
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: spacing.sm,
          marginTop: spacing.xl
        }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: borderRadius.sm,
              border: '1px solid ' + colors.gray200,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>
          <span style={{ alignSelf: 'center', color: colors.textSecondary }}>
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
            disabled={page === pagination.pages}
            style={{
              padding: `${spacing.sm} ${spacing.md}`,
              borderRadius: borderRadius.sm,
              border: '1px solid ' + colors.gray200,
              cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
              opacity: page === pagination.pages ? 0.5 : 1
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: borderRadius.lg,
            padding: spacing.xl,
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing.lg,
              color: colors.textPrimary
            }}>
              Review Password Reset Request
            </h2>

            <div style={{ marginBottom: spacing.lg }}>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
                <strong>Student:</strong> {selectedRequest.studentId?.name}
              </p>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
                <strong>Email:</strong> {selectedRequest.email}
              </p>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
                <strong>Reason:</strong> {selectedRequest.reason}
              </p>
              <p style={{ color: colors.textSecondary }}>
                <strong>Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
            </div>

            <div style={{ marginBottom: spacing.lg }}>
              <label style={{
                display: 'block',
                marginBottom: spacing.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textPrimary
              }}>
                Admin Notes (for approval/denial reason)
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  border: `1px solid ${colors.gray200}`,
                  fontFamily: 'inherit',
                  fontSize: typography.fontSize.sm,
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter reason or notes..."
              />
            </div>

            <div style={{
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => { setSelectedRequest(null); setAdminNotes(''); }}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.md,
                  border: '1px solid ' + colors.gray200,
                  backgroundColor: 'white',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  fontWeight: typography.fontWeight.semibold
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeny(selectedRequest._id)}
                disabled={actionLoading}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.md,
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: typography.fontWeight.semibold,
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? 'Processing...' : 'Deny'}
              </button>
              <button
                onClick={() => handleApprove(selectedRequest._id)}
                disabled={actionLoading}
                style={{
                  padding: `${spacing.sm} ${spacing.lg}`,
                  borderRadius: borderRadius.md,
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: 'white',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontWeight: typography.fontWeight.semibold,
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasswordResetRequests;
