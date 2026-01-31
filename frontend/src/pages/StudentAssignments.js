import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Get all enrolled courses
      const enrollmentsRes = await api.get('/lms/enrollments/student');
      const enrollments = enrollmentsRes.data.data || [];

      // Get assignments for each course
      const allAssignments = [];
      for (const enrollment of enrollments) {
        try {
          const assignmentsRes = await api.get(`/lms/courses/${enrollment.courseId._id}/assignments`);
          const courseAssignments = (assignmentsRes.data.data || []).map(a => ({
            ...a,
            courseName: enrollment.courseId.title,
            courseId: enrollment.courseId._id
          }));
          allAssignments.push(...courseAssignments);
        } catch (err) {
          console.error('Failed to fetch assignments for course:', err);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    if (!submissionText && !submissionFile) {
      setMessage('Please provide submission text or upload a file');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');

      const formData = new FormData();
      if (submissionText) formData.append('submissionText', submissionText);
      if (submissionFile) formData.append('file', submissionFile);

      await api.post(`/lms/assignments/${selectedAssignment._id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('Assignment submitted successfully!');
      setSelectedAssignment(null);
      setSubmissionText('');
      setSubmissionFile(null);
      fetchAssignments();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submission?.status === 'graded') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Graded</span>;
    }
    if (assignment.submission?.status === 'submitted') {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Submitted</span>;
    }
    const dueDate = new Date(assignment.deadline);
    const now = new Date();
    if (dueDate < now) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
  };

  const filteredAssignments = assignments.filter(a => {
    // Filter by status
    if (filter !== 'all') {
      if (filter === 'pending' && a.submission) return false;
      if (filter === 'submitted' && a.submission?.status !== 'submitted') return false;
      if (filter === 'graded' && a.submission?.status !== 'graded') return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(search) ||
        a.courseName.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => !a.submission).length,
    submitted: assignments.filter(a => a.submission?.status === 'submitted').length,
    graded: assignments.filter(a => a.submission?.status === 'graded').length
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-black">My Assignments</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">View and submit your course assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg md:rounded-xl p-3 md:p-6 border border-indigo-500">
          <p className="text-white text-xs md:text-sm font-medium">Total</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.total}</h3>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg md:rounded-xl p-3 md:p-6 border border-yellow-500">
          <p className="text-white text-xs md:text-sm font-medium">Pending</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.pending}</h3>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-500">
          <p className="text-white text-xs md:text-sm font-medium">Submitted</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.submitted}</h3>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg md:rounded-xl p-3 md:p-6 border border-green-500">
          <p className="text-white text-xs md:text-sm font-medium">Graded</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{stats.graded}</h3>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-1 md:gap-2 overflow-x-auto">
          {['all', 'pending', 'submitted', 'graded'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 md:px-4 py-2 rounded-lg font-medium text-xs md:text-sm transition whitespace-nowrap ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <p className="text-black">No assignments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assignment => (
            <div key={assignment._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-black">{assignment.title}</h3>
                    {getStatusBadge(assignment)}
                  </div>
                  <p className="text-sm text-black mb-2">{assignment.courseName}</p>
                  <p className="text-black mb-3">{assignment.description}</p>
                  <div className="flex items-center gap-4 text-sm text-black">
                    <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    <span>📊 Max Score: {assignment.maxScore}</span>
                    {assignment.submission?.score !== undefined && (
                      <span className="font-semibold text-green-600">
                        ✅ Score: {assignment.submission.score}/{assignment.maxScore}
                      </span>
                    )}
                  </div>
                  {assignment.submission?.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-black">Instructor Feedback:</p>
                      <p className="text-sm text-black mt-1">{assignment.submission.feedback}</p>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {!assignment.submission ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
                    >
                      Submit
                    </button>
                  ) : assignment.submission.status === 'submitted' ? (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition"
                    >
                      Resubmit
                    </button>
                  ) : (
                    <Link
                      to={`/student/courses/${assignment.courseId}`}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-black font-medium transition inline-block"
                    >
                      View Course
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-black">{selectedAssignment.title}</h2>
                <p className="text-sm text-black mt-1">{selectedAssignment.courseName}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionText('');
                  setSubmissionFile(null);
                  setMessage('');
                }}
                className="text-black hover:text-black"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Submission Text (Optional)
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  placeholder="Enter your submission text here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
                {submissionFile && (
                  <p className="text-sm text-black mt-2">Selected: {submissionFile.name}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium disabled:opacity-50 transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAssignment(null);
                    setSubmissionText('');
                    setSubmissionFile(null);
                    setMessage('');
                  }}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-black font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default StudentAssignments;
