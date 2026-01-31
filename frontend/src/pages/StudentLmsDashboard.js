import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Badge, EmptyState } from '../components/ModernComponents';
import { colors, spacing, typography, borderRadius } from '../theme/designSystem';

/**
 * STUDENT LMS DASHBOARD
 * Shows enrolled courses, progress, and continue learning options
 */
const StudentLmsDashboard = () => {
  useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [resumePoint, setResumePoint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLmsDashboard();
  }, []);

  const fetchLmsDashboard = async () => {
    try {
      const res = await api.get('/lms/student/dashboard');
      if (res.data.success) {
        setCourses(res.data.data);
        setStats(res.data.stats);
      }

      // Get resume point
      try {
        const resumeRes = await api.get('/lms/student/resume');
        if (resumeRes.data.success && resumeRes.data.data) {
          setResumePoint(resumeRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch resume point:', err);
      }
    } catch (error) {
      console.error('Failed to fetch LMS dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-black">Loading your courses...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Continue learning and track your progress</p>
        </div>

        {/* Resume Card */}
        {resumePoint && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-blue-700 uppercase tracking-wide">Continue Learning</p>
                <h3 className="text-lg sm:text-xl font-bold text-black mt-1 sm:mt-2">{resumePoint.courseName}</h3>
                <p className="text-sm text-gray-600 mt-1">Last viewing: {resumePoint.lessonName}</p>
              </div>
              <Link
                to={`/student/lms/player/${resumePoint.courseId}`}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center min-h-[44px] flex items-center justify-center"
              >
                Continue
              </Link>
            </div>
          </Card>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="Enrolled Courses"
              value={stats.totalEnrolled}
              icon="📚"
              color="blue"
            />
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon="✓"
              color="green"
            />
            <StatCard
              label="Average Progress"
              value={`${stats.avgProgress}%`}
              icon="📊"
              color="purple"
            />
          </div>
        )}

        {/* Course Cards */}
        {courses.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-black mb-4">All Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Card key={course._id} className="flex flex-col hover:shadow-lg transition">
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover rounded-t-lg -m-4 mb-4"
                    />
                  )}

                  <h3 className="text-lg font-bold text-black">{course.title}</h3>

                  <div className="flex gap-2 mt-2">
                    <Badge variant={course.status === 'completed' ? 'success' : 'primary'}>
                      {course.status}
                    </Badge>
                    {course.level && (
                      <Badge variant="secondary" className="font-semibold text-black">{course.level}</Badge>
                    )}
                  </div>

                  {course.instructor && (
                    <p className="text-sm text-black mt-2">by {course.instructor}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-black">Progress</span>
                      <span className="text-sm font-bold text-black">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson Progress */}
                  <p className="text-xs text-black mt-2">
                    {course.completedLessons} of {course.totalLessons} lessons completed
                  </p>

                  {/* Enrolled Date */}
                  <p className="text-xs text-black mt-1">
                    Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 flex-grow items-end">
                    <Link
                      to={`/student/lms/player/${course._id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                    >
                      Open Course
                    </Link>
                    {course.progress === 100 && (
                      <Link
                        to="/student/lms/certificates"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                      >
                        Certificate
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No Courses Yet"
            description="You haven't enrolled in any courses. Browse available courses to get started."
            icon="📚"
            action={
              <Link 
                to="/student/courses"
                style={{ 
                  display: 'inline-block',
                  backgroundColor: colors.accent,
                  color: 'white',
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: borderRadius.md,
                  textDecoration: 'none',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Browse Courses
              </Link>
            }
          />
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentLmsDashboard;
