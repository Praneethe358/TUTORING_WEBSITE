const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

let tokens = {};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get(`${API_BASE}/health`);
    if (response.data.status === 'ok') {
      log.success('Health check passed');
      return true;
    }
  } catch (error) {
    log.error(`Health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Student Login
async function testStudentLogin() {
  try {
    const response = await axios.post(`${API_BASE}/student/login`, {
      email: 'student@demo.com',
      password: 'Student123!'
    });
    tokens.student = response.data.token;
    log.success('Student login successful');
    return true;
  } catch (error) {
    log.error(`Student login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 3: Tutor Login
async function testTutorLogin() {
  try {
    const response = await axios.post(`${API_BASE}/tutor/login`, {
      email: 'tutor@demo.com',
      password: 'Tutor123!'
    });
    tokens.tutor = response.data.token;
    log.success('Tutor login successful');
    return true;
  } catch (error) {
    log.error(`Tutor login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 4: Admin Login
async function testAdminLogin() {
  try {
    const response = await axios.post(`${API_BASE}/admin/login`, {
      email: 'admin@demo.com',
      password: 'Admin123!'
    });
    tokens.admin = response.data.token;
    log.success('Admin login successful');
    return true;
  } catch (error) {
    log.error(`Admin login failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 5: Create LMS Course
async function testCreateCourse() {
  try {
    const response = await axios.post(`${API_BASE}/lms/courses`, {
      title: 'Introduction to Calculus',
      description: 'Learn the fundamentals of calculus including limits, derivatives, and integrals.',
      category: 'Mathematics',
      level: 'intermediate',
      duration: 40,
      prerequisites: ['Algebra', 'Trigonometry'],
      learningOutcomes: ['Understand limits', 'Calculate derivatives', 'Solve integrals']
    }, {
      headers: { Authorization: `Bearer ${tokens.tutor}` }
    });
    tokens.courseId = response.data.data._id;
    log.success('Course created successfully');
    return true;
  } catch (error) {
    log.error(`Course creation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 6: Get Tutor Courses
async function testGetTutorCourses() {
  try {
    const response = await axios.get(`${API_BASE}/lms/courses?instructor=current`, {
      headers: { Authorization: `Bearer ${tokens.tutor}` }
    });
    log.success(`Fetched ${response.data.data.length} courses for tutor`);
    return true;
  } catch (error) {
    log.error(`Fetch tutor courses failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 7: Update Course Status (Publish)
async function testPublishCourse() {
  try {
    const response = await axios.put(`${API_BASE}/lms/courses/${tokens.courseId}/toggle-publish`, {}, {
      headers: { Authorization: `Bearer ${tokens.tutor}` }
    });
    log.success(`Course ${response.data.data.status === 'published' ? 'published' : 'unpublished'}`);
    return true;
  } catch (error) {
    log.error(`Publish course failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 8: Get All Published Courses (Student View)
async function testGetPublishedCourses() {
  try {
    const response = await axios.get(`${API_BASE}/lms/courses?status=published`);
    log.success(`Fetched ${response.data.data.length} published courses`);
    return true;
  } catch (error) {
    log.error(`Fetch published courses failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 9: Student Profile
async function testStudentProfile() {
  try {
    const response = await axios.get(`${API_BASE}/student/profile`, {
      headers: { Authorization: `Bearer ${tokens.student}` }
    });
    log.success('Student profile fetched successfully');
    return true;
  } catch (error) {
    log.error(`Fetch student profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 10: Tutor Profile
async function testTutorProfile() {
  try {
    const response = await axios.get(`${API_BASE}/tutor/profile`, {
      headers: { Authorization: `Bearer ${tokens.tutor}` }
    });
    log.success('Tutor profile fetched successfully');
    return true;
  } catch (error) {
    log.error(`Fetch tutor profile failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 11: Get Course by ID
async function testGetCourseById() {
  try {
    const response = await axios.get(`${API_BASE}/lms/courses/${tokens.courseId}`);
    log.success('Course details fetched successfully');
    return true;
  } catch (error) {
    log.error(`Fetch course by ID failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test 12: Update Course
async function testUpdateCourse() {
  try {
    const response = await axios.put(`${API_BASE}/lms/courses/${tokens.courseId}`, {
      description: 'Updated description: Master calculus with practical examples and exercises.'
    }, {
      headers: { Authorization: `Bearer ${tokens.tutor}` }
    });
    log.success('Course updated successfully');
    return true;
  } catch (error) {
    log.error(`Update course failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log.section('🧪 TESTING ALL FEATURES');
  
  const results = {
    passed: 0,
    failed: 0
  };

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Student Login', fn: testStudentLogin },
    { name: 'Tutor Login', fn: testTutorLogin },
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Create LMS Course', fn: testCreateCourse },
    { name: 'Get Tutor Courses', fn: testGetTutorCourses },
    { name: 'Publish Course', fn: testPublishCourse },
    { name: 'Get Published Courses', fn: testGetPublishedCourses },
    { name: 'Student Profile', fn: testStudentProfile },
    { name: 'Tutor Profile', fn: testTutorProfile },
    { name: 'Get Course by ID', fn: testGetCourseById },
    { name: 'Update Course', fn: testUpdateCourse }
  ];

  for (const test of tests) {
    log.info(`Testing: ${test.name}`);
    const result = await test.fn();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  log.section('📊 TEST RESULTS');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  log.success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    log.error(`Failed: ${results.failed}`);
  } else {
    log.success('All tests passed! 🎉');
  }
}

runAllTests().then(() => {
  process.exit(0);
}).catch(error => {
  log.error(`Test runner error: ${error.message}`);
  process.exit(1);
});
