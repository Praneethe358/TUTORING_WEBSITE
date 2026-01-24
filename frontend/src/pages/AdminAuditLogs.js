import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit-logs', { params: { page, limit: 20 } });
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Audit Logs</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2">Admin</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Target</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} className="border-b border-slate-700">
                    <td className="px-4 py-2">{log.admin?.name}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-2">{log.targetType}</td>
                    <td className="px-4 py-2">{log.targetEmail}</td>
                    <td className="px-4 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
