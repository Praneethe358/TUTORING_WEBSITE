import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import TutorAvailabilityDisplay from '../components/TutorAvailabilityDisplay';

const StudentTutorAvailability = () => {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByAvailability, setFilterByAvailability] = useState(false);

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

  const filteredTutors = tutors.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.subjects?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterByAvailability) {
      return matchesSearch && t.availability?.some(d => d.isAvailable);
    }
    return matchesSearch;
  });

  const getAvailableSlots = (tutor) => {
    if (!tutor.availability) return 0;
    return tutor.availability.filter(d => d.isAvailable).length;
  };

  const navigateToBooking = (tutor) => {
    setSelectedTutor(tutor);
    // Could also navigate to booking page
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Browse Tutors & Availability</h1>
        <p className="text-slate-400 mt-1">Find tutors with available time slots for your classes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">Filters</h2>
            
            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm text-slate-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="Tutor name or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Availability Filter */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterByAvailability}
                  onChange={(e) => setFilterByAvailability(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-slate-300">Available Now</span>
              </label>
            </div>

            {/* Stats */}
            <div className="bg-slate-900 rounded-lg p-4 space-y-3 border border-slate-700">
              <div>
                <p className="text-slate-400 text-sm">Total Tutors</p>
                <p className="text-2xl font-bold text-indigo-400">{filteredTutors.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Available Today</p>
                <p className="text-2xl font-bold text-green-400">
                  {filteredTutors.filter(t => getAvailableSlots(t) > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tutor Cards */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Loading tutors...</p>
            </div>
          ) : filteredTutors.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
              <p className="text-slate-400">No tutors found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTutors.map(tutor => (
                <div key={tutor._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition">
                  <div className="flex items-start gap-6 mb-4">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                      {tutor.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">{tutor.name}</h3>
                      <p className="text-slate-400">{tutor.email}</p>
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tutor.subjects.slice(0, 3).map((subject, idx) => (
                            <span key={idx} className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs font-medium">
                              {subject}
                            </span>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-medium">
                              +{tutor.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl mb-2">{getAvailableSlots(tutor)}/7</div>
                      <p className="text-xs text-slate-400">days available</p>
                    </div>
                  </div>

                  {/* Availability Preview */}
                  {tutor.availability && (
                    <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                      <p className="text-sm text-slate-300 mb-3 font-medium">This Week</p>
                      <div className="grid grid-cols-7 gap-2">
                        {tutor.availability.map((day, idx) => (
                          <div key={day.day} className="text-center">
                            <p className="text-xs text-slate-400 mb-1">{day.day.slice(0, 3)}</p>
                            <div className={`w-full py-1 rounded text-xs font-medium ${
                              day.isAvailable 
                                ? 'bg-green-900/30 text-green-300 border border-green-700' 
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}>
                              {day.isAvailable ? '✓' : '✗'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => navigateToBooking(tutor)}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
                  >
                    View Availability & Book
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed View Modal */}
      {selectedTutor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 sticky top-0 bg-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedTutor.name}</h2>
              <button
                onClick={() => setSelectedTutor(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <TutorAvailabilityDisplay
                tutorId={selectedTutor._id}
                tutorName={selectedTutor.name}
                availability={selectedTutor.availability}
              />
              
              <button
                onClick={() => setSelectedTutor(null)}
                className="w-full mt-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTutorAvailability;
