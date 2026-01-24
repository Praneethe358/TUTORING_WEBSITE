import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import AdminSidebar from '../components/AdminSidebar';
import api from '../lib/api';

/**
 * ADMIN ANALYTICS PAGE
 * Comprehensive platform analytics and insights
 */
const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [platformStats, setPlatformStats] = useState(null);
  const [tutorStats, setTutorStats] = useState([]);
  const [studentStats, setStudentStats] = useState([]);
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [platform, tutors, students, classTrends] = await Promise.all([
        api.get(`/admin/analytics/platform?period=${period}`),
        api.get('/admin/analytics/tutors?limit=10'),
        api.get('/admin/analytics/students?limit=10'),
        api.get('/admin/analytics/trends?period=week')
      ]);
      
      setPlatformStats(platform.data.data);
      setTutorStats(tutors.data.data || []);
      setStudentStats(students.data.data || []);
      setTrends(classTrends.data.data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className={`${color} rounded-xl p-6 text-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-sm mt-1 opacity-75">{subtitle}</p>}
        </div>
        <span className="text-4xl opacity-75">{icon}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout sidebar={AdminSidebar}>
        <div className="text-center py-12 text-slate-400">Loading analytics...</div>
      </DashboardLayout>
    );
  }

  if (!platformStats) {
    return (
      <DashboardLayout sidebar={AdminSidebar}>
        <div className="text-center py-12 text-slate-400">No analytics data available</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={AdminSidebar}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-slate-400 mt-1">Comprehensive insights and metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={platformStats.users.totalStudents}
            subtitle={`+${platformStats.users.newStudents} in period`}
            icon="👨‍🎓"
            color="bg-blue-600"
          />
          <StatCard
            title="Active Tutors"
            value={platformStats.users.totalTutors}
            subtitle={`+${platformStats.users.newTutors} in period`}
            icon="👨‍🏫"
            color="bg-green-600"
          />
          <StatCard
            title="Pending Tutors"
            value={platformStats.users.pendingTutors}
            subtitle="Awaiting approval"
            icon="⏳"
            color="bg-orange-600"
          />
          <StatCard
            title="Blocked Users"
            value={platformStats.users.blockedTutors}
            subtitle="Total blocked"
            icon="🚫"
            color="bg-red-600"
          />
        </div>
      </div>

      {/* Class Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Class Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Classes"
            value={platformStats.classes.total}
            subtitle={`${platformStats.classes.totalHours}h total`}
            icon="📚"
            color="bg-indigo-600"
          />
          <StatCard
            title="Completed"
            value={platformStats.classes.completed}
            subtitle={`${platformStats.classes.growth} growth`}
            icon="✅"
            color="bg-green-600"
          />
          <StatCard
            title="Upcoming"
            value={platformStats.classes.upcoming}
            subtitle="Scheduled"
            icon="📅"
            color="bg-blue-600"
          />
          <StatCard
            title="Cancelled"
            value={platformStats.classes.cancelled}
            subtitle={`${platformStats.classes.inPeriod} in period`}
            icon="❌"
            color="bg-red-600"
          />
        </div>
      </div>

      {/* Attendance & Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Attendance Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Records</span>
              <span className="text-white font-semibold">{platformStats.attendance.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Present</span>
              <span className="text-green-400 font-semibold">{platformStats.attendance.present}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Absent</span>
              <span className="text-red-400 font-semibold">{platformStats.attendance.absent}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
              <span className="text-slate-400">Attendance Rate</span>
              <span className="text-xl text-indigo-400 font-bold">{platformStats.attendance.rate}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Course Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Courses</span>
              <span className="text-white font-semibold">{platformStats.courses.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active</span>
              <span className="text-green-400 font-semibold">{platformStats.courses.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pending Approval</span>
              <span className="text-orange-400 font-semibold">{platformStats.courses.pending}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
              <span className="text-slate-400">Messages Sent</span>
              <span className="text-xl text-indigo-400 font-bold">{platformStats.communication.totalMessages}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tutors */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Top Performing Tutors</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tutor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Subjects</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Classes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Hours</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tutorStats.map((tutor, index) => (
                <tr key={tutor._id} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{tutor.name}</p>
                        <p className="text-xs text-slate-400">{tutor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    {tutor.subjects?.slice(0, 2).join(', ')}
                    {tutor.subjects?.length > 2 && '...'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-white">{tutor.classCount}</span>
                    <span className="text-xs text-slate-400 ml-1">({tutor.upcomingCount} upcoming)</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-white">{tutor.totalHours}h</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-yellow-400">
                      ⭐ {tutor.averageRating?.toFixed(1) || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Students */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Most Active Students</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Classes</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Hours</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {studentStats.map((student, index) => (
                <tr key={student._id} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">{student.name}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-white">{student.classCount}</span>
                    <span className="text-xs text-slate-400 ml-1">({student.upcomingCount} upcoming)</span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-white">{student.totalHours}h</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-medium ${student.attendanceRate >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                      {student.attendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
