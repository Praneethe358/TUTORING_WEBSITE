import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Card } from '../components/ModernComponents';

const ClassCalendar = () => {
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed
  const [selectedClass, setSelectedClass] = useState(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter === 'upcoming' ? 'scheduled' : filter}` : '';
      const response = await api.get(`/classes${params}`);
      setClasses(response.data.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/classes/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetchStats();
  }, [fetchClasses, fetchStats]);

  const getStatusBadge = (status) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      ongoing: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rescheduled: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  const isUpcoming = (scheduledAt) => {
    return new Date(scheduledAt) > new Date();
  };

  const groupClassesByDate = () => {
    const grouped = {};
    classes.forEach(cls => {
      const date = new Date(cls.scheduledAt).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(cls);
    });
    return Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const groupedClasses = groupClassesByDate();

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Classes</h1>
        
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="text-center">
                <p className="text-sm text-blue-600 font-medium mb-1">Total Classes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="text-center">
                <p className="text-sm text-green-600 font-medium mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-green-900">{stats.upcoming}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="text-center">
                <p className="text-sm text-purple-600 font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-purple-900">{stats.completed}</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="text-center">
                <p className="text-sm text-orange-600 font-medium mb-1">Total Hours</p>
                <p className="text-3xl font-bold text-orange-900">{stats.totalHours}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'upcoming', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : classes.length === 0 ? (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You don't have any classes scheduled yet"
                : `No ${filter} classes`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedClasses.map(([date, dayClasses]) => {
            const { dayOfWeek } = formatDateTime(dayClasses[0].scheduledAt);
            return (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{dayOfWeek}</h2>
                  <span className="text-gray-500">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Classes for this date */}
                <div className="grid gap-4">
                  {dayClasses.map((cls) => {
                    const { time } = formatDateTime(cls.scheduledAt);
                    const upcoming = isUpcoming(cls.scheduledAt);
                    
                    return (
                      <Card
                        key={cls._id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          upcoming ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => setSelectedClass(cls)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4 flex-1">
                            {/* Time */}
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{time.split(':')[0]}</div>
                              <div className="text-sm text-gray-500">{time.split(' ')[1]}</div>
                              <div className="text-xs text-gray-400 mt-1">{cls.duration}min</div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {cls.topic}
                              </h3>
                              {cls.description && (
                                <p className="text-gray-600 text-sm mb-2">{cls.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {cls.tutor?.name || cls.student?.name || 'Loading...'}
                                </span>
                                {cls.meetingLink && (
                                  <a
                                    href={cls.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Join Meeting
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            {getStatusBadge(cls.status)}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedClass(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.topic}</h2>
                {getStatusBadge(selectedClass.status)}
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-4">
              {selectedClass.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedClass.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Date & Time</h3>
                  <p className="text-gray-900">
                    {formatDateTime(selectedClass.scheduledAt).date}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {formatDateTime(selectedClass.scheduledAt).time}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Duration</h3>
                  <p className="text-gray-900">{selectedClass.duration} minutes</p>
                </div>
              </div>

              {selectedClass.meetingLink && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Meeting Link</h3>
                  <a
                    href={selectedClass.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                  >
                    {selectedClass.meetingLink}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {selectedClass.notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                  <p className="text-gray-600">{selectedClass.notes}</p>
                </div>
              )}

              {selectedClass.tutorRemarks && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tutor Remarks</h3>
                  <p className="text-gray-600">{selectedClass.tutorRemarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassCalendar;
