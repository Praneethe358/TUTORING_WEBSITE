require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const enforceHTTPS = require('./src/middleware/httpsMiddleware');
const studentRoutes = require('./src/routes/studentRoutes');
const tutorRoutes = require('./src/routes/tutorRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const materialRoutes = require('./src/routes/materialRoutes');
const classRoutes = require('./src/routes/classRoutes');
const availabilityRoutes = require('./src/routes/availabilityRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const sessionNoteRoutes = require('./src/routes/sessionNoteRoutes');
const avatarRoutes = require('./src/routes/avatarRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const lmsRoutes = require('./src/routes/lmsRoutes'); // LMS routes for course management
const studentLmsRoutes = require('./src/routes/studentLmsRoutes'); // Student LMS routes
const adminLmsRoutes = require('./src/routes/adminLmsRoutes'); // Admin LMS routes
const searchRoutes = require('./src/routes/searchRoutes');
const contactRoutes = require('./src/routes/contact'); // Contact form routes
const emailVerificationRoutes = require('./src/routes/emailVerificationRoutes'); // Email verification routes
const errorHandler = require('./src/middleware/errorHandler');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Basic rate limiting for auth and sensitive endpoints
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Socket.io setup
const io = socketIO(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', process.env.CLIENT_URL || 'http://localhost:3000'],
    credentials: true
  }
});

// expose io for other modules
const { setIO, setActiveUser, removeActiveUserBySocket, getActiveSocketId, getActiveUserIds } = require('./src/utils/socket');
setIO(io);

// Store active socket connections via util
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  socket.on('user_online', (userId) => {
    setActiveUser(userId, socket.id);
    io.emit('users_online', getActiveUserIds());
  });

  socket.on('disconnect', () => {
    removeActiveUserBySocket(socket.id);
    io.emit('users_online', getActiveUserIds());
  });

  socket.on('send_message', (data) => {
    const { senderId, receiverId, content, senderType, receiverType } = data;
    const receiverSocketId = getActiveSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId,
        senderType,
        content,
        timestamp: new Date()
      });
    }
    socket.emit('message_sent', { status: 'sent' });
  });

  socket.on('typing', (data) => {
    const { receiverId, senderName } = data;
    const receiverSocketId = getActiveSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { senderName });
    }
  });

  socket.on('stop_typing', (data) => {
    const { receiverId } = data;
    const receiverSocketId = getActiveSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_stopped_typing', {});
    }
  });
});

// Middleware
app.use(enforceHTTPS); // HTTPS enforcement in production

// Allow localhost variants for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Auth & sensitive endpoints rate limiting
app.use('/api/student/login', authLimiter);
app.use('/api/student/register', authLimiter);
app.use('/api/student/forgot-password', authLimiter);
app.use('/api/student/reset-password', authLimiter);
app.use('/api/tutor/login', authLimiter);
app.use('/api/tutor/register', authLimiter);
app.use('/api/tutor/forgot-password', authLimiter);
app.use('/api/tutor/reset-password', authLimiter);
app.use('/api/admin/login', authLimiter);

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/student', studentRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/session-notes', sessionNoteRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/lms', lmsRoutes); // LMS API routes
app.use('/api/lms/student', studentLmsRoutes); // Student LMS routes
app.use('/api/lms/admin', adminLmsRoutes); // Admin LMS routes
app.use('/api/search', searchRoutes);
app.use('/api/contact', contactRoutes); // Contact form routes
app.use('/api/email-verification', emailVerificationRoutes); // Email verification routes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tutoring';

// Start HTTP server regardless of DB connectivity to avoid connection refused
server.listen(PORT, () => {
  console.log(`WebSocket server ready`);
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB in background and report status
mongoose.connect(MONGO_URI).then(() => {
  console.log('Mongo connected');
}).catch(err => {
  console.error('Mongo connection error', err.message || err);
});
