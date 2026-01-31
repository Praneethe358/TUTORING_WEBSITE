import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import FormInput from '../components/FormInput';

const TutorRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', qualifications: '', subjects: '', experienceYears: '', cv: null });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cvFileName, setCvFileName] = useState('');

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCVChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file must be less than 5MB');
        return;
      }
      // Validate file type
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        setError('CV must be PDF or Word document');
        return;
      }
      setForm({ ...form, cv: file });
      setCvFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (!form.cv) return setError('CV is required');
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('qualifications', form.qualifications);
      formData.append('subjects', JSON.stringify(form.subjects.split(',').map(s => s.trim()).filter(Boolean)));
      formData.append('experienceYears', Number(form.experienceYears));
      formData.append('cv', form.cv);

      await api.post('/tutor/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Registered. Await admin approval to login.');
      setTimeout(() => navigate('/tutor/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">Tutor Sign Up</h1>
      {message && <div className="mb-4 text-sm text-emerald-400">{message}</div>}
      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
      <FormInput label="Full Name" name="name" value={form.name} onChange={onChange} required placeholder="Jane Doe" />
      <FormInput label="Email" name="email" type="email" value={form.email} onChange={onChange} required placeholder="tutor@example.com" />
      <FormInput label="Phone" name="phone" value={form.phone} onChange={onChange} required placeholder="1234567890" />
      <FormInput label="Qualifications" name="qualifications" value={form.qualifications} onChange={onChange} required placeholder="M.Sc. Mathematics" />
      <FormInput label="Subjects (comma separated)" name="subjects" value={form.subjects} onChange={onChange} required placeholder="Math, Physics" />
      <FormInput label="Years of Experience" name="experienceYears" type="number" value={form.experienceYears} onChange={onChange} required placeholder="3" />
      
      {/* CV Upload - Professional Design */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CV (PDF or Word) *
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleCVChange}
            required
            className="hidden"
            id="cv-input"
          />
          <label
            htmlFor="cv-input"
            style={{
              display: 'block',
              padding: '2rem',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              border: '2px dashed #667eea',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea25 0%, #764ba225 100%)';
              e.currentTarget.style.borderColor = '#5a67d8';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {/* Icon */}
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              
              {/* Text */}
              <div>
                {cvFileName ? (
                  <>
                    <p style={{
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      color: '#10b981',
                      marginBottom: '0.25rem'
                    }}>
                      ✓ {cvFileName}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280'
                    }}>
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }}>
                      PDF, DOC, or DOCX (Max 5MB)
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af'
                    }}>
                      Your professional CV or resume
                    </p>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>
      </div>

      <FormInput label="Password" name="password" type="password" value={form.password} onChange={onChange} required placeholder="••••••••" />
      <FormInput label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={onChange} required placeholder="••••••••" />
      <button type="submit" disabled={loading} className="w-full py-3 mt-2 rounded-lg bg-black hover:bg-gray-900 text-white font-semibold transition disabled:opacity-60">
        {loading ? 'Submitting...' : 'Register'}
      </button>
      <p className="text-sm text-gray-600 mt-4 text-center">
        Already approved? <Link className="text-blue-600 hover:text-blue-700" to="/tutor/login">Log in</Link>
      </p>
    </form>
  );
};

export default TutorRegister;
