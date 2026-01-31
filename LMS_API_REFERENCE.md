# STUDENT & ADMIN LMS API REFERENCE

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require:
- Student endpoints: `protectStudent` middleware
- Admin endpoints: `protectAdmin` middleware
- Token in Authorization header: `Bearer <token>`

---

## STUDENT LMS ENDPOINTS

### Dashboard & Overview

**Get Student LMS Dashboard**
```
GET /lms/student/dashboard
Auth: Required (Student)
Response: {
  success: boolean,
  data: [
    {
      _id: ObjectId,
      title: string,
      thumbnail: string,
      instructor: { name: string },
      progress: number (0-100),
      status: string (active|completed),
      completedLessons: number,
      totalLessons: number,
      lastLessonId: ObjectId,
      completionTime: number (hours)
    }
  ],
  stats: {
    totalEnrolled: number,
    inProgress: number,
    completed: number,
    notStarted: number,
    avgProgress: number
  }
}
```

**Get Resume Point (Last Lesson)**
```
GET /lms/student/resume
Auth: Required (Student)
Response: {
  success: boolean,
  data: {
    courseId: ObjectId,
    courseName: string,
    lessonId: ObjectId,
    lessonName: string
  } | null
}
```

### Course Learning

**Get Course Player Data**
```
GET /lms/student/courses/:courseId/player
Auth: Required (Student)
Params: courseId (course ID)
Response: {
  success: boolean,
  data: {
    course: { title, instructor, ... },
    modules: [
      {
        _id: ObjectId,
        title: string,
        lessons: [
          {
            _id: ObjectId,
            title: string,
            content: string,
            videoUrl: string,
            resources: [{name, url}],
            completed: boolean,
            progress: number,
            timeSpent: number
          }
        ]
      }
    ],
    currentLesson: lesson object,
    nextLesson: lesson object | null,
    previousLesson: lesson object | null,
    progress: { progress, completedLessons, totalLessons },
    enrollment: { status, enrolledAt }
  }
}
```

**Mark Lesson Complete**
```
POST /lms/student/lessons/:lessonId/complete
Auth: Required (Student)
Params: lessonId (lesson ID)
Response: {
  success: boolean,
  message: string,
  data: {
    progress: progress object,
    courseProgress: number,
    completedLessons: number,
    totalLessons: number,
    courseCompleted: boolean
  }
}
```

### Assignments

**Get All Assignments**
```
GET /lms/student/assignments
Auth: Required (Student)
Query: 
  - courseId (optional): Filter by course
  - status (optional): not-submitted|submitted|graded
Response: {
  success: boolean,
  data: [
    {
      _id: ObjectId,
      title: string,
      description: string,
      courseId: ObjectId,
      courseName: string,
      deadline: Date,
      maxPoints: number,
      submissionStatus: string (not-submitted|submitted|graded),
      submission: {
        status: string,
        submittedAt: Date,
        score: number
      } | null
    }
  ]
}
```

### Quizzes

**Get All Quizzes**
```
GET /lms/student/quizzes
Auth: Required (Student)
Query:
  - courseId (optional): Filter by course
Response: {
  success: boolean,
  data: [
    {
      _id: ObjectId,
      title: string,
      description: string,
      courseId: ObjectId,
      courseName: string,
      questions: [questions array],
      duration: number (minutes),
      passingScore: number,
      maxAttempts: number,
      attemptsCount: number,
      bestScore: number | null,
      lastAttemptScore: number | null,
      remainingAttempts: number,
      canAttempt: boolean
    }
  ]
}
```

### Certificates

**Get Student Certificates**
```
GET /lms/student/certificates
Auth: Required (Student)
Response: {
  success: boolean,
  data: [
    {
      _id: ObjectId,
      courseTitle: string,
      studentName: string,
      instructorName: string,
      certificateNumber: string,
      issuedDate: Date,
      completionDate: Date,
      finalScore: number,
      completionTime: number (hours)
    }
  ]
}
```

---

## ADMIN LMS ENDPOINTS

### Dashboard & Overview

**Get Admin LMS Dashboard**
```
GET /lms/admin/dashboard
Auth: Required (Admin)
Response: {
  success: boolean,
  data: {
    summary: {
      totalCourses: number,
      totalEnrollments: number,
      activeEnrollments: number,
      completedEnrollments: number,
      totalStudents: number,
      enrollmentRate: number (%)
    },
    performance: {
      avgCompletionTime: number (hours),
      avgProgress: number (%),
      overallCompletion: number (%)
    },
    topCourses: [
      {
        _id: ObjectId,
        title: string,
        totalEnrollments: number,
        completionRate: number (%)
      }
    ]
  }
}
```

### Course Management

**Get All Courses with Stats**
```
GET /lms/admin/courses
Auth: Required (Admin)
Query:
  - category (optional): Filter by category
  - status (optional): draft|active|archived
  - search (optional): Search by title/description
Response: {
  success: boolean,
  data: [
    {
      _id: ObjectId,
      title: string,
      category: string,
      level: string,
      instructor: { name, email },
      stats: {
        totalEnrollments: number,
        activeEnrollments: number,
        completedEnrollments: number,
        completionRate: number (%),
        avgProgress: number (%)
      }
    }
  ]
}
```

