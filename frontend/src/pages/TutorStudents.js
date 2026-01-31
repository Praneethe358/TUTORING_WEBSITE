import React, { useState, useEffect } from 'react';
import api from '../lib/api';

/**
 * TUTOR STUDENTS PAGE
 * 
 * View all students who booked classes
 * - Student list with contact info
 * - Booking history per student
 * - Filter and search
 */
const TutorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get bookings and extract unique students
      const res = await api.get('/tutor/bookings');
      const bookings = res.data.bookings || [];
      
      // Group by student
      const studentMap = new Map();
      bookings.forEach(booking => {
        const student = booking.student;
        if (student && student._id) {
          if (!studentMap.has(student._id)) {
            studentMap.set(student._id, {
              ...student,
              classCount: 0,
              totalHours: 0
            });
          }
          const existing = studentMap.get(student._id);
          existing.classCount += 1;
          existing.totalHours += booking.course?.durationMinutes || 0;
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Students</h1>
        <p className="text-slate-400 mt-1">Students who booked your classes</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students by name or email..."
          className="w-full max-w-md px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Students Grid */}
      {loading ? (
        <p className="text-slate-400">Loading students...</p>
      ) : students.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <p className="text-slate-400">No students yet. Students will appear here after booking classes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div
              key={student._id}
              className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-indigo-500 transition"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                  {student.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                  <p className="text-sm text-slate-400">{student.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Classes:</span>
                  <span className="text-white font-semibold">{student.classCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Hours:</span>
                  <span className="text-white font-semibold">{(student.totalHours / 60).toFixed(1)}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorStudents;
