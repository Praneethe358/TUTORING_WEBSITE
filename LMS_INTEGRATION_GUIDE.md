# LMS Feature Integration Guide

## Quick Start for Testing

### Prerequisites
- Node.js and npm installed
- MongoDB running
- Backend server: `npm start` (from backend folder)
- Frontend server: `npm start` (from frontend folder)

---

## Backend Setup

### 1. Verify Models are Registered
The new models (`Certificate` and `Discussion`) should be automatically loaded. They are in:
- `backend/src/models/Certificate.js`
- `backend/src/models/Discussion.js`

No additional registration needed - Mongoose auto-discovers models.

### 2. Verify Routes are Mounted
LMS routes are already imported in your `server.js` or main app file. Check that lmsRoutes are mounted:

```javascript
// In your server.js or app setup
app.use('/api/lms', lmsRoutes);
```

### 3. Database Indexes
The models automatically create MongoDB indexes. No migration needed.

---

## Frontend Setup

### 1. Verify Routes are Registered
All new routes have been added to `frontend/src/App.js`:

```javascript
// Tutor LMS Routes
{ path: '/tutor/lms/courses', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsCourses /></TutorDashboardLayout></ProtectedTutorRoute> },
{ path: '/tutor/lms/courses/:courseId/edit', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsCourseEdit /></TutorDashboardLayout></ProtectedTutorRoute> },
{ path: '/tutor/lms/courses/:courseId/modules', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsModules /></TutorDashboardLayout></ProtectedTutorRoute> },
{ path: '/tutor/lms/courses/:courseId/assignments', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsAssignments /></TutorDashboardLayout></ProtectedTutorRoute> },
{ path: '/tutor/lms/courses/:courseId/quizzes', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsQuizzes /></TutorDashboardLayout></ProtectedTutorRoute> },
{ path: '/tutor/lms/courses/:courseId/grading', element: <ProtectedTutorRoute><TutorDashboardLayout><TutorLmsGrading /></TutorDashboardLayout></ProtectedTutorRoute> },
```

### 2. Verify Student LMS Routes Exist
Student course learning routes should already be in App.js:

```javascript
{ path: '/student/courses', element: <ProtectedStudentRoute><DashboardLayout sidebar={StudentSidebar}><StudentCourseCatalog /></DashboardLayout></ProtectedStudentRoute> },
{ path: '/student/my-courses', element: <ProtectedStudentRoute><DashboardLayout sidebar={StudentSidebar}><StudentMyCourses /></DashboardLayout></ProtectedStudentRoute> },
{ path: '/student/courses/:courseId', element: <ProtectedStudentRoute><DashboardLayout sidebar={StudentSidebar}><StudentCourseView /></DashboardLayout></ProtectedStudentRoute> },
```

### 3. Update Sidebar Navigation (Optional)
If you want quick links in tutor/student sidebars, update the sidebar components:

**TutorSidebar.js** - Add to sidebar menu:
```javascript
{
  name: 'LMS Courses',
  path: '/tutor/lms/courses',
  icon: 'BookOpen'
}
```

**StudentSidebar.js** - Add to sidebar menu:
```javascript
{
  name: 'Browse Courses',
  path: '/student/courses',
  icon: 'Library'
},
{
  name: 'My Courses',
  path: '/student/my-courses',
  icon: 'BookMarked'
}
```

---

## Testing the Features

### Test as Tutor

1. **Create a Course**
   - Navigate to `/tutor/lms/courses`
   - Click "+ Create Course"
   - Fill in course details and submit
   - Course appears in dashboard

2. **Add Modules and Lessons**
   - Click "Manage Modules & Lessons" on course card
   - Click "+ Add Module"
   - Create a module, then add lessons to it
   - Select lesson type (video, text, PDF, etc.)

3. **Create Assignments**
   - Click "Manage Assignments" on course card
   - Click "+ Create Assignment"
   - Set title, description, deadline, max score
   - Assignment appears in list

4. **Create Quizzes**
   - Click "Manage Quizzes" on course card
   - Click "+ Create Quiz"
   - Add questions with options
   - Set passing score and time limit

5. **Publish Course**
   - Go back to course dashboard
   - Click course card
   - Click "Publish" button
   - Status changes from "draft" to "published"

6. **Grade Submissions**
   - Click "View Submissions & Grade"
   - Select an assignment
   - Click on ungraded submission
   - Enter score and feedback
   - Submit grade

### Test as Student

1. **Browse Courses**
   - Navigate to `/student/courses`
   - Browse available courses
   - Filter by category or level

2. **Enroll in Course**
   - Click "Enroll Now" on published course
   - Confirms enrollment

3. **Learn Content**
   - Navigate to `/student/my-courses`
   - Click course to open
   - View modules and lessons in sidebar
   - Progress through lessons

4. **Submit Assignments**
   - Go to "Assignments" tab
   - Click "Submit Assignment"
   - Upload file or enter text
   - View grade after instructor grades it

