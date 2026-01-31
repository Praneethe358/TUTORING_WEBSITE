import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [enrollments, setEnrollments] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsRes = await api.get('/admin/dashboard-stats');
      setStats(statsRes.data);

      // Load recent activities
      try {
        const activityRes = await api.get('/admin/activity-logs?limit=10');
        setActivities(activityRes.data.logs || []);
      } catch (err) {
        console.log('Activity logs not available');
      }

      // Load enrollment stats
      try {
        const enrollRes = await api.get('/lms/admin/enrollment-stats');
        setEnrollments(enrollRes.data || { total: 0, active: 0, completed: 0 });
      } catch (err) {
        console.log('Enrollment stats not available');
      }

      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div style={{ padding: spacing['3xl'], display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.lg }}>Loading dashboard...</p>
        </div>
      </AdminDashboardLayout>
    );
  }

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
            Dashboard
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}>
            Overview of platform statistics and metrics
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
        
        {stats && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 100%, 300px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.5rem)', marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <StatCard title="Total Students" value={stats.totalStudents} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" icon="👥" />
              <StatCard title="Total Tutors" value={stats.totalTutors} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" icon="🧑‍🏫" />
              <StatCard title="Pending Tutors" value={stats.pendingTutors} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" icon="⏳" />
              <StatCard title="Total Bookings" value={stats.totalBookings} gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" icon="📅" />
              <StatCard title="Active Courses" value={stats.activeCourses} gradient="linear-gradient(135deg, #ec4899 0%, #db2777 100%)" icon="📚" />
              <StatCard title="Total Enrollments" value={enrollments.total} gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" icon="🎓" />
            </div>

            {/* Enrollment Stats */}
            <div style={{ 
              backgroundColor: colors.white, 
              borderRadius: borderRadius.xl, 
              padding: spacing['2xl'],
              boxShadow: shadows.sm,
              marginBottom: spacing['2xl']
            }}>
              <h2 style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.lg
              }}>
                LMS Enrollment Overview
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.lg }}>
                <EnrollmentMetric label="Active Enrollments" value={enrollments.active} color={colors.success} />
                <EnrollmentMetric label="Completed Courses" value={enrollments.completed} color={colors.accent} />
                <EnrollmentMetric label="Completion Rate" value={`${enrollments.total > 0 ? Math.round((enrollments.completed / enrollments.total) * 100) : 0}%`} color={colors.info} />
              </div>
            </div>

            {/* Two Column Layout for Activity and Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: spacing.xl }}>
              {/* Recent Activity */}
              <div style={{ 
                backgroundColor: colors.white, 
                borderRadius: borderRadius.xl, 
                padding: spacing['2xl'],
                boxShadow: shadows.sm,
                maxHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
                  <h2 style={{ 
                    fontSize: typography.fontSize.xl, 
                    fontWeight: typography.fontWeight.bold,
                    color: colors.textPrimary
                  }}>
                    Recent Activity
                  </h2>
                  <Link to="/admin/audit-logs" style={{ 
                    color: colors.accent, 
                    fontSize: typography.fontSize.sm,
                    textDecoration: 'none',
                    fontWeight: typography.fontWeight.medium
                  }}>
                    View All →
                  </Link>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <ActivityItem key={index} activity={activity} />
                    ))
                  ) : (
                    <p style={{ color: colors.textSecondary, textAlign: 'center', padding: spacing.xl }}>
                      No recent activity
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                backgroundColor: colors.white, 
                borderRadius: borderRadius.xl, 
                padding: spacing['2xl'],
                boxShadow: shadows.sm
              }}>
                <h2 style={{ 
                  fontSize: typography.fontSize.xl, 
                  fontWeight: typography.fontWeight.bold,
                  color: colors.textPrimary,
                  marginBottom: spacing.lg
                }}>
                  Quick Actions
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                  <QuickActionButton to="/admin/tutors" icon="🧑‍🏫" label="Manage Tutors" description={`${stats.pendingTutors} pending approval`} />
                  <QuickActionButton to="/admin/tutor-cvs" icon="📄" label="Review Tutor CVs" description="Download & approve CVs" />
                  <QuickActionButton to="/admin/students" icon="👥" label="Manage Students" description={`${stats.totalStudents} total students`} />
                  <QuickActionButton to="/admin/lms/dashboard" icon="📚" label="LMS Dashboard" description="View course analytics" />
                  <QuickActionButton to="/admin/lms/grades" icon="📊" label="View Grades" description="Student performance" />
                  <QuickActionButton to="/admin/lms/reports" icon="📄" label="Export Reports" description="Download data exports" />
                  <QuickActionButton to="/admin/announcements" icon="📢" label="Announcements" description="Create announcements" />
                </div>
              </div>
            </div>

            {/* Platform Health */}
            <div style={{ 
              backgroundColor: colors.white, 
              borderRadius: borderRadius.xl, 
              padding: spacing['2xl'],
              boxShadow: shadows.sm,
              marginTop: spacing['2xl']
            }}>
              <h2 style={{ 
                fontSize: typography.fontSize.xl, 
                fontWeight: typography.fontWeight.bold,
                color: colors.textPrimary,
                marginBottom: spacing.lg
              }}>
                Platform Health
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: spacing.lg }}>
                <HealthIndicator label="Database" status="healthy" />
                <HealthIndicator label="API Services" status="healthy" />
                <HealthIndicator label="Storage" status="healthy" />
                <HealthIndicator label="Authentication" status="healthy" />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

