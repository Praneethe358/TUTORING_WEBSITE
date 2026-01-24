import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import FavoriteButton from '../components/FavoriteButton';
import { ShareButton } from '../utils/socialSharing';

const EnhancedTutorsList = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', experience: '' });

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tutor/public');
      setTutors(res.data.tutors || []);
    } catch (error) {
      console.error('Failed to load tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(t => {
    if (filter.subject && !t.subjects?.some(s => s.toLowerCase().includes(filter.subject.toLowerCase()))) {
      return false;
    }
    if (filter.experience && t.experienceYears < parseInt(filter.experience)) {
      return false;
    }
    return true;
  });

  const subjects = [...new Set(tutors.flatMap(t => t.subjects || []))];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎓 Find Tutors</h1>
          <p className="text-slate-400">Connect with expert tutors worldwide</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Subject</label>
            <select
              value={filter.subject}
              onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All subjects</option>
              {subjects.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Min Experience</label>
            <select
              value={filter.experience}
              onChange={(e) => setFilter({ ...filter, experience: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any experience</option>
              <option value="1">1+ years</option>
              <option value="3">3+ years</option>
              <option value="5">5+ years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Results</label>
            <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white">
              {filteredTutors.length} tutors found
            </div>
          </div>
        </div>

        {/* Tutors Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : filteredTutors.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <p className="text-slate-400">No tutors found matching your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map(tutor => (
              <div key={tutor._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {tutor.avatar ? (
                      <img
                        src={`http://localhost:5000${tutor.avatar}`}
                        alt={tutor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                        {tutor.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold">{tutor.name}</h3>
                      <p className="text-xs text-slate-400">{tutor.experienceYears} years exp</p>
                    </div>
                  </div>
                  <FavoriteButton tutorId={tutor._id} />
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Subjects:</span> {tutor.subjects?.join(', ')}
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">Qualifications:</span> {tutor.qualifications}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/tutors/${tutor._id}`}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-center font-medium transition text-sm"
                  >
                    View Profile
                  </Link>
                  <ShareButton tutor={tutor} tutorId={tutor._id} className="flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTutorsList;
