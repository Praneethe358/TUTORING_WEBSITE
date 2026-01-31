import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';

/**
 * STUDENT MESSAGES PAGE
 * 
 * Communication with tutors
 * - Message threads
 * - Real-time chat
 * - Message history
 */
const StudentMessages = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const [conversations, setConversations] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const typingTimeout = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    if (!userId) return;
    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });
    newSocket.on('connect', () => {
      setErrorMsg('');
      newSocket.emit('user_online', userId);
    });
    newSocket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        setErrorMsg('Connection lost. Reconnecting...');
      }
    });
    newSocket.on('reconnect', () => {
      setErrorMsg('');
      newSocket.emit('user_online', userId);
    });
    newSocket.on('reconnect_failed', () => {
      setErrorMsg('Unable to reconnect. Please refresh the page.');
    });
    newSocket.on('users_online', setOnlineUsers);
    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, {
        _id: Math.random(),
        sender: data.senderId,
        receiver: userId,
        content: data.content,
        createdAt: data.timestamp,
        isRead: true,
        senderType: data.senderType || 'tutor'
      }]);
      setConversations(prev => prev.map(c => c.userId === data.senderId ? {
        ...c,
        lastMessage: data.content,
        lastMessageTime: data.timestamp,
        unreadCount: (c.unreadCount || 0) + (selectedTutor?.userId === data.senderId ? 0 : 1)
      } : c));
    });
    newSocket.on('user_typing', () => setIsTyping(true));
    newSocket.on('user_stopped_typing', () => setIsTyping(false));
    setSocket(newSocket);
    return () => newSocket.close();
  }, [userId]);

  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, tutorRes] = await Promise.all([
          api.get('/messages/conversations'),
          api.get('/tutor/public')
        ]);
        setConversations(convRes.data.conversations || []);
        setTutors(Array.isArray(tutorRes.data) ? tutorRes.data : (tutorRes.data.tutors || []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedTutor) {
      api.get(`/messages/conversation/${selectedTutor._id || selectedTutor.userId}`)
        .then(res => setMessages(res.data.messages || []))
        .catch(err => {
          console.error(err);
          if (err?.response?.status === 403) {
            setErrorMsg('You are not authorized to view this conversation.');
          } else {
            setErrorMsg('Failed to load messages.');
          }
        });
    }
  }, [selectedTutor]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTutor || !userId) return;
    try {
      const receiverId = selectedTutor._id || selectedTutor.userId;
      socket?.emit('send_message', { senderId: userId, receiverId, content: newMessage, senderType: 'student', receiverType: 'tutor' });
      await api.post('/messages/send', { receiverId, content: newMessage, senderType: 'student', receiverType: 'tutor' });
      setMessages(prev => [...prev, { _id: Math.random(), sender: userId, receiver: receiverId, content: newMessage, createdAt: new Date(), isRead: false, senderType: 'student' }]);
      setConversations(prev => prev.map(c => c.userId === receiverId ? { ...c, lastMessage: newMessage, lastMessageTime: new Date(), unreadCount: 0 } : c));
      setNewMessage('');
      socket?.emit('stop_typing', { receiverId });
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 403) {
        setErrorMsg('You are not authorized to chat with this tutor.');
      } else {
        setErrorMsg('Failed to send message. Please try again.');
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedTutor) {
      socket?.emit('typing', { receiverId: selectedTutor._id || selectedTutor.userId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => socket?.emit('stop_typing', { receiverId: selectedTutor._id || selectedTutor.userId }), 3000);
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const combinedList = React.useMemo(() => {
    const convIds = new Set(conversations.map(c => c.userId?.toString()));
    const convEntries = conversations.map(conv => ({
      userId: conv.userId,
      user: {
        ...conv.user,
        avatar: conv.user?.avatar || conv.user?.profileImage || conv.user?.avatarUrl
      },
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unreadCount,
      source: 'conversation'
    }));

    const tutorEntries = tutors
      .filter(t => !convIds.has((t._id || t.id || '').toString()))
      .map(t => ({
        userId: t._id || t.id,
        user: { 
          name: t.name, 
          email: t.email, 
          avatar: t.avatar || t.profileImage || t.avatarUrl
        },
        source: 'tutor'
      }));

    return [...convEntries, ...tutorEntries];
  }, [conversations, tutors]);

  const filteredList = combinedList.filter(item => (
    (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const handleSelectTutor = (entry) => {
    setSelectedTutor(entry);
    setMessages([]);
    setErrorMsg('');
    setConversations(prev => prev.map(c => c.userId === entry.userId ? { ...c, unreadCount: 0 } : c));
  };

  return (
    <StudentDashboardLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">Messages</h1>
        <p className="text-sm text-gray-500">Chat with your tutors</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] gap-4 h-[calc(100vh-200px)] md:h-[calc(100vh-220px)] max-h-[700px]">
        {/* Conversations List */}
        <div className={`bg-white rounded-lg border border-gray-200 overflow-auto shadow-sm ${selectedTutor ? 'hidden md:block' : 'block'}`}>
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search tutors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-3 sm:py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
          </div>
          {loading ? (
            <p style={{ padding: spacing.lg, color: colors.textSecondary }}>Loading conversations...</p>
          ) : filteredList.length === 0 ? (
            <p style={{ padding: spacing.lg, color: colors.textSecondary }}>No tutors found</p>
          ) : (
            <div>
              {filteredList.map(entry => {
                const isOnline = onlineUsers.includes(entry.userId);
                return (
                  <button
                    key={entry.userId}
                    onClick={() => handleSelectTutor(entry)}
                    style={{
                      width: '100%',
                      padding: spacing.md,
                      textAlign: 'left',
                      backgroundColor: selectedTutor?.userId === entry.userId ? colors.accentLight : colors.white,
                      border: 'none',
                      borderBottom: `1px solid ${colors.gray200}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      borderLeft: selectedTutor?.userId === entry.userId ? `3px solid ${colors.accent}` : '3px solid transparent',
                    }}
                    onMouseOver={(e) => {
                      if (selectedTutor?.userId !== entry.userId) {
                        e.currentTarget.style.backgroundColor = colors.bgSecondary;
                      }
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = selectedTutor?.userId === entry.userId ? colors.accentLight : colors.white;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: colors.gray300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: `2px solid ${colors.gray200}`
                        }}>
                          {entry.user?.avatar ? (
                            <img 
                              src={entry.user.avatar.startsWith('http') ? entry.user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${entry.user.avatar}`} 
                              alt="avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: 18px; fontWeight: bold; color: ${colors.text}">${entry.user?.name?.charAt(0).toUpperCase()}</span>`; }}
                            />
                          ) : (
                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text }}>
                              {entry.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {isOnline && (
                          <span style={{ position: 'absolute', bottom: '0', right: '0', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.success, border: `2px solid ${colors.white}` }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <h3 style={{ fontWeight: typography.fontWeight.semibold, color: colors.text, fontSize: typography.fontSize.sm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.user?.name}</h3>
                          {entry.unreadCount > 0 && (
                            <span style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%', flexShrink: 0 }} title="New messages" />
                          )}
                        </div>
                        {entry.lastMessage && (
                          <>
                            <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{entry.lastMessage}</p>
                            {entry.lastMessageTime && (
                              <p style={{ fontSize: '11px', color: colors.textSecondary }}>
                                {new Date(entry.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm ${selectedTutor ? 'block' : 'hidden md:flex'}`}>
          {selectedTutor ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center gap-3">
                {/* Back button - mobile only */}
                <button
                  onClick={() => setSelectedTutor(null)}
                  className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ←
                </button>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">{selectedTutor.user?.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-500">{onlineUsers.includes(selectedTutor.userId) ? '🟢 Online' : '⚫ Offline'}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, padding: spacing.lg, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {errorMsg && (
                  <div style={{ padding: spacing.sm, backgroundColor: '#fee2e2', border: `1px solid #fca5a5`, color: '#991b1b', borderRadius: borderRadius.md }}>
                    {errorMsg}
                  </div>
                )}
                {messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: colors.textSecondary, fontSize: typography.fontSize.sm }}>No messages yet. Start the conversation!</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} style={{ display: 'flex', justifyContent: msg.senderType === 'student' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: spacing.sm }}>
                      {msg.senderType !== 'student' && (
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: colors.gray300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: `2px solid ${colors.gray200}`
                        }}>
                          {selectedTutor?.user?.avatar ? (
                            <img 
                              src={selectedTutor.user.avatar.startsWith('http') ? selectedTutor.user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${selectedTutor.user.avatar}`} 
                              alt="avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: ${typography.fontSize.lg}; fontWeight: bold; color: ${colors.text}">${selectedTutor?.user?.name?.charAt(0).toUpperCase()}</span>`; }}
                            />
                          ) : (
                            <span style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.text }}>
                              {selectedTutor?.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '70%',
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: msg.senderType === 'student' ? colors.accent : colors.bgSecondary,
                        color: msg.senderType === 'student' ? colors.white : colors.text,
                        boxShadow: shadows.sm,
                        wordWrap: 'break-word'
                      }}>
                        {msg.senderType !== 'student' && (
                          <p style={{ fontSize: typography.fontSize.xs, fontWeight: 'semibold', marginBottom: spacing.xs, opacity: 0.8 }}>
                            {selectedTutor?.user?.name}
                          </p>
                        )}
                        <p style={{ fontSize: typography.fontSize.sm, lineHeight: '1.5' }}>{msg.content}</p>
                        <p style={{ fontSize: typography.fontSize.xs, opacity: 0.7, marginTop: spacing.xs, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.senderType === 'student' && (
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: colors.gray300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: `2px solid ${colors.gray200}`
                        }}>
                          {user?.avatar ? (
                            <img 
                              src={user.avatar.startsWith('http') ? user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${user.avatar}`} 
                              alt="avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: ${typography.fontSize.lg}; fontWeight: bold; color: ${colors.text}">${user?.name?.charAt(0).toUpperCase()}</span>`; }}
                            />
                          ) : (
                            <span style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.text }}>
                              {user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: spacing.sm }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: colors.gray300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: `2px solid ${colors.gray200}`
                    }}>
                      {selectedTutor?.user?.avatar ? (
                        <img 
                          src={selectedTutor.user.avatar.startsWith('http') ? selectedTutor.user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${selectedTutor.user.avatar}`} 
                          alt="avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: ${typography.fontSize.lg}; fontWeight: bold; color: ${colors.text}">${selectedTutor?.user?.name?.charAt(0).toUpperCase()}</span>`; }}
                        />
                      ) : (
                        <span style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.text }}>
                          {selectedTutor?.user?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: borderRadius.md, backgroundColor: colors.bgSecondary, boxShadow: shadows.sm }}>
                      <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary, fontStyle: 'italic' }}>Typing...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-3 sm:py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 sm:px-6 py-3 sm:py-2 bg-indigo-600 text-white font-medium rounded-lg transition min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-4 text-center">
              Select a tutor to start chatting
            </div>
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentMessages;
