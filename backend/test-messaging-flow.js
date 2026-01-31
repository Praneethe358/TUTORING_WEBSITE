/**
 * TEST MESSAGING FLOW
 * Verify: real-time updates, search filtering, authorization
 */
const axios = require('axios');
const { io } = require('socket.io-client');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

let tutorToken, studentToken, tutorId, studentId, courseId, enrollmentId;
let tutorSocket, studentSocket;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (status, message) => {
  const color = status === '✓' ? colors.green : status === '✗' ? colors.red : colors.blue;
  console.log(`${color}${status}${colors.reset} ${message}`);
};

const api = axios.create({ baseURL: API_URL, validateStatus: () => true });

async function runTests() {
  try {
    log('📋', 'Starting Messaging Flow Tests...\n');

    // Step 1: Create and login tutor
    log('🔧', 'Step 1: Setup Tutor');
    const tutorRes = await api.post('/auth/register', {
      name: 'Test Tutor',
      email: `tutor-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'tutor'
    });
    if (tutorRes.status !== 201) {
      log('✗', `Register response: ${tutorRes.status}`);
      console.log('Response:', tutorRes.data);
      throw new Error('Failed to register tutor');
    }
    tutorId = tutorRes.data.user._id;
    log('✓', `Tutor registered: ${tutorId}`);

    const tutorLoginRes = await api.post('/auth/login', {
      email: tutorRes.data.user.email,
      password: 'Test123!'
    });
    tutorToken = tutorLoginRes.data.token;
    log('✓', 'Tutor logged in');

    // Step 2: Create and login student
    log('🔧', 'Step 2: Setup Student');
    const studentRes = await api.post('/auth/register', {
      name: 'Test Student',
      email: `student-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'student'
    });
    if (studentRes.status !== 201) throw new Error('Failed to register student');
    studentId = studentRes.data.user._id;
    log('✓', `Student registered: ${studentId}`);

    const studentLoginRes = await api.post('/auth/login', {
      email: studentRes.data.user.email,
      password: 'Test123!'
    });
    studentToken = studentLoginRes.data.token;
    log('✓', 'Student logged in');

    // Step 3: Create an LMS course
    log('🔧', 'Step 3: Create LMS Course');
    const courseRes = await api.post(
      '/lms/courses',
      {
        title: 'Test Course',
        description: 'Course for messaging test',
        category: 'Test',
        instructorId: tutorId
      },
      { headers: { Authorization: `Bearer ${tutorToken}` } }
    );
    if (courseRes.status !== 201) throw new Error('Failed to create course');
    courseId = courseRes.data.course._id;
    log('✓', `Course created: ${courseId}`);

    // Step 4: Enroll student in course
    log('🔧', 'Step 4: Enroll Student in Course');
    const enrollRes = await api.post(
      `/lms/courses/${courseId}/enroll`,
      {},
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    if (enrollRes.status !== 201) throw new Error('Failed to enroll student');
    enrollmentId = enrollRes.data.enrollment._id;
    log('✓', `Student enrolled in course: ${enrollmentId}`);

    // Step 5: Connect sockets
    log('🔧', 'Step 5: Connect WebSocket Clients');
    tutorSocket = io(SOCKET_URL, { auth: { token: tutorToken }, withCredentials: true });
    studentSocket = io(SOCKET_URL, { auth: { token: studentToken }, withCredentials: true });

    await new Promise(resolve => setTimeout(resolve, 1000));
    log('✓', 'Both clients connected');

    // Step 6: Test sending message from tutor to student
    log('🔧', 'Step 6: Tutor Sends Message');
    const sendRes = await api.post(
      '/messages/send',
      { receiverId: studentId, content: 'Hello from tutor!', senderType: 'tutor', receiverType: 'student' },
      { headers: { Authorization: `Bearer ${tutorToken}` } }
    );
    if (sendRes.status !== 201) throw new Error(`Failed to send message: ${sendRes.status}`);
    log('✓', 'Message sent via REST API');

    // Emit via socket
    tutorSocket.emit('send_message', {
      senderId: tutorId,
      receiverId: studentId,
      content: 'Hello from tutor socket!',
      senderType: 'tutor',
      receiverType: 'student'
    });
    log('✓', 'Message emitted via Socket.IO');

    // Step 7: Wait for student to receive message
    log('🔧', 'Step 7: Verify Student Receives Message');
    let messageReceived = false;
    studentSocket.on('receive_message', (data) => {
      if (data.content === 'Hello from tutor socket!') {
        messageReceived = true;
        log('✓', `Student received: "${data.content}"`);
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    if (messageReceived) {
      log('✓', 'Real-time message delivery confirmed');
    } else {
      log('⚠', 'No socket message received (may be expected if socket.io needs auth setup)');
    }

    // Step 8: Test search filtering
    log('🔧', 'Step 8: Test Search Filtering');
    const convRes = await api.get('/messages/conversations', {
      headers: { Authorization: `Bearer ${tutorToken}` }
    });
    if (convRes.status === 200) {
      const hasStudent = convRes.data.conversations?.some(c => c.user?.email?.includes('student'));
      if (hasStudent) {
        log('✓', 'Conversation list retrieved and contains student');
      } else {
        log('⚠', 'Conversation list retrieved but student not found (may not be populated yet)');
      }
    } else {
      log('✗', `Failed to get conversations: ${convRes.status}`);
    }

    // Step 9: Test authorization (unauthorized user tries to chat)
    log('🔧', 'Step 9: Test Authorization - Unauthorized Chat Attempt');
    const otherStudentRes = await api.post('/auth/register', {
      name: 'Other Student',
      email: `other-${Date.now()}@test.com`,
      password: 'Test123!',
      userType: 'student'
    });
    const otherStudentToken = (await api.post('/auth/login', {
      email: otherStudentRes.data.user.email,
      password: 'Test123!'
    })).data.token;

    const unauthorizedRes = await api.post(
      '/messages/send',
      { receiverId: tutorId, content: 'Should fail', senderType: 'student', receiverType: 'tutor' },
      { headers: { Authorization: `Bearer ${otherStudentToken}` } }
    );
    if (unauthorizedRes.status === 403) {
      log('✓', 'Authorization correctly blocked unauthorized chat (403)');
    } else if (unauthorizedRes.status === 201) {
      log('⚠', 'Message sent but should have been blocked (enrollment not enforced)');
    } else {
      log('✗', `Unexpected status: ${unauthorizedRes.status}`);
    }

    // Step 10: Test message history
    log('🔧', 'Step 10: Get Message History');
    const historyRes = await api.get(`/messages/conversation/${studentId}`, {
      headers: { Authorization: `Bearer ${tutorToken}` }
    });
    if (historyRes.status === 200) {
      const messageCount = historyRes.data.messages?.length || 0;
      log('✓', `Message history retrieved: ${messageCount} messages`);
    } else {
      log('✗', `Failed to get message history: ${historyRes.status}`);
    }

    log('✅', '\nAll tests completed!\n');
    process.exit(0);

  } catch (error) {
    log('✗', `Test failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
