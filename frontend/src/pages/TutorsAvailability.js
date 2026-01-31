import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';
import { Card, Badge, Button } from '../components/ModernComponents';

/**
 * TUTORS AVAILABILITY PAGE
 * Shows all approved tutors with their availability schedules
 */
const TutorsAvailability = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available, specific-time
  const [searchSubject, setSearchSubject] = useState('');

  useEffect(() => {
    fetchTutorsAvailability();
  }, []);

  const fetchTutorsAvailability = async () => {
    try {
      setLoading(true);
      // Fetch approved tutors
      const res = await api.get('/tutors?status=approved');
      const tutorsData = res.data.data || [];

      // Fetch availability for each tutor
      const tutorsWithAvailability = await Promise.all(
        tutorsData.map(async (tutor) => {
          try {
            const availRes = await api.get(`/availability/${tutor._id}`);
            return {
              ...tutor,
              availability: availRes.data.data || []
            };
          } catch (err) {
            return {
              ...tutor,
              availability: []
            };
          }
        })
      );

      setTutors(tutorsWithAvailability);
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
  };

  const formatTime = (time) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    // Search by subject
    if (searchSubject && !tutor.subjects?.some(s => s.toLowerCase().includes(searchSubject.toLowerCase()))) {
      return false;
    }

    // Filter by availability
    if (filter === 'available') {
      return tutor.availability && tutor.availability.length > 0;
    }

    return true;
  });

  const handleBookSession = (tutor) => {
    navigate('/student/booking', { state: { selectedTutorId: tutor._id } });
  };

  return (
    <StudentDashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👨‍🏫 Browse Tutors & Availability
        </h1>
        <p className="text-gray-600">
          Find qualified tutors and check their availability schedules
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search by Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Subject
            </label>
            <input
              type="text"
              placeholder="e.g., Math, Physics, English..."
              value={searchSubject}
              onChange={(e) => setSearchSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter by Availability */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Availability
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tutors</option>
              <option value="available">Available Now</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tutors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredTutors.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">😞 No tutors found matching your criteria</p>
            <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <Card key={tutor._id} className="flex flex-col">
              {/* Tutor Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {tutor.avatar ? (
                    <img
                      src={tutor.avatar.startsWith('http') ? tutor.avatar : `http://localhost:5000${tutor.avatar}`}
                      alt={tutor.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    '👨‍🏫'
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{tutor.name}</h3>
                  <p className="text-sm text-gray-600">{tutor.qualifications}</p>
                  {tutor.experienceYears && (
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {tutor.experienceYears} years experience
                    </p>
                  )}
                </div>
              </div>

              {/* Subjects */}
              <div className="py-4 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">📚 Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects && tutor.subjects.length > 0 ? (
                    tutor.subjects.map((subject, idx) => (
                      <Badge key={idx} variant="primary" className="text-xs">
                        {subject}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">Not specified</p>
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="py-4 border-b border-gray-200 flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-3">⏰ Availability</p>
                {tutor.availability && tutor.availability.length > 0 ? (
                  <div className="space-y-2">
                    {tutor.availability.slice(0, 4).map((slot, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-green-50 border border-green-200 rounded p-2"
                      >
                        <p className="font-medium text-green-900">
                          {getDayName(slot.dayOfWeek)}
                        </p>
                        <p className="text-green-700">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                      </div>
                    ))}
                    {tutor.availability.length > 4 && (
                      <p className="text-xs text-gray-500 italic">
                        +{tutor.availability.length - 4} more slots
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">📭 No availability set yet</p>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={() => handleBookSession(tutor)}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200"
                >
                  📅 Book Session
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default TutorsAvailability;
