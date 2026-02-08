const CourseEnrollment = require('../models/CourseEnrollment');
const LessonProgress = require('../models/LessonProgress');
const LMSCourse = require('../models/LMSCourse');
const Lesson = require('../models/Lesson');
const Student = require('../models/Student');
const TutorAssignment = require('../models/TutorAssignment');

/**
 * Enrollment & Progress Controller
 */

// @desc    Enroll in a course
// @route   POST /api/lms/courses/:courseId/enroll
// @access  Student only
exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await LMSCourse.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Course is not published' });
    }

    // Check if student is assigned to this course's instructor
    const assignment = await TutorAssignment.findOne({
      tutor: course.instructor,
      student: req.userId,
      status: 'active'
    }).lean();

    if (!assignment) {
      return res.status(403).json({ success: false, message: 'You can only enroll in courses from your assigned tutors' });
    }

    // Check if already enrolled
    const existing = await CourseEnrollment.findOne({
      studentId: req.userId,
      courseId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Count total lessons
    const totalLessons = await Lesson.countDocuments({ courseId });

    const enrollment = await CourseEnrollment.create({
      studentId: req.userId,
      courseId,
      totalLessons
    });

    // Add student to course's enrolled students
    await LMSCourse.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: req.userId }
    });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ success: false, message: 'Failed to enroll', error: error.message });
  }
};

// @desc    Get student's enrolled courses
// @route   GET /api/lms/enrollments
// @access  Student only
exports.getEnrollments = async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({ studentId: req.userId })
      .populate({
        path: 'courseId',
        populate: { path: 'instructor', select: 'name email avatar' }
      })
      .sort({ enrolledAt: -1 });

    res.json({ success: true, data: enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch enrollments', error: error.message });
  }
};

// @desc    Get course progress
// @route   GET /api/lms/courses/:courseId/progress
// @access  Student only
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await CourseEnrollment.findOne({
      studentId: req.userId,
      courseId
    }).populate('lastLessonId');

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Get detailed lesson progress
    const lessonProgress = await LessonProgress.find({
      studentId: req.userId,
      courseId
    });

    res.json({
      success: true,
      data: {
        enrollment,
        lessonProgress
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch progress', error: error.message });
  }
};

// @desc    Update lesson progress
// @route   PUT /api/lms/lessons/:lessonId/progress
// @access  Student only
exports.updateLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { progress, timeSpent } = req.body; // progress: 0-100

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    let lessonProgress = await LessonProgress.findOne({
      studentId: req.userId,
      lessonId
    });

    if (!lessonProgress) {
      lessonProgress = await LessonProgress.create({
        studentId: req.userId,
        courseId: lesson.courseId,
        lessonId,
        progress,
        timeSpent: timeSpent || 0
      });
    } else {
      lessonProgress.progress = progress;
      if (timeSpent) {
        lessonProgress.timeSpent += timeSpent;
      }
      lessonProgress.lastAccessedAt = new Date();

      if (progress >= 100 && !lessonProgress.completed) {
        lessonProgress.completed = true;
        lessonProgress.completedAt = new Date();
      }

      await lessonProgress.save();
    }

    // Update enrollment progress
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    const completedLessons = await LessonProgress.countDocuments({
      studentId: req.userId,
      courseId: lesson.courseId,
      completed: true
    });

    const courseProgress = Math.round((completedLessons / totalLessons) * 100);

    await CourseEnrollment.findOneAndUpdate(
      { studentId: req.userId, courseId: lesson.courseId },
      {
        progress: courseProgress,
        completedLessons,
        totalLessons,
        lastLessonId: lessonId
      }
    );

    res.json({
      success: true,
      message: 'Progress updated',
      data: { lessonProgress, courseProgress }
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress', error: error.message });
  }
};

// @desc    Get unique students enrolled in instructor's courses
// @route   GET /api/lms/instructor/students
// @access  Tutor only
exports.getInstructorStudents = async (req, res) => {
  try {
    console.log('getInstructorStudents called');
    console.log('req.user:', req.user);
    console.log('req.userId:', req.userId);
    console.log('req.authRole:', req.authRole);
    
    // Use req.user._id (from populated user) or fallback to req.userId (from token)
    const instructorId = req.user?._id || req.userId;
    if (!instructorId) {
      console.log('No instructor ID found');
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    console.log('Looking for courses for instructor:', instructorId);
    const courses = await LMSCourse.find({ instructor: instructorId }).select('_id');
    console.log('Found courses:', courses.length);
    
    const courseIds = courses.map(c => c._id);
    if (courseIds.length === 0) {
      console.log('No courses found for this instructor');
      return res.json({ success: true, data: [] });
    }

    const enrollments = await CourseEnrollment.find({ courseId: { $in: courseIds }, status: { $ne: 'dropped' } })
      .populate({ path: 'studentId', select: '_id name email' });

    console.log('Found enrollments:', enrollments.length);

    const unique = new Map();
    enrollments.forEach(enr => {
      if (enr.studentId?._id) {
        unique.set(enr.studentId._id.toString(), {
          userId: enr.studentId._id,
          user: { name: enr.studentId.name, email: enr.studentId.email }
        });
      }
    });

    const result = Array.from(unique.values());
    console.log('Returning students:', result.length);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Get instructor students error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

// @desc    Get instructor's course analytics
// @route   GET /api/lms/instructor/analytics
// @access  Instructor only
exports.getInstructorAnalytics = async (req, res) => {
  try {
    const courses = await LMSCourse.find({ instructor: req.userId });
    const courseIds = courses.map(c => c._id);

    const totalEnrollments = await CourseEnrollment.countDocuments({
      courseId: { $in: courseIds }
    });

    const activeEnrollments = await CourseEnrollment.countDocuments({
      courseId: { $in: courseIds },
      status: 'active'
    });

    const completedEnrollments = await CourseEnrollment.countDocuments({
      courseId: { $in: courseIds },
      status: 'completed'
    });

    // Course-wise enrollment
    const courseAnalytics = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await CourseEnrollment.countDocuments({ courseId: course._id });
        const avgProgress = await CourseEnrollment.aggregate([
          { $match: { courseId: course._id } },
          { $group: { _id: null, avgProgress: { $avg: '$progress' } } }
        ]);

        return {
          courseId: course._id,
          title: course.title,
          enrollments,
          averageProgress: avgProgress[0]?.avgProgress || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        courseAnalytics
      }
    });
  } catch (error) {
    console.error('Get instructor analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};
