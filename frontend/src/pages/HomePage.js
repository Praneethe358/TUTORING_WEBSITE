import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Grid, Card, GradientText, SectionHeading, Badge, StatCard, Divider } from '../components/ModernUI';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/designSystem';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  if (user && role === 'student') {
    navigate('/student/dashboard', { replace: true });
    return null;
  }
  if (user && role === 'tutor') {
    navigate('/tutor/dashboard', { replace: true });
    return null;
  }

  return (
    <div style={{ background: colors.bgSecondary, minHeight: '100vh' }}>
      {/* ============= NAVBAR ============= */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: colors.white,
        boxShadow: shadows.sm,
        zIndex: 1000,
        transition: 'all 0.3s ease',
      }}>
        <Container>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${spacing.lg} 0`,
          }}>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.primary,
              letterSpacing: '-0.5px',
            }}>
              Learn<GradientText>Hub</GradientText>
            </div>
            <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* ============= HERO SECTION ============= */}
      <section style={{ paddingTop: '120px', paddingBottom: spacing['4xl'] }}>
        <Container>
          <div style={{
            maxWidth: '700px',
            marginBottom: spacing['4xl'],
          }}>
            <Badge variant="primary" style={{ marginBottom: spacing.lg }}>
              ✨ Trusted by 50,000+ learners worldwide
            </Badge>
            
            <h1 style={{
              fontSize: typography.fontSize['5xl'],
              fontWeight: typography.fontWeight.extrabold,
              lineHeight: typography.lineHeight.tight,
              margin: `${spacing.lg} 0`,
              color: colors.textPrimary,
            }}>
              Learn from the best
              <br />
              <GradientText>tutors online</GradientText>
            </h1>

            <p style={{
              fontSize: typography.fontSize.lg,
              color: colors.textSecondary,
              lineHeight: typography.lineHeight.relaxed,
              margin: `${spacing.xl} 0`,
              maxWidth: '600px',
            }}>
              Connect with expert tutors, personalize your learning, and achieve your goals faster than ever before.
            </p>

            <div style={{ display: 'flex', gap: spacing.lg, marginTop: spacing['2xl'] }}>
              <Button size="lg" onClick={() => navigate('/register')}>
                Start Learning →
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/tutors')}>
                Browse Tutors
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ============= STATS SECTION ============= */}
      <section style={{ background: colors.white, padding: `${spacing['4xl']} 0`, borderBottom: `1px solid ${colors.gray200}` }}>
        <Container>
          <Grid cols={4}>
            <StatCard label="Active Tutors" value="2,500+" icon="👨‍🏫" trend="↑ 45% YoY" />
            <StatCard label="Course Hours" value="50,000+" icon="⏱️" trend="↑ 32% YoY" />
            <StatCard label="5⭐ Reviews" value="98%" icon="⭐" />
            <StatCard label="Success Rate" value="94%" icon="🎓" />
          </Grid>
        </Container>
      </section>

      {/* ============= FEATURES SECTION ============= */}
      <section style={{ padding: `${spacing['4xl']} 0` }}>
        <Container>
          <SectionHeading 
            title="Why learners love us"
            subtitle="Everything you need to succeed in your learning journey"
            centered
          />
          
          <Grid cols={3}>
            {[
              {
                icon: '🎯',
                title: 'Personalized Learning',
                desc: 'Get a tutor tailored to your learning style and pace'
              },
              {
                icon: '📱',
                title: 'Learn Anywhere',
                desc: 'Access lessons on desktop, tablet, or mobile device'
              },
              {
                icon: '💬',
                title: '1-on-1 Sessions',
                desc: 'Direct communication with your tutor for quick feedback'
              },
              {
                icon: '🏆',
                title: 'Proven Results',
                desc: 'Students improve by an average of 2+ letter grades'
              },
              {
                icon: '🔒',
                title: 'Safe & Secure',
                desc: 'Your data and progress are fully protected'
              },
              {
                icon: '⚡',
                title: 'Instant Booking',
                desc: 'Schedule sessions instantly with available tutors'
              },
            ].map((feature, i) => (
              <Card key={i} hover className="feature-card">
                <div style={{ fontSize: '40px', marginBottom: spacing.lg }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  margin: `0 0 ${spacing.md} 0`,
                  color: colors.textPrimary,
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: colors.textSecondary,
                  margin: 0,
                  lineHeight: typography.lineHeight.relaxed,
                }}>
                  {feature.desc}
                </p>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ============= TESTIMONIALS SECTION ============= */}
      <section style={{ background: colors.white, padding: `${spacing['4xl']} 0`, borderTop: `1px solid ${colors.gray200}` }}>
        <Container>
          <SectionHeading 
            title="What students are saying"
            subtitle="Join thousands of happy learners"
            centered
          />
          
          <Grid cols={3}>
            {[
              {
                name: 'Sarah Johnson',
                role: 'High School Student',
                text: 'My tutor helped me go from a C to an A in Math. Highly recommend!',
                avatar: '👩‍🎓'
              },
              {
                name: 'Mike Chen',
                role: 'College Student',
                text: 'The flexibility to learn on my own schedule was exactly what I needed.',
                avatar: '👨‍🎓'
              },
              {
                name: 'Emma Davis',
                role: 'Professional Learner',
                text: 'Affordable, professional, and incredibly effective. Best platform out there.',
                avatar: '👩‍💼'
              },
            ].map((testimonial, i) => (
              <Card key={i}>
                <div style={{ marginBottom: spacing.lg }}>
                  <div style={{ fontSize: '40px', marginBottom: spacing.md }}>
                    {testimonial.avatar}
                  </div>
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: colors.textPrimary,
                    fontStyle: 'italic',
                    margin: 0,
                    lineHeight: typography.lineHeight.relaxed,
                  }}>
                    "{testimonial.text}"
                  </p>
                </div>
                <Divider margin="lg" />
                <div>
                  <p style={{
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.textPrimary,
                    margin: 0,
                  }}>
                    {testimonial.name}
                  </p>
                  <p style={{
                    color: colors.textTertiary,
                    margin: 0,
                    fontSize: typography.fontSize.sm,
                  }}>
                    {testimonial.role}
                  </p>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ============= CTA SECTION ============= */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
        padding: `${spacing['4xl']} 0`,
        color: colors.white,
      }}>
        <Container>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              margin: `0 0 ${spacing.lg} 0`,
            }}>
              Ready to transform your learning?
            </h2>
            <p style={{
              fontSize: typography.fontSize.lg,
              margin: `0 0 ${spacing['2xl']} 0`,
              opacity: 0.9,
            }}>
              Start your journey today with a free consultation
            </p>
            <Button size="lg" onClick={() => navigate('/register')} style={{
              background: colors.accent,
              color: colors.white,
            }}>
              Get Started Today
            </Button>
          </div>
        </Container>
      </section>

      {/* ============= FOOTER ============= */}
      <footer style={{
        background: colors.gray900,
        color: colors.white,
        padding: `${spacing['4xl']} 0`,
        marginTop: spacing['4xl'],
      }}>
        <Container>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: spacing['3xl'],
            marginBottom: spacing['3xl'],
            paddingBottom: spacing['3xl'],
            borderBottom: `1px solid ${colors.gray700}`,
          }}>
            <div>
              <h3 style={{ margin: 0, marginBottom: spacing.lg }}>Company</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, gap: spacing.md, display: 'flex', flexDirection: 'column' }}>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>About Us</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Blog</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ margin: 0, marginBottom: spacing.lg }}>Support</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, gap: spacing.md, display: 'flex', flexDirection: 'column' }}>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Help Center</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Contact</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ margin: 0, marginBottom: spacing.lg }}>Legal</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, gap: spacing.md, display: 'flex', flexDirection: 'column' }}>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Privacy</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Terms</a></li>
                <li><a href="#" style={{ color: colors.gray400, textDecoration: 'none' }}>Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 style={{ margin: 0, marginBottom: spacing.lg }}>Follow</h3>
              <div style={{ display: 'flex', gap: spacing.md }}>
                <a href="#" style={{ fontSize: '24px' }}>🐦</a>
                <a href="#" style={{ fontSize: '24px' }}>📘</a>
                <a href="#" style={{ fontSize: '24px' }}>💼</a>
                <a href="#" style={{ fontSize: '24px' }}>📸</a>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', color: colors.gray500 }}>
            <p style={{ margin: 0 }}>
              © 2026 LearnHub. All rights reserved.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;
