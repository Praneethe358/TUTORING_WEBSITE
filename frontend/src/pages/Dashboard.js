import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold">Student Dashboard</h1>
            <p className="text-slate-300 mt-1">{user?.name} • {user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/student/profile" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">Profile</Link>
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">Logout</button>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-sm text-slate-400">Access</p>
            <p className="text-lg font-semibold mt-1">Student-only content</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <p className="text-sm text-slate-400">Next steps</p>
            <p className="text-lg font-semibold mt-1">Complete your profile</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
