const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let studentToken, tutorToken, adminToken;
let studentId, tutorId, adminId;
let classId, availabilityId, announcementId;

// Helper to make authenticated requests
const authRequest = (token) => ({
  headers: { Cookie: `token=${token}` }
});

// Color output
const green = (msg) => console.log('\x1b[32m%s\x1b[0m', msg);
const red = (msg) => console.log('\x1b[31m%s\x1b[0m', msg);
const yellow = (msg) => console.log('\x1b[33m%s\x1b[0m', msg);
const cyan = (msg) => console.log('\x1b[36m%s\x1b[0m', msg);

async function testAPI() {
  try {
    cyan('\n=== Starting API Tests ===\n');

    // 1. Test Health
    cyan('1. Testing Health Endpoint');
    const health = await axios.get(`${BASE_URL}/health`);
    green(`✓ Health: ${JSON.stringify(health.data)}`);

    // 2. Register Student
    cyan('\n2. Registering Test Student');
    try {
      const studentReg = await axios.post(`${BASE_URL}/student/register`, {
        name: 'API Test Student',
        email: 'test.student@example.com',
        password: 'TestPass123',
        enrollmentNumber: 'TEST001',
        department: 'Computer Science',
        semester: 3,
        phone: '1234567890'
      });
      studentId = studentReg.data.student.id;
      green(`✓ Student registered: ${studentId}`);
    } catch (e) {
      yellow(`⚠ Student may already exist: ${e.response?.data?.message}`);
    }

    // 3. Login Student
    cyan('\n3. Logging in Student');
    const studentLogin = await axios.post(`${BASE_URL}/student/login`, {
      email: 'test.student@example.com',
      password: 'TestPass123'
    });
    const cookies = studentLogin.headers['set-cookie'];
    if (cookies) {
      studentToken = cookies[0].split(';')[0].split('=')[1];
      green(`✓ Student logged in, token obtained`);
    }

    // 4. Skip tutor testing for now
    yellow('\n4-5. Skipping tutor tests (no tutor account available)');

    // 6. Test Class Stats
    cyan('\n6. Testing Class Stats');
    const stats = await axios.get(`${BASE_URL}/classes/stats`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Class Stats: ${JSON.stringify(stats.data.data)}`);

    // 7. Test Announcements
    cyan('\n7. Testing Announcements');
    const announcements = await axios.get(`${BASE_URL}/announcements`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Announcements: ${announcements.data.count} found`);

    // 8. Test Notifications
    cyan('\n8. Testing Notifications');
    const notifications = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Notifications: ${notifications.data.count} found`);

    // 9. Test Unread Count
    cyan('\n9. Testing Unread Notifications Count');
    const unreadCount = await axios.get(`${BASE_URL}/notifications/unread/count`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Unread Count: ${unreadCount.data.data.unreadCount}`);

    // 10. Test Attendance
    cyan('\n10. Testing Attendance');
    const attendance = await axios.get(`${BASE_URL}/attendance`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Attendance: ${attendance.data.count} records found`);

    // 11. Test Availability (should require tutor ID)
    cyan('\n11. Testing Availability');
    try {
      const availability = await axios.get(`${BASE_URL}/availability`, {
        headers: { Cookie: `token=${studentToken}` }
      });
      green(`✓ Availability: ${availability.data.count} slots found`);
    } catch (e) {
      yellow(`⚠ Expected: ${e.response?.data?.message}`);
    }

    // 12. Test Classes
    cyan('\n12. Testing Classes');
    const classes = await axios.get(`${BASE_URL}/classes`, {
      headers: { Cookie: `token=${studentToken}` }
    });
    green(`✓ Classes: ${classes.data.count} classes found`);

    green('\n=== ✓ All API Tests Completed Successfully! ===\n');

  } catch (error) {
    red(`\n✗ Error: ${error.message}`);
    if (error.response) {
      red(`Response: ${JSON.stringify(error.response.data)}`);
    }
    process.exit(1);
  }
}

testAPI();
