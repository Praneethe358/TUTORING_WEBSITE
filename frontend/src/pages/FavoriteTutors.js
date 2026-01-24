import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import { CardSkeleton } from '../components/LoadingSkeleton';
import FavoriteButton from '../components/FavoriteButton';
import api from '../lib/api';

const FavoriteTutors = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    // Reload favorites after removing
    loadFavorites();
  };

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">❤️ Favorite Tutors</h1>
        <p className="text-slate-400 mt-1">Your bookmarked tutors for quick access</p>
      </div>

      {loading ? (
        <CardSkeleton count={3} />
      ) : favorites.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <p className="text-slate-400 mb-4">No favorite tutors yet</p>
          <Link
            to="/tutors"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
          >
            Browse Tutors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(({ _id, tutor }) => (
            <div key={_id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {tutor.avatar ? (
                    <img
                      src={`http://localhost:5000${tutor.avatar}`}
                      alt={tutor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {tutor.name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">{tutor.name}</h3>
                    <p className="text-sm text-slate-400">{tutor.experienceYears} years exp</p>
                  </div>
                </div>
                <FavoriteButton tutorId={tutor._id} />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Subjects:</span>{' '}
                  {tutor.subjects?.join(', ') || 'N/A'}
                </p>
                <p className="text-sm text-slate-300">
                  <span className="font-medium">Qualifications:</span>{' '}
                  {tutor.qualifications || 'N/A'}
                </p>
              </div>

              <Link
                to={`/tutors/${tutor._id}`}
                className="block w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white text-center font-medium transition"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default FavoriteTutors;
