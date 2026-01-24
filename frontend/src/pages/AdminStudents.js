import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteStudent, setDeleteStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, [page, search]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/students', {
        params: { search: search || undefined, page, limit: 10 }
      });
      setStudents(res.data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      await api.delete(`/admin/users/student/${studentId}`);
      loadStudents();
      setDeleteStudent(null);
    } catch (err) {
      alert('Delete failed: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Student Management</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 rounded bg-slate-800 border border-slate-600"
          />
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
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Joined</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student._id} className="border-b border-slate-700">
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.email}</td>
                    <td className="px-4 py-2">{student.phone}</td>
                    <td className="px-4 py-2">{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => setDeleteStudent(student._id)}
                        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deleteStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Delete Student?</h2>
              <p className="text-slate-300 mb-6">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(deleteStudent)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteStudent(null)}
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

export default AdminStudents;
