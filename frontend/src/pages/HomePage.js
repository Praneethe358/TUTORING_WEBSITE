import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, shadows, transitions } from '../theme/designSystem';
import Logo from '../components/Logo';
import '../styles/homepage-animations.css';
import '../styles/homepage-premium-purple.css';
import axios from 'axios';

// Add desktop-specific logo styling with higher specificity
const styles = `
  .homepage-header-logo .logo-root img {
    height: 64px !important;
  }
  
  @media (min-width: 1024px) {
    .homepage-header-logo .logo-root img {
      height: 180px !important;
      max-height: 180px !important;
    }
  }
`;

const brand = {
  navy: colors.primary,
  blue: colors.primaryLight,
  lightBlue: colors.gray50,
  gold: colors.accent,
  white: colors.white,
  text: colors.textPrimary,
  muted: colors.textSecondary,
  border: colors.gray200,
  purple: '#8B5CF6',
  purpleDark: '#6D28D9',
  orange: '#FF8C42',
  pink: '#EC4899',
  green: '#10B981'
};

const sectionStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${spacing.lg}`
};

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

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const featureCards = [
    { icon: '🛡️', title: 'Online & Safe Learning', desc: 'Secure virtual classrooms with monitored sessions.' },
    { icon: '📘', title: 'Structured Curriculum', desc: 'Grade-aligned lesson plans and weekly goals.' },
    { icon: '🤝', title: 'Personalized Attention', desc: 'Small batches and 1:1 doubt clearing.' },
    { icon: '📈', title: 'Regular Assessments', desc: 'Frequent quizzes with parent-ready reports.' }
  ];

  const steps = [
    { title: 'Register', desc: 'Pick your role, share your goals, and create your HOPE account.' },
    { title: 'Attend / Teach', desc: 'Join live online classes or start teaching from home.' },
    { title: 'Track Progress / Earn', desc: 'Parents track growth; tutors track earnings and impact.' }
  ];

  return (
    <div className="homepage-premium-purple" style={{ background: colors.bgSecondary, color: brand.text, minHeight: '100vh' }}>
      {/* Inject custom styles for desktop logo sizing */}
      <style>{styles}</style>
      
      {/* Header / Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: `1px solid ${brand.border}`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${spacing.lg} 0`, gap: spacing.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <div className="homepage-header-logo" style={{ display: 'flex', alignItems: 'center' }}>
              <Logo size={180} withText={true} />
            </div>
            <span style={{ fontSize: typography.fontSize.sm, color: brand.muted, display: 'none', '@media (min-width: 768px)': { display: 'inline' } }}>Saving Time, Inspiring Minds</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' }}>
            <NavButton onClick={() => scrollTo('hero')}>Home</NavButton>
            <NavButton onClick={() => navigate('/login')}>Student Login</NavButton>
            <NavButton onClick={() => navigate('/tutor/login')}>Tutor Login</NavButton>
            <NavButton onClick={() => scrollTo('contact')}>Contact</NavButton>
            <div style={{ display: 'flex', gap: spacing.sm }}>
              <PillButton primary onClick={() => navigate('/login')}>Enroll</PillButton>
              <PillButton secondary onClick={() => navigate('/tuor/login')}>Apply</PillButton>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" style={{ background: `linear-gradient(135deg, ${colors.bgSecondary} 0%, ${colors.white} 70%)`, padding: `${spacing['4xl']} 0` }}>
        <div style={{ ...sectionStyle, display: 'grid', gap: spacing['2xl'], gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: spacing.sm, 
              padding: `${spacing.sm} ${spacing.lg}`, 
              background: brand.white, 
              borderRadius: 999, 
              border: `2px solid ${brand.border}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              animation: 'fadeInUp 0.6s ease'
            }}>
              <span style={{ fontWeight: 700, color: brand.blue, fontSize: typography.fontSize.sm }}>HOPE Online Tuitions</span>
              <span style={{ color: brand.muted, fontSize: typography.fontSize.xs }}>Saving Time, Inspiring Minds</span>
            </div>
            <h1 style={{ 
              fontSize: typography.fontSize['5xl'], 
              lineHeight: typography.lineHeight.tight, 
              margin: `${spacing.xl} 0 ${spacing.lg}`, 
              color: brand.navy,
              fontWeight: typography.fontWeight.extrabold,
              letterSpacing: '-0.02em',
              animation: 'fadeInUp 0.8s ease'
            }}>
              Learn safely from home with trusted tutors
            </h1>
            <p style={{ 
              fontSize: typography.fontSize.lg, 
              lineHeight: typography.lineHeight.relaxed, 
              color: brand.muted, 
              maxWidth: 640,
              animation: 'fadeInUp 1s ease'
            }}>
              Designed for busy parents and focused students. Live online classes, structured curriculum, and clear progress updates without commute stress.
            </p>
            <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.xl, animation: 'fadeInUp 1.2s ease' }}>
              <CTAButton primary onClick={() => navigate('/login')}>
                Enroll as Student
              </CTAButton>
              <CTAButton secondary onClick={() => navigate('/tutor/login')}>
                Apply as Tutor
              </CTAButton>
            </div>
            <div style={{ 
              display: 'flex', 
              gap: spacing.xl, 
              marginTop: spacing.xl, 
              flexWrap: 'wrap', 
              color: brand.muted,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              animation: 'fadeInUp 1.4s ease'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>🏠 100% online & safe</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>🕒 Saves 5+ hrs/week</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>📊 Parent progress tracking</span>
            </div>
          </div>
          <div style={{ position: 'relative', padding: spacing.lg }}>
            <div style={{
              background: brand.white,
              borderRadius: 20,
              border: `1px solid ${brand.border}`,
              boxShadow: colors.shadowLg,
              padding: spacing.lg,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, background: brand.lightBlue, borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -60, width: 220, height: 220, background: brand.gold, borderRadius: '50%', opacity: 0.15 }} />
              <div style={{ position: 'relative', display: 'grid', gap: 14 }}>
                <h3 style={{ margin: 0, color: brand.navy }}>Live online class snapshot</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {['Math', 'Science', 'English'].map((subject) => (
                    <div key={subject} style={{ background: brand.lightBlue, borderRadius: 14, padding: '12px 10px', border: `1px solid ${brand.border}` }}>
                      <p style={{ margin: 0, fontWeight: 700, color: brand.navy }}>{subject}</p>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: brand.muted }}>Live now · Small batch</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px', background: brand.white, borderRadius: 14, border: `1px solid ${brand.border}` }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: brand.blue, display: 'grid', placeItems: 'center', color: brand.white, fontWeight: 700 }}>
                    4.9
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, color: brand.navy }}>Parent-rated experience</p>
                    <p style={{ margin: 0, color: brand.muted, fontSize: 13 }}>Trusted tutors | Weekly updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose HOPE */}
      <section id="why" style={{ padding: `${spacing['3xl']} 0`, background: colors.bgPrimary }}>
        <div style={{ ...sectionStyle }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap', marginBottom: spacing['2xl'] }}>
            <div>
              <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs, letterSpacing: '0.1em', textTransform: 'uppercase' }}>WHY CHOOSE HOPE</p>
              <h2 style={{ margin: `${spacing.sm} 0 0`, color: brand.navy, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>Built for safe, structured learning at home</h2>
            </div>
            <PillButton primary onClick={() => navigate('/login')}>
              Start Learning Today
            </PillButton>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {featureCards.map((f, idx) => (
              <FeatureCard key={f.title} delay={idx * 0.1}>
                <div style={{ fontSize: 32, marginBottom: spacing.md, filter: 'grayscale(0)', transition: 'filter 0.3s ease' }}>{f.icon}</div>
                <p style={{ margin: `0 0 ${spacing.sm}`, fontWeight: typography.fontWeight.bold, color: brand.navy, fontSize: typography.fontSize.lg }}>{f.title}</p>
                <p style={{ margin: 0, color: brand.muted, lineHeight: typography.lineHeight.relaxed, fontSize: typography.fontSize.sm }}>{f.desc}</p>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* For Parents & School Students */}
      <section id="parents" style={{ padding: `${spacing['3xl']} 0`, background: colors.bgSecondary }}>
        <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs, letterSpacing: '0.1em', textTransform: 'uppercase' }}>FOR PARENTS & SCHOOL STUDENTS</p>
            <h2 style={{ margin: `${spacing.sm} 0 ${spacing.md}`, color: brand.navy, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>Safe learning, small classes, no commute</h2>
            <ul style={{ paddingLeft: spacing.lg, color: brand.muted, lineHeight: typography.lineHeight.relaxed, margin: 0, fontSize: typography.fontSize.base }}>
              <li style={{ marginBottom: spacing.sm }}>Learn from home with monitored, secure sessions.</li>
              <li style={{ marginBottom: spacing.sm }}>Save travel time and keep evenings stress-free.</li>
              <li style={{ marginBottom: spacing.sm }}>Small class sizes for better attention.</li>
              <li>Weekly updates so parents can track progress.</li>
            </ul>
            <CTAButton primary style={{ marginTop: spacing.xl }} onClick={() => navigate('/login')}>
              Start Learning Today
            </CTAButton>
          </div>
          <div style={{ background: brand.white, borderRadius: '20px', padding: spacing.xl, border: `2px solid ${brand.border}`, boxShadow: shadows.xl, transition: transitions.base }}>
            <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Progress snapshot</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing.md, marginTop: spacing.lg }}>
              {[
                { label: 'Attendance', value: '98%' },
                { label: 'Homework on-time', value: '95%' },
                { label: 'Quiz average', value: '88%' },
                { label: 'Weekly hours saved', value: '5h' }
              ].map((item) => (
                <div key={item.label} style={{ padding: spacing.lg, borderRadius: '16px', background: brand.lightBlue, border: `2px solid ${brand.border}`, transition: transitions.base }}>
                  <p style={{ margin: 0, color: brand.muted, fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium }}>{item.label}</p>
                  <p style={{ margin: `${spacing.xs} 0 0`, fontWeight: typography.fontWeight.extrabold, color: brand.navy, fontSize: typography.fontSize.xl }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For College Students (Tutors) */}
      <section id="tutors" style={{ padding: `${spacing['3xl']} 0`, background: colors.bgPrimary }}>
        <div style={{ ...sectionStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, alignItems: 'center' }}>
          <div style={{ background: brand.lightBlue, borderRadius: '20px', padding: spacing.xl, border: `2px solid ${brand.border}`, boxShadow: shadows.md, transition: transitions.base }}>
            <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs, letterSpacing: '0.1em', textTransform: 'uppercase' }}>FOR COLLEGE STUDENTS</p>
            <h2 style={{ margin: `${spacing.sm} 0 ${spacing.md}`, color: brand.navy, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>Teach from home. Earn well. Make a difference.</h2>
            <ul style={{ paddingLeft: spacing.lg, color: brand.muted, lineHeight: typography.lineHeight.relaxed, margin: 0, fontSize: typography.fontSize.base }}>
              <li style={{ marginBottom: spacing.sm }}>Work from home with safe online classrooms.</li>
              <li style={{ marginBottom: spacing.sm }}>Flexible hours that fit your schedule.</li>
              <li style={{ marginBottom: spacing.sm }}>Competitive pay for great teaching.</li>
              <li>Help younger students succeed and grow.</li>
            </ul>
            <CTAButton secondary style={{ marginTop: spacing.xl }} onClick={() => navigate('/tutor/login')}>
              Apply as Tutor
            </CTAButton>
          </div>
          <div style={{ borderRadius: '20px', border: `2px solid ${brand.border}`, padding: spacing.xl, boxShadow: shadows.xl, background: brand.white, transition: transitions.base }}>
            <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Tutor highlights</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: spacing.md, marginTop: spacing.lg }}>
              {[
                { label: 'Work from home', icon: '🏠' },
                { label: 'Flexible hours', icon: '⏰' },
                { label: 'Competitive pay', icon: '💰' },
                { label: 'Impact minds', icon: '✨' }
              ].map((item) => (
                <div key={item.label} style={{ padding: spacing.lg, borderRadius: '16px', background: brand.lightBlue, border: `2px solid ${brand.border}`, display: 'flex', gap: spacing.sm, alignItems: 'center', transition: transitions.base, cursor: 'default' }}>
                  <span style={{ fontSize: typography.fontSize['2xl'] }}>{item.icon}</span>
                  <span style={{ color: brand.navy, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: `${spacing['3xl']} 0`, background: colors.bgSecondary }}>
        <div style={{ ...sectionStyle }}>
          <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs, letterSpacing: '0.1em', textTransform: 'uppercase' }}>HOW IT WORKS</p>
          <h2 style={{ margin: `${spacing.sm} 0 ${spacing.xl}`, color: brand.navy, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>Simple steps for students and tutors</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: spacing.lg }}>
            {steps.map((step, idx) => (
              <div key={step.title} style={{ background: brand.white, borderRadius: '20px', padding: spacing.xl, border: `2px solid ${brand.border}`, boxShadow: shadows.md, transition: transitions.base }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: brand.blue, color: brand.white, display: 'grid', placeItems: 'center', fontWeight: typography.fontWeight.extrabold, marginBottom: spacing.md, fontSize: typography.fontSize.lg }}>
                  {idx + 1}
                </div>
                <p style={{ margin: `0 0 ${spacing.sm}`, fontWeight: typography.fontWeight.bold, color: brand.navy, fontSize: typography.fontSize.lg }}>{step.title}</p>
                <p style={{ margin: 0, color: brand.muted, lineHeight: typography.lineHeight.relaxed, fontSize: typography.fontSize.sm }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Trust */}
      <section id="contact" style={{ padding: `${spacing['3xl']} 0`, background: colors.bgPrimary }}>
        <div style={{ ...sectionStyle }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing['2xl'], alignItems: 'start', marginBottom: spacing['3xl'] }}>
            <div>
              <p style={{ margin: 0, color: brand.muted, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.xs, letterSpacing: '0.1em', textTransform: 'uppercase' }}>CONTACT</p>
              <h2 style={{ margin: `${spacing.sm} 0 ${spacing.lg}`, color: brand.navy, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.lineHeight.tight }}>We are here for parents and learners</h2>
              <p style={{ margin: `0 0 ${spacing.md}`, color: brand.muted, fontSize: typography.fontSize.base }}>Email: <strong style={{ color: brand.navy, fontWeight: typography.fontWeight.semibold }}>hopetuitionbygd@gmail.com</strong></p>
              <p style={{ margin: `0 0 ${spacing.xl}`, color: brand.muted, fontSize: typography.fontSize.base }}>Phone: <strong style={{ color: brand.navy, fontWeight: typography.fontWeight.semibold }}>8807717477</strong></p>
              <p style={{ margin: 0, color: brand.muted, lineHeight: typography.lineHeight.relaxed, fontSize: typography.fontSize.base }}>
                Trustworthy, parent-friendly support. We keep families informed with weekly updates and clear progress reports.
              </p>
            </div>
            <div style={{ background: brand.lightBlue, borderRadius: '20px', padding: spacing.xl, border: `2px solid ${brand.border}`, boxShadow: shadows.md, transition: transitions.base }}>
              <p style={{ margin: 0, color: brand.navy, fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg }}>Why parents trust HOPE</p>
              <ul style={{ margin: `${spacing.md} 0 0`, paddingLeft: spacing.lg, color: brand.muted, lineHeight: typography.lineHeight.relaxed, fontSize: typography.fontSize.base }}>
                <li style={{ marginBottom: spacing.sm }}>Verified tutors and safe online classrooms.</li>
                <li style={{ marginBottom: spacing.sm }}>Transparent schedules and timely reminders.</li>
                <li>Clear learning goals with measurable progress.</li>
              </ul>
            </div>
          </div>
          
          {/* Contact Form */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        background: `linear-gradient(135deg, ${brand.navy} 0%, ${colors.gray800} 100%)`, 
        color: brand.white, 
        padding: `${spacing['4xl']} 0 ${spacing['2xl']}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ 
          position: 'absolute', 
          top: -100, 
          right: -100, 
          width: 300, 
          height: 300, 
          background: brand.gold, 
          borderRadius: '50%', 
          opacity: 0.05 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: -150, 
          left: -150, 
          width: 400, 
          height: 400, 
          background: brand.gold, 
          borderRadius: '50%', 
          opacity: 0.03 
        }} />
        
        <div style={{ ...sectionStyle, position: 'relative', zIndex: 1 }}>
          {/* Main footer content */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr 1.5fr',
            gap: spacing['3xl'],
            paddingBottom: spacing['3xl'],
            borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
            alignItems: 'start'
          }}>
            {/* Brand section */}
            <div style={{ maxWidth: 320 }}>
              <div style={{ marginBottom: spacing.lg }}>
                <Logo size={64} withText={true} />
              </div>
              <p style={{ 
                color: brand.gold, 
                fontWeight: typography.fontWeight.semibold, 
                fontSize: typography.fontSize.base,
                marginBottom: spacing.md,
                fontStyle: 'italic',
                margin: `0 0 ${spacing.md}`
              }}>
                Saving Time, Inspiring Minds
              </p>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.relaxed,
                margin: 0
              }}>
                Empowering students and tutors with safe, structured online learning experiences.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 style={{ 
                color: brand.white, 
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing.lg,
                margin: `0 0 ${spacing.lg}`
              }}>
                Quick Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <FooterLink onClick={() => scrollTo('hero')}>Home</FooterLink>
                <FooterLink onClick={() => scrollTo('why')}>Why Choose HOPE</FooterLink>
                <FooterLink onClick={() => scrollTo('parents')}>For Parents</FooterLink>
                <FooterLink onClick={() => scrollTo('tutors')}>For Tutors</FooterLink>
              </div>
            </div>

            {/* Get Started */}
            <div>
              <h3 style={{ 
                color: brand.white, 
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing.lg,
                margin: `0 0 ${spacing.lg}`
              }}>
                Get Started
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <FooterLink onClick={() => navigate('/login')}>Student Login</FooterLink>
                <FooterLink onClick={() => navigate('/register')}>Student Registration</FooterLink>
                <FooterLink onClick={() => navigate('/tutor/login')}>Tutor Login</FooterLink>
                <FooterLink onClick={() => navigate('/tutor/register')}>Tutor Application</FooterLink>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 style={{ 
                color: brand.white, 
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing.lg
              }}>
                Contact Us
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: spacing.sm }}>
                  <span style={{ fontSize: typography.fontSize.lg }}>📧</span>
                  <div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.xs }}>Email</p>
                    <a 
                      href="mailto:hopetuitionbygd@gmail.com"
                      style={{ 
                        color: brand.gold, 
                        textDecoration: 'none',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      hopetuitionbygd@gmail.com
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: spacing.sm }}>
                  <span style={{ fontSize: typography.fontSize.lg }}>📞</span>
                  <div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.xs }}>Phone</p>
                    <a 
                      href="tel:8807717477"
                      style={{ 
                        color: brand.gold, 
                        textDecoration: 'none',
                        fontSize: typography.fontSize.sm,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      8807717477
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: spacing.lg,
            paddingTop: spacing.xl
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: typography.fontSize.sm,
              margin: 0
            }}>
              © 2026 HOPE Online Tuitions. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
              <FooterLink onClick={() => scrollTo('contact')}>Privacy Policy</FooterLink>
              <FooterLink onClick={() => scrollTo('contact')}>Terms of Service</FooterLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const navLinkStyle = {
  background: 'transparent',
  border: 'none',
  fontWeight: 600,
  color: brand.navy,
  cursor: 'pointer',
  fontSize: typography.fontSize.sm,
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  position: 'relative'
};

