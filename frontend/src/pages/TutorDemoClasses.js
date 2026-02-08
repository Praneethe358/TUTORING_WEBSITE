import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { colors, borderRadius, shadows } from '../theme/designSystem';

const statusColors = {
  scheduled: { bg: '#DBEAFE', text: '#1E40AF', label: 'Scheduled' },
  completed: { bg: '#D1FAE5', text: '#065F46', label: 'Completed' }
};

const TutorDemoClasses = () => {
  const [demoClasses, setDemoClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null); // demoClass object or null
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDemoClasses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/tutor/demo-classes');
      setDemoClasses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching demo classes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemoClasses();
  }, [fetchDemoClasses]);

  const handleComplete = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/tutor/demo-classes/${feedbackModal._id}/complete`, { tutorFeedback: feedback });
      setFeedbackModal(null);
      setFeedback('');
      fetchDemoClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as complete');
    } finally {
      setSubmitting(false);
    }
  };

  const scheduled = demoClasses.filter(d => d.status === 'scheduled');
  const completed = demoClasses.filter(d => d.status === 'completed');

  const cardStyle = {
    background: 'white', borderRadius: borderRadius.lg, boxShadow: shadows.sm,
    padding: '20px', border: `1px solid ${colors.border}`, transition: 'box-shadow 0.2s'
  };

  return (
    <div style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: colors.textPrimary, margin: 0 }}>
          🎓 Demo Classes
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '4px', fontSize: '14px' }}>
          Your assigned demo classes — conduct them and provide feedback
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: colors.textSecondary }}>Loading...</div>
      ) : demoClasses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px',
          background: 'white', borderRadius: borderRadius.lg, boxShadow: shadows.sm
        }}>
          <span style={{ fontSize: '48px' }}>📭</span>
          <p style={{ color: colors.textSecondary, marginTop: '12px' }}>No demo classes assigned to you yet</p>
        </div>
      ) : (
        <>
          {/* Scheduled Section */}
          {scheduled.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1E40AF', marginBottom: '14px' }}>
                📅 Upcoming ({scheduled.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {scheduled.map(demo => (
                  <div key={demo._id} style={{ ...cardStyle, borderLeft: '4px solid #3B82F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: '600', margin: 0, color: colors.textPrimary }}>
                          {demo.studentName}
                        </h3>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>
                          {demo.classGrade} • {demo.subjects}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: statusColors.scheduled.bg, color: statusColors.scheduled.text
                      }}>Scheduled</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px', fontSize: '13px', color: colors.textSecondary }}>
                      {demo.scheduledDate && (
                        <span>📅 {new Date(demo.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      {demo.scheduledTime && <span>🕐 {demo.scheduledTime}</span>}
                      <span>⏰ {demo.preferredTimeSlot}</span>
                    </div>

                    <div style={{
                      background: '#F9FAFB', borderRadius: '8px', padding: '10px 12px',
                      fontSize: '13px', marginBottom: '14px'
                    }}>
                      <div>📞 {demo.contactPhone}</div>
                      {demo.contactEmail && <div style={{ marginTop: '2px' }}>✉️ {demo.contactEmail}</div>}
                      {demo.whatsapp && <div style={{ marginTop: '2px' }}>💬 {demo.whatsapp}</div>}
                    </div>

                    <button
                      onClick={() => { setFeedbackModal(demo); setFeedback(''); }}
                      style={{
                        width: '100%', padding: '10px', border: 'none', borderRadius: '8px',
                        background: '#059669', color: 'white', fontWeight: '600',
                        fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#047857'}
                      onMouseOut={(e) => e.target.style.background = '#059669'}
                    >
                      ✅ Mark as Completed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completed.length > 0 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#065F46', marginBottom: '14px' }}>
                ✅ Completed ({completed.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {completed.map(demo => (
                  <div key={demo._id} style={{ ...cardStyle, borderLeft: '4px solid #10B981', opacity: 0.85 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ fontSize: '17px', fontWeight: '600', margin: 0, color: colors.textPrimary }}>
                          {demo.studentName}
                        </h3>
                        <p style={{ fontSize: '13px', color: colors.textSecondary, margin: '2px 0 0' }}>
                          {demo.classGrade} • {demo.subjects}
                        </p>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: statusColors.completed.bg, color: statusColors.completed.text
                      }}>Completed</span>
                    </div>
                    {demo.demoCompletedAt && (
                      <p style={{ fontSize: '12px', color: colors.textSecondary, margin: '0 0 8px' }}>
                        Completed: {new Date(demo.demoCompletedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {demo.tutorFeedback && (
                      <div style={{
                        background: '#F0FDF4', borderRadius: '8px', padding: '10px 12px',
                        fontSize: '13px', color: '#065F46', borderLeft: '3px solid #10B981'
                      }}>
                        <strong>Your Feedback:</strong> {demo.tutorFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Complete Demo Modal */}
      {feedbackModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setFeedbackModal(null)}>
          <div style={{
            background: 'white', borderRadius: borderRadius.lg, padding: '28px',
            width: '90%', maxWidth: '480px', boxShadow: shadows.xl
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px', color: colors.textPrimary }}>
              ✅ Complete Demo Class
            </h2>
            <p style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '20px' }}>
              {feedbackModal.studentName} — {feedbackModal.classGrade}
            </p>

            <form onSubmit={handleComplete}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.textSecondary, marginBottom: '6px' }}>
                  Feedback (how did the demo go?)
                </label>
                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Share how the demo class went — student's engagement level, areas of interest, suggestions for improvement..."
                  style={{
                    width: '100%', padding: '12px', border: `1px solid ${colors.border}`,
                    borderRadius: borderRadius.md, fontSize: '14px', boxSizing: 'border-box',
                    resize: 'vertical', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setFeedbackModal(null)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'white', cursor: 'pointer', fontWeight: '500' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  style={{
                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                    background: '#059669', color: 'white', cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600', opacity: submitting ? 0.7 : 1
                  }}>
                  {submitting ? 'Saving...' : '✅ Mark Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDemoClasses;
