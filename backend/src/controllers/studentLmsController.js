const CourseEnrollment = require('../models/CourseEnrollment');
const LMSCourse = require('../models/LMSCourse');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const Certificate = require('../models/Certificate');

/**
 * STUDENT LMS CONTROLLER
 * New APIs for student learning dashboard, course player, progress tracking
 * All routes check enrollment + are student-only
 */

// @desc    Get student LMS dashboard (all enrolled courses with progress)
// @route   GET /api/lms/student/dashboard
// @access  Student only
exports.getStudentDashboard = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({ studentId: req.userId })
      .populate({
        path: 'courseId',
        select: 'title thumbnail category level status',
        populate: { path: 'instructor', select: 'name' }
      })
      .sort({ enrolledAt: -1 });

    const courseData = enrollments.map(e => ({
      _id: e.courseId._id,
      title: e.courseId.title,
      thumbnail: e.courseId.thumbnail,
      category: e.courseId.category,
      level: e.courseId.level,
      instructor: e.courseId.instructor?.name,
      progress: e.progress || 0,
      status: e.status || 'active',
      enrolledAt: e.enrolledAt,
      completedLessons: e.completedLessons || 0,
      totalLessons: e.totalLessons || 0,
      lastLessonId: e.lastLessonId,
      completionTime: e.completionTime // hours
    }));

    const stats = {
      totalEnrolled: enrollments.length,
      inProgress: courseData.filter(c => c.progress > 0 && c.progress < 100).length,
      completed: courseData.filter(c => c.progress === 100).length,
      notStarted: courseData.filter(c => c.progress === 0).length,
      avgProgress: courseData.length > 0 
        ? Math.round(courseData.reduce((sum, c) => sum + c.progress, 0) / courseData.length)
        : 0
    };

    res.json({
      success: true,
      data: courseData,
      stats
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
};

// @desc    Get course player data (for course learning interface)
// @route   GET /api/lms/student/courses/:courseId/player
// @access  Student only (enrolled check)
exports.getCoursePlayer = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Verify enrollment
    const enrollment = await CourseEnrollment.findOne({
      studentId: req.userId,
      courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Get course, modules, lessons
    const course = await LMSCourse.findById(courseId)
      .populate('instructor', 'name email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 });

    // Get all lessons with progress
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await Lesson.find({ moduleId: module._id }).sort({ order: 1 });

        const lessonsWithProgress = await Promise.all(
          lessons.map(async (lesson) => {
            const progress = await LessonProgress.findOne({
              studentId: req.userId,
              lessonId: lesson._id
            });

            return {
              ...lesson.toObject(),
              completed: progress ? progress.completed : false,
              progress: progress ? progress.progress : 0,
              timeSpent: progress ? progress.timeSpent : 0
            };
          })
        );

        return {
          ...module.toObject(),
          lessons: lessonsWithLessons
        };
      })
    );

    // Get current lesson (last viewed or first incomplete)
    let currentLesson = null;
    if (enrollment.lastLessonId) {
      currentLesson = await Lesson.findById(enrollment.lastLessonId);
    } else {
      // Find first incomplete lesson
      for (const module of modulesWithLessons) {
        const incomplete = module.lessons.find(l => !l.completed);
        if (incomplete) {
          currentLesson = incomplete;
          break;
        }
      }
    }

    // Get next and previous lessons
    let nextLesson = null;
    let previousLesson = null;

    if (currentLesson) {
      const currentModule = modulesWithLessons.find(m =>
        m.lessons.some(l => l._id.toString() === currentLesson._id.toString())
      );

      if (currentModule) {
        const currentIndex = currentModule.lessons.findIndex(l =>
          l._id.toString() === currentLesson._id.toString()
        );

        if (currentIndex > 0) {
          previousLesson = currentModule.lessons[currentIndex - 1];
        }
        if (currentIndex < currentModule.lessons.length - 1) {
          nextLesson = currentModule.lessons[currentIndex + 1];
        }
      }
    }

    // Get assignments and quizzes
    const assignments = await Assignment.find({ courseId });
    const quizzes = await Quiz.find({ courseId });

    res.json({
      success: true,
      data: {
        course,
        modules: modulesWithLessons,
        currentLesson,
        nextLesson,
        previousLesson,
        assignments: assignments.length,
        quizzes: quizzes.length,
        progress: {
          progress: enrollment.progress || 0,
          completedLessons: enrollment.completedLessons || 0,
          totalLessons: enrollment.totalLessons || 0
        },
        enrollment: {
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt
        }
      }
    });
  } catch (error) {
    console.error('Get course player error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course player data',
      error: error.message
    });
  }
};

// @desc    Get resume point (last viewed lesson)
// @route   GET /api/lms/student/resume
// @access  Student only
exports.getResumPoint = async (req, res) => {
  try {
    const enrollment = await CourseEnrollment.findOne({
      studentId: req.userId,
      status: 'active'
    })
      .populate('courseId', 'title')
      .populate('lastLessonId', 'title');

    if (!enrollment || !enrollment.lastLessonId) {
      return res.json({
        success: true,
        data: null,
        message: 'No resume point found'
      });
    }

    res.json({
      success: true,
      data: {
        courseId: enrollment.courseId._id,
        courseName: enrollment.courseId.title,
        lessonId: enrollment.lastLessonId._id,
        lessonName: enrollment.lastLessonId.title
      }
    });
  } catch (error) {
    console.error('Get resume point error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume point',
      error: error.message
    });
  }
};