const pillButton = {
  border: 'none',
  borderRadius: 999,
  padding: '11px 20px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: typography.fontSize.sm,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  overflow: 'hidden'
};

const ctaButton = {
  border: 'none',
  borderRadius: '14px',
  padding: '14px 28px',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: typography.fontSize.base,
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden'
};

const FooterLink = ({ onClick, children }) => {
  const [isHover, setIsHover] = React.useState(false);
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{ 
        background: 'transparent', 
        border: 'none', 
        color: isHover ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.8)', 
        cursor: 'pointer', 
        fontWeight: 600,
        transition: 'color 0.2s ease',
        textDecoration: isHover ? 'underline' : 'none',
        fontSize: typography.fontSize.sm
      }}
    >
      {children}
    </button>
  );
};

// Interactive nav button component
const NavButton = ({ onClick, children }) => {
  const [isHover, setIsHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        ...navLinkStyle,
        background: isHover ? colors.gray50 : 'transparent',
        transform: isHover ? 'translateY(-1px)' : 'none'
      }}
    >
      {children}
    </button>
  );
};

// Pill button with hover states
const PillButton = ({ primary, secondary, onClick, children }) => {
  const [isHover, setIsHover] = React.useState(false);
  const bg = primary ? brand.blue : brand.gold;
  const color = primary ? brand.white : brand.navy;
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        ...pillButton,
        background: bg,
        color: color,
        transform: isHover ? 'translateY(-2px) scale(1.02)' : 'none',
        boxShadow: isHover ? '0 6px 20px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      {children}
    </button>
  );
};

