import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import getSocket from '../lib/socket';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Socket.io: connect and subscribe to notification events
  useEffect(() => {
    const socket = getSocket();
    if (user?.id || user?._id) {
      const userId = user.id || user._id;
      console.log('[NotificationBell] Emitting user_online:', userId);
      socket.emit('user_online', userId);
    }
    const onNewNotification = (data) => {
      console.log('[NotificationBell] Received notification:new', data);
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    };
    const onNotificationsUpdated = (data) => {
      console.log('[NotificationBell] Received notifications:updated', data);
      fetchUnreadCount();
      if (isOpen) fetchNotifications();
    };
    socket.on('notification:new', onNewNotification);
    socket.on('notifications:updated', onNotificationsUpdated);
    return () => {
      socket.off('notification:new', onNewNotification);
      socket.off('notifications:updated', onNotificationsUpdated);
    };
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen, notifications.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal':
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'class_scheduled':
      case 'class_reminder':
        return '📅';
      case 'class_cancelled':
        return '❌';
      case 'class_rescheduled':
        return '🔄';
      case 'booking_confirmed':
        return '✅';
      case 'attendance_marked':
        return '📝';
      case 'announcement':
        return '📢';
      case 'payment_received':
      case 'payment_reminder':
        return '💰';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="font-medium">No notifications yet</p>
                <p className="text-sm mt-1">We'll notify you when something important happens</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id);
                    }
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    !notification.isRead 
                      ? 'bg-blue-50 hover:bg-blue-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      !notification.isRead ? getPriorityColor(notification.priority) : 'bg-gray-100'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="ml-3 flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.actionLabel && (
                          <span className="text-xs font-medium text-blue-600">
                            {notification.actionLabel} →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <a
                href="/announcements"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View announcements
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
