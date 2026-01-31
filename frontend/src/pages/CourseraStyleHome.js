import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Grid, Card, Badge, GradientText, Divider, SectionHeading } from '../components/ModernUI';
import CourseraNavbar from '../components/CourseraNavbar';
import { colors, typography, spacing } from '../theme/designSystem';

const CourseraStyleHome = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  if (user && role === 'student') {
    navigate('/student/dashboard', { replace: true });
    return null;
  }
  if (user && role === 'tutor') {
    navigate('/tutor/dashboard', { replace: true });
    return null;
  }

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      text: 'LearnHub helped me transition into tech with personalized tutoring. The platform is intuitive and the tutors are exceptional.',
      avatar: '👩‍💻'
    },
    {
      name: 'Marcus Johnson',
      role: 'Data Scientist at Amazon',
      text: 'The quality of instruction and flexibility to schedule classes around my work made all the difference in my career growth.',
      avatar: '👨‍💼'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Product Manager at Meta',
      text: 'Outstanding platform! Found exactly the right tutor for my specific goals. Highly recommend to anyone serious about learning.',
      avatar: '👩‍🔬'
    },
  ];

  const categories = [
    { name: 'Artificial Intelligence', icon: '🤖', color: '#3B82F6' },
    { name: 'Machine Learning', icon: '🧠', color: '#8B5CF6' },
    { name: 'Data Science', icon: '📊', color: '#EC4899' },
    { name: 'IoT & Robotics', icon: '🔧', color: '#14B8A6' },
    { name: 'Visualization', icon: '📈', color: '#F59E0B' },
    { name: 'Cloud Computing', icon: '☁️', color: '#06B6D4' },
  ];

  const companies = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Tesla'];

  const projects = [
    {
      title: 'AI Chatbot Builder',
      description: 'Build intelligent conversational AI using transformers',
      level: 'Intermediate',
      students: '2.5K'
    },
    {
      title: 'ML Model Optimization',
      description: 'Optimize deep learning models for production',
      level: 'Advanced',
      students: '1.8K'
    },
    {
      title: 'Data Pipeline Engineering',
      description: 'Create scalable data processing pipelines',
      level: 'Advanced',
      students: '2.1K'
    },
    {
      title: 'Full Stack Development',
      description: 'Master modern web development stack',
      level: 'Beginner',
      students: '5.2K'
    },
  ];

  const whyChooseUs = [
    {
      icon: '👨‍🏫',
      title: 'Expert Tutors',
      description: 'Learn from industry professionals with years of experience'
    },
    {
      icon: '⏱️',
      title: 'Flexible Scheduling',
      description: 'Schedule classes at times that work for you'
    },
    {
      icon: '🎯',
      title: 'Personalized Learning',
      description: 'Tailored curriculum based on your goals'
    },
    {
      icon: '📈',
      title: 'Proven Results',
      description: '94% of students achieve their learning goals'
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with learners from around the world'
    },
    {
      icon: '💬',
      title: '24/7 Support',
      description: 'Get help whenever you need it'
    },
  ];

  return (
    <div style={{ background: colors.white, minHeight: '100vh' }}>
      <CourseraNavbar />

      {/* ============= HERO SECTION ============= */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.bgSecondary} 0%, ${colors.white} 100%)`,
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
      }}>
        <Container>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing['4xl'],
            alignItems: 'center',
          }}>
            <div>
              <Badge variant="primary" style={{ marginBottom: spacing.lg }}>
                ⭐ Trusted by 500K+ learners
              </Badge>

              <h1 style={{
                fontSize: typography.fontSize['5xl'],
                fontWeight: typography.fontWeight.extrabold,
                lineHeight: typography.lineHeight.tight,
                margin: `${spacing.lg} 0`,
                color: colors.textPrimary,
              }}>
                Master any skill with <GradientText>expert tutors</GradientText>
              </h1>

              <p style={{
                fontSize: typography.fontSize.lg,
                color: colors.textSecondary,
                lineHeight: typography.lineHeight.relaxed,
                margin: `${spacing.lg} 0 ${spacing['2xl']} 0`,
              }}>
                Learn from industry professionals. Get personalized one-on-one guidance. Achieve your goals faster.
              </p>

              <div style={{ display: 'flex', gap: spacing.lg, alignItems: 'center' }}>
                <Button size="lg" onClick={() => navigate('/register')}>
                  Start Learning Free →
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/tutors')}>
                  Browse Tutors
                </Button>
              </div>

              <div style={{
                marginTop: spacing['3xl'],
                display: 'flex',
                gap: spacing['2xl'],
              }}>
                <div>
                  <p style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent,
                  }}>
                    50K+
                  </p>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary }}>
                    Active Tutors
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent,
                  }}>
                    100K+
                  </p>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary }}>
                    Courses Completed
                  </p>
                </div>
                <div>
                  <p style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.accent,
                  }}>
                    98%
                  </p>
                  <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary }}>
                    Success Rate
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div style={{
              fontSize: '200px',
              textAlign: 'center',
              opacity: 0.8,
            }}>
              📚
            </div>
          </div>
        </Container>
      </section>

      {/* ============= TRUSTED BY COMPANIES ============= */}
      <section style={{
        background: colors.bgSecondary,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing['3xl'],
      }}>
        <Container>
          <p style={{
            textAlign: 'center',
            fontSize: typography.fontSize.sm,
            color: colors.textSecondary,
            marginBottom: spacing.lg,
            fontWeight: typography.fontWeight.semibold,
          }}>
            TRUSTED BY ENGINEERS AT
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: spacing.lg,
            textAlign: 'center',
          }}>
            {companies.map((company) => (
              <div key={company} style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.textSecondary,
                opacity: 0.7,
                transition: 'opacity 0.3s ease',
              }}>
                {company}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ============= CATEGORIES GRID ============= */}
      <section
        id="training"
        style={{
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
        background: colors.white,
        }}
      >
        <Container>
          <SectionHeading
            title="Explore Categories"
            subtitle="Learn in-demand skills from expert instructors"
            centered
          />
          <Grid cols={3} style={{ marginTop: spacing['3xl'] }}>
            {categories.map((category) => (
              <Card
                key={category.name}
                hover
                style={{
                  cursor: 'pointer',
                  background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                  borderLeft: `4px solid ${category.color}`,
                }}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: spacing.lg,
                }}>
                  {category.icon}
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  margin: 0,
                }}>
                  {category.name}
                </h3>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ============= FEATURED PROJECTS ============= */}
      <section
        id="projects"
        style={{
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
        background: colors.bgSecondary,
        }}
      >
        <Container>
          <SectionHeading
            title="Featured Projects"
            subtitle="Build real-world projects with expert guidance"
            centered
          />
          <Grid cols={2} style={{ marginTop: spacing['3xl'] }}>
            {projects.map((project) => (
              <Card
                key={project.title}
                hover
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accentDark}10 100%)`,
                  height: '200px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: spacing.lg,
                  fontSize: '80px',
                }}>
                  🚀
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  margin: 0,
                  marginBottom: spacing.sm,
                }}>
                  {project.title}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.textSecondary,
                  margin: 0,
                  marginBottom: spacing.lg,
                }}>
                  {project.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Badge variant="gray">{project.level}</Badge>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.textSecondary,
                  }}>
                    {project.students} enrolled
                  </span>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ============= WHY CHOOSE US ============= */}
      <section
        id="about"
        style={{
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
        background: colors.white,
        }}
      >
        <Container>
          <SectionHeading
            title="Why Choose LearnHub"
            subtitle="Everything you need to succeed in your learning journey"
            centered
          />
          <Grid cols={3} style={{ marginTop: spacing['3xl'] }}>
            {whyChooseUs.map((item) => (
              <div key={item.title} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: spacing.lg,
                }}>
                  {item.icon}
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.textPrimary,
                  margin: `0 0 ${spacing.sm} 0`,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.textSecondary,
                  margin: 0,
                }}>
                  {item.description}
                </p>
              </div>
            ))}
          </Grid>
        </Container>
      </section>

      {/* ============= TESTIMONIALS CAROUSEL ============= */}
      <section style={{
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accentDark} 100%)`,
        color: colors.white,
      }}>
        <Container>
          <SectionHeading
            title="What Students Say"
            subtitle="Real stories from real learners"
            centered
            style={{ color: colors.white }}
          />

          <div style={{
            maxWidth: '600px',
            margin: `${spacing['3xl']} auto 0`,
            textAlign: 'center',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: spacing.lg }}>
              {testimonials[currentTestimonial].avatar}
            </div>
            <p style={{
              fontSize: typography.fontSize.lg,
              fontStyle: 'italic',
              marginBottom: spacing.lg,
              lineHeight: typography.lineHeight.relaxed,
            }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            <p style={{
              fontWeight: typography.fontWeight.semibold,
              marginBottom: spacing.sm,
            }}>
              {testimonials[currentTestimonial].name}
            </p>
            <p style={{ fontSize: typography.fontSize.sm, opacity: 0.9 }}>
              {testimonials[currentTestimonial].role}
            </p>

            <div style={{
              display: 'flex',
              gap: spacing.md,
              justifyContent: 'center',
              marginTop: spacing['2xl'],
            }}>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: `1px solid rgba(255,255,255,0.3)`,
                  color: colors.white,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                ← Previous
              </button>
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: 'none',
                    background: index === currentTestimonial ? colors.white : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: `1px solid rgba(255,255,255,0.3)`,
                  color: colors.white,
                  padding: `${spacing.sm} ${spacing.md}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ============= CTA BANNER ============= */}
      <section
        id="pricing"
        style={{
        paddingTop: spacing['4xl'],
        paddingBottom: spacing['4xl'],
        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
        color: colors.white,
        }}
      >
        <Container>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              margin: 0,
              marginBottom: spacing.lg,
            }}>
              Ready to Start Learning?
            </h2>
            <p style={{
              fontSize: typography.fontSize.lg,
              margin: `0 0 ${spacing['2xl']} 0`,
              opacity: 0.95,
            }}>
              Join thousands of students achieving their goals with personalized tutoring.
            </p>
            <div style={{ display: 'flex', gap: spacing.lg, justifyContent: 'center' }}>
              <Button
                size="lg"
                style={{
                  background: colors.white,
                  color: colors.accent,
                }}
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="secondary"
                style={{
                  borderColor: colors.white,
                  color: colors.white,
                }}
                onClick={() => navigate('/tutors')}
              >
                Explore Tutors
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ============= FOOTER ============= */}
      <footer style={{
        background: colors.primary,
        color: colors.white,
        paddingTop: spacing['3xl'],
        paddingBottom: spacing['2xl'],
      }}>
        <Container>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: spacing['2xl'],
            marginBottom: spacing['3xl'],
          }}>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.lg,
              }}>
                Company
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {['About Us', 'Blog', 'Careers', 'Press'].map((item) => (
                  <li key={item} style={{ marginBottom: spacing.sm }}>
                    <a href="#/" style={{ color: colors.gray300, textDecoration: 'none' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.lg,
              }}>
                Learning
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {['Browse Courses', 'Tutors', 'For Tutors', 'Become a Tutor'].map((item) => (
                  <li key={item} style={{ marginBottom: spacing.sm }}>
                    <a href="#/" style={{ color: colors.gray300, textDecoration: 'none' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.lg,
              }}>
                Support
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {['Help Center', 'Contact', 'FAQ', 'Safety'].map((item) => (
                  <li key={item} style={{ marginBottom: spacing.sm }}>
                    <a href="#/" style={{ color: colors.gray300, textDecoration: 'none' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing.lg,
              }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {['Privacy', 'Terms', 'Cookie Policy', 'License'].map((item) => (
                  <li key={item} style={{ marginBottom: spacing.sm }}>
                    <a href="#/" style={{ color: colors.gray300, textDecoration: 'none' }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Divider />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing['2xl'],
          }}>
            <p style={{ margin: 0, fontSize: typography.fontSize.sm }}>
              © 2026 LearnHub. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: spacing.lg }}>
              <a href="#/" style={{ fontSize: '24px', textDecoration: 'none' }}>🐦</a>
              <a href="#/" style={{ fontSize: '24px', textDecoration: 'none' }}>📘</a>
              <a href="#/" style={{ fontSize: '24px', textDecoration: 'none' }}>💼</a>
              <a href="#/" style={{ fontSize: '24px', textDecoration: 'none' }}>📸</a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default CourseraStyleHome;
