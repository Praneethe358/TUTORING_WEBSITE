import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Container, Grid, Card, Badge, SectionHeading } from '../components/ModernUI';
import { FavoriteButton } from '../components/FavoriteButton';
import { ShareButton } from '../utils/socialSharing';
import CourseraNavbar from '../components/CourseraNavbar';
import { colors, typography, spacing } from '../theme/designSystem';

const ModernTutorsListPage = () => {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    experience: '',
    search: '',
  });

  useEffect(() => {
    fetchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tutor/public');
      let filtered = Array.isArray(response.data) ? response.data : [];

      if (filters.subject) {
        filtered = filtered.filter(t => 
          t.subjects?.some(s => s.toLowerCase().includes(filters.subject.toLowerCase()))
        );
      }
      if (filters.experience) {
        const exp = parseInt(filters.experience);
        filtered = filtered.filter(t => t.experience >= exp);
      }
      if (filters.search) {
        filtered = filtered.filter(t =>
          t.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setTutors(filtered);
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Find Expert Tutors - Browse Qualified Teachers | HOPE Online Tuitions</title>
        <meta name="description" content="Browse verified online tutors for Classes 6-12. Expert teachers for CBSE, ICSE, and all subjects. Safe, personalized online tutoring from qualified educators." />
        <meta name="keywords" content="find tutors online, hire online tutor, CBSE tutors, ICSE tutors, subject tutors, qualified teachers online, best online tutors India" />
        <meta property="og:title" content="Find Expert Tutors - HOPE Online Tuitions" />
        <meta property="og:description" content="Connect with verified tutors for personalized online learning. All subjects for Classes 6-12." />
        <link rel="canonical" href="https://frontend.onrender.com/tutors" />
      </Helmet>
      
      <CourseraNavbar />
      <div style={{ background: colors.bgSecondary, minHeight: '100vh', paddingTop: '80px' }}>
        <Container style={{ paddingTop: spacing['3xl'], paddingBottom: spacing['3xl'] }}>
          <SectionHeading
            title="Find Your Perfect Tutor"
            subtitle="Connect with expert tutors in 500+ subjects"
          centered
        />

        {/* Filters */}
        <Card style={{ marginBottom: spacing['3xl'] }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: spacing.lg,
          }}>
            <input
              type="text"
              placeholder="Search by tutor name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                padding: spacing.md,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '8px',
                fontFamily: typography.fontFamily.base,
              }}
            />
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              style={{
                padding: spacing.md,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '8px',
                fontFamily: typography.fontFamily.base,
              }}
            >
              <option value="">All Subjects</option>
              <option value="Math">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="Programming">Programming</option>
              <option value="History">History</option>
            </select>
            <select
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              style={{
                padding: spacing.md,
                border: `1px solid ${colors.gray300}`,
                borderRadius: '8px',
                fontFamily: typography.fontFamily.base,
              }}
            >
              <option value="">All Experience Levels</option>
              <option value="1">1+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: spacing['3xl'] }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: `4px solid ${colors.gray200}`,
              borderTop: `4px solid ${colors.accent}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <p style={{
              color: colors.textSecondary,
              marginBottom: spacing['2xl'],
              fontSize: typography.fontSize.sm,
            }}>
              Showing {tutors.length} tutors
            </p>

            <Grid cols={3}>
              {tutors.map((tutor) => (
                <Card key={tutor._id} hover>
                  {/* Avatar */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: tutor.avatar
                      ? `url(http://localhost:5000${tutor.avatar}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    marginBottom: spacing.lg,
                    color: colors.white,
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    {!tutor.avatar && tutor.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name & Rating */}
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    margin: 0,
                    marginBottom: spacing.sm,
                    color: colors.textPrimary,
                  }}>
                    {tutor.name}
                  </h3>

                  {/* Experience & Rate */}
                  <p style={{
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing.md,
                    fontSize: typography.fontSize.sm,
                  }}>
                    {tutor.experience}+ years • ${tutor.hourlyRate}/hr
                  </p>

                  {/* Subjects */}
                  <div style={{ marginBottom: spacing.lg, display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                    {tutor.subjects?.slice(0, 2).map((subject, i) => (
                      <Badge key={i} variant="gray">
                        {subject}
                      </Badge>
                    ))}
                    {tutor.subjects?.length > 2 && (
                      <Badge variant="gray">+{tutor.subjects.length - 2}</Badge>
                    )}
                  </div>

                  {/* Bio */}
                  <p style={{
                    color: colors.textSecondary,
                    margin: 0,
                    marginBottom: spacing.lg,
                    lineHeight: typography.lineHeight.relaxed,
                    fontSize: typography.fontSize.sm,
                  }}>
                    {tutor.bio || 'Dedicated tutor with expertise in multiple subjects'}
                  </p>

                  {/* Actions */}
                  <div style={{
                    display: 'flex',
                    gap: spacing.md,
                    marginTop: spacing.lg,
                  }}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/tutors/${tutor._id}`)}
                      style={{ flex: 1 }}
                    >
                      View Profile
                    </Button>
                    <div style={{ display: 'flex', gap: spacing.sm }}>
                      <FavoriteButton tutorId={tutor._id} />
                      <ShareButton tutor={tutor} tutorId={tutor._id} />
                    </div>
                  </div>
                </Card>
              ))}
            </Grid>

            {tutors.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: spacing['3xl'],
                background: colors.white,
                borderRadius: '12px',
              }}>
                <p style={{ color: colors.textSecondary, margin: 0 }}>
                  No tutors found. Try adjusting your filters.
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </div>
    </>
  );
};

export default ModernTutorsListPage;
