# 🧪 BACKEND API TEST SUITE

## Quick Reference Guide for API Testing

This document provides **ready-to-use test commands** for all backend APIs using `curl`, Postman, or REST clients.

---

## 🔧 Setup

### Environment Variables
```bash
# Local Development
export API_URL="http://localhost:5000/api"
export TOKEN="your-jwt-token-here"

# Or use .env file
API_URL=http://localhost:5000/api
```

### Get Auth Token
After login, extract token from:
- Browser: DevTools → Application → Cookies → `token`
- Response: Look for `token` field in login response

---

## 👤 STUDENT APIs

### 1. Register Student
```bash
curl -X POST $API_URL/student/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "phone": "1234567890",
    "course": "Mathematics",
    "password": "Test@1234"
  }' \
  -c cookies.txt

# Expected: 201 Created with JWT token
# Test Cases:
# ❌ Duplicate email → 400 Error
# ❌ Weak password → 400 Validation errors
# ❌ Missing fields → 400 Validation errors
```

### 2. Login Student
```bash
curl -X POST $API_URL/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "Test@1234"
  }' \
  -c cookies.txt

# Expected: 200 OK with token + cookie
# Test Cases:
# ❌ Wrong password → 400 Invalid credentials
# ❌ Non-existent email → 400 Invalid credentials
# ❌ Empty fields → 400 Validation error
```

### 3. Get Student Profile
```bash
curl -X GET $API_URL/student/profile \
  -b cookies.txt

# Expected: 200 OK with student object
# Test Cases:
# ❌ No cookie/token → 401 Unauthorized
# ❌ Invalid token → 401 Unauthorized
# ❌ Expired token → 401 Unauthorized
```

### 4. Update Student Profile
```bash
curl -X PUT $API_URL/student/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated Name",
    "phone": "9876543210"
  }'

# Expected: 200 OK with updated profile
# Test Cases:
# ✅ Update name only
# ✅ Update phone only
# ❌ Try to update email (should fail)
# ❌ Invalid phone format
```

### 5. Change Password
```bash
curl -X POST $API_URL/student/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "oldPassword": "Test@1234",
    "newPassword": "NewPass@5678"
  }'

# Expected: 200 OK
# Test Cases:
# ❌ Wrong old password → 400 Error
# ❌ Weak new password → 400 Validation error
# ❌ Same as old password → Should allow (no check)
```

### 6. Forgot Password
```bash
curl -X POST $API_URL/student/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com"
  }'

# Expected: 200 OK (always, for security)
# Check server console for reset token in dev mode
```

### 7. Reset Password
```bash
# Get token from email or server console
curl -X POST $API_URL/student/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-reset-token-here",
    "password": "NewPass@9012"
  }'

# Expected: 200 OK
# Test Cases:
# ❌ Invalid token → 400 Error
# ❌ Expired token → 400 Error
# ❌ Used token → 400 Error
```

### 8. Logout
```bash
curl -X POST $API_URL/student/logout \
  -b cookies.txt

# Expected: 200 OK, cookie cleared
```

### 9. Get Bookings
```bash
curl -X GET $API_URL/student/bookings \
  -b cookies.txt

# Expected: 200 OK with array of bookings
```

---

## 👨‍🏫 TUTOR APIs

### 1. Register Tutor (with CV)
```bash
curl -X POST $API_URL/tutor/register \
  -F "name=Test Tutor" \
  -F "email=tutor@test.com" \
  -F "phone=1234567890" \
  -F "password=Tutor@1234" \
  -F "qualifications=PhD in Mathematics" \
  -F "subjects[]=Mathematics" \
  -F "subjects[]=Physics" \
  -F "experienceYears=5" \
  -F "cv=@/path/to/cv.pdf" \
  -c cookies.txt

# Expected: 201 Created
# Test Cases:
# ⚠️ Without CV → Currently succeeds (BUG)
# ❌ Non-PDF file → Should validate
# ❌ Large file (>10MB) → Should reject
```

### 2. Login Tutor
```bash
curl -X POST $API_URL/tutor/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tutor@test.com",
    "password": "Tutor@1234"
  }' \
  -c cookies.txt

# Expected: 200 OK
# Note: Can login even if status='pending'
```

