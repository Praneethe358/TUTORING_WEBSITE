import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/designSystem';

/**
 * FAVORITE TUTORS - Student View
 * 
 * Display and manage favorite tutors
 * - View all favorite tutors
 * - Remove from favorites
 * - Book a class with favorite tutors
 */
const FavoriteTutors = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavoriteTutors();
  }, []);

  const fetchFavoriteTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/favorites');
      setFavorites(res.data.favorites || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorite tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (tutorId) => {
    try {
      await api.delete(`/student/favorites/${tutorId}`);
      setFavorites(favorites.filter(fav => fav._id !== tutorId));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      setError('Failed to remove favorite');
    }
  };

  const handleBookTutor = (tutorId) => {
    navigate(`/tutors/${tutorId}`);
  };

  return (
    <div style={{ padding: spacing['2xl'], maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: spacing['2xl'] }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: typography.fontWeight.bold,
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
        >
          My Favorite Tutors
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '16px' }}>
          Manage and book classes with your favorite tutors
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: spacing.lg,
            marginBottom: spacing.lg,
            backgroundColor: '#FEE2E2',
            border: `1px solid #FECACA`,
            borderRadius: borderRadius.lg,
            color: '#991B1B',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
          <p style={{ color: colors.textSecondary }}>Loading favorite tutors...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && favorites.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: spacing['3xl'],
            backgroundColor: colors.white,
            borderRadius: borderRadius.xl,
            border: `1px solid ${colors.gray200}`,
            boxShadow: shadows.md,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>⭐</div>
          <h2 style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.md }}>
            No Favorite Tutors Yet
          </h2>
          <p style={{ color: colors.textSecondary, marginBottom: spacing.lg }}>
            Explore our tutors and add them to your favorites
          </p>
          <button
            onClick={() => navigate('/tutors')}
            style={{
              padding: `${spacing.md} ${spacing.xl}`,
              backgroundColor: colors.primary,
              color: colors.white,
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: '14px',
              fontWeight: typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primaryDark || '#1e40af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
            }}
          >
            Browse Tutors
          </button>
        </div>
      )}

      {/* Favorites Grid */}
      {!loading && favorites.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: spacing.lg,
          }}
        >
          {favorites.map(tutor => (
            <div
              key={tutor._id}
              style={{
                backgroundColor: colors.white,
                borderRadius: borderRadius.xl,
                border: `1px solid ${colors.gray200}`,
                boxShadow: shadows.md,
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
            >
              {/* Profile Header */}
              <div
                style={{
                  padding: spacing.lg,
                  backgroundColor: colors.gray100,
                  borderBottom: `1px solid ${colors.gray200}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: borderRadius.full,
                      backgroundColor: colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.white,
                      fontSize: '24px',
                      fontWeight: typography.fontWeight.bold,
                    }}
                  >
                    {tutor.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: colors.textPrimary, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                      {tutor.name}
                    </h3>
                    <p style={{ color: colors.textSecondary, fontSize: '13px' }}>
                      {tutor.subjects?.join(', ') || 'Multiple Subjects'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(tutor._id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title="Remove from favorites"
                  >
                    ⭐
                  </button>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: spacing.lg }}>
                {tutor.qualifications && (
                  <div style={{ marginBottom: spacing.md }}>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                      QUALIFICATIONS
                    </p>
                    <p style={{ color: colors.textPrimary, fontSize: '14px' }}>
                      {Array.isArray(tutor.qualifications) ? tutor.qualifications.join(', ') : tutor.qualifications}
                    </p>
                  </div>
                )}

                {tutor.experienceYears && (
                  <div style={{ marginBottom: spacing.md }}>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                      EXPERIENCE
                    </p>
                    <p style={{ color: colors.textPrimary, fontSize: '14px' }}>
                      {tutor.experienceYears} years
                    </p>
                  </div>
                )}

                {tutor.hourlyRate && (
                  <div style={{ marginBottom: spacing.lg }}>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', fontWeight: typography.fontWeight.semibold, marginBottom: spacing.xs }}>
                      HOURLY RATE
                    </p>
                    <p style={{ color: colors.primary, fontSize: '18px', fontWeight: typography.fontWeight.bold }}>
                      ${tutor.hourlyRate}/hour
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: spacing.lg, borderTop: `1px solid ${colors.gray200}`, display: 'flex', gap: spacing.md }}>
                <button
                  onClick={() => handleBookTutor(tutor._id)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: colors.primary,
                    color: colors.white,
                    border: 'none',
                    borderRadius: borderRadius.lg,
                    fontSize: '14px',
                    fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primaryDark || '#1e40af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary;
                  }}
                >
                  Book Class
                </button>
                <button
                  onClick={() => navigate(`/tutors/${tutor._id}`)}
                  style={{
                    flex: 1,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: colors.white,
                    color: colors.primary,
                    border: `1px solid ${colors.primary}`,
                    borderRadius: borderRadius.lg,
                    fontSize: '14px',
                    fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.gray100;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.white;
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteTutors;
