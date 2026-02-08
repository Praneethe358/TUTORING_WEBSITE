import React, { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { Card } from '../components/ModernComponents';

const AnnouncementViewer = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?priority=${filter}` : '';
      const response = await api.get(`/announcements${params}`);
      setAnnouncements(response.data.data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleAnnouncementClick = async (announcement) => {
    setSelectedAnnouncement(announcement);
    try {
      await api.get(`/announcements/${announcement._id}`);
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      normal: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const icons = {
      general: '📋',
      maintenance: '🔧',
      feature: '✨',
      policy: '📜',
      event: '🎉',
      holiday: '🏖️',
      other: '📌',
    };
    return (
      <span className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
        {icons[category] || '📌'} {category}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <StudentDashboardLayout>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Announcements</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'urgent', 'normal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 sm:px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] sm:min-h-[auto] ${
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className="w-16 sm:w-20 h-16 sm:h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No announcements</h3>
              <p className="text-sm sm:text-base text-gray-500">
                {filter === 'all'
                  ? 'There are no announcements at this time'
                  : `No ${filter} priority announcements`}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement._id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  announcement.isPinned ? 'border-2 border-yellow-400' : ''
                }`}
                onClick={() => handleAnnouncementClick(announcement)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      {announcement.isPinned && <span className="text-yellow-500 text-base sm:text-xl">📌</span>}
                      <h3 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900">{announcement.title}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">{announcement.content}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(announcement.publishedAt || announcement.createdAt)}
                      </span>
                      {announcement.viewCount > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {announcement.viewCount} views
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col gap-2 sm:items-end flex-wrap">
                    {getPriorityBadge(announcement.priority)}
                    {getCategoryBadge(announcement.category)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {selectedAnnouncement && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setSelectedAnnouncement(null)}
          >
            <div
              className="bg-white rounded-lg sm:rounded-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    {selectedAnnouncement.isPinned && <span className="text-yellow-500 text-lg sm:text-2xl">📌</span>}
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{selectedAnnouncement.title}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(selectedAnnouncement.priority)}
                    {getCategoryBadge(selectedAnnouncement.category)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <svg className="w-5 sm:w-6 h-5 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>

                {selectedAnnouncement.attachments && selectedAnnouncement.attachments.length > 0 && (
                  <div className="mt-4 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Attachments</h3>
                    <div className="space-y-2">
                      {selectedAnnouncement.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 sm:p-3 min-h-[44px] bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm text-gray-700">{attachment.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-xs sm:text-sm text-gray-500">
                  <p>Published: {formatDate(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt)}</p>
                  {selectedAnnouncement.expiresAt && (
                    <p className="mt-1">Expires: {formatDate(selectedAnnouncement.expiresAt)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentDashboardLayout>
  );
};

export default AnnouncementViewer;
