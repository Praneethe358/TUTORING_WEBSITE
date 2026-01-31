import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [page] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/bookings', { params: { page, limit: 10 } });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (bookingId) => {
    try {
      if (!reason.trim()) {
        alert('Please provide a cancellation reason');
        return;
      }
      await api.put(`/admin/bookings/${bookingId}/cancel`, { reason });
      loadBookings();
      setCancelBooking(null);
      setReason('');
    } catch (err) {
      alert('Cancel failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch(status) {
      case 'completed':
        return { backgroundColor: colors.success, color: colors.white };
      case 'booked':
        return { backgroundColor: '#3b82f6', color: colors.white };
      case 'cancelled':
        return { backgroundColor: colors.error, color: colors.white };
      default:
        return { backgroundColor: colors.gray300, color: colors.textPrimary };
    }
  };

  return (
    <AdminDashboardLayout>
      <div style={{ padding: spacing['3xl'] }}>
        <div style={{ marginBottom: spacing['2xl'] }}>
          <h1 style={{ 
            fontSize: typography.fontSize['3xl'], 
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.sm
          }}>
            Bookings Management
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.base }}>
            View and manage all session bookings
          </p>
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
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              No bookings found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray100, borderBottom: `2px solid ${colors.gray200}` }}>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Tutor</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Student</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Date</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Status</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, idx) => (
                    <tr key={booking._id} style={{ 
                      borderBottom: `1px solid ${colors.gray200}`,
                      backgroundColor: idx % 2 === 0 ? colors.white : colors.gray50
                    }}>
                      <td style={{ padding: spacing.lg, color: colors.textPrimary }}>{booking.tutor?.name || 'N/A'}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{booking.student?.name || 'N/A'}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: spacing.lg }}>
                        <span style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          textTransform: 'capitalize',
                          ...getStatusBadgeStyle(booking.status)
                        }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={{ padding: spacing.lg }}>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => setCancelBooking(booking._id)}
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
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {cancelBooking && (
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
                Cancel Booking
              </h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                style={{
                  width: '100%',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  marginBottom: spacing.lg,
                  minHeight: '80px',
                  fontSize: typography.fontSize.base,
                  color: colors.textPrimary,
                  resize: 'vertical'
                }}
                rows={3}
              />
              <div style={{ display: 'flex', gap: spacing.md }}>
                <button
                  onClick={() => handleCancel(cancelBooking)}
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
                  Cancel Booking
                </button>
                <button
                  onClick={() => { setCancelBooking(null); setReason(''); }}
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
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminBookings;
