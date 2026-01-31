import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import api from '../lib/api';

/**
 * Student Course Catalog
 * Browse and enroll in available courses
 */
const StudentCourseCatalog = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch published courses
      const coursesRes = await api.get('/lms/courses', {
        params: { status: 'published', ...filters }
      });
      setCourses(coursesRes.data.data || []);

      // Fetch enrolled courses
      const enrollmentsRes = await api.get('/lms/enrollments');
      const enrolledIds = (enrollmentsRes.data.data || []).map(e => e.courseId._id);
      setEnrolledCourseIds(enrolledIds);
    } catch (err) {
      console.error('Fetch data error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/lms/courses/${courseId}/enroll`);
      alert('Enrolled successfully!');
      fetchData();
    } catch (err) {
      console.error('Enroll error:', err);
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Course Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and enroll in courses</p>
      </div>

      {/* Filters */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-white border border-gray-200 text-black hover:border-indigo-500 min-h-[44px]"
        >
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
        </select>

        <select
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
          className="w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg bg-white border border-gray-200 text-black hover:border-indigo-500 min-h-[44px]"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-black">No courses available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map(course => (
            <div
              key={course._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-36 sm:h-48 object-cover"
                />
              )}
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-black mb-2">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                  <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {course.category}
                  </span>
                  <span>{course.level}</span>
                  {course.duration && <span>{course.duration}h</span>}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  <span>Instructor: {course.instructor?.name || 'Unknown'}</span>
                </div>

                {isEnrolled(course._id) ? (
                  <button
                    onClick={() => navigate(`/student/courses/${course._id}`)}
                    className="w-full px-4 py-3 sm:py-2 rounded-lg bg-green-100 border border-green-200 text-green-700 font-medium hover:bg-green-50 min-h-[44px]"
                  >
                    Continue Learning
                  </button>
                ) : (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    className="w-full px-4 py-3 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium min-h-[44px]"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentCourseCatalog;