### 3. Get Tutor Profile
```bash
curl -X GET $API_URL/tutor/profile \
  -b cookies.txt

# Expected: 200 OK with tutor object including status
```

### 4. Update Tutor Profile
```bash
curl -X PUT $API_URL/tutor/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Updated Tutor Name",
    "qualifications": "PhD + 10 years exp",
    "subjects": ["Math", "Science", "English"]
  }'

# Expected: 200 OK
```

### 5. Update Availability
```bash
curl -X POST $API_URL/tutor/availability \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "availability": [
      {
        "day": "Monday",
        "slots": ["09:00-10:00", "10:00-11:00", "14:00-15:00"]
      },
      {
        "day": "Tuesday",
        "slots": ["09:00-10:00", "11:00-12:00"]
      }
    ]
  }'

# Expected: 200 OK
# Test Cases:
# ⚠️ Overlapping slots → Currently not validated
# ⚠️ Invalid time format → Should validate
```

### 6. Create Course (Legacy)
```bash
curl -X POST $API_URL/tutor/courses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Advanced Mathematics",
    "description": "Learn calculus and algebra",
    "duration": "3 months",
    "price": 5000
  }'

# Expected: 201 Created
```

### 7. Get My Courses
```bash
curl -X GET $API_URL/tutor/courses \
  -b cookies.txt

# Expected: 200 OK with array of courses
```

### 8. Get Upcoming Bookings
```bash
curl -X GET $API_URL/tutor/bookings \
  -b cookies.txt

# Expected: 200 OK with array
```

### 9. Get All Students
```bash
curl -X GET $API_URL/tutor/all-students \
  -b cookies.txt

# Expected: 200 OK
# ⚠️ Issue: Exposes student emails
```

### 10. Upload Profile Image
```bash
curl -X POST $API_URL/tutor/upload-profile-image \
  -b cookies.txt \
  -F "profileImage=@/path/to/photo.jpg"

# Expected: 200 OK with image URL
```

---

## 🔐 ADMIN APIs

### 1. Admin Login
```bash
curl -X POST $API_URL/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@system.com",
    "password": "admin123"
  }' \
  -c cookies.txt

# Expected: 200 OK
# Note: Admin accounts created via seed script
```

### 2. Get Dashboard Stats
```bash
curl -X GET $API_URL/admin/dashboard-stats \
  -b cookies.txt

# Expected: 200 OK with comprehensive stats
```

### 3. Get All Tutors
```bash
curl -X GET "$API_URL/admin/tutors?status=pending&page=1" \
  -b cookies.txt

# Query params:
# - status: pending|approved|rejected|blocked
# - page: pagination
# - search: search term
```

### 4. Approve Tutor
```bash
curl -X PUT $API_URL/admin/tutors/TUTOR_ID/approve \
  -b cookies.txt

# Expected: 200 OK
# ⚠️ Issue: No email notification sent
# ❌ Issue: No audit log created
```

### 5. Reject Tutor
```bash
curl -X PUT $API_URL/admin/tutors/TUTOR_ID/reject \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "reason": "Insufficient qualifications"
  }'

# Expected: 200 OK
# ⚠️ Issue: No email notification
```

### 6. Block Tutor
```bash
curl -X PUT $API_URL/admin/tutors/TUTOR_ID/block \
  -b cookies.txt

# Expected: 200 OK
```

### 7. Get All Students
```bash
curl -X GET "$API_URL/admin/students?page=1" \
  -b cookies.txt

# Expected: 200 OK with paginated students
```

### 8. Delete User
```bash
curl -X DELETE $API_URL/admin/users/USER_ID \
  -b cookies.txt

# Expected: 200 OK
# ⚠️ Warning: Permanent deletion, no soft delete
```

### 9. Get Platform Analytics
```bash
curl -X GET $API_URL/admin/analytics/platform \
  -b cookies.txt

# Expected: 200 OK with detailed analytics
# ⚠️ Performance: Can be slow for large datasets
```

### 10. Export Tutors CSV
```bash
curl -X GET $API_URL/admin/export/tutors \
  -b cookies.txt \
  -o tutors.csv

# Expected: CSV file download
```

---

## 📚 LMS APIs

### 1. Create Course
```bash
curl -X POST $API_URL/lms/courses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "React Masterclass",
    "description": "Learn React from scratch",
    "category": "Programming",
    "level": "Beginner",
    "price": 999,
    "language": "English"
  }'

# Expected: 201 Created
# Note: Instructor auto-set from auth token
```

