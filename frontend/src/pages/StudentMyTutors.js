import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

/**
 * STUDENT MY TUTORS PAGE
 * Shows only the tutors assigned to this student by admin.
 * No search or browse functionality.
 */
const StudentMyTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedTutors();
  }, []);

  const fetchAssignedTutors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/assigned-tutors');
      setTutors(res.data?.tutors || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assigned tutors');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: colors.white,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.gray200}`,
    padding: spacing.xl,
    boxShadow: shadows.sm,
    transition: 'box-shadow 0.2s ease',
  };

  return (
    <StudentDashboardLayout>
      <div style={{ padding: spacing.xl }}>
        <div style={{ marginBottom: spacing.xl }}>
          <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.textPrimary, margin: 0 }}>
            👨‍🏫 My Tutors
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
            These are the tutors assigned to you by the admin. You will see classes only from these tutors.
          </p>
        </div>

        {error && (
          <div style={{ padding: spacing.md, borderRadius: borderRadius.md, background: '#fee2e2', color: '#991b1b', marginBottom: spacing.md, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['3xl'], color: colors.textSecondary }}>Loading your tutors...</div>
        ) : tutors.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: spacing['3xl'] }}>
            <div style={{ fontSize: '48px', marginBottom: spacing.md }}>👨‍🏫</div>
            <p style={{ color: colors.textPrimary, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>No tutors assigned yet</p>
            <p style={{ color: colors.textSecondary, fontSize: typography.fontSize.sm, marginTop: spacing.xs }}>
              The admin will assign tutors to you. Please check back later or contact admin.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: spacing.lg }}>
            {tutors.map(tutor => (
              <div key={tutor._id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.white, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold,
                    overflow: 'hidden'
                  }}>
                    {tutor.avatar || tutor.profileImage ? (
                      <img
                        src={tutor.avatar || tutor.profileImage}
                        alt={tutor.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      tutor.name?.charAt(0)?.toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.semibold, color: colors.textPrimary, margin: 0 }}>
                      {tutor.name}
                    </h3>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, margin: 0 }}>
                      {tutor.email}
                    </p>
                  </div>
                </div>

                {tutor.subjects && tutor.subjects.length > 0 && (
                  <div style={{ marginBottom: spacing.sm }}>
                    <span style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, fontWeight: typography.fontWeight.medium }}>Subjects: </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                      {tutor.subjects.map((subj, i) => (
                        <span key={i} style={{
                          display: 'inline-block', padding: `2px ${spacing.sm}`, borderRadius: '999px',
                          fontSize: typography.fontSize.xs, background: '#eff6ff', color: '#1d4ed8',
                          fontWeight: typography.fontWeight.medium
                        }}>
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tutor.experienceYears && (
                  <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, margin: `${spacing.xs} 0 0` }}>
                    📅 {tutor.experienceYears} year{tutor.experienceYears !== 1 ? 's' : ''} experience
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentMyTutors;
