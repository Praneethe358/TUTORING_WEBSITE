import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import DashboardLayout from '../components/DashboardLayout';
import TutorSidebar from '../components/TutorSidebar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const typingTimeout = React.useRef(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', { withCredentials: true });
    newSocket.on('connect', () => { console.log('Connected'); newSocket.emit('user_online', user.id); });
    newSocket.on('users_online', setOnlineUsers);
    newSocket.on('receive_message', (data) => { setMessages(prev => [...prev, { _id: Math.random(), sender: data.senderId, receiver: user.id, content: data.content, createdAt: data.timestamp, isRead: true, senderType: 'student' }]); });
    newSocket.on('user_typing', () => setIsTyping(true));
    newSocket.on('user_stopped_typing', () => setIsTyping(false));
    setSocket(newSocket);
    return () => newSocket.close();
  }, [user.id]);

  useEffect(() => {
    api.get('/messages/conversations').then(res => setConversations(res.data.conversations || [])).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedUser) {
      api.get(`/messages/conversation/${selectedUser._id || selectedUser.userId}`).then(res => setMessages(res.data.messages || [])).catch(err => console.error(err));
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
      setNewMessage('');
      socket?.emit('stop_typing', { receiverId });
    } catch (error) { console.error(error); }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (selectedUser) {
      socket?.emit('typing', { receiverId: selectedUser._id || selectedUser.userId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => socket?.emit('stop_typing', { receiverId: selectedUser._id || selectedUser.userId }), 3000);
    }
  };

  return (
    <DashboardLayout sidebar={TutorSidebar}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-slate-400 mt-1">Chat with your students</p>
        <p className="text-slate-400 mt-1">Real-time chat with students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-slate-800 rounded-xl border border-slate-700 overflow-y-auto">
          <div className="p-4 border-b border-slate-700">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {loading ? (
            <p className="p-4 text-slate-400">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-slate-400">No conversations yet</p>
          ) : (
            <div className="divide-y divide-slate-700">
              {conversations
                .filter(conv => conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(conv => {
                const isOnline = onlineUsers.includes(conv.userId);
                return (
              <button
                key={conv.userId}
                onClick={() => setSelectedUser(conv)}
                className={`w-full p-4 text-left hover:bg-slate-700/50 transition ${
                  selectedUser?.userId === conv.userId ? 'bg-slate-700' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{conv.user?.name}</h3>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-indigo-600 rounded-full text-xs text-white flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 truncate">{conv.lastMessage}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(conv.lastMessageTime).toLocaleDateString()}
                </p>
              </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold text-white">{selectedUser.user?.name}</h2>
                <p className="text-sm text-slate-400">{onlineUsers.includes(selectedUser.userId) ? 'Online' : 'Offline'}</p>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">No messages yet. Start the conversation!</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg._id} className={`flex ${msg.senderType === 'tutor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.senderType === 'tutor' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-lg bg-slate-700 text-slate-100">
                      <p className="text-sm text-slate-400 italic">Student is typing...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition disabled:opacity-50">
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              Select a student to start chatting
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TutorMessages;
