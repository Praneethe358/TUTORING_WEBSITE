import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor LMS Quizzes Management
 */
const TutorLmsQuizzes = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 60,
    maxAttempts: 3,
    questions: [{ questionText: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '', points: 10 }]
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, quizzesRes] = await Promise.all([
        api.get(`/lms/courses/${courseId}`),
        api.get(`/lms/courses/${courseId}/quizzes`)
      ]);

      setCourse(courseRes.data.data.course);
      setQuizzes(quizzesRes.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/lms/courses/${courseId}/quizzes`, {
        ...formData,
        timeLimit: parseInt(formData.timeLimit) || 30,
        passingScore: parseInt(formData.passingScore) || 60,
        maxAttempts: parseInt(formData.maxAttempts) || 3
      });
      alert('Quiz created!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 60,
        maxAttempts: 3,
        questions: [{ questionText: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '', points: 10 }]
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/lms/quizzes/${quizId}`);
      alert('Quiz deleted');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete quiz');
    }
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIdx, optIdx, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIdx].options[optIdx] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { questionText: '', type: 'multiple-choice', options: ['', '', '', ''], correctAnswer: '', points: 10 }
      ]
    });
  };

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tutor/lms/courses')} className="text-slate-400 hover:text-white">← Back</button>
          <div>
            <h1 className="text-3xl font-bold text-white">Quizzes</h1>
            {course && <p className="text-slate-400 mt-1">{course.title}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          + Create Quiz
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create Quiz</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  rows="2"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time Limit (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Passing Score %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Max Attempts</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">Questions</h3>
                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} className="mb-4 p-4 bg-slate-900 rounded-lg space-y-3 border border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Question {qIdx + 1}</span>
                      {formData.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIdx)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Question text"
                      value={q.questionText}
                      onChange={(e) => updateQuestion(qIdx, 'questionText', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <input
                          key={optIdx}
                          type="text"
                          placeholder={`Option ${optIdx + 1}`}
                          value={opt}
                          onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                        />
                      ))}
                    </div>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(qIdx, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                    >
                      <option value="">Select correct answer</option>
                      {q.options.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt || `Option ${idx + 1}`}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Points"
                      value={q.points}
                      onChange={(e) => updateQuestion(qIdx, 'points', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="w-full px-3 py-2 border border-slate-600 rounded text-slate-300 hover:text-white text-sm font-medium"
                >
                  + Add Question
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quizzes List */}
      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <p className="text-slate-400 mb-6">No quizzes yet.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                  {quiz.description && <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(quiz._id)}
                  className="px-3 py-1 rounded text-xs bg-red-900/30 hover:bg-red-900 text-red-400"
                >
                  Delete
                </button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{quiz.questions?.length || 0} Questions</span>
                <span>{quiz.timeLimit} min</span>
                <span>Pass: {quiz.passingScore}%</span>
                <span>{quiz.maxAttempts} attempts</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorLmsQuizzes;
