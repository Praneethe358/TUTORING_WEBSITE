import React, { useEffect, useState } from 'react';
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
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'past' | 'all'

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    const now = new Date();
    if (filter === 'upcoming') {
      return classes
        .filter(c => new Date(c.scheduledAt) > now)
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
    } else if (filter === 'past') {
      return classes
        .filter(c => new Date(c.scheduledAt) <= now)
        .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));
    }
    return classes.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  };

  const filteredClasses = filterClasses();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Class Schedule</h1>
        <p className="text-slate-400 mt-1">View all your scheduled classes</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 sm:pb-0">
        {['upcoming', 'past', 'all'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap min-h-[44px] ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Classes List */}
      {loading ? (
        <p className="text-slate-400">Loading schedule...</p>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <p className="text-slate-400">No classes found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClasses.map(cls => {
            const classDate = new Date(cls.scheduledAt);
            const isPast = classDate < new Date();

            return (
              <div
                key={cls._id}
                className={`bg-slate-800 rounded-xl p-6 border transition ${
                  isPast ? 'border-slate-700 opacity-75' : 'border-slate-700 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {cls.topic || cls.course?.subject || 'Class'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Students: {cls.students?.length > 0
                        ? cls.students.map(s => s.name || s.email).join(', ')
                        : cls.student?.name || 'N/A'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-slate-400">
                        📅 {classDate.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        🕐 {classDate.toLocaleTimeString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        ⏱️ {cls.duration || cls.course?.durationMinutes || 60} mins
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      cls.status === 'completed' ? 'bg-green-900 text-green-300' :
                      cls.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {cls.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorSchedule;
