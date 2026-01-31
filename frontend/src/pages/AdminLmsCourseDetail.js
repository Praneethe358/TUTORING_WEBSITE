import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Badge, Button, EmptyState } from '../components/ModernComponents';

/**
 * ADMIN LMS COURSE DETAIL
 * Detailed view of a course with student breakdown
 */
const AdminLmsCourseDetail = () => {
  const { courseId } = useParams();
  useAuth();
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourseDetail = async () => {
    try {
      const res = await api.get(`/lms/admin/courses/${courseId}`);
      if (res.data.success) {
        setCourse(res.data.data.course);
        setStats(res.data.data.stats);
        setStudents(res.data.data.students);
      }
    } catch (error) {
      console.error('Failed to fetch course detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (filter === 'all') return students;
    return students.filter(s => s.status === filter);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const res = await api.get(`/lms/admin/export/course/${courseId}/students`, {
        responseType: 'blob',
        params: { status: filter === 'all' ? undefined : filter }
      });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `course_${courseId}_students.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Export failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  const filteredStudents = getFilteredStudents();

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              to="/admin/lms/courses"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold mb-2 inline-block"
            >
              ← Back to Courses
            </Link>
            <h1 className="text-3xl font-bold text-white">{course?.title}</h1>
            {course?.instructor && (
              <p className="text-slate-400 mt-1">by {course.instructor.name}</p>
            )}
          </div>
        </div>

        {/* Course Overview */}
        {course && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Course Category</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{course.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Level</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{course.level || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Status</p>
                <Badge variant={course.status === 'active' ? 'success' : 'warning'} className="mt-1">
                  {course.status}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.totalEnrollments}</p>
              <p className="text-sm text-gray-600 mt-1">Total Enrollments</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.activeEnrollments}</p>
              <p className="text-sm text-gray-600 mt-1">Active</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-purple-600">{stats.completedEnrollments}</p>
              <p className="text-sm text-gray-600 mt-1">Completed</p>
            </Card>
            <Card className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.completionRate}%</p>
              <p className="text-sm text-gray-600 mt-1">Completion Rate</p>
            </Card>
          </div>
        )}

        {/* Performance Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <p className="text-sm text-gray-600 mb-1">Average Progress</p>
              <p className="text-3xl font-bold text-blue-600">{stats.avgProgress}%</p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${stats.avgProgress}%` }}
                />
              </div>
            </Card>
            <Card>
              <p className="text-sm text-gray-600 mb-1">Average Completion Time</p>
              <p className="text-3xl font-bold text-purple-600">{stats.avgCompletionTime}</p>
              <p className="text-xs text-gray-600 mt-2">Hours</p>
            </Card>
          </div>
        )}

        {/* Students List */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Students Enrolled</h2>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className={`bg-green-600 text-white hover:bg-green-700 text-sm ${exporting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {exporting ? '📥 Exporting...' : '📥 Export'}
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 border-b pb-3">
            {['all', 'active', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1 text-sm font-semibold ${
                  filter === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Students Table */}
          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Student</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-900">Email</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-900">Progress</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-900">Lessons</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-900">Enrolled</th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-900">Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.studentId} className="border-b hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <Link
                          to={`/admin/lms/students/${student.studentId}/grades`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {student.studentName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{student.studentEmail}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-8">
                            {student.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {student.completedLessons}/{student.totalLessons}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={student.status === 'completed' ? 'success' : 'info'}
                        >
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {new Date(student.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {new Date(student.lastActivityAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No Students"
              description={`No ${filter !== 'all' ? filter : ''} students to show.`}
              icon="👥"
            />
          )}
        </Card>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminLmsCourseDetail;
