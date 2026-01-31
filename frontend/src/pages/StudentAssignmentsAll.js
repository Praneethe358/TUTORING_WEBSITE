import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Badge, EmptyState } from '../components/ModernComponents';

/**
 * STUDENT ASSIGNMENTS PAGE
 * View all assignments across enrolled courses
 */
const StudentAssignmentsAll = () => {
  useAuth();
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, submitted, graded
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/lms/student/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;
    return assignments.filter(a => {
      if (filter === 'pending') return a.submissionStatus === 'not-submitted';
      if (filter === 'submitted') return a.submissionStatus === 'submitted';
      if (filter === 'graded') return a.submissionStatus === 'graded';
      return true;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'not-submitted':
        return 'red';
      case 'submitted':
        return 'yellow';
      case 'graded':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'not-submitted':
        return 'Not Submitted';
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-black">Loading assignments...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  const filteredAssignments = getFilteredAssignments();

  return (
    <StudentDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black">Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your course assignments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{assignments.length}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {assignments.filter(a => a.submissionStatus === 'not-submitted').length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Pending</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {assignments.filter(a => a.submissionStatus === 'submitted').length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Submitted</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              {assignments.filter(a => a.submissionStatus === 'graded').length}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Graded</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto pb-px">
          {['all', 'pending', 'submitted', 'graded'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 sm:px-4 py-2 sm:py-2 font-semibold border-b-2 transition whitespace-nowrap min-h-[44px] text-sm sm:text-base ${
                filter === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-black'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredAssignments.map(assignment => (
              <Card
                key={assignment._id}
                className="hover:shadow-md transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-black">
                        {assignment.title}
                      </h3>
                      <Badge
                        variant={getStatusColor(assignment.submissionStatus)}
                      >
                        {getStatusLabel(assignment.submissionStatus)}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mt-2">
                      📚 {assignment.courseName}
                    </p>

                    {assignment.description && (
                      <p className="text-black mt-3">
                        {assignment.description.substring(0, 150)}...
                      </p>
                    )}

                    {/* Deadline */}
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-black">
                        📅 Due: {new Date(assignment.deadline).toLocaleDateString()}
                      </span>
                      {assignment.maxPoints && (
                        <span className="text-black">
                          ⭐ Points: {assignment.maxPoints}
                        </span>
                      )}
                    </div>

                    {/* Submission Info */}
                    {assignment.submission && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-black">
                          ✓ Submitted: {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                        </p>
                        {assignment.submission.score !== undefined && (
                          <p className="text-sm text-black font-semibold">
                            Score: {assignment.submission.score}/{assignment.maxPoints}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      to={`/student/lms/assignment/${assignment._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold text-center"
                    >
                      View Details
                    </Link>
                    {assignment.submissionStatus === 'not-submitted' && (
                      <Link
                        to={`/student/lms/assignment/${assignment._id}/submit`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold text-center"
                      >
                        Submit
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Assignments"
            description={`You have no ${filter !== 'all' ? filter : ''} assignments to show.`}
            icon="📝"
          />
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentAssignmentsAll;
