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
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-semibold">Courses</h1>
        {message && <div className="text-sm text-emerald-400">{message}</div>}
        {error && <div className="text-sm text-red-400">{error}</div>}

        <form onSubmit={create} className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-3">
          <div>
            <p className="text-sm text-slate-300">Subject</p>
            <input className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" name="subject" value={form.subject} onChange={onChange} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>

            </div>
            <div>
              <p className="text-sm text-slate-300">Duration (minutes)</p>
              <input className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" type="number" name="durationMinutes" value={form.durationMinutes} onChange={onChange} required />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-300">Description</p>
            <textarea className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100" name="description" value={form.description} onChange={onChange} />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Create Course</button>
        </form>

        <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 space-y-2">
          <h2 className="text-lg font-semibold">My Courses</h2>
          {courses.length === 0 && <p className="text-slate-400 text-sm">No courses yet.</p>}
          {courses.map(c => (
            <div key={c._id} className="p-3 rounded-lg bg-slate-900 border border-slate-700 flex justify-between">
              <div>
                <p className="font-semibold">{c.subject}</p>
                <p className="text-sm text-slate-400">{c.description}</p>
              </div>
              <div className="text-right">

                <p className="text-xs text-slate-400">{c.durationMinutes} mins • {c.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TutorCourses;
