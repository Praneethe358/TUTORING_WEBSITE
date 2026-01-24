import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';

/**
 * TUTOR CLASSES PAGE
 * Create and manage classes
 */
const TutorClasses = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    scheduledAt: '',
    duration: 60,
    topic: '',
    description: '',
    meetingPlatform: 'meet'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesRes, bookingsRes, coursesRes] = await Promise.all([
        api.get('/classes'),
        api.get('/tutor/bookings'), // Get bookings to extract students
        api.get('/tutor/courses') // Tutor's courses
      ]);
      
      setClasses(classesRes.data.data || []);
      
      // Extract unique students from bookings
      const bookings = bookingsRes.data.bookings || [];
      const uniqueStudents = [];
      const studentIds = new Set();
      bookings.forEach(booking => {
        if (booking.student && !studentIds.has(booking.student._id)) {
          studentIds.add(booking.student._id);
          uniqueStudents.push(booking.student);
        }
      });
      setStudents(uniqueStudents);
      
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createClass = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const tutorData = JSON.parse(localStorage.getItem('user'));
      
      await api.post('/classes', {
        tutorId: tutorData._id,
        studentId: form.studentId,
        courseId: form.courseId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: Number(form.duration),
        topic: form.topic,
        description: form.description,
        meetingPlatform: form.meetingPlatform
      });
      
      setMessage('Class created successfully! Google Meet link will be auto-generated if connected.');
      setForm({
        studentId: '',
        courseId: '',
        scheduledAt: '',
        duration: 60,
        topic: '',
        description: '',
        meetingPlatform: 'meet'
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  const cancelClass = async (classId) => {
    if (!window.confirm('Cancel this class?')) return;
    
    try {
      await api.delete(`/classes/${classId}`);
      setMessage('Class cancelled');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel class');
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Classes</h1>
          <p className="text-slate-400 mt-1">Schedule and manage your classes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
        >
          {showForm ? 'Cancel' : '+ Create Class'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-300">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-300">
          {error}
        </div>
      )}

      {/* Create Class Form */}
      {showForm && (
        <form onSubmit={createClass} className="mb-8 p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-white">Schedule New Class</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Student *</label>
              <select
                name="studentId"
                value={form.studentId}
                onChange={onChange}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select student</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Course</label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">Select course (optional)</option>
                {courses.filter(c => c.status === 'approved').map(course => (
                  <option key={course._id} value={course._id}>
                    {course.subject} ({course.durationMinutes} mins)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={onChange}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={onChange}
                required
                min="15"
                step="15"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Topic *</label>
            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={onChange}
              required
              placeholder="e.g., Introduction to Calculus"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows="3"
              placeholder="Additional notes or agenda"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-2">Meeting Platform</label>
            <select
              name="meetingPlatform"
              value={form.meetingPlatform}
              onChange={onChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="meet">Google Meet (auto-generated)</option>
              <option value="zoom">Zoom</option>
              <option value="teams">Microsoft Teams</option>
              <option value="other">Other</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Google Meet links are auto-created if you've connected your Google account
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Create Class
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Classes List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading classes...</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
          <p className="text-slate-400">No classes scheduled yet</p>
          <p className="text-sm text-slate-500 mt-2">Create your first class to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map(classItem => {
            const scheduledDate = new Date(classItem.scheduledAt);
            const isPast = scheduledDate < new Date();
            const isCancelled = classItem.status === 'cancelled';
            
            return (
              <div
                key={classItem._id}
                className={`bg-slate-800 rounded-xl p-6 border transition ${
                  isCancelled ? 'border-red-700 opacity-60' :
                  isPast ? 'border-slate-700 opacity-75' : 
                  'border-slate-700 hover:border-indigo-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {classItem.topic}
                      </h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        classItem.status === 'completed' ? 'bg-green-900 text-green-300' :
                        classItem.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                        classItem.status === 'in-progress' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-blue-900 text-blue-300'
                      }`}>
                        {classItem.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-400 mt-2">
                      Student: {classItem.student?.name} • {classItem.student?.email}
                    </p>
                    
                    {classItem.course && (
                      <p className="text-sm text-slate-400">
                        Course: {classItem.course.subject}
                      </p>
                    )}
                    
                    {classItem.description && (
                      <p className="text-sm text-slate-300 mt-2">{classItem.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-slate-400">
                        📅 {scheduledDate.toLocaleDateString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        🕐 {scheduledDate.toLocaleTimeString()}
                      </span>
                      <span className="text-sm text-slate-400">
                        ⏱️ {classItem.duration} mins
                      </span>
                      {classItem.meetingPlatform && (
                        <span className="text-sm text-slate-400">
                          📹 {classItem.meetingPlatform}
                        </span>
                      )}
                    </div>
                    
                    {classItem.meetingLink && (
                      <div className="mt-3">
                        <a
                          href={classItem.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                        >
                          🎥 Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {!isPast && classItem.status === 'scheduled' && (
                    <button
                      onClick={() => cancelClass(classItem._id)}
                      className="px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700 text-red-300 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TutorClasses;