// CTA button with enhanced interactions
const CTAButton = ({ primary, secondary, onClick, children }) => {
  const [isHover, setIsHover] = React.useState(false);
  const bg = primary ? brand.blue : brand.gold;
  const color = primary ? brand.white : brand.navy;
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        ...ctaButton,
        background: bg,
        color: color,
        transform: isHover ? 'translateY(-2px)' : 'none',
        boxShadow: isHover ? '0 12px 32px rgba(0, 0, 0, 0.18)' : '0 8px 24px rgba(0, 0, 0, 0.12)'
      }}
    >
      {children}
    </button>
  );
};

// Feature card with hover animation
const FeatureCard = ({ children, delay }) => {
  const [isHover, setIsHover] = React.useState(false);
  
  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        background: brand.lightBlue,
        borderRadius: '20px',
        padding: spacing.xl,
        border: `2px solid ${isHover ? brand.border : 'transparent'}`,
        boxShadow: isHover ? shadows.xl : shadows.sm,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHover ? 'translateY(-4px)' : 'none',
        cursor: 'default',
        animation: `fadeInUp 0.6s ease ${delay}s both`
      }}
    >
      {children}
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'parent',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/contact/submit', formData);
      setStatus({ type: 'success', message: response.data.message });
      setFormData({ name: '', email: '', phone: '', userType: 'parent', message: '' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to send message. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: brand.white, borderRadius: '20px', padding: spacing.xl, border: `2px solid ${brand.border}`, boxShadow: shadows.lg, maxWidth: 800, margin: '0 auto' }}>
      <h3 style={{ margin: `0 0 ${spacing.lg}`, color: brand.navy, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }}>Send us a message</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
          <div>
            <label style={{ display: 'block', marginBottom: spacing.xs, color: brand.navy, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: spacing.md,
                border: `2px solid ${brand.border}`,
                borderRadius: '12px',
                fontSize: typography.fontSize.base,
                boxSizing: 'border-box',
                transition: transitions.base
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: spacing.xs, color: brand.navy, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: spacing.md,
                border: `2px solid ${brand.border}`,
                borderRadius: '12px',
                fontSize: typography.fontSize.base,
                boxSizing: 'border-box',
                transition: transitions.base
              }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: spacing.md, marginBottom: spacing.md }}>
          <div>
            <label style={{ display: 'block', marginBottom: spacing.xs, color: brand.navy, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: spacing.md,
                border: `2px solid ${brand.border}`,
                borderRadius: '12px',
                fontSize: typography.fontSize.base,
                boxSizing: 'border-box',
                transition: transitions.base
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: spacing.xs, color: brand.navy, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>I am a *</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: spacing.md,
                border: `2px solid ${brand.border}`,
                borderRadius: '12px',
                fontSize: typography.fontSize.base,
                boxSizing: 'border-box',
                transition: transitions.base,
                background: brand.white
              }}
            >
              <option value="parent">Parent</option>
              <option value="student">Student</option>
              <option value="tutor">Prospective Tutor</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: spacing.lg }}>
          <label style={{ display: 'block', marginBottom: spacing.xs, color: brand.navy, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.sm }}>Message *</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            style={{
              width: '100%',
              padding: spacing.md,
              border: `2px solid ${brand.border}`,
              borderRadius: '12px',
              fontSize: typography.fontSize.base,
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit',
              transition: transitions.base
            }}
          />
        </div>
        {status.message && (
          <div style={{ 
            padding: spacing.md, 
            borderRadius: '12px', 
            marginBottom: spacing.md,
            background: status.type === 'success' ? '#d4edda' : '#f8d7da',
            color: status.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${status.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            fontSize: typography.fontSize.sm
          }}>
            {status.message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...ctaButton,
            background: loading ? brand.muted : brand.blue,
            color: brand.white,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            width: '100%'
          }}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default HomePage;
