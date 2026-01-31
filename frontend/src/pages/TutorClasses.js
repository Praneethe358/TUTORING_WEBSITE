import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * TUTOR CLASSES PAGE
 * Create and manage classes
 */
const TutorClasses = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    studentIds: [],
    courseId: '',
    scheduledAt: '',
    duration: 60,
    topic: '',
    description: '',
    meetingPlatform: 'meet',
    meetingLink: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch core data
      let classesRes, coursesRes, allStudentsRes;
      
      try {
        classesRes = await api.get('/classes');
      } catch (err) {
        console.error('Error fetching classes:', err);
        classesRes = { data: { data: [] } };
      }
      
      try {
        allStudentsRes = await api.get('/tutor/all-students');
      } catch (err) {
        console.warn('Could not fetch all students:', err.message);
        allStudentsRes = { data: { students: [] } };
      }
      
      try {
        coursesRes = await api.get('/tutor/courses');
      } catch (err) {
        console.warn('Could not fetch courses:', err.message);
        coursesRes = { data: { courses: [] } };
      }
      
      setClasses(classesRes.data?.data || []);
      
      // Get all registered students
      const allStudents = allStudentsRes.data?.students || [];
      console.log('All students:', allStudents);
      setStudents(allStudents);
      setCourses(coursesRes.data?.courses || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => {
    const { name, value, type, options } = e.target;
    if (type === 'select-multiple') {
      const selectedIds = Array.from(options)
        .filter(option => option.selected)
        .map(option => option.value);
      setForm({ ...form, [name]: selectedIds });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const createClass = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    // Validate students selected
    if (!form.studentIds || form.studentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }
    
    // Validate required fields
    if (!form.scheduledAt || !form.topic) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // Validate user is logged in
      if (!user || !user._id) {
        setError('User not logged in. Please refresh the page.');
        return;
      }
      
      await api.post('/classes', {
        tutorId: user._id,
        studentIds: form.studentIds,
        courseId: form.courseId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        duration: Number(form.duration),
        topic: form.topic,
        description: form.description,
        meetingPlatform: form.meetingPlatform,
        meetingLink: form.meetingLink
      });
      
      setMessage('Class created successfully!');
      setForm({
        studentIds: [],
        courseId: '',
        scheduledAt: '',
        duration: 60,
        topic: '',
        description: '',
        meetingPlatform: 'meet',
        meetingLink: ''
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error('Class creation error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create class';
      setError(errorMessage);
    }
  };

  const deleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await api.delete(`/classes/${classId}`);
      setMessage('Class deleted successfully');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete class');
    }
  };

  const editClass = (classItem) => {
    // Populate form with class data for editing
    setForm({
      studentIds: classItem.students?.map(s => s._id || s) || [],
      courseId: classItem.course?._id || '',
      scheduledAt: new Date(classItem.scheduledAt).toISOString().slice(0, 16),
      duration: classItem.duration,
      topic: classItem.topic,
      description: classItem.description || '',
      meetingPlatform: classItem.meetingPlatform || 'meet',
      meetingLink: classItem.meetingLink || ''
    });
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Classes</h1>
          <p className="text-slate-400 mt-1">Schedule and manage your classes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/50 transition"
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
        <form onSubmit={createClass} className="mb-8 p-6 rounded-xl bg-slate-800 border border-slate-700 space-y-5">
          <h2 className="text-2xl font-semibold text-white">Schedule New Class</h2>
          
          {/* Students Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Students * (Select multiple)</label>
            <select
              name="studentIds"
              value={form.studentIds}
              onChange={onChange}
              multiple
              required
              size="5"
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            >
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple students</p>
            
            {/* Selected Students Display */}
            {form.studentIds && form.studentIds.length > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-indigo-900/20 border border-indigo-700/50">
                <p className="text-xs text-indigo-300 mb-2 font-medium">Selected ({form.studentIds.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {form.studentIds.map(studentId => {
                    const student = students.find(s => s._id === studentId);
                    return student ? (
                      <span
                        key={studentId}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 text-indigo-100 text-xs font-medium"
                      >
                        {student.name}
                        <button
                          type="button"
                          onClick={() => setForm({
                            ...form,
                            studentIds: form.studentIds.filter(id => id !== studentId)
                          })}
                          className="ml-1 hover:text-red-200 transition"
                        >
                          ✕
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Course</label>
            <select
              name="courseId"
              value={form.courseId}
              onChange={onChange}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            >
              <option value="">Select course (optional)</option>
              {courses.filter(c => c.status === 'approved').map(course => (
                <option key={course._id} value={course._id}>
                  {course.subject} ({course.durationMinutes} mins)
                </option>
              ))}
            </select>
          </div>

          {/* Date/Time and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={form.scheduledAt}
                onChange={onChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={onChange}
                required
                min="15"
                step="15"
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Topic *</label>
            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={onChange}
              required
              placeholder="e.g., Introduction to Calculus"
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows="3"
              placeholder="Additional notes or agenda"
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
            />
          </div>

          {/* Meeting Platform and Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Meeting Platform</label>
              <select
                name="meetingPlatform"
                value={form.meetingPlatform}
                onChange={onChange}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              >
                <option value="meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="teams">Microsoft Teams</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Meeting Link</label>
              <input
                type="url"
                name="meetingLink"
                value={form.meetingLink}
                onChange={onChange}
                placeholder="e.g., https://meet.google.com/abc-defg-hij"
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 -mt-3">
            Enter the meeting link you created. Students will use this to join the class.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold shadow-lg shadow-indigo-500/50 transition"
            >
              Create Class
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition"
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
                      Students: {classItem.students && classItem.students.length > 0 
                        ? classItem.students.map(s => s.name || s).join(', ')
                        : (classItem.student?.name || 'N/A')}
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
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/30 transition"
                        >
                          🎥 Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {!isPast && classItem.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => editClass(classItem)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/30 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClass(classItem._id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TutorClasses;