### 2. Get All Courses (Public)
```bash
# No auth required for browsing
curl -X GET "$API_URL/lms/courses?category=Programming&level=Beginner"

# Query params:
# - category, level, search, instructor
```

### 3. Get Single Course
```bash
curl -X GET $API_URL/lms/courses/COURSE_ID

# Expected: 200 OK with course details
```

### 4. Update Course
```bash
curl -X PUT $API_URL/lms/courses/COURSE_ID \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Updated Title",
    "price": 1299
  }'

# Expected: 200 OK
# Auth: Only instructor can update
```

### 5. Publish/Unpublish Course
```bash
curl -X PATCH $API_URL/lms/courses/COURSE_ID/publish \
  -b cookies.txt

# Expected: 200 OK
# Toggles isPublished status
```

### 6. Enroll in Course
```bash
curl -X POST $API_URL/lms/courses/COURSE_ID/enroll \
  -b cookies.txt

# Expected: 200 OK with enrollment object
# Test Cases:
# ❌ Already enrolled → 400 Error
# ⚠️ Course capacity → Not enforced
```

### 7. Get My Enrollments
```bash
curl -X GET $API_URL/lms/enrollments \
  -b cookies.txt

# Expected: 200 OK with array of enrollments
```

### 8. Get Course Progress
```bash
curl -X GET $API_URL/lms/courses/COURSE_ID/progress \
  -b cookies.txt

# Expected: 200 OK with progress percentage
```

### 9. Create Module
```bash
curl -X POST $API_URL/lms/courses/COURSE_ID/modules \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Introduction to React",
    "description": "Learn React basics",
    "order": 1
  }'

# Expected: 201 Created
```

### 10. Create Lesson
```bash
curl -X POST $API_URL/lms/modules/MODULE_ID/lessons \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "What is React?",
    "content": "React is a JavaScript library...",
    "type": "video",
    "videoUrl": "https://youtube.com/watch?v=...",
    "duration": 600,
    "order": 1
  }'

# Expected: 201 Created
```

### 11. Complete Lesson
```bash
curl -X POST $API_URL/lms/lessons/LESSON_ID/complete \
  -b cookies.txt

# Expected: 200 OK
# Updates course progress
```

### 12. Create Assignment
```bash
curl -X POST $API_URL/lms/courses/COURSE_ID/assignments \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Build a React App",
    "description": "Create a todo app using React",
    "maxScore": 100,
    "deadline": "2026-02-28T23:59:59Z"
  }'

# Expected: 201 Created
```

### 13. Submit Assignment
```bash
curl -X POST $API_URL/lms/assignments/ASSIGNMENT_ID/submit \
  -b cookies.txt \
  -F "file=@/path/to/submission.pdf"

# Expected: 200 OK with submission object
# Test Cases:
# ⚠️ File size limit → Not clear
# ⚠️ Late submission → Not tracked
# ❌ File type validation → Missing
```

### 14. Grade Submission
```bash
curl -X PUT $API_URL/lms/submissions/SUBMISSION_ID/grade \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "score": 85,
    "feedback": "Good work, but improve error handling"
  }'

# Expected: 200 OK
# Auth: Only instructor
```

### 15. Create Quiz
```bash
curl -X POST $API_URL/lms/courses/COURSE_ID/quizzes \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "React Basics Quiz",
    "description": "Test your knowledge",
    "duration": 1800,
    "passingScore": 70,
    "questions": [
      {
        "text": "What is JSX?",
        "options": ["JavaScript XML", "Java Syntax", "JSON Export", "None"],
        "correctAnswer": 0,
        "points": 10
      }
    ]
  }'

# Expected: 201 Created
```

### 16. Attempt Quiz
```bash
curl -X POST $API_URL/lms/quizzes/QUIZ_ID/attempt \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "answers": [0, 2, 1, 3]
  }'

# Expected: 200 OK with score
# Test Cases:
# ⚠️ Time limit → Not enforced
# ❌ Cheating prevention → None
```

---

## 💬 MESSAGING APIs

### 1. Get Conversations
```bash
curl -X GET $API_URL/messages/conversations \
  -b cookies.txt

# Expected: 200 OK with list of conversations
# ⚠️ Issue: No pagination
```

