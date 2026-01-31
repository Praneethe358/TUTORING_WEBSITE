import React, { useEffect, useState, useCallback } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import api from '../lib/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * ADMIN ANALYTICS PAGE
 * Comprehensive platform analytics and insights
 */
const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState(null);
  const [tutorStats, setTutorStats] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = showCustomRange && customDateRange.start && customDateRange.end
        ? { startDate: customDateRange.start, endDate: customDateRange.end }
        : { period };

      const [platform, tutors, students, revenue] = await Promise.all([
        api.get(`/admin/analytics/platform`, { params }),
        api.get('/admin/analytics/tutors?limit=10'),
        api.get('/admin/analytics/students?limit=10'),
        api.get('/admin/analytics/revenue', { params }).catch(() => ({ data: { data: null } }))
      ]);
      
      setPlatformStats(platform.data.data);
      setTutorStats(tutors.data.data || []);
      setStudentStats(students.data.data || []);
      setRevenueData(revenue.data.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period, showCustomRange, customDateRange]);

  const handleExportReport = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const params = showCustomRange && customDateRange.start && customDateRange.end
        ? { startDate: customDateRange.start, endDate: customDateRange.end, format }
        : { period, format };

      const res = await api.get('/admin/export/analytics-report', {
        responseType: 'blob',
        params
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `analytics_report_${new Date().toISOString().split('T')[0]}.${format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div style={{
      background: color,
      borderRadius: borderRadius.lg,
      padding: 'clamp(1rem, 4vw, 2rem)',
      color: colors.white,
      boxShadow: shadows.md
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', opacity: 0.9 }}>{title}</p>
          <p style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: typography.fontWeight.bold, marginTop: spacing.sm }}>{value}</p>
          {subtitle && <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', marginTop: spacing.xs, opacity: 0.75 }}>{subtitle}</p>}
        </div>
        <span style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', opacity: 0.75 }}>{icon}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div style={{ textAlign: 'center', padding: spacing['4xl'], color: colors.textSecondary }}>
          Loading analytics...
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!platformStats) {
    return (
      <AdminDashboardLayout>
        <div style={{ textAlign: 'center', padding: spacing['4xl'], color: colors.textSecondary }}>
          No analytics data available
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div style={{ padding: 'clamp(1rem, 4vw, 3rem)' }}>
        <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'clamp(1rem, 2vw, 1.5rem)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: typography.fontWeight.bold, color: colors.textPrimary }}>
              Platform Analytics
            </h1>
            <p style={{ color: colors.textSecondary, marginTop: spacing.xs, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
              Comprehensive insights and metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
            <button
              onClick={() => setShowCustomRange(!showCustomRange)}
              style={{
                padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
                borderRadius: borderRadius.md,
                backgroundColor: showCustomRange ? colors.accent : colors.white,
                color: showCustomRange ? colors.white : colors.textPrimary,
                border: `1px solid ${showCustomRange ? colors.accent : colors.gray300}`,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                minHeight: '44px'
              }}
            >
              📅 Custom Range
            </button>
            {!showCustomRange && (
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                style={{
                  padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.white,
                  border: `1px solid ${colors.gray300}`,
                  color: colors.textPrimary,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                  minHeight: '44px'
                }}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            )}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleExportReport('csv')}
                disabled={exportLoading}
                style={{
                  padding: `clamp(0.5rem, 2vw, ${spacing.md}) clamp(0.75rem, 2vw, ${spacing.lg})`,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.success,
                  color: colors.white,
                  border: 'none',
                  fontWeight: typography.fontWeight.medium,
                  cursor: exportLoading ? 'not-allowed' : 'pointer',
                  fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                  opacity: exportLoading ? 0.6 : 1,
                  minHeight: '44px'
                }}
              >
                {exportLoading ? '⏳ Exporting...' : '📥 Export Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomRange && (
          <div style={{
            backgroundColor: colors.white,
            padding: 'clamp(1rem, 4vw, 1.5rem)',
            borderRadius: borderRadius.lg,
            boxShadow: shadows.sm,
            marginBottom: spacing.xl
          }}>
            <h3 style={{
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              fontWeight: typography.fontWeight.semibold,
              color: colors.textPrimary,
              marginBottom: spacing.md
            }}>
              Custom Date Range
            </h3>
            <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs
                }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray300}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}
                />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: '150px' }}>
                <label style={{
                  display: 'block',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  color: colors.textSecondary,
                  marginBottom: spacing.xs
                }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                    borderRadius: borderRadius.md,
                    backgroundColor: colors.white,
                    border: `1px solid ${colors.gray300}`,
                    color: colors.textPrimary,
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                  }}
                />
              </div>
              <button
                onClick={loadAnalytics}
                disabled={!customDateRange.start || !customDateRange.end}
                style={{
                  minHeight: '44px',
                  padding: 'clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.accent,
                  color: colors.white,
                  border: 'none',
                  fontWeight: typography.fontWeight.medium,
                  cursor: (!customDateRange.start || !customDateRange.end) ? 'not-allowed' : 'pointer',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  opacity: (!customDateRange.start || !customDateRange.end) ? 0.5 : 1,
                  whiteSpace: 'nowrap'
                }}
              >
                Apply Range
              </button>
            </div>
          </div>
        )}

        {/* Class Stats */}
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <h2 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
            Class Statistics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 100%, 250px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)' }}>
            <StatCard
              title="Total Classes"
              value={platformStats.classes.total}
              subtitle={`${platformStats.classes.totalHours}h total`}
              icon="📚"
              color="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
            />
            <StatCard
              title="Completed"
              value={platformStats.classes.completed}
              subtitle={`${platformStats.classes.growth} growth`}
              icon="✅"
              color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            />
            <StatCard
              title="Upcoming"
              value={platformStats.classes.upcoming}
              subtitle="Scheduled"
              icon="📅"
              color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
            <StatCard
              title="Cancelled"
              value={platformStats.classes.cancelled}
              subtitle={`${platformStats.classes.inPeriod} in period`}
              icon="❌"
              color="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            />
          </div>
        </div>

        {/* Attendance & Courses */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 100%, 300px), 1fr))', gap: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: 'clamp(1rem, 4vw, 2rem)', boxShadow: shadows.md }}>
            <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(0.75rem, 3vw, 1rem)' }}>
              Attendance Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Total Records</span>
                <span style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }}>{platformStats.attendance.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Present</span>
                <span style={{ color: colors.success, fontWeight: typography.fontWeight.semibold }}>{platformStats.attendance.present}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Absent</span>
                <span style={{ color: colors.error, fontWeight: typography.fontWeight.semibold }}>{platformStats.attendance.absent}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, borderTop: `1px solid ${colors.gray200}` }}>
                <span style={{ color: colors.textSecondary }}>Attendance Rate</span>
                <span style={{ fontSize: typography.fontSize.xl, color: colors.primary, fontWeight: typography.fontWeight.bold }}>{platformStats.attendance.rate}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: 'clamp(1rem, 4vw, 2rem)', boxShadow: shadows.md }}>
            <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(0.75rem, 3vw, 1rem)' }}>
              Course Overview
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Total Courses</span>
                <span style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }}>{platformStats.courses.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Active</span>
                <span style={{ color: colors.success, fontWeight: typography.fontWeight.semibold }}>{platformStats.courses.active}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: colors.textSecondary }}>Pending Approval</span>
                <span style={{ color: '#f59e0b', fontWeight: typography.fontWeight.semibold }}>{platformStats.courses.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, borderTop: `1px solid ${colors.gray200}` }}>
                <span style={{ color: colors.textSecondary }}>Messages Sent</span>
                <span style={{ fontSize: typography.fontSize.xl, color: colors.primary, fontWeight: typography.fontWeight.bold }}>{platformStats.communication.totalMessages}</span>
              </div>
            </div>
          </div>

          {/* Revenue Card - NEW */}
          {revenueData && (
            <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: 'clamp(1rem, 4vw, 2rem)', boxShadow: shadows.md }}>
              <h3 style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(0.75rem, 3vw, 1rem)' }}>
                Revenue Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.5rem, 2vw, 1rem)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: colors.textSecondary }}>Total Revenue</span>
                  <span style={{ color: colors.success, fontWeight: typography.fontWeight.bold }}>${revenueData.total?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: colors.textSecondary }}>Tutor Earnings</span>
                  <span style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }}>${revenueData.tutorEarnings?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: colors.textSecondary }}>Platform Fee</span>
                  <span style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold }}>${revenueData.platformFee?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.md, borderTop: `1px solid ${colors.gray200}` }}>
                  <span style={{ color: colors.textSecondary }}>Growth</span>
                  <span style={{ fontSize: typography.fontSize.xl, color: colors.success, fontWeight: typography.fontWeight.bold }}>{revenueData.growth || '+0%'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Tutors */}
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <h2 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
            Top Performing Tutors
          </h2>
          <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, boxShadow: shadows.md, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: colors.gray100 }}>
                <tr>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'left', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Tutor</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'left', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Subjects</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Classes</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Hours</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {tutorStats.map((tutor, index) => (
                  <tr key={tutor._id} style={{ borderTop: `1px solid ${colors.gray200}` }}>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '28px', height: '28px', minWidth: '28px', backgroundColor: colors.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: typography.fontWeight.semibold, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                          {index + 1}
                        </div>
                        <div style={{ marginLeft: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
                          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{tutor.name}</p>
                          <p style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', color: colors.textSecondary }}>{tutor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: colors.textPrimary }}>
                      {tutor.subjects?.slice(0, 2).join(', ')}
                      {tutor.subjects?.length > 2 && '...'}
                    </td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{tutor.classCount}</span>
                      <span style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', color: colors.textSecondary, marginLeft: spacing.xs }}>({tutor.upcomingCount} upcoming)</span>
                    </td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: colors.textPrimary }}>{tutor.totalHours}h</td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: '#f59e0b' }}>
                        ⭐ {tutor.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Top Students */}
        <div>
          <h2 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, marginBottom: 'clamp(1rem, 3vw, 1.5rem)' }}>
            Most Active Students
          </h2>
          <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, boxShadow: shadows.md, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '500px', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: colors.gray100 }}>
                <tr>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'left', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Student</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Classes</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Hours</th>
                  <th style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', fontWeight: typography.fontWeight.medium, color: colors.textSecondary, textTransform: 'uppercase' }}>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {studentStats.map((student, index) => (
                  <tr key={student._id} style={{ borderTop: `1px solid ${colors.gray200}` }}>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '28px', height: '28px', minWidth: '28px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.white, fontWeight: typography.fontWeight.semibold, fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}>
                          {index + 1}
                        </div>
                        <div style={{ marginLeft: 'clamp(0.5rem, 2vw, 0.75rem)' }}>
                          <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{student.name}</p>
                          <p style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', color: colors.textSecondary }}>{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: colors.textPrimary }}>{student.classCount}</span>
                      <span style={{ fontSize: 'clamp(0.625rem, 2vw, 0.75rem)', color: colors.textSecondary, marginLeft: spacing.xs }}>({student.upcomingCount} upcoming)</span>
                    </td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center', fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', color: colors.textPrimary }}>{student.totalHours}h</td>
                    <td style={{ padding: 'clamp(0.5rem, 2vw, 1rem)', textAlign: 'center' }}>
                      <span style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', fontWeight: typography.fontWeight.medium, color: student.attendanceRate >= 80 ? colors.success : '#f59e0b' }}>
                        {student.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminAnalytics;