**Get Course Detail with Students**
```
GET /lms/admin/courses/:courseId
Auth: Required (Admin)
Params: courseId (course ID)
Response: {
  success: boolean,
  data: {
    course: { _id, title, category, level, status, instructor },
    stats: {
      totalEnrollments: number,
      activeEnrollments: number,
      completedEnrollments: number,
      avgProgress: number (%),
      completionRate: number (%),
      avgCompletionTime: number (hours)
    },
    students: [
      {
        studentId: ObjectId,
        studentName: string,
        studentEmail: string,
        enrolledAt: Date,
        lastActivityAt: Date,
        progress: number (%),
        completedLessons: number,
        totalLessons: number,
        status: string (active|completed),
        hasCompletionCertificate: boolean,
        completionTime: number (hours)
      }
    ]
  }
}
```

### Student Performance

**Get Student Grades**
```
GET /lms/admin/students/:studentId/grades
Auth: Required (Admin)
Params: studentId (student ID)
Response: {
  success: boolean,
  data: {
    student: { _id, name, email },
    grades: [
      {
        courseId: ObjectId,
        courseName: string,
        courseCategory: string,
        progress: number (%),
        status: string (active|completed),
        enrolledAt: Date,
        completionTime: number (hours),
        quizzes: {
          attempted: number,
          avgScore: number (%),
          bestScore: number (%)
        },
        assignments: {
          submitted: number,
          total: number,
          avgScore: number (%)
        }
      }
    ]
  }
}
```

### Exports

**Export Grades as CSV**
```
GET /lms/admin/export/grades
Auth: Required (Admin)
Query:
  - courseId (optional): Filter by course
  - format (optional): csv (default)
Response: CSV file download
Headers: Student Name, Email, Course, Progress, Status, Quiz Avg Score, Assignment Score
```

**Export Progress as CSV**
```
GET /lms/admin/export/progress
Auth: Required (Admin)
Query:
  - courseId (optional): Filter by course
  - format (optional): csv (default)
Response: CSV file download
Headers: Student Name, Email, Course, Progress %, Lessons Completed, Total Lessons, Status, Enrolled Date, Completion Time
```

### Reports & Analytics

**Get Admin Reports**
```
GET /lms/admin/reports
Auth: Required (Admin)
Response: {
  success: boolean,
  data: {
    enrollmentTrend: [
      {
        _id: "YYYY-MM-DD",
        count: number
      }
    ],
    completionTrend: [
      {
        _id: "YYYY-MM-DD",
        count: number
      }
    ],
    categoryPerformance: [
      {
        _id: string (category),
        courseCount: number,
        totalEnrollments: number,
        avgProgress: number (%)
      }
    ],
    studentPerformance: {
      excellent: number (90%+),
      good: number (75-89%),
      average: number (50-74%),
      poor: number (<50%)
    }
  }
}
```

---

## ERROR RESPONSES

All endpoints return standard error format:

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Not enrolled in this course"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Course not found"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Failed to fetch dashboard",
  "error": "error details"
}
```

---

## RATE LIMITS
None specified - use backend defaults

## PAGINATION
Not implemented in initial version - could be added to bulk endpoints

## CACHING
No cache headers set - all requests are fresh

---

## EXAMPLE REQUESTS

### Get Student Dashboard
```bash
curl -X GET http://localhost:5000/api/lms/student/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Course Player
```bash
curl -X GET http://localhost:5000/api/lms/student/courses/COURSE_ID/player \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Lesson Complete
```bash
curl -X POST http://localhost:5000/api/lms/student/lessons/LESSON_ID/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get Admin Courses
```bash
curl -X GET "http://localhost:5000/api/lms/admin/courses?category=programming&status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Export Grades CSV
```bash
curl -X GET http://localhost:5000/api/lms/admin/export/grades \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  --output grades.csv
```

---

## FIELD DEFINITIONS

### Progress (0-100)
- 0: Not started
- 1-99: In progress
- 100: Completed

### Status Values
- **Enrollment**: active, completed, dropped
- **Course**: draft, active, archived
- **Assignment Submission**: not-submitted, submitted, graded
- **Quiz**: attempted, not-attempted

### Date Format
All dates in ISO 8601 format: `2024-01-15T10:30:00Z`

### Time Units
- `duration`: Minutes
- `completionTime`: Hours
- `timeSpent`: Minutes (in LessonProgress)

---

## RELATED EXISTING ENDPOINTS

These endpoints still exist and work:

**Student Endpoints (existing)**
- `GET /student/bookings` - Student's booking history
- `GET /student/courses` - Available courses
- `GET /student/my-courses` - Enrolled courses

**Admin Endpoints (existing)**
- `GET /admin/dashboard` - Admin overview
- `GET /admin/students` - All students
- `GET /admin/tutors` - All tutors

**Tutor LMS Endpoints (existing)**
- `GET /lms/courses` - Tutor's LMS courses
- `POST /lms/courses` - Create LMS course
- `GET /lms/courses/:id/modules` - Course modules
- etc.

These are separate and do not interfere with the new student/admin LMS endpoints.

