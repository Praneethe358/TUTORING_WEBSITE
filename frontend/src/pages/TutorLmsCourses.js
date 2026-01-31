import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor LMS Courses Dashboard
 * Manage and create LMS courses with modules, lessons, assignments, quizzes
 */
const TutorLmsCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'Beginner',
    duration: '',
    thumbnail: '',
    prerequisites: '',
    learningOutcomes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/lms/courses', {
        params: { instructor: 'current' }
      });
      setCourses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load LMS courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      // Parse learning outcomes and prerequisites (comma-separated)
      const payload = {
        ...formData,
        duration: parseInt(formData.duration) || 0,
        prerequisitesList: formData.prerequisites
          ? formData.prerequisites.split(',').map(p => p.trim())
          : [],
        learningOutcomesList: formData.learningOutcomes
          ? formData.learningOutcomes.split(',').map(o => o.trim())
          : []
      };

      await api.post('/lms/courses', payload);
      alert('Course created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        level: 'Beginner',
        duration: '',
        thumbnail: '',
        prerequisites: '',
        learningOutcomes: ''
      });
      fetchCourses();
    } catch (err) {
      console.error('Create course error:', err);
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/lms/courses/${courseId}`);
      alert('Course deleted successfully');
      fetchCourses();
      setSelectedCourse(null);
    } catch (err) {
      console.error('Delete course error:', err);
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const res = await api.patch(`/lms/courses/${courseId}/publish`);
      alert(res.data.message);
      fetchCourses();
    } catch (err) {
      console.error('Publish toggle error:', err);
      alert(err.response?.data?.message || 'Failed to update course status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">LMS Courses</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">Create and manage your LMS-hosted courses</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium min-h-[44px] whitespace-nowrap"
        >
          + Create Course
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>
      )}

      {/* Create Course Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-white">Create New Course</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                    placeholder="e.g., React Advanced Patterns"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    <option value="">Select Category</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[120px]"
                  rows="3"
                  placeholder="Course overview and what students will learn"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Duration (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                    placeholder="e.g., 40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Prerequisites (comma-separated)</label>
                <input
                  type="text"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                  placeholder="e.g., JavaScript basics, HTML/CSS"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5">Learning Outcomes (comma-separated)</label>
                <input
                  type="text"
                  value={formData.learningOutcomes}
                  onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm min-h-[44px] sm:min-h-[auto]"
                  placeholder="e.g., Master React patterns, Build real-world apps"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 sm:px-6 py-3 sm:py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white font-medium min-h-[44px] sm:min-h-[auto]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-6 py-3 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium min-h-[44px] sm:min-h-[auto]"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-6 sm:p-12 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6">No LMS courses found. Create your first course to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium min-h-[44px]"
          >
            Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {courses.map(course => (
            <div
              key={course._id}
              className="bg-slate-800 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-700 hover:border-indigo-500 transition cursor-pointer"
              onClick={() => setSelectedCourse(course._id === selectedCourse ? null : course._id)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">{course.title}</h3>
                  {course.description && (
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{course.description}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap ml-0 sm:ml-4 w-fit ${
                    course.status === 'published'
                      ? 'bg-green-900 text-green-300'
                      : course.status === 'scheduled'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {course.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">
                <span>{course.category}</span>
                <span>•</span>
                <span>{course.level}</span>
                {course.duration && (
                  <>
                    <span>•</span>
                    <span>{course.duration}h</span>
                  </>
                )}
                <span>•</span>
                <span>{course.enrolledStudents?.length || 0} students</span>
              </div>

              {selectedCourse === course._id && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/lms/courses/${course._id}/edit`);
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    Edit Course
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/lms/courses/${course._id}/modules`);
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    Manage Modules & Lessons
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/lms/courses/${course._id}/assignments`);
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    Manage Assignments
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/lms/courses/${course._id}/quizzes`);
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    Manage Quizzes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/lms/courses/${course._id}/grading`);
                    }}
                    className="w-full px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                  >
                    View Submissions & Grade
                  </button>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishToggle(course._id, course.status);
                      }}
                      className={`flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-lg font-medium text-sm min-h-[44px] sm:min-h-[auto] ${
                        course.status === 'published'
                          ? 'bg-yellow-900 hover:bg-yellow-800 text-yellow-300'
                          : 'bg-green-900 hover:bg-green-800 text-green-300'
                      }`}
                    >
                      {course.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course._id);
                      }}
                      className="flex-1 px-3 sm:px-4 py-3 sm:py-2 rounded-lg bg-red-900 hover:bg-red-800 text-red-300 font-medium text-sm min-h-[44px] sm:min-h-[auto]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorLmsCourses;

