import React, { useEffect, useState } from 'react';
import api from '../lib/api';

/**
 * TUTOR MARK ATTENDANCE PAGE
 * Mark attendance for completed classes
 */
const TutorMarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    status: 'present',
    notes: '',
    participationRating: 5,
    attentiveness: 5,
    understanding: 5,
    preparation: 5
  });

  useEffect(() => {
    loadCompletedClasses();
  }, []);

  const loadCompletedClasses = async () => {
    try {
      setLoading(true);
      // Get completed classes
      const res = await api.get('/classes?status=completed&limit=50');
      setClasses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const openMarkAttendance = (classItem) => {
    setSelectedClass(classItem);
    setForm({
      status: 'present',
      notes: '',
      participationRating: 5,
      attentiveness: 5,
      understanding: 5,
      preparation: 5
    });
    setShowModal(true);
    setError('');
    setMessage('');
  };

  const onChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const submitAttendance = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      await api.post('/attendance', {
        classId: selectedClass._id,
        studentId: selectedClass.student._id,
        status: form.status,
        notes: form.notes,
        participationRating: parseInt(form.participationRating),
        attentiveness: parseInt(form.attentiveness),
        understanding: parseInt(form.understanding),
        preparation: parseInt(form.preparation),
        isVerified: true
      });
      
      setMessage('Attendance marked successfully');
      setShowModal(false);
      loadCompletedClasses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  const RatingInput = ({ label, name, value }) => (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          name={name}
          value={value}
          onChange={onChange}
          min="1"
          max="5"
          className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-white font-semibold w-8 text-center">{value}</span>
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Mark Attendance</h1>
        <p className="text-slate-400 mt-1">Record attendance for completed classes</p>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-300">
          {message}
        </div>
      )}
      
      {error && !showModal && (
        <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400">No completed classes found</p>
          <p className="text-sm text-slate-500 mt-2">Complete classes will appear here for attendance marking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map(classItem => (
            <div
              key={classItem._id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {classItem.topic}
                  </h3>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">
                      Student: {classItem.student?.name} • {classItem.student?.email}
                    </p>
                    {classItem.course && (
                      <p className="text-sm text-slate-400">
                        Course: {classItem.course.subject}
                      </p>
                    )}
                    <p className="text-sm text-slate-400">
                      Date: {new Date(classItem.scheduledAt).toLocaleString()} • Duration: {classItem.duration}min
                    </p>
                  </div>

                  {classItem.description && (
                    <p className="text-sm text-slate-300 mt-2">
                      {classItem.description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => openMarkAttendance(classItem)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                >
                  Mark Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Modal */}
      {showModal && selectedClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Mark Attendance</h2>
              
              <div className="mb-4 p-4 rounded-lg bg-slate-900 border border-slate-700">
                <p className="text-sm text-slate-400">Class: <span className="text-white">{selectedClass.topic}</span></p>
                <p className="text-sm text-slate-400 mt-1">Student: <span className="text-white">{selectedClass.student.name}</span></p>
                <p className="text-sm text-slate-400 mt-1">Date: <span className="text-white">{new Date(selectedClass.scheduledAt).toLocaleString()}</span></p>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={submitAttendance} className="space-y-6">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Attendance Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused Absence</option>
                  </select>
                </div>

                {form.status === 'present' && (
                  <>
                    <RatingInput
                      label="Participation Rating"
                      name="participationRating"
                      value={form.participationRating}
                    />

                    <RatingInput
                      label="Attentiveness"
                      name="attentiveness"
                      value={form.attentiveness}
                    />

                    <RatingInput
                      label="Understanding"
                      name="understanding"
                      value={form.understanding}
                    />

                    <RatingInput
                      label="Preparation"
                      name="preparation"
                      value={form.preparation}
                    />
                  </>
                )}

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={onChange}
                    rows="3"
                    placeholder="Additional notes about the class..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                  >
                    Submit Attendance
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorMarkAttendance;
