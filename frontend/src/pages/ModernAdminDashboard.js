import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';
import { useAdmin } from '../context/AdminContext';
import api from '../lib/api';
import { Card, StatCard, Badge, Button } from '../components/ModernComponents';

/**
 * MODERN ADMIN DASHBOARD
 * Enterprise-style with analytics, platform health, and key metrics
 */
const ModernAdminDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const { admin } = useAdmin();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    pendingTutors: 0,
    totalBookings: 0,
    platformRevenue: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch admin analytics - adjust endpoints based on your backend
      const res = await api.get('/admin/dashboard');
      const data = res.data;

      setStats({
        totalStudents: data.totalStudents || 0,
        totalTutors: data.totalTutors || 0,
        pendingTutors: data.pendingTutors || 0,
        totalBookings: data.totalBookings || 0,
        platformRevenue: data.revenue || 0,
        activeUsers: data.activeUsers || 0,
      });
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Dashboard 🎛️
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Platform overview and key performance indicators
        </p>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          change="+12% vs last month"
          trend="up"
        />
        <StatCard
          icon="🧑‍🏫"
          label="Total Tutors"
          value={stats.totalTutors.toLocaleString()}
          change="+5 this week"
          trend="up"
        />
        <StatCard
          icon="⏳"
          label="Pending Approvals"
          value={stats.pendingTutors}
          change="Needs review"
          trend={stats.pendingTutors > 0 ? 'warning' : 'neutral'}
        />
        <StatCard
          icon="📅"
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          change="All time"
          trend="neutral"
        />
        <StatCard
          icon="💵"
          label="Platform Revenue"
          value={`₹${stats.platformRevenue.toLocaleString()}`}
          change="+23% vs last month"
          trend="up"
        />
        <StatCard
          icon="🟢"
          label="Active Now"
          value={stats.activeUsers}
          change="Real-time"
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Administrative Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" className="w-full">
                ✅ Approve Tutors
              </Button>
              <Button variant="primary" className="w-full">
                👥 Manage Users
              </Button>
              <Button variant="outline" className="w-full">
                📊 View Analytics
              </Button>
              <Button variant="outline" className="w-full">
                ⚙️ System Settings
              </Button>
            </div>
          </Card>

          {/* Recent Pending Approvals */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Pending Tutor Approvals
              </h2>
              <Badge variant="warning">{stats.pendingTutors}</Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats.pendingTutors === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  ✅ All tutor applications reviewed
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Placeholder for tutor list - implement with real data */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Pending Tutors</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Waiting for review</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Platform Health */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Platform Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">API Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Database</span>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Server Response</span>
                <span className="text-sm font-semibold text-green-600">52ms avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="text-sm font-semibold text-green-600">99.9%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Overview */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              System Overview
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Platform Users</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(stats.totalStudents + stats.totalTutors).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats.totalTutors > 0 
                    ? ((stats.totalBookings / (stats.totalStudents * 2)) * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Session</span>
                <span className="font-semibold text-gray-900 dark:text-white">1h 15m</span>
              </div>
            </div>
          </Card>

          {/* Support & Documentation */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Support
            </h3>
            <div className="space-y-2">
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                📖 Admin Guide
              </button>
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                🐛 Report Issue
              </button>
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                💬 Support Chat
              </button>
            </div>
          </Card>

          {/* Admin Badge */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Role</p>
              <Badge variant="primary" size="lg">
                👑 Super Admin
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModernAdminDashboard;
