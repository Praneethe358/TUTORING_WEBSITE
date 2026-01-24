import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    loadCourses();
  }, [filter, page]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/courses', {
        params: { status: filter || undefined, page, limit: 10 }
      });
      setCourses(res.data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (courseId, act, msg = '') => {
    try {
      if (act === 'approve') {
        await api.put(`/admin/courses/${courseId}/approve`);
      } else if (act === 'reject') {
        await api.put(`/admin/courses/${courseId}/reject`, { reason: msg });
      }
      loadCourses();
      setSelectedCourse(null);
      setReason('');
      setAction('');
    } catch (err) {
      alert('Action failed: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Course Moderation</h1>

        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded bg-slate-800 border border-slate-600"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2">Subject</th>
                  <th className="px-4 py-2">Tutor</th>

                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id} className="border-b border-slate-700">
                    <td className="px-4 py-2">{course.subject}</td>
                    <td className="px-4 py-2">{course.tutor?.name}</td>

                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        course.status === 'approved' ? 'bg-green-600' :
                        course.status === 'pending' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {course.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(course._id, 'approve')} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded mr-2">Approve</button>
                          <button onClick={() => { setSelectedCourse(course._id); setAction('reject'); }} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Reject Course</h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 mb-4"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(selectedCourse, action, reason)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                >
                  Reject
                </button>
                <button
                  onClick={() => { setSelectedCourse(null); setAction(''); setReason(''); }}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
