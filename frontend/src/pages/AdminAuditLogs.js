import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/audit-logs', { params: { page, limit: 20 } });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionBadgeColor = (action) => {
    const actionLower = action?.toLowerCase() || '';
    if (actionLower.includes('approve')) return colors.success;
    if (actionLower.includes('reject') || actionLower.includes('block')) return colors.error;
    if (actionLower.includes('delete')) return colors.warning;
    return colors.accent;
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
            Audit Logs
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            Track all administrative actions and changes
          </p>
        </div>

        {error && (
          <div style={{
            padding: spacing.lg,
            backgroundColor: '#fee2e2',
            border: `1px solid #fca5a5`,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg,
            color: '#991b1b',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)'
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
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: spacing['3xl'], textAlign: 'center', color: colors.textSecondary }}>
              No audit logs found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: colors.gray100, borderBottom: `2px solid ${colors.gray200}` }}>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Admin</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Action</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Target Type</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Target Email</th>
                    <th style={{ padding: spacing.lg, textAlign: 'left', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr key={log._id} style={{ 
                      borderBottom: `1px solid ${colors.gray200}`,
                      backgroundColor: idx % 2 === 0 ? colors.white : colors.gray50
                    }}>
                      <td style={{ padding: spacing.lg, color: colors.textPrimary }}>{log.admin?.name || 'N/A'}</td>
                      <td style={{ padding: spacing.lg }}>
                        <span style={{
                          padding: `${spacing.xs} ${spacing.md}`,
                          borderRadius: borderRadius.full,
                          fontSize: typography.fontSize.xs,
                          fontWeight: typography.fontWeight.semibold,
                          backgroundColor: getActionBadgeColor(log.action),
                          color: colors.white
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{log.targetType || 'N/A'}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary }}>{log.targetEmail || 'N/A'}</td>
                      <td style={{ padding: spacing.lg, color: colors.textSecondary, fontSize: typography.fontSize.sm }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {logs.length > 0 && (
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
              disabled={logs.length < 20}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                backgroundColor: logs.length < 20 ? colors.gray200 : colors.accent,
                color: logs.length < 20 ? colors.textTertiary : colors.white,
                border: 'none',
                borderRadius: borderRadius.md,
                fontWeight: typography.fontWeight.medium,
                cursor: logs.length < 20 ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAuditLogs;