5. **Take Quizzes**
   - Go to "Quizzes" tab
   - Click "Start Quiz"
   - Answer all questions
   - Submit and see results

---

## API Testing with cURL/Postman

### Create a Course (Tutor)
```bash
curl -X POST http://localhost:5000/api/lms/courses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "React Advanced",
    "description": "Advanced React patterns",
    "category": "Web Development",
    "level": "Advanced",
    "duration": 40
  }'
```

### Get All Published Courses (Student/Public)
```bash
curl http://localhost:5000/api/lms/courses?status=published
```

### Create a Module
```bash
curl -X POST http://localhost:5000/api/lms/courses/{courseId}/modules \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction",
    "description": "Getting started with React"
  }'
```

### Enroll in Course (Student)
```bash
curl -X POST http://localhost:5000/api/lms/courses/{courseId}/enroll \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Complete a Lesson (Student)
```bash
curl -X POST http://localhost:5000/api/lms/lessons/{lessonId}/complete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Submit Assignment (Student)
```bash
curl -X POST http://localhost:5000/api/lms/assignments/{assignmentId}/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@assignment.pdf" \
  -F "submissionText=My submission text"
```

### Grade Submission (Tutor)
```bash
curl -X PUT http://localhost:5000/api/lms/submissions/{submissionId}/grade \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "score": 85,
    "feedback": "Great work! Well explained."
  }'
```

### Submit Quiz Attempt (Student)
```bash
curl -X POST http://localhost:5000/api/lms/quizzes/{quizId}/attempt \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      { "questionIndex": 0, "answer": "React" },
      { "questionIndex": 1, "answer": "Virtual DOM" }
    ],
    "timeSpent": 300
  }'
```

### Create Discussion (Student/Tutor)
```bash
curl -X POST http://localhost:5000/api/lms/discussions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "{courseId}",
    "title": "How to use hooks?",
    "content": "Can someone explain hooks in detail?",
    "isQuestion": true,
    "tags": ["react", "hooks"]
  }'
```

### Issue Certificate (Tutor/System)
```bash
curl -X POST http://localhost:5000/api/lms/certificates/issue/{courseId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{studentId}",
    "completionDate": "2024-01-15",
    "finalScore": 95
  }'
```

---

## Troubleshooting

### "Course not found" error
- Verify course exists in MongoDB
- Check courseId format (should be valid ObjectId)
- Verify user is the instructor of the course

### "Not authorized" error
- Check JWT token is valid
- Verify user role (must be tutor for course creation)
- Check ownership of course/assignment/quiz

### Submissions not showing
- Verify student enrolled in course
- Check assignment exists in course
- Ensure submissions were created

### Quiz timer not working
- Verify timeLimit is set on quiz
- Check browser console for errors
- Ensure quiz hasn't been submitted already

---

## Database Models Reference

### Course Enrollment
```javascript
{
  studentId: ObjectId,
  courseId: ObjectId,
  enrolledAt: Date,
  progress: Number (0-100),
  completedLessons: Number,
  totalLessons: Number,
  lastLessonId: ObjectId
}
```

### Assignment Submission
```javascript
{
  assignmentId: ObjectId,
  studentId: ObjectId,
  submissionUrl: String,
  submissionText: String,
  status: "submitted" | "graded",
  score: Number,
  feedback: String,
  gradedBy: ObjectId,
  createdAt: Date
}
```

### Quiz Attempt
```javascript
{
  quizId: ObjectId,
  studentId: ObjectId,
  answers: [{ questionIndex, answer }],
  score: Number,
  percentage: Number (0-100),
  passed: Boolean,
  timeSpent: Number (seconds)
}
```

### Discussion
```javascript
{
  courseId: ObjectId,
  lessonId: ObjectId (optional),
  authorId: ObjectId,
  title: String,
  content: String,
  isQuestion: Boolean,
  isPinned: Boolean,
  isAnswered: Boolean,
  replies: [...],
  likes: [ObjectId],
  views: Number,
  tags: [String]
}
```

---

## Performance Considerations

1. **Pagination** - For large course lists, implement pagination in `getCourses`
2. **Caching** - Cache published courses to reduce DB queries
3. **Indexes** - Ensure MongoDB indexes on courseId, studentId, lessonId
4. **File Uploads** - Store large files in S3 or cloud storage instead of MongoDB
5. **Lazy Loading** - Load module content on-demand instead of all at once

---

## Security Notes

✅ All routes protected with authentication middleware
✅ Tutor can only modify own courses
✅ Students can only enroll and access published courses
✅ Grading limited to course instructors
✅ Certificates issued only to enrolled students

---

## Next Steps

1. Deploy to staging environment
2. Run comprehensive test suite
3. Get user feedback from test group
4. Deploy to production
5. Monitor for errors and performance issues
6. Implement optional enhancements as needed

---

For questions or issues, refer to the API documentation or check the controller comments for implementation details.
