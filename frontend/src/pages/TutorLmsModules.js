import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor LMS Module & Lesson Management
 * Create, edit, and manage modules and lessons within a course
 */
const TutorLmsModules = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [moduleFormData, setModuleFormData] = useState({ title: '', description: '' });
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    contentUrl: '',
    textContent: '',
    duration: '',
    isFree: false,
    isLocked: true
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, modulesRes] = await Promise.all([
        api.get(`/lms/courses/${courseId}`),
        api.get(`/lms/courses/${courseId}/modules`)
      ]);

      setCourse(courseRes.data.data.course);
      const modulesList = modulesRes.data.data || [];
      
      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        modulesList.map(async (module) => {
          try {
            const lessonsRes = await api.get(`/lms/modules/${module._id}/lessons`);
            return {
              ...module,
              lessons: lessonsRes.data.data || []
            };
          } catch {
            return { ...module, lessons: [] };
          }
        })
      );

      setModules(modulesWithLessons);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/lms/courses/${courseId}/modules`, moduleFormData);
      alert('Module created successfully!');
      setShowModuleForm(false);
      setModuleFormData({ title: '', description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create module');
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!selectedModule) {
      alert('Please select a module first');
      return;
    }

    try {
      const payload = {
        ...lessonFormData,
        duration: parseInt(lessonFormData.duration) || 0
      };

      await api.post(`/lms/modules/${selectedModule}/lessons`, payload);
      alert('Lesson created successfully!');
      setShowLessonForm(false);
      setLessonFormData({
        title: '',
        description: '',
        type: 'video',
        contentUrl: '',
        textContent: '',
        duration: '',
        isFree: false,
        isLocked: true
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create lesson');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/lms/modules/${moduleId}`);
      alert('Module deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/lms/lessons/${lessonId}`);
      alert('Lesson deleted successfully');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tutor/lms/courses')}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Modules & Lessons</h1>
            {course && <p className="text-slate-400 mt-1">{course.title}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowModuleForm(true)}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          + Add Module
        </button>
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Module</h2>
              <button onClick={() => setShowModuleForm(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Module Title *</label>
                <input
                  type="text"
                  required
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="e.g., Introduction to React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={moduleFormData.description}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModuleForm(false)}
                  className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && selectedModule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Lesson</h2>
              <button onClick={() => setShowLessonForm(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleCreateLesson} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Lesson Title *</label>
                <input
                  type="text"
                  required
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Content Type *</label>
                <select
                  required
                  value={lessonFormData.type}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="video">Video</option>
                  <option value="text">Text Content</option>
                  <option value="pdf">PDF</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="resource">Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Content URL</label>
                <input
                  type="url"
                  value={lessonFormData.contentUrl}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, contentUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="0"
                  value={lessonFormData.duration}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lessonFormData.isFree}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, isFree: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Free Preview</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lessonFormData.isLocked}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, isLocked: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Locked Until Complete Previous</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <p className="text-slate-400 mb-6">No modules yet. Create your first module to start building your course.</p>
          </div>
        ) : (
          modules.map((module, idx) => (
            <div key={module._id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-6 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    Module {idx + 1}: {module.title}
                  </h3>
                  {module.description && <p className="text-slate-400 text-sm mt-1">{module.description}</p>}
                  <p className="text-slate-500 text-sm mt-2">{module.lessons?.length || 0} lessons</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedModule(module._id);
                      setShowLessonForm(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
                  >
                    + Lesson
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module._id)}
                    className="px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900 text-red-400 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {module.lessons && module.lessons.length > 0 && (
                <div className="border-t border-slate-700 p-6 bg-slate-900/30">
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIdx) => (
                      <div key={lesson._id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {idx + 1}.{lessonIdx + 1} {lesson.title}
                          </p>
                          <p className="text-sm text-slate-400">{lesson.type} • {lesson.duration || 0} min</p>
                        </div>
                        <button
                          onClick={() => handleDeleteLesson(lesson._id)}
                          className="px-3 py-1 rounded text-xs bg-red-900/30 hover:bg-red-900 text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorLmsModules;
