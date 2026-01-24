import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Card } from '../components/ModernComponents';

const AttendanceViewer = () => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
    fetchStats();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance');
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/attendance/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800 border-green-200',
      absent: 'bg-red-100 text-red-800 border-red-200',
      late: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      excused: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getParticipationBadge = (level) => {
    const styles = {
      excellent: 'bg-purple-100 text-purple-800',
      good: 'bg-green-100 text-green-800',
      average: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-orange-100 text-orange-800',
      none: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[level]}`}>
        {level}
      </span>
    );
  };

  const renderRatingStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Attendance Record</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="text-center">
              <p className="text-sm text-green-600 font-medium mb-1">Attendance Rate</p>
              <p className="text-3xl font-bold text-green-900">
                {stats.attendancePercentage ? `${stats.attendancePercentage.toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {stats.present || 0} / {stats.total || 0} classes
              </p>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="text-center">
              <p className="text-sm text-blue-600 font-medium mb-1">Avg Performance</p>
              <p className="text-3xl font-bold text-blue-900">
                {stats.averageRatings?.overall ? stats.averageRatings.overall.toFixed(1) : 'N/A'}/5
              </p>
              <div className="flex justify-center mt-1">
                {stats.averageRatings?.overall && renderRatingStars(Math.round(stats.averageRatings.overall))}
              </div>
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="text-center">
              <p className="text-sm text-purple-600 font-medium mb-1">Total Classes</p>
              <p className="text-3xl font-bold text-purple-900">{stats.total || 0}</p>
              <p className="text-xs text-purple-600 mt-1">
                {stats.late || 0} late arrivals
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Attendance Records */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : attendance.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-20 h-20 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
            <p className="text-gray-500">Your attendance will appear here after classes</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {attendance.map((record) => (
            <Card
              key={record._id}
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Class Info */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {record.class?.topic || 'Class'}
                    </h3>
                    {getStatusBadge(record.status)}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(record.markedAt || record.createdAt)}
                    </span>
                    {record.minutesLate > 0 && (
                      <span className="flex items-center gap-1 text-yellow-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {record.minutesLate} min late
                      </span>
                    )}
                    {record.participationLevel && (
                      <span className="flex items-center gap-2">
                        Participation: {getParticipationBadge(record.participationLevel)}
                      </span>
                    )}
                  </div>

                  {/* Ratings */}
                  {(record.attentiveness || record.understanding || record.preparation) && (
                    <div className="grid grid-cols-3 gap-4">
                      {record.attentiveness && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Attentiveness</p>
                          {renderRatingStars(record.attentiveness)}
                        </div>
                      )}
                      {record.understanding && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Understanding</p>
                          {renderRatingStars(record.understanding)}
                        </div>
                      )}
                      {record.preparation && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Preparation</p>
                          {renderRatingStars(record.preparation)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tutor Remarks Preview */}
                  {record.tutorRemarks && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      💬 {record.tutorRemarks}
                    </p>
                  )}
                </div>

                {/* Verified Badge */}
                {record.isVerified && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedRecord.class?.topic || 'Attendance Details'}
                </h2>
                {getStatusBadge(selectedRecord.status)}
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Marked On</h3>
                  <p className="text-gray-900">{formatDate(selectedRecord.markedAt || selectedRecord.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Marked By</h3>
                  <p className="text-gray-900 capitalize">{selectedRecord.markedBy}</p>
                </div>
              </div>

              {/* Participation */}
              {selectedRecord.participationLevel && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Participation Level</h3>
                  {getParticipationBadge(selectedRecord.participationLevel)}
                </div>
              )}

              {/* Performance Ratings */}
              {(selectedRecord.attentiveness || selectedRecord.understanding || selectedRecord.preparation) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Performance Ratings</h3>
                  <div className="space-y-3">
                    {selectedRecord.attentiveness && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Attentiveness</span>
                        <div className="flex items-center gap-2">
                          {renderRatingStars(selectedRecord.attentiveness)}
                          <span className="text-sm font-medium text-gray-900">{selectedRecord.attentiveness}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedRecord.understanding && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Understanding</span>
                        <div className="flex items-center gap-2">
                          {renderRatingStars(selectedRecord.understanding)}
                          <span className="text-sm font-medium text-gray-900">{selectedRecord.understanding}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedRecord.preparation && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Preparation</span>
                        <div className="flex items-center gap-2">
                          {renderRatingStars(selectedRecord.preparation)}
                          <span className="text-sm font-medium text-gray-900">{selectedRecord.preparation}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Topics Covered */}
              {selectedRecord.topicsCovered && selectedRecord.topicsCovered.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Topics Covered</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedRecord.topicsCovered.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tutor Remarks */}
              {selectedRecord.tutorRemarks && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tutor's Remarks</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedRecord.tutorRemarks}</p>
                </div>
              )}

              {/* Homework */}
              {selectedRecord.homeworkAssigned && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Homework Assigned</h3>
                  <p className="text-gray-700">{selectedRecord.homeworkAssigned}</p>
                </div>
              )}

              {/* Student Feedback */}
              {selectedRecord.studentFeedback && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Feedback</h3>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">{selectedRecord.studentFeedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceViewer;
