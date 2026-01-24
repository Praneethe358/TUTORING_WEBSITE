import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminSidebar from '../components/AdminSidebar';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadBookings();
  }, [page]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bookings', { params: { page, limit: 10 } });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/cancel`, { reason });
      loadBookings();
      setCancelBooking(null);
      setReason('');
    } catch (err) {
      alert('Cancel failed: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="flex bg-slate-900 text-white min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Bookings Management</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-4 py-2">Tutor</th>
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id} className="border-b border-slate-700">
                    <td className="px-4 py-2">{booking.tutor?.name}</td>
                    <td className="px-4 py-2">{booking.student?.name}</td>
                    <td className="px-4 py-2">{new Date(booking.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded text-sm font-semibold ${
                        booking.status === 'completed' ? 'bg-green-600' :
                        booking.status === 'pending' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          onClick={() => setCancelBooking(booking._id)}
                          className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {cancelBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Cancel Booking?</h2>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full px-4 py-2 rounded bg-slate-700 border border-slate-600 mb-4"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(cancelBooking)}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                >
                  Cancel Booking
                </button>
                <button
                  onClick={() => { setCancelBooking(null); setReason(''); }}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 px-4 py-2 rounded"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
