import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    loadTutors();
  }, [filter, page, search]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/tutors', {
        params: { status: filter || undefined, search: search || undefined, page, limit: 10 }
      });
      setTutors(res.data.tutors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (tutorId, act, msg = '') => {
    try {
      if (act === 'approve') {
        await api.put(`/admin/tutors/${tutorId}/approve`);
      } else if (act === 'reject') {
        await api.put(`/admin/tutors/${tutorId}/reject`, { reason: msg });
      } else if (act === 'block') {
        await api.put(`/admin/tutors/${tutorId}/block`, { reason: msg });
      }
      loadTutors();
      setSelectedTutor(null);
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
        <h1 className="text-4xl font-bold mb-8">Tutor Management</h1>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 rounded bg-slate-800 border border-slate-600"
          />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded bg-slate-800 border border-slate-600"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tutors.map(tutor => (
                  <tr key={tutor._id} className="border-b border-slate-700">
                    <td className="px-4 py-2">{tutor.name}</td>
                    <td className="px-4 py-2">{tutor.email}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        tutor.status === 'approved' ? 'bg-green-600' :
                        tutor.status === 'pending' ? 'bg-yellow-600' :
                        tutor.status === 'rejected' ? 'bg-red-600' :
                        'bg-gray-600'
                      }`}>
                        {tutor.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {tutor.status === 'pending' && (
                        <>
                          <button onClick={() => handleAction(tutor._id, 'approve')} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded mr-2">Approve</button>
                          <button onClick={() => { setSelectedTutor(tutor._id); setAction('reject'); }} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded">Reject</button>
                        </>
                      )}
                      {tutor.status === 'approved' && (
                        <button onClick={() => { setSelectedTutor(tutor._id); setAction('block'); }} className="bg-orange-600 hover:bg-orange-500 px-3 py-1 rounded">Block</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTutor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">{action === 'reject' ? 'Reject Tutor' : 'Block Tutor'}</h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 mb-4"
                rows="4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(selectedTutor, action, reason)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setSelectedTutor(null); setAction(''); setReason(''); }}
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

export default AdminTutors;
