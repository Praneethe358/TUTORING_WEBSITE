import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor LMS Grading Dashboard
 * Grade assignments and view quiz results
 */
const TutorLmsGrading = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({ score: '', feedback: '' });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseRes, assignmentsRes] = await Promise.all([
        api.get(`/lms/courses/${courseId}`),
        api.get(`/lms/courses/${courseId}/assignments`)
      ]);

      setCourse(courseRes.data.data.course);
      setAssignments(assignmentsRes.data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/lms/assignments/${assignmentId}/submissions`);
      setSubmissions(res.data.data || []);
      setSelectedAssignment(assignmentId);
    } catch (err) {
      console.error('Fetch submissions error:', err);
      alert(err.response?.data?.message || 'Failed to fetch submissions');
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await api.put(`/lms/submissions/${gradingSubmission._id}/grade`, {
        score: parseInt(gradeFormData.score) || 0,
        feedback: gradeFormData.feedback
      });
      alert('Submission graded successfully!');
      setGradingSubmission(null);
      setGradeFormData({ score: '', feedback: '' });
      fetchSubmissions(selectedAssignment);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to grade submission');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/tutor/lms/courses')} className="text-slate-400 hover:text-white">← Back</button>
        <div>
          <h1 className="text-3xl font-bold text-white">Grading Dashboard</h1>
          {course && <p className="text-slate-400 mt-1">{course.title}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Assignments</h3>
          <div className="space-y-2">
            {assignments.length === 0 ? (
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-slate-400 text-sm">
                No assignments
              </div>
            ) : (
              assignments.map((assignment) => (
                <button
                  key={assignment._id}
                  onClick={() => fetchSubmissions(assignment._id)}
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    selectedAssignment === assignment._id
                      ? 'bg-indigo-900/30 border-indigo-700'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <p className="font-medium text-white">{assignment.title}</p>
                  <p className="text-xs text-slate-400 mt-1">Max: {assignment.maxScore}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Submissions List */}
        <div className="lg:col-span-2">
          {selectedAssignment && submissions.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Submissions ({submissions.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {submissions.map((submission) => (
                  <div key={submission._id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">{submission.studentId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{submission.studentId?.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          submission.status === 'graded'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-blue-900/30 text-blue-400'
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                    {submission.status === 'graded' ? (
                      <div className="bg-slate-900 rounded p-3 mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold text-indigo-400">
                            Score: {submission.score}
                          </span>
                        </div>
                        {submission.feedback && (
                          <p className="text-xs text-slate-300 italic">"{submission.feedback}"</p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setGradingSubmission(submission);
                          setGradeFormData({ score: '', feedback: '' });
                        }}
                        className="w-full px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                      >
                        Grade Submission
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedAssignment ? (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
              <p className="text-slate-400">No submissions yet</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
              <p className="text-slate-400">Select an assignment to view submissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Grading Form Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Grade Submission</h2>
              <button
                onClick={() => setGradingSubmission(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Student</p>
              <p className="text-white font-medium">{gradingSubmission.studentId?.name}</p>
              <p className="text-sm text-slate-400 mt-2">{gradingSubmission.studentId?.email}</p>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Score *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={gradeFormData.score}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, score: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
                  placeholder="e.g., 85"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Feedback</label>
                <textarea
                  value={gradeFormData.feedback}
                  onChange={(e) => setGradeFormData({ ...gradeFormData, feedback: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 outline-none"
                  rows="4"
                  placeholder="Provide constructive feedback to the student..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorLmsGrading;
