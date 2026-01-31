import React, { useEffect, useState, useCallback } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'unread') params.isRead = 'false';
      if (filter === 'read') params.isRead = 'true';

      const res = await api.get('/notifications', { params });
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter, fetchNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread/count');
      setUnreadCount(res.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    try {
      await api.delete('/notifications/read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'class':
      case 'booking':
        return '📅';
      case 'assignment':
        return '📝';
      case 'quiz':
        return '📋';
      case 'grade':
        return '🎓';
      case 'message':
        return '💬';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      class: 'Class',
      booking: 'Booking',
      assignment: 'Assignment',
      quiz: 'Quiz',
      grade: 'Grade',
      message: 'Message',
      announcement: 'Announcement',
      system: 'System'
    };
    return labels[type] || 'Notification';
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Notifications</h1>
          <p className="text-black mt-1">Stay updated with your activities</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 border border-indigo-500 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium">Unread Notifications</p>
            <h3 className="text-3xl font-bold text-white mt-1">{unreadCount}</h3>
          </div>
          <div className="text-indigo-200 text-4xl">🔔</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-black border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {notifications.some(n => n.isRead) && (
          <button
            onClick={deleteAllRead}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition"
          >
            Clear Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-black text-lg font-medium">No notifications</p>
          <p className="text-black mt-2">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`bg-white rounded-xl p-5 border-2 transition hover:shadow-md ${
                notification.isRead ? 'border-gray-200' : 'border-indigo-600 bg-indigo-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-3xl">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        {getTypeLabel(notification.type)}
                      </span>
                      {!notification.isRead && (
                        <span className="ml-2 w-2 h-2 bg-indigo-600 rounded-full inline-block"></span>
                      )}
                    </div>
                    <p className="text-xs text-black flex-shrink-0">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <h3 className="text-lg font-semibold text-black mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-black mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-3">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default StudentNotifications;