### 2. Get Conversation with User
```bash
curl -X GET $API_URL/messages/conversation/USER_ID \
  -b cookies.txt

# Expected: 200 OK with message history
```

### 3. Send Message
```bash
curl -X POST $API_URL/messages/send \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "receiverId": "USER_ID",
    "content": "Hello! When is our next class?",
    "receiverType": "tutor"
  }'

# Expected: 200 OK
# Note: Socket.IO also emits real-time event
# Test Cases:
# ⚠️ Message length → No limit
# ❌ Profanity filter → Not implemented
```

### 4. Mark as Read
```bash
curl -X PUT $API_URL/messages/read/USER_ID \
  -b cookies.txt

# Expected: 200 OK
# Marks all messages from USER_ID as read
```

---

## 📤 FILE UPLOAD APIs

### 1. Upload Student Photo
```bash
curl -X POST $API_URL/upload/student/photo \
  -b cookies.txt \
  -F "photo=@/path/to/photo.jpg"

# Expected: 200 OK with photo URL
```

### 2. Delete Student Photo
```bash
curl -X DELETE $API_URL/upload/student/photo \
  -b cookies.txt

# Expected: 200 OK
```

### 3. Upload Material (Tutor)
```bash
curl -X POST $API_URL/materials/upload \
  -b cookies.txt \
  -F "file=@/path/to/material.pdf" \
  -F "title=Calculus Notes" \
  -F "description=Chapter 1-5" \
  -F "courseId=COURSE_ID"

# Expected: 200 OK with material object
```

---

## 🔍 SEARCH APIs

### 1. Search Courses
```bash
curl -X GET "$API_URL/search/courses?q=React&category=Programming"

# Expected: 200 OK with matching courses
```

### 2. Search Tutors
```bash
curl -X GET "$API_URL/search/tutors?q=Math&subjects=Mathematics"

# Expected: 200 OK with matching tutors
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Student Journey
```bash
# 1. Register
curl -X POST $API_URL/student/register ...

# 2. Login (get token)
curl -X POST $API_URL/student/login ...

# 3. Browse courses
curl -X GET $API_URL/lms/courses

# 4. Enroll in course
curl -X POST $API_URL/lms/courses/COURSE_ID/enroll ...

# 5. Complete lesson
curl -X POST $API_URL/lms/lessons/LESSON_ID/complete ...

# 6. Submit assignment
curl -X POST $API_URL/lms/assignments/ASSIGNMENT_ID/submit ...

# 7. Take quiz
curl -X POST $API_URL/lms/quizzes/QUIZ_ID/attempt ...
```

### Scenario 2: Complete Tutor Journey
```bash
# 1. Register with CV
curl -X POST $API_URL/tutor/register ... -F "cv=@cv.pdf"

# 2. Wait for admin approval (manual step)

# 3. Login
curl -X POST $API_URL/tutor/login ...

# 4. Update availability
curl -X POST $API_URL/tutor/availability ...

# 5. Create LMS course
curl -X POST $API_URL/lms/courses ...

# 6. Create modules
curl -X POST $API_URL/lms/courses/COURSE_ID/modules ...

# 7. Add lessons
curl -X POST $API_URL/lms/modules/MODULE_ID/lessons ...

# 8. Publish course
curl -X PATCH $API_URL/lms/courses/COURSE_ID/publish ...
```

---

## 🚨 Error Response Codes

```
200 OK - Success
201 Created - Resource created
400 Bad Request - Validation error or invalid data
401 Unauthorized - Not authenticated
403 Forbidden - Authenticated but not authorized
404 Not Found - Resource doesn't exist
413 Payload Too Large - File too big
500 Internal Server Error - Server error
```

---

## 📝 Notes

1. **Authentication**: All protected routes require JWT token in cookie or `Authorization: Bearer <token>` header
2. **CORS**: Ensure `withCredentials: true` when making requests from frontend
3. **Rate Limiting**: ⚠️ NOT IMPLEMENTED - Add before production
4. **File Uploads**: ⚠️ Validation incomplete - Add file type and size checks
5. **Error Messages**: Some expose internal details - sanitize before production

---

*This test suite should be automated with tools like Jest, Mocha, or Postman Collections for CI/CD integration.*
