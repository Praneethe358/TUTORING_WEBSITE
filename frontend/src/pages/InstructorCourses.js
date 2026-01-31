import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * Instructor Course Management Page
 * List, create, edit, delete courses
 */
const InstructorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Get instructor's own courses
      const res = await api.get('/lms/courses', {
        params: { instructor: 'current' }
      });
      setCourses(res.data.data || []);
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This will delete all modules, lessons, and student progress.')) {
      return;
    }

    try {
      await api.delete(`/lms/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      console.error('Delete course error:', err);
      alert('Failed to delete course');
    }
  };

  const handleTogglePublish = async (courseId, currentStatus) => {
    try {
      await api.patch(`/lms/courses/${courseId}/publish`);
      fetchCourses();
    } catch (err) {
      console.error('Toggle publish error:', err);
      alert('Failed to update course status');
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black">My Courses</h1>
          <p className="text-slate-400 mt-1">Manage your course content</p>
        </div>
        <button
          onClick={() => navigate('/tutor/courses/create')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          + Create Course
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400">No courses yet</p>
          <p className="text-sm text-slate-500 mt-2">Create your first course to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div
              key={course._id}
              className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-indigo-500 transition"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-green-900/30 text-green-300 border border-green-700'
                        : 'bg-gray-900/30 text-gray-300 border border-gray-700'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span>{course.category}</span>
                  <span>{course.level}</span>
                  {course.duration && <span>{course.duration}h</span>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/tutor/courses/${course._id}/edit`)}
                    className="flex-1 min-w-[80px] px-3 py-2 rounded-lg bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-700 text-indigo-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleTogglePublish(course._id, course.status)}
                    className="flex-1 min-w-[80px] px-3 py-2 rounded-lg bg-green-900/30 hover:bg-green-900/50 border border-green-700 text-green-300 text-sm font-medium"
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstructorCourses;
