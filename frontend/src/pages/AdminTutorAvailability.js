import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import TutorAvailabilityDisplay from '../components/TutorAvailabilityDisplay';

const AdminTutorAvailability = () => {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/tutors');
      setTutors(Array.isArray(res.data) ? res.data : (res.data.tutors || []));
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTutors = tutors.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Tutor Availability Management</h1>
        <p className="text-slate-400 mt-1">View and manage all tutor schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutor List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Tutors</h2>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search tutors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* Tutor List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-slate-400 text-sm">Loading tutors...</p>
              ) : filteredTutors.length === 0 ? (
                <p className="text-slate-400 text-sm">No tutors found</p>
              ) : (
                filteredTutors.map(tutor => (
                  <button
                    key={tutor._id}
                    onClick={() => setSelectedTutor(tutor)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedTutor?._id === tutor._id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="font-medium">{tutor.name}</p>
                    <p className="text-xs opacity-75">{tutor.email}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Availability Display */}
        <div className="lg:col-span-2">
          {selectedTutor ? (
            <div>
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    {selectedTutor.name?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedTutor.name}</h3>
                    <p className="text-slate-400">{selectedTutor.email}</p>
                    <p className="text-sm text-indigo-400 mt-1">
                      Status: <span className="font-medium capitalize">{selectedTutor.status || 'pending'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {selectedTutor.availability ? (
                <TutorAvailabilityDisplay 
                  tutorId={selectedTutor._id}
                  tutorName={selectedTutor.name}
                  availability={selectedTutor.availability}
                />
              ) : (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <p className="text-slate-400">No availability set for this tutor</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
              <p className="text-slate-400">Select a tutor to view their availability</p>
            </div>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminTutorAvailability;