// @desc    Get student's assignments across all courses
// @route   GET /api/lms/student/assignments
// @access  Student only
exports.getStudentAssignments = async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const query = {};

    if (courseId) {
      query.courseId = courseId;
    } else {
      // Get all enrolled courses
      const enrollments = await CourseEnrollment.find({ studentId: req.userId });
      const courseIds = enrollments.map(e => e.courseId);
      query.courseId = { $in: courseIds };
    }

    const assignments = await Assignment.find(query)
      .populate('courseId', 'title')
      .sort({ deadline: 1 });

    // Add submission status
    const AssignmentSubmission = require('../models/AssignmentSubmission');
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await AssignmentSubmission.findOne({
          assignmentId: assignment._id,
          studentId: req.userId
        });

        return {
          ...assignment.toObject(),
          submission: submission || null,
          submissionStatus: submission ? submission.status : 'not-submitted'
        };
      })
    );

    if (status) {
      const filtered = assignmentsWithStatus.filter(a => a.submissionStatus === status);
      return res.json({ success: true, data: filtered });
    }

    res.json({ success: true, data: assignmentsWithStatus });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments',
      error: error.message
    });
  }
};

// @desc    Get student's quizzes across all courses
// @route   GET /api/lms/student/quizzes
// @access  Student only
exports.getStudentQuizzes = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = {};

    if (courseId) {
      query.courseId = courseId;
    } else {
      // Get all enrolled courses
      const enrollments = await CourseEnrollment.find({ studentId: req.userId });
      const courseIds = enrollments.map(e => e.courseId);
      query.courseId = { $in: courseIds };
    }

    const quizzes = await Quiz.find(query)
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    // Add attempt status
    const QuizAttempt = require('../models/QuizAttempt');
    const quizzesWithStatus = await Promise.all(
      quizzes.map(async (quiz) => {
        const attempts = await QuizAttempt.find({
          quizId: quiz._id,
          studentId: req.userId
        }).sort({ createdAt: -1 });

        const quizObj = quiz.toObject();
        return {
          ...quizObj,
          attemptsCount: attempts.length,
          bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null,
          lastAttemptScore: attempts.length > 0 ? attempts[0].percentage : null,
          remainingAttempts: Math.max(0, quiz.maxAttempts - attempts.length),
          canAttempt: attempts.length < quiz.maxAttempts
        };
      })
    );

    res.json({ success: true, data: quizzesWithStatus });
  } catch (error) {
    console.error('Get student quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quizzes',
      error: error.message
    });
  }
};

// @desc    Get student's certificates
// @route   GET /api/lms/student/certificates
// @access  Student only
exports.getStudentCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.userId })
      .populate('courseId', 'title')
      .populate('instructorId', 'name')
      .sort({ issuedDate: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Get student certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// @desc    Update lesson progress and auto-complete course if all lessons done
// @route   POST /api/lms/student/lessons/:lessonId/complete
// @access  Student only
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Create/update progress
    let progress = await LessonProgress.findOne({
      studentId: req.userId,
      lessonId
    });

    if (!progress) {
      progress = await LessonProgress.create({
        studentId: req.userId,
        courseId: lesson.courseId,
        lessonId,
        completed: true,
        progress: 100,
        completedAt: new Date()
      });
    } else {
      progress.completed = true;
      progress.progress = 100;
      progress.completedAt = new Date();
      await progress.save();
    }

    // Update course enrollment progress
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    const completedLessons = await LessonProgress.countDocuments({
      studentId: req.userId,
      courseId: lesson.courseId,
      completed: true
    });

    const courseProgress = Math.round((completedLessons / totalLessons) * 100);

    const enrollment = await CourseEnrollment.findOneAndUpdate(
      { studentId: req.userId, courseId: lesson.courseId },
      {
        progress: courseProgress,
        completedLessons,
        totalLessons,
        lastLessonId: lessonId,
        lastActivityAt: new Date(),
        status: courseProgress === 100 ? 'completed' : 'active'
      },
      { new: true }
    );

    // If course completed, auto-issue certificate
    if (courseProgress === 100 && !enrollment.certificateId) {
      const Certificate = require('../models/Certificate');
      const Student = require('../models/Student');
      const course = await LMSCourse.findById(lesson.courseId).populate('instructor');
      const user = await Student.findById(req.userId);

      const certificate = await Certificate.create({
        courseId: lesson.courseId,
        studentId: req.userId,
        instructorId: course.instructor._id,
        completionDate: new Date(),
        finalScore: courseProgress,
        courseTitle: course.title,
        studentName: user?.name || 'Student',
        instructorName: course.instructor?.name || 'Instructor',
        completionTime: Math.ceil((Date.now() - enrollment.enrolledAt) / (1000 * 60 * 60)) // hours
      });

      // Update enrollment with certificate
      await CourseEnrollment.findByIdAndUpdate(enrollment._id, {
        certificateId: certificate._id,
        completionTime: Math.ceil((Date.now() - enrollment.enrolledAt) / (1000 * 60 * 60))
      });
    }

    res.json({
      success: true,
      message: 'Lesson marked complete',
      data: {
        progress,
        courseProgress,
        completedLessons,
        totalLessons,
        courseCompleted: courseProgress === 100
      }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson complete',
      error: error.message
    });
  }
};
