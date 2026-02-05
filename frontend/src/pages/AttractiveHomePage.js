import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const AttractiveHomePage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Auto-redirect authenticated users
  if (user && role === 'student') {
    navigate('/student/dashboard', { replace: true });
    return null;
  }
  if (user && role === 'tutor') {
    navigate('/tutor/dashboard', { replace: true });
    return null;
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    // Store form data and navigate to booking/register
    sessionStorage.setItem('bookingData', JSON.stringify(formData));
    navigate('/register');
  };

  return (
    <div style={{ background: '#f0f0f0', minHeight: '100vh' }}>
      {/* Global Mobile Responsive Styles */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
          body {
            font-size: 14px;
          }
          
          h2 {
            font-size: 20px !important;
          }
          
          h3 {
            font-size: 18px !important;
          }
        }
        
        @media (max-width: 480px) {
          h2 {
            font-size: 18px !important;
          }
          
          h3 {
            font-size: 16px !important;
          }
        }
      `}</style>
      
      {/* Mobile Responsive Styles for Floating Icons */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .floating-icon {
          width: 60px;
          height: 60px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 0, 0, 0.2);
          animation: float 3s ease-in-out infinite;
        }
        
        .floating-icon:nth-child(1) {
          animation-delay: 0s;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3);
        }
        
        .floating-icon:nth-child(2) {
          animation-delay: 0.5s;
          box-shadow: 0 0 20px rgba(37, 211, 102, 0.5), 0 0 40px rgba(37, 211, 102, 0.3);
        }
        
        .floating-icon:nth-child(3) {
          animation-delay: 1s;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.5), 0 0 40px rgba(245, 158, 11, 0.3);
        }
        
        @media (max-width: 1024px) {
          /* Tablet and below */
          .floating-icon {
            width: 50px;
            height: 50px;
            font-size: 22px;
          }
          .floating-icons-container {
            right: 20px;
            bottom: 120px;
            gap: 16px;
          }
        }
        
        @media (max-width: 768px) {
          /* Mobile specific styles */
          .floating-icon {
            width: 48px !important;
            height: 48px !important;
            font-size: 20px !important;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.25) !important;
          }
          
          .floating-icons-container {
            right: 12px !important;
            bottom: 80px !important;
            gap: 10px !important;
            z-index: 999 !important;
          }
          
          .top-banner {
            display: none !important;
          }
          
          /* Header Container - Improved Mobile Layout */
          .header-container {
            flex-wrap: wrap !important;
            gap: 8px !important;
            padding: 12px 0 !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
          }
          
          /* Logo and Name */
          .header-logo-group {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            flex-shrink: 0 !important;
          }
          
          .header-logo-group img {
            width: 40px !important;
            height: 40px !important;
            flex-shrink: 0 !important;
          }
          
          .header-logo-name {
            font-size: 18px !important;
            font-weight: bold !important;
            color: white !important;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5) !important;
            white-space: nowrap !important;
            letter-spacing: 0.5px !important;
          }
          
          /* Navigation Buttons */
          .header-nav {
            display: flex !important;
            gap: 6px !important;
            background: rgba(30, 58, 138, 0.9) !important;
            padding: 5px 8px !important;
            border-radius: 20px !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            flex-shrink: 0 !important;
            align-items: center !important;
          }
          
          .header-nav button {
            background: transparent !important;
            color: white !important;
            padding: 6px 10px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            font-weight: 500 !important;
            border: 1px solid transparent !important;
            transition: all 0.2s ease !important;
            white-space: nowrap !important;
            cursor: pointer !important;
          }
          
          .header-nav button:hover {
            background: rgba(255, 255, 255, 0.15) !important;
            border-color: rgba(255, 255, 255, 0.3) !important;
          }
          
          .header-nav button:first-child {
            border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small mobile */
          .floating-icon {
            width: 44px !important;
            height: 44px !important;
            font-size: 18px !important;
          }
          
          .floating-icons-container {
            right: 10px !important;
            bottom: 60px !important;
          }
          
          .header-logo-group {
            gap: 6px !important;
          }
          
          .header-logo-group img {
            width: 36px !important;
            height: 36px !important;
          }
          
          .header-logo-name {
            font-size: 16px !important;
          }
          
          .header-nav {
            padding: 4px 6px !important;
            gap: 4px !important;
          }
          
          .header-nav button {
            padding: 5px 8px !important;
            font-size: 11px !important;
          }
          
          /* Hero Section Mobile Typography */
          .hero-main-title {
            font-size: 32px !important;
            font-weight: 800 !important;
            line-height: 1.15 !important;
          }
          
          .hero-subtitle {
            font-size: 20px !important;
            margin-bottom: 18px !important;
          }
          
          .hero-description {
            font-size: 14px !important;
            line-height: 1.5 !important;
            margin-bottom: 20px !important;
          }
          
          .feature-item {
            font-size: 13px !important;
            padding: 9px 10px !important;
          }
          
          .feature-emoji {
            font-size: 18px !important;
          }
          
          .hero-content-grid {
            gap: 16px !important;
            padding: 0 !important;
          }
          
          .form-card {
            padding: 18px !important;
            border-radius: 10px !important;
          }
          
          .form-card h2 {
            font-size: 20px !important;
          }
          
          .form-card p {
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }
          
          .form-input {
            padding: 10px !important;
            font-size: 13px !important;
            margin-bottom: 11px !important;
          }
          
          .form-button {
            padding: 11px !important;
            font-size: 14px !important;
            border-radius: 6px !important;
          }
        }
        
        @media (max-width: 768px) {
          /* Tablet and Mobile shared styles */
          .hero-main-title {
            font-size: 38px !important;
            margin-bottom: 12px !important;
          }
          
          .hero-subtitle {
            font-size: 22px !important;
            margin-bottom: 20px !important;
          }
          
          .hero-description {
            font-size: 15px !important;
            line-height: 1.6 !important;
          }
          
          .feature-item {
            font-size: 14px !important;
            padding: 10px 12px !important;
            gap: 10px !important;
          }
          
          .feature-emoji {
            font-size: 20px !important;
          }
          
          .hero-content-grid {
            gap: 20px !important;
          }
          
          /* Mobile Feature Cards - 2 Column Layout */
          .mobile-feature-cards {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          
          .mobile-feature-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }
          
          .mobile-feature-card > div:nth-child(3) {
            font-size: 48px !important;
            margin-bottom: 12px !important;
          }
          
          .mobile-feature-card h3 {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }
          
          .mobile-feature-card p {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          .form-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }
          
          .form-card h2 {
            font-size: 22px !important;
            margin-bottom: 8px !important;
          }
          
          .form-card p {
            font-size: 14px !important;
          }
          
          .form-input {
            padding: 11px !important;
            font-size: 14px !important;
            border-radius: 6px !important;
            margin-bottom: 12px !important;
          }
          
          .form-button {
            padding: 12px !important;
            font-size: 15px !important;
          }
          
          /* Mobile Parent Features Cards - 2 Column Layout */
          .parent-features-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          
          .parent-feature-card {
            padding: 20px !important;
            border-radius: 10px !important;
          }
          
          .parent-feature-card > div:first-child {
            font-size: 40px !important;
            margin-bottom: 10px !important;
          }
          
          .parent-feature-card h3 {
            font-size: 15px !important;
            margin-bottom: 8px !important;
          }
          
          .parent-feature-card p {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          /* Mobile Tutor Features Cards - 2 Column Layout */
          .tutor-features-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          
          .tutor-feature-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }
          
          .tutor-feature-card > div:first-child {
            font-size: 40px !important;
            margin-bottom: 12px !important;
          }
          
          .tutor-feature-card h3 {
            font-size: 15px !important;
            margin-bottom: 8px !important;
          }
          
          .tutor-feature-card p {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          /* Mobile How It Works Cards - 2 Column Layout */
          .how-it-works-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
          
          .how-it-works-card {
            padding: 20px !important;
            border-radius: 10px !important;
          }
          
          .how-it-works-card > div:first-child {
            width: 50px !important;
            height: 50px !important;
            font-size: 24px !important;
            margin-bottom: 12px !important;
          }
          
          .how-it-works-card h3 {
            font-size: 15px !important;
            margin-bottom: 8px !important;
          }
          
          .how-it-works-card p {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
        }
      `}</style>

      {/* Top Banner */}
      <div className="top-banner" style={{
        background: '#DC2626',
        color: 'white',
        padding: '8px 12px',
        textAlign: 'center',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span>🎓 HOPE Online Tuitions - Guiding your child's progress from home – easily and effectively</span>
        <button style={{
          background: 'white',
          color: '#DC2626',
          border: 'none',
          padding: '5px 14px',
          borderRadius: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '11px',
          whiteSpace: 'nowrap'
        }}>
          Learn More
        </button>
      </div>

      {/* Floating Contact Icons */}
      <div className="floating-icons-container" style={{
        position: 'fixed',
        right: '30px',
        bottom: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 1000
      }}>
        {/* Call Icon */}
        <a href="tel:+918807717477" className="floating-icon" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: 'scale(1)',
          position: 'relative'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }} title="Call: +91-8807717477">
          📞
        </a>

        {/* WhatsApp Icon */}
        <a href="https://wa.me/918807717477?text=Hello%20HOPE" target="_blank" rel="noopener noreferrer" className="floating-icon" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#25D366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '32px',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: 'scale(1)',
          fontWeight: 'bold'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }} title="Chat on WhatsApp: +91-8807717477">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>

        {/* Email Icon */}
        <a href="mailto:hopetuitionbygd@gmail.com?subject=Inquiry%20from%20HOPE%20Website" className="floating-icon" style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          transform: 'scale(1)'
        }} onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }} onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }} title="Email: hopetuitionbygd@gmail.com">
          📧
        </a>
      </div>

      {/* Main Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #111827 100%)',
        color: 'white',
        padding: '30px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          width: '250px',
          height: '250px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%'
        }}></div>

        {/* Header with Logo */}
        <div className="header-container" style={{
          maxWidth: '1200px',
          margin: '0 auto 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2,
          gap: '20px',
          padding: '0 10px'
        }}>
          {/* Logo and Brand Name */}
          <div className="header-logo-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '0' }}>
            <Logo size={50} withText={false} />
            <span className="header-logo-name" style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.5)', whiteSpace: 'nowrap' }}>HOPE</span>
          </div>
          
          {/* Login Buttons */}
          <nav className="header-nav" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: 'auto' }}>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              padding: '8px 12px',
              transition: 'all 0.2s ease'
            }} onClick={() => navigate('/login')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderRadius = '6px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              Student Login
            </button>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              padding: '8px 12px',
              transition: 'all 0.2s ease'
            }} onClick={() => navigate('/tutor/login')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderRadius = '6px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              Tutor Login
            </button>
          </nav>
        </div>

        {/* Hero Content */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Side - Content */}
          <div style={{
            '@media (max-width: 768px)': {
              gridColumn: '1 / -1'
            }
          }}>
            <div className="hero-main-title" style={{ 
              fontSize: '52px', 
              fontWeight: '900',
              marginBottom: '15px',
              lineHeight: '1.2',
              textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 20px rgba(255,255,255,0.3)',
              color: '#FFFFFF'
            }}>
              HOPE Online Tuitions
            </div>
            <div className="hero-subtitle" style={{ 
              fontSize: '28px',
              color: '#FFFFFF',
              marginBottom: '25px',
              fontWeight: '600',
              textShadow: '2px 2px 6px rgba(0,0,0,0.6), 0 0 15px rgba(255,255,255,0.2)'
            }}>
              Saving Time, Inspiring Minds
            </div>
            <p className="hero-description" style={{ 
              fontSize: '17px',
              color: '#FFFFFF',
              marginBottom: '30px',
              lineHeight: '1.7',
              fontWeight: '400',
              textShadow: '1px 1px 4px rgba(0,0,0,0.7)'
            }}>
              <strong style={{ fontWeight: '700' }}>For School Students</strong> - Experience the power of Online ✓ Safe ✓ Structured learning. Classes from home mean no travel or daily commutes, fitting smoothly into your family routine.
            </p>
            
            {/* Features List */}
            <div style={{ display: 'grid', gap: '15px' }}>
              {[
                { emoji: '🏠', text: 'Save Time & Energy - No Travel Required' },
                { emoji: '📊', text: 'Track Academic Progress Regularly' },
                { emoji: '👨‍🏫', text: 'Personalized Attention in Small Classes' },
                { emoji: '📝', text: 'Assessments & Detailed Feedback' }
              ].map((item, idx) => (
                <div key={idx} className="feature-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', background: 'rgba(255,255,255,0.2)', padding: '12px 15px', borderRadius: '10px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <span className="feature-emoji" style={{ fontSize: '24px', flexShrink: 0 }}>{item.emoji}</span>
                  <span style={{ fontWeight: '600', color: '#FFFFFF', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Booking Form */}
          <div className="form-card" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideInRight 0.8s ease-out',
            width: '100%'
          }}>
            <h2 style={{ 
              fontSize: '26px', 
              fontWeight: 'bold', 
              marginBottom: '10px',
              color: '#1f2937'
            }}>
              Enroll Today – Empower Your Child!
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '25px', 
              fontSize: '15px',
              lineHeight: '1.5'
            }}>
              Start your child's journey with HOPE Online Tuitions
            </p>

            {/* Form Fields */}
            <form onSubmit={handleSchedule}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Name of your Child"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your Mobile Number"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1E3A8A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                className="form-button"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B35 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 53, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
                }}
              >
                Continue to Schedule
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Classes We Teach Section */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
        padding: '70px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '42px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            Classes We Teach
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '50px',
            maxWidth: '800px',
            margin: '0 auto 50px',
            lineHeight: '1.6'
          }}>
            We offer structured and personalized online tutoring tailored to different academic levels.
          </p>

          <div className="mobile-feature-cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {[
              { 
                level: 'Classes 6–7', 
                desc: 'Strong foundations and concept clarity',
                icon: '📚',
                color: '#3B82F6'
              },
              { 
                level: 'Classes 8–10', 
                desc: 'Board-focused learning with continuous support',
                icon: '🎯',
                color: '#F59E0B'
              },
              { 
                level: 'Classes 11–12', 
                desc: 'Advanced subjects and career preparation',
                icon: '🎓',
                color: '#10B981'
              }
            ].map((classInfo, idx) => (
              <div
                key={idx}
                className="mobile-feature-card"
                style={{
                  background: 'white',
                  padding: '35px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  border: `3px solid ${classInfo.color}`,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = `0 15px 30px ${classInfo.color}40`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: `${classInfo.color}15`,
                  borderRadius: '50%'
                }}></div>
                <div style={{ 
                  fontSize: '56px', 
                  marginBottom: '20px',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {classInfo.icon}
                </div>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  marginBottom: '15px', 
                  color: classInfo.color,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {classInfo.level}
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '16px', 
                  lineHeight: '1.7',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {classInfo.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{
        background: 'white',
        padding: '60px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px',
            color: '#1f2937'
          }}>
            Why Parents Choose HOPE
          </h2>
          <p style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#6b7280',
            marginBottom: '50px',
            maxWidth: '700px',
            margin: '0 auto 50px'
          }}>
            Trusted by families for quality online education
          </p>

          <div className="parent-features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { emoji: '⏱️', title: 'Save Time & Energy', desc: 'Classes from home mean no travel or daily commutes, fitting smoothly into your family routine' },
              { emoji: '📊', title: 'Track Academic Progress', desc: 'Regular updates on your child’s performance, strengths, and areas to improve – you’ll always stay informed' },
              { emoji: '🤝', title: 'Personalized Attention', desc: 'Small class sizes ensure every student is noticed, guided, and supported by expert teachers' },
              { emoji: '📝', title: 'Assessments & Feedback', desc: 'Periodic tests, detailed feedback, and progress reports keep parents in the loop' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="parent-feature-card"
                style={{
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  padding: '30px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  border: '1px solid #bfdbfe',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(59, 130, 246, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{feature.emoji}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Become a Tutor Section */}
      <div style={{
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
        padding: '80px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1E3A8A',
              marginBottom: '15px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>
              Become a Tutor – Teach, Earn & Grow
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#374151',
              lineHeight: '1.7',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              We are looking for passionate college students and graduates who are interested in teaching school students through online classes. Tutors are paid based on their teaching workload and performance.
            </p>
          </div>

          {/* Key Points Grid */}
          <div className="tutor-features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '25px',
            marginBottom: '50px'
          }}>
            {[
              { icon: '⏰', title: 'Flexible Teaching Hours', desc: 'Set your own schedule and teach at your convenience' },
              { icon: '🏠', title: 'Work From Home', desc: 'Teach from the comfort of your home, no commute needed' },
              { icon: '💰', title: 'Performance-Based Salary', desc: 'Earn based on classes taken and teaching quality' },
              { icon: '🤝', title: 'Academic Support', desc: 'Get guidance from our experienced academic team' }
            ].map((item, idx) => (
              <div key={idx} className="tutor-feature-card" style={{
                background: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#1E3A8A',
                  marginBottom: '10px'
                }}>{item.title}</h3>
                <p style={{
                  fontSize: '15px',
                  color: '#6B7280',
                  lineHeight: '1.6'
                }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Eligibility Section */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#1E3A8A',
              marginBottom: '25px',
              textAlign: 'center'
            }}>
              Eligibility Requirements
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {[
                { icon: '🎓', text: 'College students or graduates' },
                { icon: '📚', text: 'Strong subject knowledge' },
                { icon: '💬', text: 'Good communication skills' },
                { icon: '📡', text: 'Reliable internet connection' }
              ].map((req, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '15px',
                  background: '#F0F9FF',
                  borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '32px' }}>{req.icon}</span>
                  <span style={{
                    fontSize: '16px',
                    color: '#374151',
                    fontWeight: '500'
                  }}>{req.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/tutor/register')}
              style={{
                padding: '18px 48px',
                background: 'linear-gradient(135deg, #1E3A8A 0%, #111827 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(30, 58, 138, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(30, 58, 138, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 58, 138, 0.3)';
              }}
            >
              Apply as a Tutor →
            </button>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{
        background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
        padding: '60px 20px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '50px',
            color: '#1f2937'
          }}>
            How It Works
          </h2>

          <div className="how-it-works-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {[
              { num: '1', title: 'Sign Up', desc: 'Create your account as a student or tutor in minutes' },
              { num: '2', title: 'Browse & Connect', desc: 'Find tutors by subject, skills, and availability' },
              { num: '3', title: 'Attend Class', desc: 'Join live sessions via video call or offline meeting' },
              { num: '4', title: 'Track Progress', desc: 'Monitor improvement with detailed analytics' }
            ].map((step, idx) => (
              <div
                key={idx}
                className="how-it-works-card"
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #1E3A8A 0%, #111827 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0 auto 20px',
                  boxShadow: '0 4px 15px rgba(30, 58, 138, 0.3)'
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, #EA580C 0%, #DC2626 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            Enroll Today – Empower Your Child!
          </h2>
          <p style={{ fontSize: '20px', marginBottom: '30px', color: 'rgba(255, 255, 255, 0.95)', lineHeight: '1.6' }}>
            Join HOPE Online Tuitions and watch your child excel academically from the comfort of home.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                padding: '14px 32px',
                background: 'white',
                color: '#EF4444',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Enroll Now
            </button>
            <button
              onClick={() => navigate('/tutor/register')}
              style={{
                padding: '14px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Become a Tutor
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: '#111827',
        color: '#9ca3af',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            marginBottom: '30px',
            textAlign: 'left'
          }} className="footer-grid">
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px' }}>About HOPE</h4>
              <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
                <strong style={{ color: '#FFA500' }}>HOPE Online Tuitions</strong> - Guiding your child's progress from home, easily and effectively. We provide structured, safe, and personalized online education for school students.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px', fontWeight: 'bold' }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '8px' }}><button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textDecoration: 'none' }}>How It Works</button></li>
                <li style={{ marginBottom: '8px' }}><button onClick={() => {}} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textDecoration: 'none' }}>Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '15px', fontWeight: 'bold', fontSize: '18px' }}>Contact Us</h4>
              <p style={{ fontSize: '15px', marginBottom: '12px', color: '#FFA500', fontWeight: '500' }}>✉️ hopetuitionbygd@gmail.com</p>
              <p style={{ fontSize: '15px', color: '#FFA500', fontWeight: '500' }}>📞 +91-8807717477</p>
              <p style={{ fontSize: '13px', marginTop: '15px', color: '#9ca3af' }}>Available Mon-Sat: 9 AM - 8 PM</p>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid #374151',
            paddingTop: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <p>&copy; 2024-25 HOPE Online Tuitions. All rights reserved. | Saving Time, Inspiring Minds</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #1E3A8A !important;
          box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          /* Footer: Hide Quick Links and adjust to 2 columns (About & Contact) */
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
          }
          
          /* Hide Quick Links section on mobile */
          .footer-grid > div:nth-child(2) {
            display: none !important;
          }
          
          /* Adjust footer grid to center with 2 visible columns */
          .footer-grid {
            max-width: 600px !important;
            margin: 0 auto 30px auto !important;
          }
          
          /* Footer text alignment */
          .footer-grid > div {
            text-align: left !important;
          }
          
          /* Top Banner Mobile */
          div[style*="background: #DC2626"] {
            padding: 10px 10px !important;
            font-size: 12px !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          div[style*="background: #DC2626"] span {
            font-size: 13px !important;
            line-height: 1.4 !important;
          }
          
          div[style*="background: #DC2626"] button {
            font-size: 11px !important;
            padding: 4px 12px !important;
          }
          
          /* Header with Logo */
          div[style*="maxWidth: 1200px"] {
            margin: 0 auto 30px !important;
            padding: 15px 10px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 15px !important;
          }
          
          /* Logo section */
          div[style*="display: flex"][style*="gap: 15px"] {
            width: 100% !important;
            justify-content: center !important;
            margin-bottom: 10px !important;
          }
          
          /* Navigation */
          nav {
            width: 100% !important;
            justify-content: center !important;
            gap: 12px !important;
            flex-wrap: wrap !important;
          }
          
          nav button {
            font-size: 13px !important;
            padding: 8px 12px !important;
          }
          
          /* Hero Section Mobile */
          h1, h2 {
            font-size: 32px !important;
          }
          
          h3 {
            font-size: 20px !important;
          }
          
          /* Adjust padding for mobile */
          div[style*="padding: 60px"] {
            padding: 40px 15px !important;
          }
          
          div[style*="padding: 70px"] {
            padding: 50px 15px !important;
          }
          
          div[style*="padding: 40px 20px"] {
            padding: 30px 15px !important;
          }
          
          /* Stack grids to 2 columns on mobile */
          div[style*="gridTemplateColumns: repeat"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          /* Reduce font sizes */
          p {
            font-size: 14px !important;
          }
          
          /* Buttons */
          button {
            font-size: 14px !important;
            padding: 12px 20px !important;
          }
          
          /* Form card adjustments */
          div[style*="borderRadius: 16px"] {
            padding: 20px !important;
            margin: 0 10px !important;
          }
          
          /* Logo and header text */
          div[style*="fontSize: 52px"] {
            font-size: 36px !important;
          }
          
          div[style*="fontSize: 28px"] {
            font-size: 22px !important;
          }
          
          div[style*="fontSize: 17px"] {
            font-size: 15px !important;
          }
          
          /* Feature cards */
          div[style*="fontSize: 48px"] {
            font-size: 40px !important;
          }
          
          div[style*="fontSize: 56px"] {
            font-size: 48px !important;
          }
          
          /* CTA Section */
          div[style*="fontSize: 42px"] {
            font-size: 28px !important;
          }
          
          div[style*="fontSize: 40px"] {
            font-size: 30px !important;
          }
          
          div[style*="fontSize: 36px"] {
            font-size: 26px !important;
          }
          
          /* Footer text alignment */
          footer div[style*="textAlign: left"] {
            text-align: left !important;
          }
          
          footer h4 {
            font-size: 16px !important;
          }
          
          footer p {
            font-size: 13px !important;
          }
          
          /* Remove decorative circles on mobile */
          div[style*="position: absolute"][style*="borderRadius: 50%"] {
            display: none !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Extra small devices - single column for footer */
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 15px !important;
            max-width: 100% !important;
            margin: 0 0 30px 0 !important;
          }
          
          /* Ensure Quick Links remain hidden on small mobile */
          .footer-grid > div:nth-child(2) {
            display: none !important;
          }
          
          /* Extra small devices - single column for other grids */
          div[style*="gridTemplateColumns: repeat"] {
            grid-template-columns: 1fr !important;
          }
          
          /* Header centering for very small screens */
          div[style*="maxWidth: 1200px"] {
            margin: 0 auto 20px !important;
            padding: 12px 8px !important;
          }
          
          /* Logo smaller on very small screens */
          div[style*="display: flex"][style*="gap: 15px"] {
            gap: 8px !important;
          }
          
          /* Navigation stacked and centered */
          nav {
            width: 100% !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          nav button {
            font-size: 12px !important;
            padding: 8px 10px !important;
            width: 100% !important;
          }
          
          /* Top banner extra small */
          div[style*="background: #DC2626"] {
            padding: 8px 8px !important;
            font-size: 11px !important;
          }
          
          div[style*="background: #DC2626"] span {
            font-size: 12px !important;
          }
          
          div[style*="background: #DC2626"] button {
            font-size: 10px !important;
            padding: 3px 10px !important;
          }
          
          /* Footer extra small */
          footer h4 {
            font-size: 14px !important;
            margin-bottom: 10px !important;
          }
          
          footer p {
            font-size: 12px !important;
            margin-bottom: 8px !important;
          }
          
          footer ul {
            padding: 0 !important;
          }
          
          footer li {
            margin-bottom: 5px !important;
          }
          
          div[style*="fontSize: 52px"] {
            font-size: 28px !important;
          }
          
          div[style*="fontSize: 36px"] {
            font-size: 24px !important;
          }
          
          div[style*="fontSize: 28px"] {
            font-size: 20px !important;
          }
          
          /* Make top banner text smaller */
          div[style*="fontSize: 14px"] span {
            font-size: 12px !important;
          }
          
          /* Adjust feature list items */
          div[style*="fontSize: 16px"] {
            font-size: 14px !important;
          }
          
          /* Stack buttons vertically */
          div[style*="display: flex"][style*="gap: 15px"] {
            flex-direction: column !important;
            gap: 10px !important;
          }
          
          button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttractiveHomePage;
