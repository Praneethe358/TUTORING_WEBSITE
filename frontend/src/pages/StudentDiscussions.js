import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Button, Badge, EmptyState } from '../components/ModernComponents';

/**
 * STUDENT DISCUSSIONS PAGE
 * View and participate in course discussions
 */
const StudentDiscussions = () => {
  useAuth();
  const { courseId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchDiscussions = async () => {
    try {
      if (courseId) {
        const res = await api.get(`/lms/discussions?courseId=${courseId}`);
        if (res.data.success) {
          setDiscussions(res.data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDiscussion = async (discussion) => {
    setSelectedDiscussion(discussion);
    // Fetch replies for this discussion
    try {
      const res = await api.get(`/lms/discussions/${discussion._id}`);
      if (res.data.success) {
        setReplies(res.data.data.replies || []);
      }
    } catch (error) {
      console.error('Failed to fetch discussion replies:', error);
    }
  };

  const handlePostReply = async () => {
    if (!newReply.trim()) {
      alert('Please write a reply');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/lms/discussions/${selectedDiscussion._id}/reply`, {
        content: newReply
      });

      if (res.data.success) {
        setNewReply('');
        handleSelectDiscussion(selectedDiscussion); // Refresh replies
      }
    } catch (error) {
      console.error('Failed to post reply:', error);
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopic.trim()) {
      alert('Please enter title and content');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/lms/discussions', {
        courseId,
        title: newTopicTitle,
        content: newTopic
      });

      if (res.data.success) {
        setNewTopicTitle('');
        setNewTopic('');
        fetchDiscussions(); // Refresh discussions
      }
    } catch (error) {
      console.error('Failed to create topic:', error);
      alert('Failed to create topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (replyId) => {
    try {
      const res = await api.post(`/lms/discussions/${selectedDiscussion._id}/reply/${replyId}/like`);
      if (res.data.success) {
        handleSelectDiscussion(selectedDiscussion); // Refresh
      }
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading discussions...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discussions List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Topics</h2>

            {/* Create New Topic Form */}
            <div className="mb-4 pb-4 border-b">
              <input
                type="text"
                placeholder="Topic title"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
              />
              <textarea
                placeholder="Start a discussion..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none mb-2"
              />
              <Button
                onClick={handleCreateTopic}
                disabled={submitting}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? 'Creating...' : 'Create Topic'}
              </Button>
            </div>

            {/* Topics List */}
            <div className="space-y-2 max-h-screen overflow-y-auto">
              {discussions.length > 0 ? (
                discussions.map(discussion => (
                  <button
                    key={discussion._id}
                    onClick={() => handleSelectDiscussion(discussion)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition ${
                      selectedDiscussion?._id === discussion._id
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {discussion.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      by {discussion.authorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      💬 {discussion.replies?.length || 0} replies
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-600 text-center py-4">No topics yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Discussion Detail */}
        <div className="lg:col-span-2">
          {selectedDiscussion ? (
            <div className="space-y-6">
              {/* Topic Header */}
              <Card>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedDiscussion.title}
                </h1>

                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span>👤 {selectedDiscussion.authorName}</span>
                  <span>📅 {new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                  <span>💬 {selectedDiscussion.replies?.length || 0} replies</span>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{selectedDiscussion.content}</p>
                </div>

                {/* Topic Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => alert('Pinned!')}
                    className="bg-yellow-600 text-white hover:bg-yellow-700 text-sm"
                  >
                    {selectedDiscussion.pinned ? '📌 Pinned' : '🔖 Pin Topic'}
                  </Button>
                </div>
              </Card>

              {/* Replies Section */}
              <Card>
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Replies ({selectedDiscussion.replies?.length || 0})
                </h2>

                <div className="space-y-4">
                  {replies.map(reply => (
                    <div key={reply._id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {reply.authorName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(reply.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {reply.level || 'Student'}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mt-3">{reply.content}</p>

                      <div className="flex gap-4 mt-3">
                        <button
                          onClick={() => handleToggleLike(reply._id)}
                          className="text-sm text-gray-600 hover:text-blue-600 transition"
                        >
                          👍 {reply.likes || 0} likes
                        </button>
                        <button
                          onClick={() => setNewReply(`@${reply.authorName} `)}
                          className="text-sm text-gray-600 hover:text-blue-600 transition"
                        >
                          💬 Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* New Reply Form */}
              <Card>
                <h3 className="font-bold text-gray-900 mb-3">Post a Reply</h3>
                <textarea
                  placeholder="Write your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                />
                <Button
                  onClick={handlePostReply}
                  disabled={submitting}
                  className="mt-3 bg-green-600 text-white hover:bg-green-700"
                >
                  {submitting ? 'Posting...' : 'Post Reply'}
                </Button>
              </Card>
            </div>
          ) : (
            <EmptyState
              title="Select a Topic"
              description="Choose a discussion topic from the left sidebar to view details and replies."
              icon="💬"
            />
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentDiscussions;
