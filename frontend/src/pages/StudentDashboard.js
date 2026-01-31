import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, StatCard, Badge, Button, EmptyState } from '../components/ModernComponents';

/**
 * MODERN STUDENT DASHBOARD
 * Clean, professional design with key metrics and upcoming classes
 */
const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalClasses: 0,
    upcomingClasses: 0,
    completedClasses: 0,
    thisMonthClasses: 0,
    totalHours: 0,
    pendingAssignments: 0,
    upcomingQuizzes: 0,
    averageGrade: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [location]);

  const fetchDashboardData = async () => {
    try {
      // Fetch classes
      const classesRes = await api.get('/classes');
      const classes = classesRes.data.data || [];

      const now = new Date();
      const upcoming = classes.filter(c => new Date(c.scheduledAt) > now && c.status === 'scheduled');
      const completed = classes.filter(c => c.status === 'completed');
      const thisMonth = classes.filter(c => {
        const classDate = new Date(c.scheduledAt);
        return classDate.getMonth() === now.getMonth() && classDate.getFullYear() === now.getFullYear();
      });

      // Fetch assignments
      const enrollmentsRes = await api.get('/lms/enrollments/student');
      const enrollments = enrollmentsRes.data.data || [];
      
      let allAssignments = [];
      let allQuizzes = [];
      let quizScores = [];
      
      for (const enrollment of enrollments) {
        try {
          // Fetch assignments
          const assignRes = await api.get(`/lms/courses/${enrollment.courseId._id}/assignments`);
          const assignments = (assignRes.data.data || []).map(a => ({
            ...a,
            courseName: enrollment.courseId.title
          }));
          allAssignments.push(...assignments);
          
          // Fetch quizzes
          const quizRes = await api.get(`/lms/courses/${enrollment.courseId._id}/quizzes`);
          const quizzes = (quizRes.data.data || []).map(q => ({
            ...q,
            courseName: enrollment.courseId.title
          }));
          allQuizzes.push(...quizzes);

          // Collect quiz scores
          quizzes.forEach(quiz => {
            if (quiz.bestScore !== null && quiz.bestScore !== undefined) {
              quizScores.push(quiz.bestScore);
            }
          });
        } catch (err) {
          console.error('Failed to fetch course data:', err);
        }
      }

      const pendingAssignments = allAssignments.filter(a => !a.submission);
      const upcomingQuizzes = allQuizzes.filter(q => !q.attempted && new Date(q.deadline) > now);

      // Calculate average grade from quiz scores
      let avgGrade = 0;
      if (quizScores.length > 0) {
        avgGrade = Math.round(
          quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
        );
      }

      setStats({
        totalClasses: classes.length,
        upcomingClasses: upcoming.length,
        completedClasses: completed.length,
        thisMonthClasses: thisMonth.length,
        totalHours: classes.reduce((sum, c) => sum + (c.duration || 0), 0) / 60,
        pendingAssignments: pendingAssignments.length,
        upcomingQuizzes: upcomingQuizzes.length,
        averageGrade: avgGrade
      });

      setUpcomingBookings(upcoming.slice(0, 3));
      setRecentAssignments(allAssignments.slice(0, 3));
      setUpcomingQuizzes(upcomingQuizzes.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudentDashboardLayout>
      {/* Header with Welcome Message */}
      <div className="student-dashboard-header mb-6 md:mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                alt={user.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-indigo-100 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                <span className="text-2xl md:text-3xl font-bold text-white">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 leading-relaxed">
              Track your progress and stay on top of your learning journey
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="student-stats-grid grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mb-4 md:mb-8">
        <StatCard
          icon="📚"
          label="Total Classes"
          value={stats.totalClasses}
          change={`+${stats.thisMonthClasses} this month`}
          trend="up"
        />
        <StatCard
          icon="📝"
          label="Pending Tasks"
          value={stats.pendingAssignments}
          change={stats.pendingAssignments > 0 ? "Action needed" : "All done!"}
          trend={stats.pendingAssignments > 0 ? "down" : "up"}
        />
        <StatCard
          icon="📋"
          label="Quizzes Due"
          value={stats.upcomingQuizzes}
          change={stats.upcomingQuizzes > 0 ? "Complete soon" : "No quizzes"}
          trend="neutral"
        />
        <StatCard
          icon="🎯"
          label="Avg Grade"
          value={`${stats.averageGrade}%`}
          change="Keep it up!"
          trend="up"
        />
      </div>

      <div className="student-main-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Classes */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">
                📅 Upcoming Sessions
              </h2>
              <Link to="/student/classes">
                <Badge variant="primary" className="cursor-pointer hover:bg-indigo-700">
                  View All
                </Badge>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No upcoming classes"
                description="You have no classes scheduled yet"
              />
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map(booking => (
                  <div
                    key={booking._id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                        {booking.course?.subject === 'Math' ? '🔢' : booking.course?.subject === 'English' ? '📖' : '📚'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">
                          {booking.course?.subject || 'Class'}
                        </h3>
                        <p className="text-sm text-black">
                          with {booking.tutor?.name}
                        </p>
                        <p className="text-sm text-black mt-1">
                          {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="ml-2">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Assignments */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">
                📝 Recent Assignments
              </h2>
              <Link to="/student/assignments">
                <Badge variant="primary" className="cursor-pointer hover:bg-indigo-700">
                  View All
                </Badge>
              </Link>
            </div>

            {recentAssignments.length === 0 ? (
              <EmptyState
                icon="📭"
                title="No assignments"
                description="You have no assignments yet"
              />
            ) : (
              <div className="space-y-3">
                {recentAssignments.map(assignment => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <h3 className="font-medium text-black">{assignment.title}</h3>
                      <p className="text-sm text-black">{assignment.courseName}</p>
                      <p className="text-xs text-black mt-1">
                        Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    {assignment.submission ? (
                      <Badge variant="success">Submitted</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-black mb-4">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <Link to="/student/tutors-availability">
                <Button variant="outline" className="w-full">
                  👨‍🏫 Browse Tutors
                </Button>
              </Link>
              <Link to="/student/booking">
                <Button variant="outline" className="w-full">
                  📅 Book Session
                </Button>
              </Link>
              <Link to="/student/messages">
                <Button variant="outline" className="w-full">
                  💬 Messages
                </Button>
              </Link>
              <Link to="/student/materials">
                <Button variant="outline" className="w-full">
                  📚 My Materials
                </Button>
              </Link>
              <Link to="/student/grades">
                <Button variant="outline" className="w-full">
                  🎓 View Grades
                </Button>
              </Link>
            </div>
          </Card>

          {/* Upcoming Quizzes */}
          <Card>
            <h3 className="text-lg font-semibold text-black mb-4">
              📋 Upcoming Quizzes
            </h3>
            {upcomingQuizzes.length === 0 ? (
              <p className="text-sm text-black">No upcoming quizzes</p>
            ) : (
              <div className="space-y-3">
                {upcomingQuizzes.map(quiz => (
                  <div
                    key={quiz._id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <h4 className="font-medium text-black text-sm">{quiz.title}</h4>
                    <p className="text-xs text-black">{quiz.courseName}</p>
                    <p className="text-xs text-black mt-1">
                      {quiz.timeLimit} min • {quiz.totalPoints} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Progress Card */}
          <Card>
            <h3 className="text-sm font-semibold text-black mb-4">
              📊 Learning Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Classes Completed</span>
                  <span className="text-sm font-semibold text-black">
                    {stats.completedClasses}/{stats.totalClasses}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    style={{
                      width: `${stats.totalClasses > 0 ? (stats.completedClasses / stats.totalClasses) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Study Hours</span>
                  <span className="text-sm font-semibold text-black">
                    {stats.totalHours.toFixed(1)}h / 50h
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-blue-600"
                    style={{
                      width: `${Math.min((stats.totalHours / 50) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentDashboard;
