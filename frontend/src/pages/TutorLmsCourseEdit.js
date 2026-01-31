import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor Course Edit Page
 * Edit course details and view course analytics
 */
const TutorLmsCourseEdit = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lms/courses/${courseId}`);
      setCourse(res.data.data.course);
      setFormData({
        title: res.data.data.course.title || '',
        description: res.data.data.course.description || '',
        category: res.data.data.course.category || '',
        level: res.data.data.course.level || 'Beginner',
        duration: res.data.data.course.duration || '',
        thumbnail: res.data.data.course.thumbnail || '',
        prerequisites: (res.data.data.course.prerequisites || []).join(', '),
        learningOutcomes: (res.data.data.course.learningOutcomes || []).join(', ')
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
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

      await api.put(`/lms/courses/${courseId}`, payload);
      alert('Course updated successfully!');
      fetchCourse();
    } catch (err) {
      console.error('Save error:', err);
      alert(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12 text-slate-400">
        Course not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/tutor/lms/courses')}
          className="text-slate-400 hover:text-white"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-white">Edit Course</h1>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
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
            <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              rows="5"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (hours)</label>
              <input
                type="number"
                min="0"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Thumbnail URL</label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
            />
            {formData.thumbnail && (
              <img
                src={formData.thumbnail}
                alt="Thumbnail preview"
                className="mt-3 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prerequisites (comma-separated)</label>
            <input
              type="text"
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              placeholder="e.g., JavaScript basics, HTML/CSS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Learning Outcomes (comma-separated)</label>
            <input
              type="text"
              value={formData.learningOutcomes}
              onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
              placeholder="e.g., Master React patterns, Build real-world apps"
            />
          </div>

          <div className="pt-6 border-t border-slate-700 flex justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate('/tutor/lms/courses')}
              className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Course Stats */}
      {course && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-indigo-400">{course.enrolledStudents?.length || 0}</div>
            <div className="text-sm text-slate-400 mt-2">Enrolled Students</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-green-400">{course.status}</div>
            <div className="text-sm text-slate-400 mt-2">Status</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-400">{course.version || 0}</div>
            <div className="text-sm text-slate-400 mt-2">Versions</div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 text-center">
            <div className="text-sm text-slate-400">Created</div>
            <div className="text-sm text-indigo-400 mt-2">{new Date(course.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorLmsCourseEdit;
