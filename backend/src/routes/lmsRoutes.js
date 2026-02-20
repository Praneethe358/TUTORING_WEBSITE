const express = require('express');
const router = express.Router();
const { protectAny, optionalAuth, protectStudent, protectTutor } = require('../middleware/authMiddleware');
const {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  togglePublish
} = require('../controllers/lmsCourseController');

// Import certificate and discussion controllers
const {
  issueCertificate,
  getMyCertificates,
  getCourseCertificates,
  getCertificate,
  deleteCertificate
} = require('../controllers/certificateController');

const {
  createDiscussion,
  getDiscussions,
  getDiscussion,
  addReply,
  likeDiscussion,
  likeReply,
  togglePin,
  deleteDiscussion,
  updateDiscussion
} = require('../controllers/discussionController');

const {
  createModule,
  getModules,
  updateModule,
  deleteModule,
  reorderModules
} = require('../controllers/moduleController');

const {
  createLesson,
  getLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
  reorderLessons
} = require('../controllers/lessonController');

const {
  createAssignment,
  getAssignments,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission
} = require('../controllers/assignmentController');

const {
  createQuiz,
  getQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getQuizAttempts
} = require('../controllers/quizController');

const { uploadSubmission } = require('../middleware/lmsUploadMiddleware');

const {
  enrollCourse,
  getEnrollments,
  getCourseProgress,
  updateLessonProgress,
  getInstructorAnalytics,
  getInstructorStudents
} = require('../controllers/enrollmentController');

// Course routes
router.post('/courses', protectAny, createCourse);
router.get('/courses', optionalAuth, getCourses); // Public browsing, optional auth for filtering
router.get('/courses/:id', optionalAuth, getCourse);
router.put('/courses/:id', protectAny, updateCourse);
router.delete('/courses/:id', protectAny, deleteCourse);
router.patch('/courses/:id/publish', protectAny, togglePublish);

// Module routes
router.post('/courses/:courseId/modules', protectAny, createModule);
router.get('/courses/:courseId/modules', getModules);
router.put('/modules/:id', protectAny, updateModule);
router.delete('/modules/:id', protectAny, deleteModule);
router.patch('/courses/:courseId/modules/reorder', protectAny, reorderModules);

// Lesson routes
router.post('/modules/:moduleId/lessons', protectAny, createLesson);
router.get('/modules/:moduleId/lessons', getLessons);
router.get('/lessons/:id', getLesson);
router.put('/lessons/:id', protectAny, updateLesson);
router.delete('/lessons/:id', protectAny, deleteLesson);
router.post('/lessons/:id/complete', protectAny, completeLesson);
router.patch('/modules/:moduleId/lessons/reorder', protectAny, reorderLessons);

// Assignment routes
router.post('/courses/:courseId/assignments', protectAny, createAssignment);
router.get('/courses/:courseId/assignments', protectAny, getAssignments);
router.put('/assignments/:id', protectAny, updateAssignment);
router.delete('/assignments/:id', protectAny, deleteAssignment);
router.post('/assignments/:id/submit', protectAny, uploadSubmission.single('file'), submitAssignment);
router.get('/assignments/:id/submissions', protectAny, getSubmissions);
router.put('/submissions/:id/grade', protectAny, gradeSubmission);

// Quiz routes
router.post('/courses/:courseId/quizzes', protectAny, createQuiz);
router.get('/courses/:courseId/quizzes', protectAny, getQuizzes);
router.get('/quizzes/:id', protectAny, getQuiz);
router.put('/quizzes/:id', protectAny, updateQuiz);
router.delete('/quizzes/:id', protectAny, deleteQuiz);
router.post('/quizzes/:id/attempt', protectAny, submitQuizAttempt);
router.get('/quizzes/:id/attempts', protectAny, getQuizAttempts);

// Enrollment & Progress routes
router.post('/courses/:courseId/enroll', protectAny, enrollCourse);
router.get('/enrollments', protectAny, getEnrollments);
router.get('/courses/:courseId/progress', protectAny, getCourseProgress);
router.put('/lessons/:lessonId/progress', protectAny, updateLessonProgress);
router.get('/instructor/analytics', protectAny, getInstructorAnalytics);
router.get('/instructor/students', protectAny, getInstructorStudents);

// Certificate routes - NEW
router.post('/certificates/issue/:courseId', protectAny, issueCertificate);
router.get('/certificates/my', protectAny, getMyCertificates);
router.get('/courses/:courseId/certificates', protectAny, getCourseCertificates);
router.get('/certificates/:id', protectAny, getCertificate);
router.delete('/certificates/:id', protectAny, deleteCertificate);

// Discussion routes - NEW
router.post('/discussions', protectAny, createDiscussion);
router.get('/discussions', getDiscussions); // Public
router.get('/discussions/:id', getDiscussion); // Public
router.post('/discussions/:id/reply', protectAny, addReply);
router.post('/discussions/:id/reply/:replyId/like', protectAny, likeReply);
router.post('/discussions/:id/like', protectAny, likeDiscussion);
router.patch('/discussions/:id/pin', protectAny, togglePin);
router.put('/discussions/:id', protectAny, updateDiscussion);
router.delete('/discussions/:id', protectAny, deleteDiscussion);

module.exports = router;
