import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const StudentBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api.get('/tutor/student/bookings').then(res => setBookings(res.data.bookings || []));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-semibold">My Bookings</h1>
        <div className="space-y-2">
          {bookings.length === 0 && <p className="text-slate-400 text-sm">No bookings yet.</p>}
          {bookings.map(b => (
            <div key={b._id} className="p-3 rounded-lg bg-slate-800 border border-slate-700 flex justify-between">
              <div>
                <p className="font-semibold text-slate-100">{b.tutor?.name}</p>
                <p className="text-sm text-slate-400">{b.course?.subject}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-300">{new Date(b.date).toLocaleString()}</p>
                <p className="text-xs text-slate-400">{b.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentBookings;
