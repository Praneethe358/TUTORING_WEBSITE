import React, { useEffect, useState } from 'react';
import AdminDashboardLayout from '../components/AdminDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Button, Badge, EmptyState } from '../components/ModernComponents';

/**
 * ADMIN LMS GRADES PAGE
 * Track all student grades across courses
 */
const AdminLmsGrades = () => {
  useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (studentId) => {
    setSelectedStudent(studentId);
    try {
      const res = await api.get(`/lms/admin/students/${studentId}/grades`);
      if (res.data.success) {
        setStudentGrades(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch student grades:', error);
    }
  };

  const getPerformanceColor = (progress) => {
    if (progress >= 90) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExportGrades = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/lms/admin/export/grades', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'lms-grades.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Failed to export grades:', error);
      alert('Failed to export grades');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading grades...</p>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8">
        {/* Students List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 mb-3">
              <h2 className="text-base sm:text-lg font-bold text-white">Students</h2>
              <Button
                onClick={handleExportGrades}
                disabled={exportLoading}
                className="bg-green-600 text-white hover:bg-green-500 text-xs sm:text-sm min-h-[44px] sm:min-h-[auto] w-full sm:w-auto"
              >
                {exportLoading ? '⏳ Exporting...' : '📥 Export'}
              </Button>
            </div>

            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 min-h-[44px] sm:min-h-[auto] border border-gray-300 rounded-lg mb-3 text-sm"
            />

            <div className="space-y-2 max-h-screen overflow-y-auto">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <button
                    key={student._id}
                    onClick={() => handleSelectStudent(student._id)}
                    className={`w-full text-left px-3 py-2.5 sm:py-2 min-h-[44px] rounded-lg transition ${
                      selectedStudent === student._id
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-600 truncate">{student.email}</p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">No students found</p>
              )}
            </div>
          </Card>
        </div>

        {/* Grades Detail */}
        <div className="lg:col-span-2">
          {studentGrades ? (
            <div className="space-y-6">
              {/* Student Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">Student</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{studentGrades.student.name}</p>
                  <p className="text-sm sm:text-base text-gray-600">{studentGrades.student.email}</p>
                </div>
              </Card>

              {/* Course Grades */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h3>

                {studentGrades.grades.length > 0 ? (
                  <div className="space-y-4">
                    {studentGrades.grades.map(grade => (
                      <Card key={grade.courseId}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-gray-900">{grade.courseName}</h4>
                            <p className="text-xs text-gray-600">{grade.courseCategory}</p>
                          </div>
                          <Badge
                            variant={grade.status === 'completed' ? 'success' : 'info'}
                          >
                            {grade.status}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className={`text-sm font-bold ${getPerformanceColor(grade.progress)}`}>
                              {grade.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${grade.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Quizzes */}
                        <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-600">Quiz Attempts</p>
                            <p className="text-lg font-bold text-purple-600">{grade.quizzes.attempted}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Avg Score</p>
                            <p className="text-lg font-bold text-blue-600">{grade.quizzes.avgScore}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Best Score</p>
                            <p className="text-lg font-bold text-green-600">{grade.quizzes.bestScore}%</p>
                          </div>
                        </div>

                        {/* Assignments */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-xs text-gray-600">Submitted</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {grade.assignments.submitted}/{grade.assignments.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Avg Score</p>
                            <p className="text-lg font-bold text-blue-600">{grade.assignments.avgScore}%</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="flex gap-4 mt-3 text-xs text-gray-600 pt-3 border-t">
                          <span>📅 Enrolled: {new Date(grade.enrolledAt).toLocaleDateString()}</span>
                          {grade.completionTime && (
                            <span>⏱️ Time: {grade.completionTime}h</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Grades"
                    description="This student is not enrolled in any courses yet."
                    icon="📊"
                  />
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Select a Student"
              description="Choose a student from the list to view their grades and performance."
              icon="👤"
            />
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminLmsGrades;
