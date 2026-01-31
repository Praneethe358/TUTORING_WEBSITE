import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export const FavoriteButton = ({ tutorId, className = '' }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkFavorite = useCallback(async () => {
    try {
      const res = await api.get(`/favorites/check/${tutorId}`);
      setIsFavorited(res.data.isFavorited);
    } catch (error) {
      console.error('Failed to check favorite:', error);
    }
  }, [tutorId]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    setLoading(true);
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${tutorId}`);
        setIsFavorited(false);
      } else {
        await api.post('/favorites', { tutorId });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Toggle favorite failed:', error);
      alert(error.response?.data?.message || 'Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-lg transition ${
        isFavorited
          ? 'bg-red-600 hover:bg-red-500 text-white'
          : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorited ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
