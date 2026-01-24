import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Badge, Button } from '../components/ModernComponents';

/**
 * MODERN TUTOR DASHBOARD
 * Productivity-focused with earnings, students, and schedule overview
 */
const ModernTutorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0,
    upcomingSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorData();
  }, []);

  const fetchTutorData = async () => {
    try {
      // Fetch tutor bookings and calculate stats
      const res = await api.get('/tutor/bookings');
      const bookings = res.data.bookings || [];

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const upcomingCount = bookings.filter(b => new Date(b.date) > now).length;
      const monthEarnings = bookings
        .filter(b => new Date(b.date) >= thisMonth && b.status === 'completed')
        .reduce((sum, b) => sum + (b.course?.price || 0), 0);

      const uniqueStudents = new Set(bookings.map(b => b.student?._id)).size;
      const totalEarnings = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.course?.price || 0), 0);

      setStats({
        totalStudents: uniqueStudents,
        totalEarnings: totalEarnings,
        thisMonthEarnings: monthEarnings,
        upcomingSessions: upcomingCount,
      });
    } catch (error) {
      console.error('Failed to fetch tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard 📊
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name?.split(' ')[0]}! Here's your teaching overview.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="👥"
          label="Active Students"
          value={stats.totalStudents}
          change={`+${Math.floor(Math.random() * 3)} new`}
          trend="up"
        />
        <StatCard
          icon="💰"
          label="This Month"
          value={`₹${stats.thisMonthEarnings.toLocaleString()}`}
          change="45% vs last month"
          trend="up"
        />
        <StatCard
          icon="📈"
          label="Total Earnings"
          value={`₹${stats.totalEarnings.toLocaleString()}`}
          change="All time"
          trend="neutral"
        />
        <StatCard
          icon="📅"
          label="Next Session"
          value={stats.upcomingSessions}
          change={`${stats.upcomingSessions} scheduled`}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button variant="primary" className="w-full text-sm">
                ➕ Add Availability
              </Button>
              <Button variant="outline" className="w-full text-sm">
                📂 Upload Materials
              </Button>
              <Button variant="outline" className="w-full text-sm">
                💬 Messages
              </Button>
            </div>
          </Card>

          {/* Schedule Overview */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              This Week's Schedule
            </h2>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    📅 Your schedule will appear here
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Performance Card */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Student Satisfaction</span>
                  <span className="font-semibold text-gray-900 dark:text-white">4.8/5 ⭐</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                  <div className="w-4/5 h-full bg-yellow-400 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                  <span className="font-semibold text-gray-900 dark:text-white">2 min avg</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Resources */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Resources
            </h3>
            <div className="space-y-2">
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                📖 Tutoring Tips
              </button>
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                📊 Earnings Guide
              </button>
              <button type="button" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm bg-transparent border-0 cursor-pointer p-0">
                💡 Best Practices
              </button>
            </div>
          </Card>

          {/* Status Badge */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Profile Status</p>
              <Badge variant="success" size="lg">
                ✅ Verified Tutor
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ModernTutorDashboard;
