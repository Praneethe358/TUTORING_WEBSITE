import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Badge, Button, EmptyState } from '../components/ModernComponents';

/**
 * MODERN STUDENT DASHBOARD
 * Clean, professional design with key metrics and upcoming classes
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
    totalHours: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch bookings from existing backend endpoint
      const res = await api.get('/student/bookings');
      const bookings = res.data.bookings || [];

      // Calculate stats
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.date) > now);
      const completed = bookings.filter(b => b.status === 'completed');

      setStats({
        totalClasses: bookings.length,
        upcomingClasses: upcoming.length,
        completedClasses: completed.length,
        totalHours: bookings.reduce((sum, b) => sum + (b.course?.durationMinutes || 0), 0) / 60
      });

      setUpcomingBookings(upcoming.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      {/* Header with Welcome Message */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's your learning progress and upcoming sessions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="📚"
          label="Total Classes"
          value={stats.totalClasses}
          change="+2 this month"
          trend="up"
        />
        <StatCard
          icon="📅"
          label="Upcoming"
          value={stats.upcomingClasses}
          change={stats.upcomingClasses > 0 ? "Next: Tomorrow" : "No classes"}
          trend="neutral"
        />
        <StatCard
          icon="✅"
          label="Completed"
          value={stats.completedClasses}
          change={`${Math.round((stats.completedClasses / (stats.totalClasses || 1)) * 100)}% done`}
          trend="up"
        />
        <StatCard
          icon="⏱️"
          label="Total Hours"
          value={`${stats.totalHours.toFixed(1)}h`}
          change="Goal: 50h"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Classes - Main */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Sessions
              </h2>
              <Badge variant="primary">
                {stats.upcomingClasses} scheduled
              </Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No upcoming classes"
                description="Browse our tutors and book your first session"
                action={<Link to="/tutors"><Button variant="primary">Find Tutors</Button></Link>}
              />
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div
                    key={booking._id}
                    className="flex items-start justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {booking.course?.subject === 'Math' ? '🔢' : booking.course?.subject === 'English' ? '📖' : '📚'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {booking.course?.subject || 'Class'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          with {booking.tutor?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="ml-2">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/tutors">
                <Button variant="primary" className="w-full">
                  🔍 Find Tutors
                </Button>
              </Link>
              <Link to="/student/messages">
                <Button variant="outline" className="w-full">
                  💬 Messages
                </Button>
              </Link>
              <Link to="/student/materials">
                <Button variant="outline" className="w-full">
                  📚 My Materials
                </Button>
              </Link>
              <Button variant="ghost" className="w-full text-left">
                ⚙️ Settings
              </Button>
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Learning Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Classes Completed</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {stats.completedClasses}/{stats.totalClasses}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    style={{
                      width: `${stats.totalClasses > 0 ? (stats.completedClasses / stats.totalClasses) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
