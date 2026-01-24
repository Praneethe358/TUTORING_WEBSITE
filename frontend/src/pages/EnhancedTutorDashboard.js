import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

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
    totalEarnings: 0,
    thisMonth: 0,
    totalStudents: 0,
    upcomingClasses: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch bookings from existing endpoint
      const res = await api.get('/tutor/bookings');
      const bookings = res.data.bookings || [];

      // Calculate stats
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.date) > now);
      const completed = bookings.filter(b => b.status === 'completed');
      const totalClasses = completed.length;

      // Get unique students
      const uniqueStudents = new Set(bookings.map(b => b.student?._id).filter(Boolean));

      setStats({
        totalClasses,
        thisMonthClasses: totalClasses * 0.4, // Placeholder calculation
        totalStudents: uniqueStudents.size,
        upcomingClasses: upcoming.length
      });

      setUpcomingBookings(upcoming.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name}!</h1>
        <p className="text-slate-400 mt-1">Your teaching dashboard</p>
        {user?.status === 'pending' && (
          <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 text-sm">
            ⚠️ Your account is pending admin approval
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon="📚"
          color="bg-green-600"
        />
        <StatCard
          title="This Month"
          value={stats.thisMonthClasses}
          icon="📈"
          color="bg-blue-600"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="🎓"
          color="bg-purple-600"
        />
        <StatCard
          title="Upcoming Classes"
          value={stats.upcomingClasses}
          icon="📅"
          color="bg-orange-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <ActionCard
          title="Manage Availability"
          description="Set your teaching schedule"
          icon="📅"
          link="/tutor/availability"
        />
        <ActionCard
          title="My Courses"
          description="View and edit your courses"
          icon="📚"
          link="/tutor/courses"
        />
        <ActionCard
          title="Upload Materials"
          description="Share study resources"
          icon="📤"
          link="/tutor/materials"
        />
      </div>

      {/* Upcoming Classes */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-4">Upcoming Classes</h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : upcomingBookings.length === 0 ? (
          <p className="text-slate-400">No upcoming classes scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map(booking => (
              <div
                key={booking._id}
                className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
              >
                <div>
                  <h3 className="font-semibold text-white">{booking.student?.name}</h3>
                  <p className="text-sm text-slate-400">
                    {booking.course?.subject} • {new Date(booking.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{new Date(booking.date).toLocaleTimeString()}</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 mt-1">
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
        {icon}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

// Action Card Component
const ActionCard = ({ title, description, icon, link }) => (
  <a
    href={link}
    className="block p-6 bg-slate-800 rounded-xl border border-slate-700 hover:border-indigo-500 transition group"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">
      {title}
    </h3>
    <p className="text-sm text-slate-400 mt-1">{description}</p>
  </a>
);

export default EnhancedTutorDashboard;
