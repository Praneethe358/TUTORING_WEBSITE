import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';

/**
 * TUTOR MESSAGES PAGE
 * 
 * Chat with students
 * - Message threads
 * - Real-time messaging (placeholder for WebSocket)
 * - Message history
 */
const TutorMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const typingTimeout = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
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
      newSocket.emit('user_online', user.id);
    });
    newSocket.on('disconnect', (reason) => {
      if (reason !== 'io client disconnect') {
        setErrorMsg('Connection lost. Reconnecting...');
      }
    });
    newSocket.on('reconnect', () => {
      setErrorMsg('');
      newSocket.emit('user_online', user.id);
    });
    newSocket.on('reconnect_failed', () => {
      setErrorMsg('Unable to reconnect. Please refresh the page.');
    });
    newSocket.on('users_online', setOnlineUsers);
    newSocket.on('receive_message', (data) => {
      // Append message to current thread if viewing, otherwise just update conversations list
      setMessages(prev => [...prev, { _id: Math.random(), sender: data.senderId, receiver: user.id, content: data.content, createdAt: data.timestamp, isRead: true, senderType: data.senderType || 'student' }]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setConversations(prev => prev.map(c => c.userId === data.senderId ? { ...c, lastMessage: data.content, lastMessageTime: data.timestamp, unreadCount: (c.unreadCount || 0) + (selectedUser?.userId === data.senderId ? 0 : 1) } : c));
    });
    newSocket.on('user_typing', () => setIsTyping(true));
    newSocket.on('user_stopped_typing', () => setIsTyping(false));
    setSocket(newSocket);
    return () => newSocket.close();
  }, [user.id]);

  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, assignedRes] = await Promise.all([
          api.get('/messages/conversations'),
          api.get('/tutor/assigned-students')
        ]);
        setConversations(convRes.data.conversations || []);

        // Build student list from admin-assigned students only
        const assignedStudents = Array.isArray(assignedRes.data?.students) ? assignedRes.data.students : [];
        const uniqueStudents = assignedStudents.map(s => ({
          userId: s._id || s.id,
          user: {
            name: s.name,
            email: s.email,
            avatar: s.avatar || s.profileImage
          },
          source: 'assigned'
        })).filter(s => s.userId && s.user?.name);

        setStudents(uniqueStudents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      api.get(`/messages/conversation/${selectedUser._id || selectedUser.userId}`)
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
  }, [selectedUser]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const receiverId = selectedUser._id || selectedUser.userId;
      socket?.emit('send_message', { senderId: user.id, receiverId, content: newMessage, senderType: 'tutor', receiverType: 'student' });
      await api.post('/messages/send', { receiverId, content: newMessage, senderType: 'tutor', receiverType: 'student' });
      setMessages(prev => [...prev, { _id: Math.random(), sender: user.id, receiver: receiverId, content: newMessage, createdAt: new Date(), isRead: false, senderType: 'tutor' }]);
      setConversations(prev => prev.map(c => c.userId === receiverId ? { ...c, lastMessage: newMessage, lastMessageTime: new Date(), unreadCount: 0 } : c));
      setNewMessage('');
      socket?.emit('stop_typing', { receiverId });
    } catch (error) {
      console.error(error);
      if (error?.response?.status === 403) {
        setErrorMsg('You are not authorized to chat with this student.');
      } else {
        setErrorMsg('Failed to send message. Please try again.');
      }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedUser) {
      socket?.emit('typing', { receiverId: selectedUser._id || selectedUser.userId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => socket?.emit('stop_typing', { receiverId: selectedUser._id || selectedUser.userId }), 3000);
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

    const studentEntries = students
      .filter(s => !convIds.has((s.userId || '').toString()))
      .map(s => ({
        userId: s.userId,
        user: s.user,
        source: 'student'
      }));

    return [...convEntries, ...studentEntries];
  }, [conversations, students]);

  const filteredList = combinedList.filter(item =>
    (item.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (entry) => {
    setSelectedUser(entry);
    setMessages([]);
    setErrorMsg('');
    setConversations(prev => prev.map(c => c.userId === entry.userId ? { ...c, unreadCount: 0 } : c));
  };

  return (
    <div>
      <div style={{ marginBottom: spacing['2xl'] }}>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">Messages</h1>
        <p style={{ color: colors.textSecondary, marginTop: spacing.sm }}>Chat with your students</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: spacing.lg, height: 'calc(100vh - 220px)', maxHeight: '700px' }} className="md:grid-cols-[380px_1fr]">
        {/* Conversations List */}
        <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, border: `1px solid ${colors.gray200}`, overflow: 'auto', boxShadow: shadows.sm }}>
          <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray200}` }}>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: `${spacing.sm} ${spacing.md}`,
                backgroundColor: colors.bgSecondary,
                border: `1px solid ${colors.gray300}`,
                borderRadius: borderRadius.md,
                color: colors.text,
                fontSize: typography.fontSize.sm,
                outline: 'none',
              }}
            />
          </div>
          {loading ? (
            <p style={{ padding: spacing.lg, color: colors.textSecondary }}>Loading conversations...</p>
          ) : filteredList.length === 0 ? (
            <p style={{ padding: spacing.lg, color: colors.textSecondary }}>No students found</p>
          ) : (
            <div>
              {filteredList.map(entry => {
                const isOnline = onlineUsers.includes(entry.userId);
                return (
              <button
                key={entry.userId}
                onClick={() => handleSelectUser(entry)}
                style={{
                  width: '100%',
                  padding: spacing.md,
                  textAlign: 'left',
                  backgroundColor: selectedUser?.userId === entry.userId ? colors.accentLight : colors.white,
                  border: 'none',
                  borderBottom: `1px solid ${colors.gray200}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: selectedUser?.userId === entry.userId ? `3px solid ${colors.accent}` : '3px solid transparent',
                }}
                onMouseOver={(e) => {
                  if (selectedUser?.userId !== entry.userId) {
                    e.currentTarget.style.backgroundColor = colors.bgSecondary;
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = selectedUser?.userId === entry.userId ? colors.accentLight : colors.white;
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
                        <span style={{ minWidth: '20px', height: '20px', backgroundColor: colors.accent, borderRadius: '50%', fontSize: '11px', color: colors.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', fontWeight: 'bold' }}>
                          {entry.unreadCount}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{entry.lastMessage || 'Start a new conversation'}</p>
                    {entry.lastMessageTime && (
                      <p style={{ fontSize: '11px', color: colors.textSecondary }}>
                        {new Date(entry.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
        <div style={{ backgroundColor: colors.white, borderRadius: borderRadius.lg, border: `1px solid ${colors.gray200}`, display: 'flex', flexDirection: 'column', boxShadow: shadows.sm }}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: spacing.lg, borderBottom: `1px solid ${colors.gray200}` }}>
                <h2 style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text }}>{selectedUser.user?.name}</h2>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.textSecondary }}>{onlineUsers.includes(selectedUser.userId) ? 'Online' : 'Offline'}</p>
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
                    <div key={msg._id} style={{ display: 'flex', justifyContent: msg.senderType === 'tutor' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: spacing.sm }}>
                      {msg.senderType !== 'tutor' && (
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
                          {selectedUser?.user?.avatar ? (
                            <img 
                              src={selectedUser.user.avatar.startsWith('http') ? selectedUser.user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${selectedUser.user.avatar}`} 
                              alt="avatar" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: ${typography.fontSize.lg}; fontWeight: bold; color: ${colors.text}">${selectedUser?.user?.name?.charAt(0).toUpperCase()}</span>`; }}
                            />
                          ) : (
                            <span style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.text }}>
                              {selectedUser?.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '70%',
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: borderRadius.md,
                        backgroundColor: msg.senderType === 'tutor' ? colors.accent : colors.bgSecondary,
                        color: msg.senderType === 'tutor' ? colors.white : colors.text,
                        boxShadow: shadows.sm,
                        wordWrap: 'break-word'
                      }}>
                        {msg.senderType !== 'tutor' && (
                          <p style={{ fontSize: typography.fontSize.xs, fontWeight: 'semibold', marginBottom: spacing.xs, opacity: 0.8 }}>
                            {selectedUser?.user?.name}
                          </p>
                        )}
                        <p style={{ fontSize: typography.fontSize.sm, lineHeight: '1.5' }}>{msg.content}</p>
                        <p style={{ fontSize: typography.fontSize.xs, opacity: 0.7, marginTop: spacing.xs, textAlign: 'right' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.senderType === 'tutor' && (
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
                          {user?.profileImage || user?.avatar ? (
                            <img 
                              src={(user?.profileImage || user?.avatar)?.startsWith('http') ? (user?.profileImage || user?.avatar) : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${user?.profileImage || user?.avatar}`} 
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
                      {selectedUser?.user?.avatar ? (
                        <img 
                          src={selectedUser.user.avatar.startsWith('http') ? selectedUser.user.avatar : `${process.env.REACT_APP_API_URL?.replace('/api', '')}${selectedUser.user.avatar}`} 
                          alt="avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span style="fontSize: ${typography.fontSize.lg}; fontWeight: bold; color: ${colors.text}">${selectedUser?.user?.name?.charAt(0).toUpperCase()}</span>`; }}
                        />
                      ) : (
                        <span style={{ fontSize: typography.fontSize.lg, fontWeight: 'bold', color: colors.text }}>
                          {selectedUser?.user?.name?.charAt(0).toUpperCase()}
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
              <form onSubmit={handleSendMessage} style={{ padding: spacing.lg, borderTop: `1px solid ${colors.gray200}` }}>
                <div style={{ display: 'flex', gap: spacing.sm }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: colors.bgSecondary,
                      border: `1px solid ${colors.gray300}`,
                      borderRadius: borderRadius.md,
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{
                      padding: `${spacing.sm} ${spacing.lg}`,
                      backgroundColor: colors.accent,
                      color: colors.white,
                      fontWeight: typography.fontWeight.medium,
                      borderRadius: borderRadius.md,
                      border: 'none',
                      cursor: !newMessage.trim() ? 'not-allowed' : 'pointer',
                      opacity: !newMessage.trim() ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textSecondary }}>
              Select a student to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorMessages;
