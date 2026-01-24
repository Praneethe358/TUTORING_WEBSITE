import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * TUTOR CLASS SCHEDULE PAGE
 * 
 * Calendar view of all scheduled classes
 * - Weekly calendar layout
 * - Upcoming and past classes
 * - Class details modal
 */
const TutorSchedule = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/tutor/bookings');
      setBookings(res.data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return bookings.filter(b => new Date(b.date) > now).sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filter === 'past') {
      return bookings.filter(b => new Date(b.date) <= now).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredBookings = filterBookings();

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Class Schedule</h1>
        <p className="text-slate-400 mt-1">View all your scheduled classes</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['upcoming', 'past', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <p className="text-slate-400">Loading schedule...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <p className="text-slate-400">No classes found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const bookingDate = new Date(booking.date);
            const isPast = bookingDate < new Date();

            return (
              <div
                key={booking._id}
                className={`bg-slate-800 rounded-xl p-6 border transition ${
                  isPast ? 'border-slate-700 opacity-75' : 'border-slate-700 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {booking.course?.subject || 'Class'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Student: {booking.student?.name} • {booking.student?.email}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-400">
                        📅 {bookingDate.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        🕐 {bookingDate.toLocaleTimeString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        ⏱️ {booking.course?.durationMinutes || 60} mins
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'completed' ? 'bg-green-900 text-green-300' :
                      booking.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TutorSchedule;
