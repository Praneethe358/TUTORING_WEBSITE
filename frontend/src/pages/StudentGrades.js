import React, { useEffect, useState } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

const StudentGrades = () => {
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    gradedAssignments: 0,
    averageScore: 0,
    totalQuizzes: 0,
    averageQuizScore: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, assignments, quizzes

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);

      // Get all enrolled courses
      const enrollmentsRes = await api.get('/lms/enrollments/student');
      const enrollments = enrollmentsRes.data.data || [];

      const allGrades = [];

      // Fetch assignments and quizzes for each course
      for (const enrollment of enrollments) {
        const courseId = enrollment.courseId._id;
        const courseName = enrollment.courseId.title;

        // Fetch assignments
        try {
          const assignmentsRes = await api.get(`/lms/courses/${courseId}/assignments`);
          const assignments = assignmentsRes.data.data || [];

          assignments
            .filter(a => a.submission?.status === 'graded')
            .forEach(a => {
              allGrades.push({
                type: 'assignment',
                courseName,
                title: a.title,
                score: a.submission.score,
                maxScore: a.maxScore,
                percentage: Math.round((a.submission.score / a.maxScore) * 100),
                feedback: a.submission.feedback,
                date: a.submission.gradedAt,
                passed: a.submission.score >= (a.maxScore * 0.6)
              });
            });
        } catch (err) {
          console.error('Failed to fetch assignments:', err);
        }

        // Fetch quizzes
        try {
          const quizzesRes = await api.get(`/lms/courses/${courseId}/quizzes`);
          const quizzes = quizzesRes.data.data || [];

          for (const quiz of quizzes) {
            try {
              const attemptsRes = await api.get(`/lms/quizzes/${quiz._id}/attempts`);
              const attempts = attemptsRes.data.data || [];

              if (attempts.length > 0) {
                const bestAttempt = attempts.reduce((best, current) => 
                  current.percentage > best.percentage ? current : best
                );

                allGrades.push({
                  type: 'quiz',
                  courseName,
                  title: quiz.title,
                  score: bestAttempt.score,
                  maxScore: bestAttempt.totalPoints,
                  percentage: bestAttempt.percentage,
                  attempts: attempts.length,
                  date: bestAttempt.createdAt,
                  passed: bestAttempt.passed
                });
              }
            } catch (err) {
              console.error('Failed to fetch quiz attempts:', err);
            }
          }
        } catch (err) {
          console.error('Failed to fetch quizzes:', err);
        }
      }

      // Calculate stats
      const assignments = allGrades.filter(g => g.type === 'assignment');
      const quizzes = allGrades.filter(g => g.type === 'quiz');

      const avgAssignmentScore = assignments.length > 0
        ? Math.round(assignments.reduce((sum, a) => sum + a.percentage, 0) / assignments.length)
        : 0;

      const avgQuizScore = quizzes.length > 0
        ? Math.round(quizzes.reduce((sum, q) => sum + q.percentage, 0) / quizzes.length)
        : 0;

      const passRate = allGrades.length > 0
        ? Math.round((allGrades.filter(g => g.passed).length / allGrades.length) * 100)
        : 0;

      setStats({
        totalAssignments: assignments.length,
        gradedAssignments: assignments.length,
        averageScore: avgAssignmentScore,
        totalQuizzes: quizzes.length,
        averageQuizScore: avgQuizScore,
        passRate
      });

      setGrades(allGrades.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'assignments') return g.type === 'assignment';
    if (filter === 'quizzes') return g.type === 'quiz';
    return true;
  });

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">My Grades</h1>
        <p className="text-sm text-black mt-1">View your performance across all courses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500">
          <p className="text-white text-sm font-medium">Assignments</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats.gradedAssignments}</h3>
          <p className="text-white text-sm mt-1">Avg: {stats.averageScore}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 border border-purple-500">
          <p className="text-white text-sm font-medium">Quizzes</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats.totalQuizzes}</h3>
          <p className="text-white text-sm mt-1">Avg: {stats.averageQuizScore}%</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 border border-green-500">
          <p className="text-white text-sm font-medium">Pass Rate</p>
          <h3 className="text-3xl font-bold text-white mt-1">{stats.passRate}%</h3>
          <p className="text-white text-sm mt-1">Overall</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 border border-indigo-500">
          <p className="text-white text-sm font-medium">Overall GPA</p>
          <h3 className="text-3xl font-bold text-white mt-1">
            {((stats.averageScore + stats.averageQuizScore) / 20).toFixed(1)}
          </h3>
          <p className="text-white text-sm mt-1">Out of 10.0</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'assignments', label: 'Assignments' },
          { key: 'quizzes', label: 'Quizzes' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grades List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : filteredGrades.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <p className="text-black">No grades available yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGrades.map((grade, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      grade.type === 'assignment' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {grade.type === 'assignment' ? 'Assignment' : 'Quiz'}
                    </span>
                    <h3 className="text-xl font-semibold text-black">{grade.title}</h3>
                  </div>

                  <p className="text-sm text-black mb-3">{grade.courseName}</p>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-black">Score</p>
                      <p className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                        {grade.score}/{grade.maxScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-black">Percentage</p>
                      <p className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                        {grade.percentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-black">Grade</p>
                      <p className={`text-2xl font-bold ${getGradeColor(grade.percentage)}`}>
                        {getGradeLetter(grade.percentage)}
                      </p>
                    </div>
                    {grade.type === 'quiz' && (
                      <div>
                        <p className="text-sm text-black">Attempts</p>
                        <p className="text-2xl font-bold text-black">{grade.attempts}</p>
                      </div>
                    )}
                  </div>

                  {grade.feedback && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-black">Instructor Feedback:</p>
                      <p className="text-sm text-black mt-1">{grade.feedback}</p>
                    </div>
                  )}

                  <p className="text-xs text-black mt-3">
                    Graded on: {new Date(grade.date).toLocaleDateString()}
                  </p>
                </div>

                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                  grade.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {grade.passed ? '✓' : '✗'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default StudentGrades;