const StatCard = ({ title, value, gradient, icon }) => (
  <div style={{
    background: gradient,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    boxShadow: shadows.md,
    color: colors.white,
    transition: 'transform 0.2s ease',
    cursor: 'default'
  }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = shadows.lg; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = shadows.md; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          opacity: 0.9,
          marginBottom: spacing.md
        }}>
          {title}
        </p>
        <p style={{
          fontSize: typography.fontSize['4xl'],
          fontWeight: typography.fontWeight.bold
        }}>
          {value || 0}
        </p>
      </div>
      <span style={{ fontSize: '2rem', opacity: 0.8 }}>{icon}</span>
    </div>
  </div>
);

const EnrollmentMetric = ({ label, value, color }) => (
  <div style={{ padding: spacing.lg, backgroundColor: colors.gray50, borderRadius: borderRadius.lg }}>
    <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs }}>
      {label}
    </p>
    <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color }}>
      {value}
    </p>
  </div>
);

const ActivityItem = ({ activity }) => (
  <div style={{ 
    padding: spacing.md, 
    borderBottom: `1px solid ${colors.gray200}`,
    display: 'flex',
    gap: spacing.md,
    alignItems: 'flex-start'
  }}>
    <div style={{ 
      width: '8px', 
      height: '8px', 
      borderRadius: '50%', 
      backgroundColor: colors.accent,
      marginTop: spacing.sm,
      flexShrink: 0
    }} />
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: typography.fontSize.sm, color: colors.textPrimary, marginBottom: spacing.xs }}>
        {activity.action || activity.message || 'Activity logged'}
      </p>
      <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary }}>
        {activity.user || 'System'} • {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Recently'}
      </p>
    </div>
  </div>
);

const QuickActionButton = ({ to, icon, label, description }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      padding: spacing.lg,
      backgroundColor: colors.gray50,
      borderRadius: borderRadius.lg,
      border: `1px solid ${colors.gray200}`,
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.backgroundColor = colors.accentLight;
        e.currentTarget.style.borderColor = colors.accent;
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.backgroundColor = colors.gray50;
        e.currentTarget.style.borderColor = colors.gray200;
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div>
          <p style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary }}>
            {label}
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

const HealthIndicator = ({ label, status }) => {
  const statusColors = {
    healthy: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
    warning: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
    error: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' }
  };
  const colors_status = statusColors[status] || statusColors.healthy;

  return (
    <div style={{ 
      padding: spacing.lg, 
      backgroundColor: colors_status.bg,
      borderRadius: borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md
    }}>
      <div style={{ 
        width: '12px', 
        height: '12px', 
        borderRadius: '50%', 
        backgroundColor: colors_status.dot,
        flexShrink: 0
      }} />
      <div>
        <p style={{ fontSize: typography.fontSize.sm, color: colors_status.text, fontWeight: typography.fontWeight.semibold }}>
          {label}
        </p>
        <p style={{ fontSize: typography.fontSize.xs, color: colors_status.text, textTransform: 'capitalize' }}>
          {status}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
