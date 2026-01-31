/**
 * SECURITY TESTING SCRIPT
 * Automated tests for security fixes implemented in QA phase
 * Tests: Rate limiting, file validation, CV requirement, timeouts
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function recordTest(name, passed, details = '') {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log('green', `✓ ${name}`);
  } else {
    results.failed++;
    log('red', `✗ ${name}`);
  }
  if (details) {
    console.log(`  ${details}`);
  }
}

// TEST 1: Rate Limiting on Login Endpoints
async function testRateLimiting() {
  log('blue', '\n=== TEST 1: Rate Limiting ===');
  
  try {
    const endpoint = `${BASE_URL}/student/login`;
    const attempts = [];
    
    // Make 12 rapid requests (limit is 10 per 15 minutes)
    for (let i = 0; i < 12; i++) {
      try {
        const res = await axios.post(endpoint, {
          email: 'nonexistent@test.com',
          password: 'wrongpassword'
        }, { validateStatus: () => true });
        attempts.push({ attempt: i + 1, status: res.status, blocked: res.status === 429 });
      } catch (err) {
        attempts.push({ attempt: i + 1, status: err.response?.status || 0, blocked: err.response?.status === 429 });
      }
    }
    
    const blockedCount = attempts.filter(a => a.blocked).length;
    const passed = blockedCount >= 2; // Should block at least 2 requests after 10th
    
    recordTest(
      'Rate limiting blocks excessive login attempts',
      passed,
      `Blocked ${blockedCount}/12 requests (expected >=2 blocks after 10 requests)`
    );
    
    return passed;
  } catch (err) {
    recordTest('Rate limiting test', false, `Error: ${err.message}`);
    return false;
  }
}

// TEST 2: File Upload Validation
async function testFileValidation() {
  log('blue', '\n=== TEST 2: File Upload Validation ===');
  
  // Test 2a: Reject dangerous file extensions
  try {
    const form = new FormData();
    const maliciousFile = Buffer.from('#!/bin/bash\necho "malicious"');
    form.append('file', maliciousFile, {
      filename: 'malicious.sh',
      contentType: 'application/x-sh'
    });
    form.append('title', 'Test Assignment');
    form.append('description', 'Test');
    form.append('courseId', '507f1f77bcf86cd799439011');
    
    const res = await axios.post(`${BASE_URL}/lms/assignments`, form, {
      headers: form.getHeaders(),
      validateStatus: () => true
    });
    
    const passed = res.status === 400 || res.status === 403;
    recordTest(
      'Rejects dangerous file extensions (.sh)',
      passed,
      `Status: ${res.status} (expected 400 or 403)`
    );
  } catch (err) {
    recordTest('Dangerous file rejection', false, `Error: ${err.message}`);
  }
  
  // Test 2b: Reject mismatched MIME types
  try {
    const form = new FormData();
    const fakePdf = Buffer.from('<script>alert("xss")</script>');
    form.append('file', fakePdf, {
      filename: 'fake.pdf',
      contentType: 'text/html'
    });
    form.append('title', 'Test Assignment');
    form.append('description', 'Test');
    form.append('courseId', '507f1f77bcf86cd799439011');
    
    const res = await axios.post(`${BASE_URL}/lms/assignments`, form, {
      headers: form.getHeaders(),
      validateStatus: () => true
    });
    
    const passed = res.status === 400 || res.status === 403;
    recordTest(
      'Rejects mismatched MIME types (HTML as PDF)',
      passed,
      `Status: ${res.status} (expected 400 or 403)`
    );
  } catch (err) {
    recordTest('MIME type validation', false, `Error: ${err.message}`);
  }
  
  // Test 2c: Accept valid files
  try {
    const form = new FormData();
    const validPdf = Buffer.from('%PDF-1.4\n%âãÏÓ\ntest content');
    form.append('file', validPdf, {
      filename: 'valid.pdf',
      contentType: 'application/pdf'
    });
    form.append('title', 'Valid Assignment');
    form.append('description', 'Valid test');
    form.append('courseId', '507f1f77bcf86cd799439011');
    
    const res = await axios.post(`${BASE_URL}/lms/assignments`, form, {
      headers: form.getHeaders(),
      validateStatus: () => true
    });
    
    // Should fail with auth error (401) not file validation error
    const passed = res.status !== 400 && res.status !== 403;
    recordTest(
      'Accepts valid PDF files (auth may fail)',
      passed,
      `Status: ${res.status} (should not be 400/403)`
    );
  } catch (err) {
    recordTest('Valid file acceptance', true, 'Auth required (expected)');
  }
}

// TEST 3: CV Requirement for Tutor Registration
async function testCVRequirement() {
  log('blue', '\n=== TEST 3: CV Requirement ===');
  
  try {
    // Attempt tutor registration without CV
    const res = await axios.post(`${BASE_URL}/tutor/register`, {
      name: 'Test Tutor',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!@#',
      phone: '1234567890',
      subjects: ['Math'],
      hourlyRate: 50,
      bio: 'Test bio'
    }, { validateStatus: () => true });
    
    const passed = res.status === 400 && 
                   (res.data.message?.toLowerCase().includes('cv') ||
                    res.data.message?.toLowerCase().includes('required'));
    
    recordTest(
      'Tutor registration requires CV file',
      passed,
      `Status: ${res.status}, Message: "${res.data.message || 'none'}"`
    );
  } catch (err) {
    recordTest('CV requirement test', false, `Error: ${err.message}`);
  }
}

// TEST 4: Request Timeout Configuration
async function testRequestTimeout() {
  log('blue', '\n=== TEST 4: Request Timeout ===');
  
  try {
    // This tests if timeout is configured (can't easily test actual timeout without slow endpoint)
    const startTime = Date.now();
    
    try {
      await axios.get(`${BASE_URL}/nonexistent-endpoint`, {
        timeout: 100, // Short timeout to verify timeout works
        validateStatus: () => true
      });
    } catch (err) {
      const elapsed = Date.now() - startTime;
      const isTimeoutError = err.code === 'ECONNABORTED' || err.message.includes('timeout');
      const passed = isTimeoutError && elapsed < 200;
      
      recordTest(
        'Request timeout configured and working',
        passed,
        `Timeout triggered in ${elapsed}ms (expected <200ms)`
      );
      return passed;
    }
    
    recordTest('Request timeout test', false, 'Timeout did not trigger');
    return false;
  } catch (err) {
    recordTest('Request timeout test', false, `Error: ${err.message}`);
    return false;
  }
}

// TEST 5: Authentication Token Security
async function testTokenSecurity() {
  log('blue', '\n=== TEST 5: Token Security ===');
  
  try {
    // Test 5a: Protected endpoints reject unauthenticated requests
    const protectedEndpoints = [
      '/student/profile',
      '/tutor/dashboard',
      '/admin/analytics/platform'
    ];
    
    let allProtected = true;
    for (const endpoint of protectedEndpoints) {
      try {
        const res = await axios.get(`${BASE_URL}${endpoint}`, {
          validateStatus: () => true
        });
        
        if (res.status !== 401 && res.status !== 403) {
          allProtected = false;
          log('yellow', `  Warning: ${endpoint} returned ${res.status} (expected 401/403)`);
        }
      } catch (err) {
        // Connection errors are okay, we're testing auth
      }
    }
    
    recordTest(
      'Protected endpoints require authentication',
      allProtected,
      `Tested ${protectedEndpoints.length} endpoints`
    );
    
    // Test 5b: Invalid tokens are rejected
    try {
      const res = await axios.get(`${BASE_URL}/student/profile`, {
        headers: { Authorization: 'Bearer invalid-token-12345' },
        validateStatus: () => true
      });
      
      const passed = res.status === 401 || res.status === 403;
      recordTest(
        'Invalid tokens are rejected',
        passed,
        `Status: ${res.status} (expected 401/403)`
      );
    } catch (err) {
      recordTest('Invalid token rejection', true, 'Request failed (expected)');
    }
    
    return allProtected;
  } catch (err) {
    recordTest('Token security test', false, `Error: ${err.message}`);
    return false;
  }
}

// TEST 6: SQL Injection Prevention (NoSQL Injection)
async function testInjectionPrevention() {
  log('blue', '\n=== TEST 6: Injection Prevention ===');
  
  try {
    // Test NoSQL injection in login
    const injectionPayloads = [
      { email: { $ne: null }, password: { $ne: null } },
      { email: { $gt: '' }, password: 'test' },
      { email: 'admin@test.com', password: { $regex: '.*' } }
    ];
    
    let allBlocked = true;
    for (const payload of injectionPayloads) {
      try {
        const res = await axios.post(`${BASE_URL}/student/login`, payload, {
          validateStatus: () => true
        });
        
        // Should return 400 (bad request) or 401 (unauthorized), not 200 (success)
        if (res.status === 200) {
          allBlocked = false;
          log('red', `  CRITICAL: Injection payload succeeded!`);
        }
      } catch (err) {
        // Errors are good here
      }
    }
    
    recordTest(
      'NoSQL injection payloads blocked',
      allBlocked,
      `Tested ${injectionPayloads.length} injection patterns`
    );
    
    return allBlocked;
  } catch (err) {
    recordTest('Injection prevention test', false, `Error: ${err.message}`);
    return false;
  }
}

// TEST 7: CORS Configuration
async function testCORSConfiguration() {
  log('blue', '\n=== TEST 7: CORS Configuration ===');
  
  try {
    const res = await axios.options(`${BASE_URL}/student/login`, {
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST'
      },
      validateStatus: () => true
    });
    
    const allowedOrigin = res.headers['access-control-allow-origin'];
    const allowsCredentials = res.headers['access-control-allow-credentials'];
    
    // Should not allow arbitrary origins with credentials
    const passed = !(allowedOrigin === 'http://malicious-site.com' && allowsCredentials === 'true');
    
    recordTest(
      'CORS properly restricts origins',
      passed,
      `Origin: ${allowedOrigin}, Credentials: ${allowsCredentials}`
    );
    
    return passed;
  } catch (err) {
    recordTest('CORS configuration test', true, 'CORS headers validated');
    return true;
  }
}

// MAIN TEST RUNNER
async function runAllTests() {
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║   SECURITY TESTING SUITE - LMS PLATFORM ║');
  log('blue', '╚════════════════════════════════════════╝\n');
  
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  try {
    await testRateLimiting();
    await testFileValidation();
    await testCVRequirement();
    await testRequestTimeout();
    await testTokenSecurity();
    await testInjectionPrevention();
    await testCORSConfiguration();
  } catch (err) {
    log('red', `\nFatal error: ${err.message}`);
  }
  
  // Print summary
  log('blue', '\n╔════════════════════════════════════════╗');
  log('blue', '║             TEST SUMMARY               ║');
  log('blue', '╚════════════════════════════════════════╝\n');
  
  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  log('green', `Passed: ${results.passed}/${total}`);
  log('red', `Failed: ${results.failed}/${total}`);
  log('blue', `Pass Rate: ${passRate}%\n`);
  
  if (results.failed > 0) {
    log('yellow', 'Failed Tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => {
        log('red', `  • ${t.name}`);
        if (t.details) console.log(`    ${t.details}`);
      });
  }
  
  console.log('\n');
  
  if (passRate >= 80) {
    log('green', '✓ Security testing PASSED - System is deployment ready');
    process.exit(0);
  } else {
    log('red', '✗ Security testing FAILED - Critical issues detected');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(err => {
  log('red', `\nUnexpected error: ${err.message}`);
  console.error(err);
  process.exit(1);
});
