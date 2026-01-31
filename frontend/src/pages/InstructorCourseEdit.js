import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * Instructor Course Edit Page
 * Manage course content: modules, lessons, assignments, quizzes
 */
const InstructorCourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum'); // basics, curriculum, assignments, quizzes
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [viewingAttempts, setViewingAttempts] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingData, setGradingData] = useState({ score: 0, feedback: '' });
  
  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lms/courses/${id}`);
      if (res.data?.data) {
        setCourse(res.data.data.course);
        setModules(res.data.data.modules || []);
        setAssignments(res.data.data.assignments || []);
        setQuizzes(res.data.data.quizzes || []);
      }
    } catch (err) {
      console.error('Fetch course error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handle Course Update
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lms/courses/${id}`, course);
      alert('Course updated successfully!');
    } catch (err) {
      console.error('Update course error:', err);
      alert('Failed to update course');
    }
  };

  // Module Management
  const handleAddModule = async () => {
    const title = prompt('Enter module title:');
    if (!title) return;

    try {
      await api.post(`/lms/courses/${id}/modules`, { title });
      fetchCourseData();
    } catch (err) {
      console.error('Add module error:', err);
      alert('Failed to add module');
    }
  };

  const handleUpdateModule = async (moduleId, currentTitle) => {
    const title = prompt('Update module title:', currentTitle);
    if (!title || title === currentTitle) return;

    try {
      await api.put(`/lms/modules/${moduleId}`, { title });
      fetchCourseData();
    } catch (err) {
      console.error('Update module error:', err);
      alert('Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;

    try {
      await api.delete(`/lms/modules/${moduleId}`);
      fetchCourseData();
    } catch (err) {
      console.error('Delete module error:', err);
      alert('Failed to delete module');
    }
  };

  // Lesson Management
  const handleAddLesson = async (moduleId) => {
    const title = prompt('Enter lesson title:');
    if (!title) return;

    try {
      await api.post(`/lms/modules/${moduleId}/lessons`, { 
        title, 
        type: 'text',
        textContent: 'Initial content'
      });
      fetchCourseData();
    } catch (err) {
      console.error('Add lesson error:', err);
      alert('Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;

    try {
      await api.delete(`/lms/lessons/${lessonId}`);
      fetchCourseData();
    } catch (err) {
      console.error('Delete lesson error:', err);
      alert('Failed to delete lesson');
    }
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lms/lessons/${editingLesson._id}`, editingLesson);
      setEditingLesson(null);
      fetchCourseData();
      alert('Lesson updated!');
    } catch (err) {
      console.error('Update lesson error:', err);
      alert('Failed to update lesson');
    }
  };

  // Assignment Management
  const handleAddAssignment = async () => {
    const title = prompt('Enter assignment title:');
    if (!title) return;

    const description = prompt('Enter assignment description:');
    if (!description) return;
    
    try {
      // Set a default deadline 7 days from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);

      await api.post(`/lms/courses/${id}/assignments`, { 
        title, 
        description,
        maxScore: 100,
        deadline: defaultDeadline
      });
      fetchCourseData();
    } catch (err) {
      console.error('Add assignment error:', err);
      alert('Failed to add assignment: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) return;

    try {
      await api.delete(`/lms/assignments/${assignmentId}`);
      fetchCourseData();
    } catch (err) {
      console.error('Delete assignment error:', err);
      alert('Failed to delete assignment');
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lms/assignments/${editingAssignment._id}`, editingAssignment);
      setEditingAssignment(null);
      fetchCourseData();
      alert('Assignment updated!');
    } catch (err) {
      console.error('Update assignment error:', err);
      alert('Failed to update assignment');
    }
  };

  // Quiz Management
  const handleAddQuiz = async () => {
    const title = prompt('Enter quiz title:');
    if (!title) return;

    try {
      await api.post(`/lms/courses/${id}/quizzes`, { 
        title,
        description: 'Quiz description',
        questions: [],
        timeLimit: 30,
        maxAttempts: 3
      });
      fetchCourseData();
    } catch (err) {
      console.error('Add quiz error:', err);
      alert('Failed to add quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;

    try {
      await api.delete(`/lms/quizzes/${quizId}`);
      fetchCourseData();
    } catch (err) {
      console.error('Delete quiz error:', err);
      alert('Failed to delete quiz');
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lms/quizzes/${editingQuiz._id}`, editingQuiz);
      setEditingQuiz(null);
      fetchCourseData();
      alert('Quiz updated!');
    } catch (err) {
      console.error('Update quiz error:', err);
      alert('Failed to update quiz');
    }
  };

  // Fetch Submissions
  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/lms/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.data || []);
      setViewingSubmissions(assignmentId);
    } catch (err) {
      console.error('Fetch submissions error:', err);
      alert('Failed to fetch submissions');
    }
  };

  // Fetch Attempts
  const fetchAttempts = async (quizId) => {
    try {
      const res = await api.get(`/lms/quizzes/${quizId}/attempts`);
      setAttempts(res.data.data || []);
      setViewingAttempts(quizId);
    } catch (err) {
      console.error('Fetch attempts error:', err);
      alert('Failed to fetch attempts');
    }
  };

  // Grade Submission
  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/lms/submissions/${gradingSubmission._id}/grade`, gradingData);
      setGradingSubmission(null);
      fetchSubmissions(viewingSubmissions);
      alert('Submission graded!');
    } catch (err) {
      console.error('Grade submission error:', err);
      alert('Failed to grade submission');
    }
  };

  // Reorder Modules
  const handleMoveModule = async (index, direction) => {
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;

    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    try {
      await api.patch(`/lms/courses/${id}/modules/reorder`, {
        moduleIds: newModules.map(m => m._id)
      });
      fetchCourseData();
    } catch (err) {
      console.error('Reorder modules error:', err);
      alert('Failed to reorder modules');
    }
  };

  // Reorder Lessons
  const handleMoveLesson = async (moduleId, index, direction) => {
    const module = modules.find(m => m._id === moduleId);
    if (!module) return;

    const newLessons = [...module.lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;

    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];

    try {
      await api.patch(`/lms/modules/${moduleId}/lessons/reorder`, {
        lessonIds: newLessons.map(l => l._id)
      });
      fetchCourseData();
    } catch (err) {
      console.error('Reorder lessons error:', err);
      alert('Failed to reorder lessons');
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={TutorSidebar}>
        <div className="text-center py-12 text-slate-400">Loading course details...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout sidebar={TutorSidebar}>
        <div className="text-center py-12 text-slate-400">Course not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/tutor/lms/courses')}
            className="text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-2"
          >
            ← Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-black">{course.title}</h1>
          <p className="text-slate-400">Manage your course content and structure</p>
        </div>
        <div className="flex gap-2">
           <button
             onClick={() => navigate(`/student/courses/${course._id}`)}
             className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium"
           >
             Preview as Student
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 mb-6">
        {['basics', 'curriculum', 'assignments', 'quizzes'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'basics' && (
        <form onSubmit={handleUpdateCourse} className="space-y-6 max-w-2xl">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Title</label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Description</label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
            <button
              onClick={handleAddModule}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              + Add Module
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, modIdx) => (
              <div key={module._id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-4 bg-slate-700/50 flex justify-between items-center border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">#{modIdx + 1}</span>
                    <h3 className="font-semibold text-white">{module.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex bg-slate-900/50 rounded p-1 border border-slate-700 mr-2">
                      <button
                        onClick={() => handleMoveModule(modIdx, 'up')}
                        disabled={modIdx === 0}
                        className="px-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveModule(modIdx, 'down')}
                        disabled={modIdx === modules.length - 1}
                        className="px-1 text-slate-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        ↓
                      </button>
                    </div>
                    <button
                      onClick={() => handleAddLesson(module._id)}
                      className="px-2 py-1 text-xs bg-green-900/30 text-green-400 border border-green-700 rounded hover:bg-green-900/50"
                    >
                      + Add Lesson
                    </button>
                    <button
                      onClick={() => handleUpdateModule(module._id, module.title)}
                      className="px-2 py-1 text-xs bg-indigo-900/30 text-indigo-400 border border-indigo-700 rounded hover:bg-indigo-900/50"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module._id)}
                      className="px-2 py-1 text-xs bg-red-900/30 text-red-400 border border-red-700 rounded hover:bg-red-900/50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  {module.lessons && module.lessons.length > 0 ? (
                    module.lessons.map((lesson, lessonIdx) => (
                      <div key={lesson._id} className="flex justify-between items-center p-3 bg-slate-700/20 rounded-lg border border-slate-600/50">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{modIdx + 1}.{lessonIdx + 1}</span>
                          <span className="text-sm text-slate-300">{lesson.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-600 text-slate-300 uppercase font-bold">
                            {lesson.type}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex bg-slate-900/30 rounded px-1 border border-slate-700/50 mr-2">
                            <button
                              onClick={() => handleMoveLesson(module._id, lessonIdx, 'up')}
                              disabled={lessonIdx === 0}
                              className="px-1 text-slate-500 hover:text-white disabled:opacity-20 text-[10px]"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveLesson(module._id, lessonIdx, 'down')}
                              disabled={lessonIdx === module.lessons.length - 1}
                              className="px-1 text-slate-500 hover:text-white disabled:opacity-20 text-[10px]"
                            >
                              ↓
                            </button>
                          </div>
                          <button
                            onClick={() => setEditingLesson(lesson)}
                            className="text-slate-400 hover:text-indigo-400 p-1"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(lesson._id)}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center py-4 text-sm text-slate-500">No lessons in this module</p>
                  )}
                </div>
              </div>
            ))}

            {modules.length === 0 && (
              <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                <p className="text-slate-500">No modules yet. Click "+ Add Module" to start building your curriculum.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Assignments</h2>
            <button
              onClick={handleAddAssignment}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              + Create Assignment
            </button>
          </div>

          <div className="grid gap-4">
            {assignments.map((assignment) => (
              <div key={assignment._id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">{assignment.title}</h3>
                  <p className="text-sm text-slate-400">{assignment.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchSubmissions(assignment._id)}
                    className="px-3 py-1 text-xs bg-green-900/30 text-green-400 border border-green-700 rounded hover:bg-green-900/50"
                  >
                    Submissions
                  </button>
                  <button
                    onClick={() => setEditingAssignment(assignment)}
                    className="px-3 py-1 text-xs bg-indigo-900/30 text-indigo-400 border border-indigo-700 rounded hover:bg-indigo-900/50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="px-3 py-1 text-xs bg-red-900/30 text-red-400 border border-red-700 rounded hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                <p className="text-slate-500">No assignments yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Quizzes</h2>
            <button
              onClick={handleAddQuiz}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              + Create Quiz
            </button>
          </div>

          <div className="grid gap-4">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-white">{quiz.title}</h3>
                  <p className="text-sm text-slate-400">{quiz.questions?.length || 0} Questions • {quiz.timeLimit} mins</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchAttempts(quiz._id)}
                    className="px-3 py-1 text-xs bg-green-900/30 text-green-400 border border-green-700 rounded hover:bg-green-900/50"
                  >
                    Attempts
                  </button>
                  <button
                    onClick={() => setEditingQuiz(quiz)}
                    className="px-3 py-1 text-xs bg-indigo-900/30 text-indigo-400 border border-indigo-700 rounded hover:bg-indigo-900/50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="px-3 py-1 text-xs bg-red-900/30 text-red-400 border border-red-700 rounded hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                <p className="text-slate-500">No quizzes yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Lesson</h2>
              <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdateLesson} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={editingLesson.type}
                  onChange={(e) => setEditingLesson({ ...editingLesson, type: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="text">Text Content</option>
                  <option value="video">Video Embed</option>
                  <option value="pdf">PDF Document</option>
                  <option value="ppt">PowerPoint</option>
                  <option value="resource">Resource Links</option>
                </select>
              </div>
              {editingLesson.type === 'text' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Content (HTML)</label>
                  <textarea
                    value={editingLesson.textContent}
                    onChange={(e) => setEditingLesson({ ...editingLesson, textContent: e.target.value })}
                    rows="10"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              )}
              {(editingLesson.type === 'video' || editingLesson.type === 'pdf' || editingLesson.type === 'ppt') && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Content URL</label>
                  <input
                    type="url"
                    value={editingLesson.contentUrl}
                    onChange={(e) => setEditingLesson({ ...editingLesson, contentUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    placeholder="https://..."
                  />
                  <p className="text-xs text-slate-500 mt-1">For video, use embed URL (e.g., https://www.youtube.com/embed/...)</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Editor Modal */}
      {editingQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Quiz</h2>
              <button onClick={() => setEditingQuiz(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdateQuiz} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time Limit (mins)</label>
                  <input
                    type="number"
                    value={editingQuiz.timeLimit}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, timeLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Attempts</label>
                  <input
                    type="number"
                    value={editingQuiz.maxAttempts}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, maxAttempts: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-white">Questions ({editingQuiz.questions?.length || 0})</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const qs = [...(editingQuiz.questions || [])];
                      qs.push({
                        questionText: 'New Question',
                        type: 'mcq',
                        options: ['Option 1', 'Option 2'],
                        correctAnswer: 'Option 1',
                        points: 1
                      });
                      setEditingQuiz({ ...editingQuiz, questions: qs });
                    }}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded"
                  >
                    + Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {(editingQuiz.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-500 font-mono">Question #{qIdx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const qs = editingQuiz.questions.filter((_, i) => i !== qIdx);
                            setEditingQuiz({ ...editingQuiz, questions: qs });
                          }}
                          className="text-red-400 text-xs hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={q.questionText}
                        onChange={(e) => {
                          const qs = [...editingQuiz.questions];
                          qs[qIdx].questionText = e.target.value;
                          setEditingQuiz({ ...editingQuiz, questions: qs });
                        }}
                        className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-white"
                        placeholder="Question text..."
                      />
                      
                      <div className="space-y-2">
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2 items-center">
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={q.correctAnswer === opt}
                              onChange={() => {
                                const qs = [...editingQuiz.questions];
                                qs[qIdx].correctAnswer = opt;
                                setEditingQuiz({ ...editingQuiz, questions: qs });
                              }}
                              className="w-4 h-4 border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const qs = [...editingQuiz.questions];
                                const oldVal = qs[qIdx].options[oIdx];
                                qs[qIdx].options[oIdx] = e.target.value;
                                if (qs[qIdx].correctAnswer === oldVal) {
                                  qs[qIdx].correctAnswer = e.target.value;
                                }
                                setEditingQuiz({ ...editingQuiz, questions: qs });
                              }}
                              className="flex-1 px-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const qs = [...editingQuiz.questions];
                                qs[qIdx].options = qs[qIdx].options.filter((_, i) => i !== oIdx);
                                setEditingQuiz({ ...editingQuiz, questions: qs });
                              }}
                              className="text-slate-500 hover:text-red-400"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const qs = [...editingQuiz.questions];
                            if (!qs[qIdx].options) qs[qIdx].options = [];
                            qs[qIdx].options.push('New Option');
                            setEditingQuiz({ ...editingQuiz, questions: qs });
                          }}
                          className="text-[10px] text-indigo-400 hover:underline"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingQuiz(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Editor Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Edit Assignment</h2>
              <button onClick={() => setEditingAssignment(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleUpdateAssignment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editingAssignment.title}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={editingAssignment.description}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Max Score</label>
                <input
                  type="number"
                  value={editingAssignment.maxScore}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, maxScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  value={editingAssignment.deadline ? new Date(editingAssignment.deadline).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, deadline: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {viewingSubmissions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Submissions</h2>
              <button onClick={() => setViewingSubmissions(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <div key={sub._id} className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-white font-semibold">{sub.studentId?.name || 'Unknown Student'}</p>
                          <p className="text-xs text-slate-500">{new Date(sub.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'graded' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                          }`}>
                            {sub.status}
                          </span>
                          {sub.score !== undefined && (
                            <p className="text-sm font-bold text-indigo-400 mt-1">{sub.score} / {sub.assignmentId?.maxScore}</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3 text-sm text-slate-300 mb-4 whitespace-pre-wrap">
                        {sub.submissionText || <span className="text-slate-500 italic">No text provided</span>}
                      </div>

                      {sub.submissionUrl && sub.submissionUrl !== 'text-only' && (
                        <div className="mb-4">
                          <a 
                            href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${sub.submissionUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-indigo-400 font-medium transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Submitted File
                          </a>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setGradingSubmission(sub);
                          setGradingData({ score: sub.score || 0, feedback: sub.feedback || '' });
                        }}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-slate-500">No submissions found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Grade Submission</h2>
              <button onClick={() => setGradingSubmission(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleGradeSubmission} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Score</label>
                <input
                  type="number"
                  value={gradingData.score}
                  onChange={(e) => setGradingData({ ...gradingData, score: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Feedback</label>
                <textarea
                  value={gradingData.feedback}
                  onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attempts Modal */}
      {viewingAttempts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Quiz Attempts</h2>
              <button onClick={() => setViewingAttempts(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-sm border-b border-slate-700">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Score</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {attempts.length > 0 ? (
                      attempts.map((attempt) => (
                        <tr key={attempt._id} className="text-sm">
                          <td className="py-4">
                            <p className="text-white font-medium">{attempt.studentId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{attempt.studentId?.email}</p>
                          </td>
                          <td className="py-4 text-slate-400">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className="text-indigo-400 font-bold">{attempt.percentage}%</span>
                            <span className="text-xs text-slate-500 ml-1">({attempt.score}/{attempt.totalPoints})</span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              attempt.passed ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                            }`}>
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">No attempts yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default InstructorCourseEdit;
