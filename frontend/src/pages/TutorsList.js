import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const TutorsList = () => {
  const [tutors, setTutors] = useState([]);
  const [filters, setFilters] = useState({ subject: '', minExperience: '' });

  useEffect(() => {
    api.get('/tutor/public').then(res => setTutors(res.data.tutors || []));
  }, []);

  const filtered = tutors.filter(t => {
    const subjectOk = filters.subject ? t.subjects.some(s => s.toLowerCase().includes(filters.subject.toLowerCase())) : true;
    const expOk = filters.minExperience ? (t.experienceYears || 0) >= Number(filters.minExperience) : true;
    return subjectOk && expOk;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-semibold">Find Tutors</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100" placeholder="Subject filter" value={filters.subject} onChange={e => setFilters({ ...filters, subject: e.target.value })} />
          <input className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100" placeholder="Min experience (years)" value={filters.minExperience} onChange={e => setFilters({ ...filters, minExperience: e.target.value })} />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {filtered.map(t => (
            <Link to={`/tutors/${t._id}`} key={t._id} className="p-4 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 transition">
              <p className="text-lg font-semibold">{t.name}</p>
              <p className="text-sm text-slate-400">{t.qualifications}</p>
              <p className="text-sm text-slate-300">Subjects: {t.subjects.join(', ')}</p>
              <p className="text-xs text-slate-400">Experience: {t.experienceYears} years</p>
            </Link>
          ))}
          {filtered.length === 0 && <p className="text-slate-400">No tutors match filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default TutorsList;
