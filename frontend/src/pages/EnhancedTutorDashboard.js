import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Badge, EmptyState } from '../components/ModernComponents';

/**
 * TUTOR DASHBOARD - ENHANCED
 * 
 * Main landing page for tutors with sidebar layout
 * - Earnings summary
 * - Upcoming classes
 * - Student count
 * - Quick actions
 */
const EnhancedTutorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClasses: 0,
    thisMonthClasses: 0,
    totalStudents: 0,
    upcomingClasses: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const avatarUrl = useMemo(() => {
    const raw = user?.profileImage || user?.avatar;
    if (!raw) return null;
    return raw.startsWith('http') ? raw : `http://localhost:5000${raw}`;
  }, [user?.profileImage, user?.avatar]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch real data from multiple endpoints
      const [classesRes] = await Promise.all([
        api.get('/classes'),
        api.get('/tutor/all-students')
      ]);

      const classes = classesRes.data?.data || [];

      // Calculate stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Total classes (all scheduled/completed/ongoing classes)
      const totalClasses = classes.filter(c => 
        ['scheduled', 'completed', 'ongoing'].includes(c.status)
      ).length;

      // Classes this month
      const thisMonthClasses = classes.filter(c => {
        const classDate = new Date(c.scheduledAt);
        return classDate >= startOfMonth && 
               classDate <= now &&
               ['scheduled', 'completed', 'ongoing'].includes(c.status);
      }).length;

      // Upcoming classes (future scheduled/ongoing)
      const upcomingClasses = classes.filter(c => {
        const classDate = new Date(c.scheduledAt);
        return classDate > now && ['scheduled', 'ongoing'].includes(c.status);
      }).length;

      // Get unique students from classes
      const uniqueStudentIds = new Set();
      classes.forEach(cls => {
        if (cls.student?._id) {
          uniqueStudentIds.add(cls.student._id.toString());
        }
        if (cls.students && Array.isArray(cls.students)) {
          cls.students.forEach(s => {
            if (s._id) uniqueStudentIds.add(s._id.toString());
          });
        }
      });

      setStats({
        totalClasses,
        thisMonthClasses,
        totalStudents: uniqueStudentIds.size,
        upcomingClasses
      });

      // Get upcoming classes for list display
      const upcoming = classes
        .filter(c => {
          const classDate = new Date(c.scheduledAt);
          return classDate > now && ['scheduled', 'ongoing'].includes(c.status);
        })
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .slice(0, 5);

      setUpcomingBookings(upcoming);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Welcome Message */}
      <div className="mb-6 md:mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'T'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed">
              Track your teaching progress and upcoming sessions
            </p>
            {user?.status === 'pending' && (
              <div className="mt-3">
                <Badge variant="warning">⚠️ Pending admin approval</Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
        <StatCard
          icon="📚"
          label="Total Classes"
          value={stats.totalClasses}
          change={`${stats.thisMonthClasses} this month`}
          trend="up"
        />
        <StatCard
          icon="📈"
          label="This Month"
          value={stats.thisMonthClasses}
          change="Keep it up"
          trend="up"
        />
        <StatCard
          icon="🎓"
          label="Students"
          value={stats.totalStudents}
          change="Active learners"
          trend="neutral"
        />
        <StatCard
          icon="📅"
          label="Upcoming"
          value={stats.upcomingClasses}
          change="Next sessions"
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card hover={false} className="cursor-default">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">🗓️ Upcoming Classes</h2>
              <Link to="/tutor/schedule">
                <Badge variant="primary" className="cursor-pointer hover:bg-indigo-700">
                  View All
                </Badge>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No upcoming classes"
                description="You have no classes scheduled yet"
              />
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((cls) => (
                  <div
                    key={cls._id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {cls.course?.subject === 'Math' ? '🔢' : cls.course?.subject === 'English' ? '📖' : '📚'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">
                          {cls.topic || cls.course?.subject || 'Class'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {cls.students?.length > 0
                            ? cls.students.map((s) => s.name).join(', ')
                            : cls.student?.name || 'Student'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-sm text-gray-500">
                      <p>{new Date(cls.scheduledAt).toLocaleDateString()}</p>
                      <p>{new Date(cls.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <Badge variant="secondary" className="mt-2 inline-block">
                        {cls.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card hover={false} className="cursor-default">
            <h3 className="text-lg font-semibold text-black mb-4">⚡ Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/tutor/lms/courses"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  🎓 LMS Courses
                </span>
                <span className="text-indigo-600">→</span>
              </Link>
              <Link
                to="/tutor/availability"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  📅 Availability
                </span>
                <span className="text-indigo-600">→</span>
              </Link>
              <Link
                to="/tutor/schedule"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  🗓️ Class Schedule
                </span>
                <span className="text-indigo-600">→</span>
              </Link>
              <Link
                to="/tutor/materials"
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition min-h-[44px]"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  📤 Upload Materials
                </span>
                <span className="text-indigo-600">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTutorDashboard;
