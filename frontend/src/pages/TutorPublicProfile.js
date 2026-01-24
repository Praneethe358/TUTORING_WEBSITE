import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const TutorPublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [tutor, setTutor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tutor/public/${id}`).then(res => setTutor(res.data.tutor)).catch(() => setError('Tutor not found'));
  }, [id]);

  useEffect(() => {
    api.get('/tutor/public').then(res => {
      const t = res.data.tutors?.find(tt => tt._id === id);
      if (t) setCourses(t.courses || []);
    });
  }, [id]);

  const book = async (courseId) => {
    if (!user || role !== 'student') {
      navigate('/login');
      return;
    }
    try {
      await api.post('/tutor/book', { tutorId: id, courseId, date: new Date().toISOString() });
      alert('Booked!');
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    }
  };

  if (error) return <div className="text-center text-red-400 mt-10">{error}</div>;
  if (!tutor) return <div className="text-center text-slate-200 mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
          <p className="text-sm text-slate-400">Tutor</p>
          <h1 className="text-3xl font-semibold">{tutor.name}</h1>
          <p className="text-sm text-slate-300">{tutor.qualifications}</p>
          <p className="text-sm text-slate-300">Subjects: {tutor.subjects?.join(', ')}</p>
          <p className="text-xs text-slate-400">Experience: {tutor.experienceYears} years</p>
          <p className="text-xs text-slate-400">Status: {tutor.isActive ? 'Approved' : 'Pending'}</p>
        </div>

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
          <h2 className="text-lg font-semibold">Availability</h2>
          {tutor.availability?.length === 0 && <p className="text-sm text-slate-400">No availability set.</p>}
          {tutor.availability?.map(day => (
            <div key={day.day} className="text-sm text-slate-300">
              <span className="font-semibold">{day.day}:</span> {day.slots.join(', ')}
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
          <h2 className="text-lg font-semibold">Courses</h2>
          {courses.length === 0 && <p className="text-sm text-slate-400">No courses listed.</p>}
          {courses.map(c => (
            <div key={c._id} className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex justify-between">
              <div>
                <p className="font-semibold">{c.subject}</p>
                <p className="text-sm text-slate-400">{c.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-200">${c.price}</p>
                <p className="text-xs text-slate-400">{c.durationMinutes} mins</p>
                <button onClick={() => book(c._id)} className="mt-2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Book</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorPublicProfile;
