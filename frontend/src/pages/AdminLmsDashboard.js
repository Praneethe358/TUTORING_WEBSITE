import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard } from '../components/ModernComponents';

/**
 * ADMIN LMS DASHBOARD
 * Overview of LMS performance, courses, enrollments
 */
const AdminLmsDashboard = () => {
  useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLmsDashboard();
  }, []);

  const fetchLmsDashboard = async () => {
    try {
      const res = await api.get('/lms/admin/dashboard');
      if (res.data.success) {
        setDashboard(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch LMS dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading LMS dashboard...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">LMS Dashboard</h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">Comprehensive view of LMS performance and engagement</p>
          </div>
          <Link
            to="/admin/lms/courses"
            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition font-medium min-h-[44px] sm:min-h-[auto] text-center"
          >
            View All Courses
          </Link>
        </div>

        {/* Summary Stats */}
        {dashboard?.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
            <StatCard
              label="Total Courses"
              value={dashboard.summary.totalCourses}
              icon="📚"
              color="blue"
            />
            <StatCard
              label="Total Enrollments"
              value={dashboard.summary.totalEnrollments}
              icon="👥"
              color="purple"
            />
            <StatCard
              label="Active Enrollments"
              value={dashboard.summary.activeEnrollments}
              icon="▶️"
              color="green"
            />
            <StatCard
              label="Completed"
              value={dashboard.summary.completedEnrollments}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Total Students"
              value={dashboard.summary.totalStudents}
              icon="👨‍🎓"
              color="indigo"
            />
          </div>
        )}

        {/* Performance Metrics */}
        {dashboard?.performance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-600 mb-1">Overall Completion Rate</p>
              <p className="text-3xl font-bold text-green-600">{dashboard.performance.overallCompletion}%</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboard.performance.overallCompletion}%` }}
                />
              </div>
            </Card>

            <Card>
              <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
              <p className="text-3xl font-bold text-blue-600">{Math.round(dashboard.performance.avgProgress)}%</p>
              <p className="text-xs text-gray-600 mt-2">Per enrollment</p>
            </Card>

            <Card>
              <p className="text-sm text-gray-600 mb-1">Avg Completion Time</p>
              <p className="text-3xl font-bold text-purple-600">{Math.round(dashboard.performance.avgCompletionTime)}</p>
              <p className="text-xs text-gray-600 mt-2">Hours</p>
            </Card>
          </div>
        )}

        {/* Top Courses */}
        {dashboard?.topCourses && dashboard.topCourses.length > 0 && (
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top Courses</h2>
            <div className="space-y-3">
              {dashboard.topCourses.map(course => (
                <div
                  key={course._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{course.title}</p>
                    <p className="text-sm text-gray-600">
                      {course.totalEnrollments} enrollments
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{Math.round(course.completionRate)}%</p>
                    <p className="text-xs text-gray-600">completion</p>
                  </div>
                  <Link
                    to={`/admin/lms/courses/${course._id}`}
                    className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/lms/courses"
            className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">📊</p>
            <p className="font-semibold text-gray-900">Course Monitoring</p>
            <p className="text-sm text-gray-600 mt-1">View all courses and enrollments</p>
          </Link>

          <Link
            to="/admin/lms/grades"
            className="p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">📈</p>
            <p className="font-semibold text-gray-900">Grades & Performance</p>
            <p className="text-sm text-gray-600 mt-1">Track student progress and scores</p>
          </Link>

          <Link
            to="/admin/lms/reports"
            className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:shadow-md transition"
          >
            <p className="text-2xl mb-2">📋</p>
            <p className="font-semibold text-gray-900">Reports</p>
            <p className="text-sm text-gray-600 mt-1">Analytics and trends</p>
          </Link>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminLmsDashboard;
