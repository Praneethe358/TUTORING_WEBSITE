import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TutorDashboard = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/tutor/bookings').then(res => setBookings(res.data.bookings || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold">Tutor Dashboard</h1>
            <p className="text-slate-300 mt-1">{user?.name} • {user?.email}</p>
            <p className="text-xs text-slate-400">Status: {user?.isActive ? 'Approved' : 'Pending approval'}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/tutor/availability" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">Availability</Link>
            <Link to="/tutor/courses" className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">Courses</Link>
            <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white">Logout</button>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Upcoming Classes</h2>
          <div className="space-y-2">
            {bookings.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
            {bookings.map(b => (
              <div key={b._id} className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{b.student?.name}</p>
                  <p className="text-sm text-slate-400">{new Date(b.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">{b.course?.subject}</p>
                  <p className="text-sm text-slate-400">{b.course?.durationMinutes} mins</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;
