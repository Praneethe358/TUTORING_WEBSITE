import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSkeleton';
import FavoriteButton from '../components/FavoriteButton';
import { ShareButton } from '../utils/socialSharing';
import SessionNotes from '../components/SessionNotes';

const EnhancedTutorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ courseId: '', date: '' });

  useEffect(() => {
    loadTutorProfile();
  }, [id]);

  const loadTutorProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tutor/public/${id}`);
      setTutor(res.data.tutor);
    } catch (error) {
      console.error('Failed to load tutor:', error);
      alert('Failed to load tutor profile');
      navigate('/tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.courseId || !booking.date) {
      alert('Please select a course and date');
      return;
    }

    try {
      await api.post('/tutor/book', {
        tutorId: id,
        courseId: booking.courseId,
        date: booking.date
      });
      alert('Booking successful! Check your bookings page.');
      navigate('/student/bookings');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading tutor profile..." />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400 text-lg">Tutor not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/tutors')}
          className="mb-4 text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          ← Back to Tutors
        </button>

        {/* Profile Card */}
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {tutor.avatar ? (
                <img
                  src={`http://localhost:5000${tutor.avatar}`}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-indigo-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-indigo-600">
                  {tutor.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{tutor.name}</h1>
                <p className="text-slate-400">{tutor.experienceYears} years of experience</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-indigo-600/20 border border-indigo-600 rounded-full text-sm text-indigo-300">
                    ⭐ {tutor.rating?.toFixed(1) || 'N/A'} rating
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <FavoriteButton tutorId={tutor._id} />
              <ShareButton tutor={tutor} tutorId={tutor._id} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects?.map(s => (
                  <span key={s} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-white">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Qualifications</p>
              <p className="text-white">{tutor.qualifications}</p>
            </div>
          </div>
        </div>

        {/* Courses & Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">📚 Courses</h2>
            <div className="space-y-3">
              {tutor.courses && tutor.courses.length > 0 ? (
                tutor.courses.map(course => (
                  <div key={course._id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                    <h3 className="text-white font-semibold">{course.subject}</h3>
                    <p className="text-slate-400 text-sm">{course.description}</p>
                    <p className="text-slate-300 text-sm mt-2">
                      <span className="font-medium">{course.durationMinutes}</span> minutes • Status: <span className="text-indigo-400">{course.status}</span>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No courses available yet</p>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">📅 Book a Session</h2>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Course</label>
                <select
                  value={booking.courseId}
                  onChange={(e) => setBooking({ ...booking, courseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a course</option>
                  {tutor.courses?.map(c => (
                    <option key={c._id} value={c._id}>{c.subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
              >
                Book Session
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTutorProfile;
