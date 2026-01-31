import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

const StudentBooking = () => {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tutor/public');
      setTutors(Array.isArray(res.data) ? res.data : (res.data.tutors || []));
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (tutorId) => {
    try {
      const res = await api.get(`/availability/${tutorId}?onlyAvailable=true`);
      setAvailability(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      setAvailability([]);
    }
  };

  const handleTutorSelect = (tutor) => {
    setSelectedTutor(tutor);
    setSelectedSlot(null);
    setMessage('');
    fetchAvailability(tutor._id);
  };

  const handleBookSession = async () => {
    if (!selectedSlot) return;

    try {
      setBookingLoading(true);
      setMessage('');

      // Create booking
      await api.post('/classes/book', {
        tutorId: selectedTutor._id,
        availabilitySlotId: selectedSlot._id,
        topic: `Session with ${selectedTutor.name}`,
        duration: 60 // default 60 minutes
      });

      setMessage('Session booked successfully!');
      setSelectedTutor(null);
      setSelectedSlot(null);
      setAvailability([]);
    } catch (error) {
      console.error('Failed to book session:', error);
      setMessage(error.response?.data?.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  const getDayName = (dayOfWeek) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const filteredTutors = tutors.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <StudentDashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Book a Session</h1>
        <p className="text-sm text-black mt-1">Find a tutor and book an available time slot</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tutors List */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search tutors by name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <h2 className="text-lg font-semibold text-black mb-4">Available Tutors ({filteredTutors.length})</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : filteredTutors.length === 0 ? (
            <p className="text-black text-center py-8">No tutors found</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTutors.map(tutor => (
                <div
                  key={tutor._id}
                  onClick={() => handleTutorSelect(tutor)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedTutor?._id === tutor._id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tutor.avatar ? (
                      <img
                        src={`http://localhost:5000${tutor.avatar}`}
                        alt={tutor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                        {tutor.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-black text-sm">{tutor.name}</h3>
                      <p className="text-xs text-black">{tutor.subjects?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Availability Slots */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          {!selectedTutor ? (
            <div className="text-center py-12">
              <p className="text-black">Select a tutor to view available time slots</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-black mb-4">
                Available Slots for {selectedTutor.name}
              </h2>

              {availability.length === 0 ? (
                <p className="text-black text-center py-8">No available slots</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {availability.map(slot => (
                    <div
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedSlot?._id === slot._id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-black">
                            {slot.specificDate
                              ? new Date(slot.specificDate).toLocaleDateString()
                              : getDayName(slot.dayOfWeek)}
                          </p>
                          <p className="text-sm text-black mt-1">
                            {slot.startTime} - {slot.endTime}
                          </p>
                          {slot.notes && (
                            <p className="text-xs text-black mt-1">{slot.notes}</p>
                          )}
                        </div>
                        {selectedSlot?._id === slot._id && (
                          <span className="text-indigo-600">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedSlot && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-black mb-2">Selected Slot:</p>
                    <p className="text-black">
                      {selectedSlot.specificDate
                        ? new Date(selectedSlot.specificDate).toLocaleDateString()
                        : getDayName(selectedSlot.dayOfWeek)}
                    </p>
                    <p className="text-black">
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>
                  </div>

                  <button
                    onClick={handleBookSession}
                    disabled={bookingLoading}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium disabled:opacity-50 transition"
                  >
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentBooking;
