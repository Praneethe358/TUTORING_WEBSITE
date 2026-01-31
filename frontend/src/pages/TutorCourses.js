import React, { useEffect, useState } from 'react';
import api from '../lib/api';

const TutorCourses = () => {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ subject: '', durationMinutes: '', description: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    const res = await api.get('/tutor/courses');
    setCourses(res.data.courses || []);
  };

  useEffect(() => { load(); }, []);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/tutor/courses', {
        subject: form.subject,

        durationMinutes: Number(form.durationMinutes),
        description: form.description
      });
      setMessage('Course created (pending approval)');
      setForm({ subject: '', durationMinutes: '', description: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">My Courses</h1>
          <p className="text-slate-400 mt-1">Create and manage your courses</p>
        </div>
        {message && <div className="p-3 rounded-lg bg-emerald-900/30 border border-emerald-700 text-emerald-400">{message}</div>}
        {error && <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400">{error}</div>}

        <form onSubmit={create} className="p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-white">Create New Course</h2>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Subject</label>
            <input 
              className="w-full px-4 py-3 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
              name="subject" 
              value={form.subject} 
              onChange={onChange} 
              placeholder="e.g., Mathematics, Physics, English"
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Duration (minutes)</label>
            <input 
              className="w-full px-4 py-3 sm:py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]" 
              type="number" 
              name="durationMinutes" 
              value={form.durationMinutes} 
              onChange={onChange} 
              placeholder="60"
              required 
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              name="description" 
              value={form.description} 
              onChange={onChange} 
              rows="3"
              placeholder="Describe what this course covers..."
            />
          </div>
          <button type="submit" className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition min-h-[44px]">
            Create Course
          </button>
        </form>

        <div className="p-6 rounded-xl bg-slate-800 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">All Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No courses yet. Create your first course above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c._id} className="p-4 rounded-lg bg-slate-900 border border-slate-700 hover:border-indigo-500 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{c.subject}</h3>
                      <p className="text-sm text-slate-400 mt-1">{c.description || 'No description provided'}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-slate-500">⏱️ {c.durationMinutes} minutes</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          c.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                          c.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {c.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorCourses;
