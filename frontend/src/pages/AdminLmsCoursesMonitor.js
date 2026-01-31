import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Badge, EmptyState } from '../components/ModernComponents';

/**
 * ADMIN LMS COURSES MONITOR
 * Monitor all LMS courses with enrollment stats
 */
const AdminLmsCoursesMonitor = () => {
  useAuth();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState({ category: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.status) params.append('status', filter.status);
      if (filter.search) params.append('search', filter.search);

      const res = await api.get(`/lms/admin/courses?${params}`);
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">LMS Courses Monitor</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">Monitor all courses and track enrollment statistics</p>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search courses..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm min-h-[44px] sm:min-h-[auto]"
            />
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm min-h-[44px] sm:min-h-[auto]"
            >
              <option value="">All Categories</option>
              <option value="programming">Programming</option>
              <option value="business">Business</option>
              <option value="design">Design</option>
              <option value="science">Science</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="px-3 sm:px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-sm min-h-[44px] sm:min-h-[auto]"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </Card>

        {/* Courses Table */}
        {courses.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 sm:rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Course</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Instructor</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Enrollments</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Active</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Completed</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Completion %</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Avg Progress</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-gray-900">{course.title}</p>
                        <p className="text-xs text-gray-600">{course.category || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {course.instructor?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="primary">{course.stats?.totalEnrollments || 0}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-blue-600">
                        {course.stats?.activeEnrollments || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-green-600">
                        {course.stats?.completedEnrollments || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-purple-600">
                        {course.stats?.completionRate || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${course.stats?.avgProgress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {course.stats?.avgProgress || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/admin/lms/courses/${course._id}`}
                        className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Courses Found"
            description="No courses match your filter criteria."
            icon="📚"
          />
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
            <p className="text-sm text-gray-600">Total Courses</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {courses.reduce((sum, c) => sum + (c.stats?.totalEnrollments || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Enrollments</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {courses.reduce((sum, c) => sum + (c.stats?.completedEnrollments || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {courses.length > 0
                ? Math.round(
                    courses.reduce((sum, c) => sum + (c.stats?.avgProgress || 0), 0) /
                    courses.length
                  )
                : 0}
              %
            </p>
            <p className="text-sm text-gray-600">Avg Progress</p>
          </Card>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminLmsCoursesMonitor;
