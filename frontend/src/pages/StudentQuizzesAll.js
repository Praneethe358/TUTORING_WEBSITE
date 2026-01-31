import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Badge, EmptyState } from '../components/ModernComponents';

/**
 * STUDENT QUIZZES PAGE
 * View all quizzes across enrolled courses
 */
const StudentQuizzesAll = () => {
  useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [filter, setFilter] = useState('all'); // all, available, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/lms/student/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredQuizzes = () => {
    if (filter === 'all') return quizzes;
    if (filter === 'available') return quizzes.filter(q => q.canAttempt);
    if (filter === 'completed') return quizzes.filter(q => !q.canAttempt);
    return quizzes;
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-black">Loading quizzes...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  const filteredQuizzes = getFilteredQuizzes();

  return (
    <StudentDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Quizzes</h1>
          <p className="text-sm text-gray-500 mt-1">Take and review quizzes from your courses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{quizzes.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Quizzes</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {quizzes.filter(q => q.canAttempt).length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Available</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-purple-600">
              {quizzes.filter(q => q.attemptsCount > 0).length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Attempted</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {quizzes.filter(q => q.bestScore !== null).length > 0
                ? Math.round(
                    quizzes
                      .filter(q => q.bestScore !== null)
                      .reduce((sum, q) => sum + q.bestScore, 0) /
                    quizzes.filter(q => q.bestScore !== null).length
                  )
                : 0}
              %
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Avg Score</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto pb-px">
          {['all', 'available', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 sm:px-4 py-2 font-semibold border-b-2 transition whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                filter === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-black'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Quizzes List */}
        {filteredQuizzes.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredQuizzes.map(quiz => (
              <Card
                key={quiz._id}
                className="hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-black">
                        {quiz.title}
                      </h3>
                      {quiz.canAttempt ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="warning">All Attempts Used</Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mt-2">
                      📚 {quiz.courseName}
                    </p>

                    {quiz.description && (
                      <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                        {quiz.description.substring(0, 150)}...
                      </p>
                    )}

                    {/* Quiz Info */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm">
                      <span className="text-gray-600">
                        ❓ Questions: {quiz.questions?.length || 0}
                      </span>
                      {quiz.duration && (
                        <span className="text-gray-600">
                          ⏱️ Duration: {quiz.duration} mins
                        </span>
                      )}
                      {quiz.passingScore && (
                        <span className="text-gray-600">
                          ✓ Pass Score: {quiz.passingScore}%
                        </span>
                      )}
                      <span className="text-black">
                        🔄 Attempts: {quiz.attemptsCount}/{quiz.maxAttempts}
                      </span>
                    </div>

                    {/* Score Info */}
                    {quiz.attemptsCount > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-black">Last Score</p>
                            <p className="text-lg font-bold text-blue-600">
                              {quiz.lastAttemptScore}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-black">Best Score</p>
                            <p className="text-lg font-bold text-green-600">
                              {quiz.bestScore}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pass/Fail Status */}
                    {quiz.bestScore !== null && quiz.passingScore && (
                      <div className="mt-3">
                        {quiz.bestScore >= quiz.passingScore ? (
                          <Badge variant="success">Passed</Badge>
                        ) : (
                          <Badge variant="warning">Failed</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2">
                    {quiz.canAttempt && (
                      <Link
                        to={`/student/lms/quiz/${quiz._id}/attempt`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold text-center"
                      >
                        Take Quiz
                      </Link>
                    )}
                    {quiz.attemptsCount > 0 && (
                      <Link
                        to={`/student/lms/quiz/${quiz._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold text-center"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Quizzes"
            description={`You have no ${filter !== 'all' ? filter : ''} quizzes to show.`}
            icon="❓"
          />
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentQuizzesAll;
