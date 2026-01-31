import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';

/**
 * Tutor LMS Assignments Management
 */
const TutorLmsAssignments = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    maxScore: 100,
    attachmentUrl: ''
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/lms/courses/${courseId}/assignments`, {
        ...formData,
        maxScore: parseInt(formData.maxScore) || 100
      });
      alert('Assignment created!');
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        deadline: '',
        maxScore: 100,
        attachmentUrl: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/lms/assignments/${assignmentId}`);
      alert('Assignment deleted');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete assignment');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-black">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tutor/lms/courses')} className="text-black hover:text-gray-800">← Back</button>
          <div>
            <h1 className="text-3xl font-bold text-black">Assignments</h1>
            {course && <p className="text-black mt-1">{course.title}</p>}
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          + Create Assignment
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-black">Create Assignment</h2>
              <button onClick={() => setShowForm(false)} className="text-black hover:text-gray-800 text-2xl">×</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-black"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Max Score</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-black"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-lg border border-slate-700 text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <p className="text-black mb-6">No assignments yet.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-black">{assignment.title}</h3>
                  {assignment.description && <p className="text-black text-sm mt-1">{assignment.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(assignment._id)}
                  className="px-3 py-1 rounded text-xs bg-red-900/30 hover:bg-red-900 text-red-400"
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-4 text-sm text-black">
                <span>Max Score: {assignment.maxScore}</span>
                {assignment.deadline && <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TutorLmsAssignments;
