const LMSCourse = require('../models/LMSCourse');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const LessonProgress = require('../models/LessonProgress');
const CourseEnrollment = require('../models/CourseEnrollment');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');
const TutorAssignment = require('../models/TutorAssignment');

/**
 * LMS Course Controller - Handles course CRUD operations
 */

// @desc    Create a new course
// @route   POST /api/lms/courses
// @access  Instructor only
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      prerequisites,
      learningOutcomes,
      thumbnail
    } = req.body;

    const instructorId = req.userId;

    const normalizedLevel = level
      ? level.charAt(0).toUpperCase() + level.slice(1).toLowerCase()
      : 'Beginner';

    const course = await LMSCourse.create({
      title,
      description,
      category,
      level: normalizedLevel,
      duration,
      prerequisites,
      learningOutcomes,
      thumbnail,
      instructor: instructorId,
      status: 'draft'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// @desc    Get all courses (with filters)
// @route   GET /api/lms/courses
// @access  Public (published) / Instructor (own drafts)
exports.getCourses = async (req, res) => {
  try {
    // Auto-publish scheduled courses whose publishAt has passed
    await LMSCourse.updateMany(
      { status: 'scheduled', publishAt: { $lte: new Date() } },
      { status: 'published', publishedAt: new Date() }
    );

    const { category, level, status, instructor, q, sort } = req.query;
    const query = {};

    // Filtering
    if (category) query.category = category;
    if (level) query.level = level;
    if (status) query.status = status;
    if (instructor) {
      if (instructor === 'current') {
        const currentId = req.userId;
        if (!currentId) {
          return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        query.instructor = currentId;
      } else {
        query.instructor = instructor;
      }
    }

    // If student, only show published courses from assigned tutors
    if (req.user?.role === 'student') {
      query.status = 'published';
      const assignments = await TutorAssignment.find({
        student: req.userId,
        status: 'active'
      }).select('tutor').lean();
      const assignedTutorIds = assignments.map(a => a.tutor);
      query.instructor = { $in: assignedTutorIds };
    }

    // If instructor, show own courses + published courses
    if (req.user?.role === 'tutor' && !instructor) {
      query.$or = [
        { instructor: req.userId },
        { status: 'published' }
      ];
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const sortOptions = (() => {
      if (sort === 'newest') return { createdAt: -1 };
      if (sort === 'oldest') return { createdAt: 1 };
      if (sort === 'popularity') return { enrolledStudents: -1 };
      return { createdAt: -1 };
    })();

    const courses = await LMSCourse.find(query)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort(sortOptions);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// @desc    Get single course with modules and lessons
// @route   GET /api/lms/courses/:id
// @access  Public (published) / Instructor (own)
exports.getCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id)
      .populate('instructor', 'name email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.status === 'scheduled' && course.publishAt && course.publishAt <= new Date()) {
      course.status = 'published';
      course.publishedAt = new Date();
      await course.save();
    }

    // Check access permissions
    const isInstructor = course.instructor._id.toString() === req.user?.userId;
    if (['draft', 'scheduled', 'archived'].includes(course.status) &&
        req.user?.role !== 'tutor' &&
        !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get modules with lessons
    const modules = await Module.find({ courseId: course._id })
      .sort({ order: 1 });

    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        let lessons = await Lesson.find({ moduleId: module._id })
          .sort({ order: 1 });
        
        // If student, attach completion status
        if (req.user?.role === 'student') {
          const progresses = await LessonProgress.find({
            studentId: req.userId,
            lessonId: { $in: lessons.map(l => l._id) }
          });

          lessons = lessons.map(lesson => {
            const progress = progresses.find(p => p.lessonId.toString() === lesson._id.toString());
            return {
              ...lesson.toObject(),
              completed: progress ? progress.completed : false
            };
          });
        }
        
        return {
          ...module.toObject(),
          lessons
        };
      })
    );

    // If student, check enrollment and progress
    let enrollment = null;
    if (req.user?.role === 'student') {
      enrollment = await CourseEnrollment.findOne({
        studentId: req.userId,
        courseId: course._id
      });
    }

    // Get assignments and quizzes
    let assignments = await Assignment.find({ courseId: course._id });
    let quizzes = await Quiz.find({ courseId: course._id });

    // If student, attach submission and attempt status
    if (req.user?.role === 'student') {
      const AssignmentSubmission = require('../models/AssignmentSubmission');
      const QuizAttempt = require('../models/QuizAttempt');

      assignments = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await AssignmentSubmission.findOne({
            assignmentId: assignment._id,
            studentId: req.userId
          });
          return {
            ...assignment.toObject(),
            submission: submission || null
          };
        })
      );

      quizzes = await Promise.all(
        quizzes.map(async (quiz) => {
          const attempts = await QuizAttempt.find({
            quizId: quiz._id,
            studentId: req.userId
          });
          const quizObj = quiz.toObject();
          // Hide correct answers for students
          quizObj.questions = quizObj.questions.map(q => ({
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            points: q.points
          }));
          return {
            ...quizObj,
            attemptsCount: attempts.length,
            bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null
          };
        })
      );
    }

    res.json({
      success: true,
      data: {
        course,
        modules: modulesWithLessons,
        enrollment,
        assignments,
        quizzes
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/lms/courses/:id
// @access  Instructor (own courses only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership using req.userId from middleware
    const currentUserId = req.userId || req.user?._id?.toString();
    if (course.instructor.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'category',
      'level',
      'duration',
      'prerequisites',
      'learningOutcomes',
      'thumbnail',
      'status'
    ];

    let updated = false;
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
        updated = true;
      }
    });

    // Schedule publish if provided
    if (req.body.publishAt) {
      course.publishAt = req.body.publishAt;
      course.status = 'scheduled';
      updated = true;
    }

    if (updated) {
      course.versionHistory.push({
        version: course.version,
        updatedAt: new Date(),
        updatedBy: currentUserId,
        snapshot: {
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          duration: course.duration,
          prerequisites: course.prerequisites,
          learningOutcomes: course.learningOutcomes,
          thumbnail: course.thumbnail,
          status: course.status,
          publishAt: course.publishAt
        }
      });
      course.version += 1;
    }

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/lms/courses/:id
// @access  Instructor (own courses only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership using req.userId from middleware
    const currentUserId = req.userId || req.user?._id?.toString();
    if (course.instructor.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    // Delete all related data
    await Module.deleteMany({ courseId: course._id });
    await Lesson.deleteMany({ courseId: course._id });
    await CourseEnrollment.deleteMany({ courseId: course._id });
    
    await course.deleteOne();

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// @desc    Publish/Unpublish course
// @route   PATCH /api/lms/courses/:id/publish
// @access  Instructor (own courses only)
exports.togglePublish = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check ownership using req.userId from middleware
    const currentUserId = req.userId || req.user?._id?.toString();
    if (course.instructor.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.body?.publishAt) {
      course.publishAt = req.body.publishAt;
      course.status = 'scheduled';
    } else {
      course.status = course.status === 'published' ? 'draft' : 'published';
      course.publishedAt = course.status === 'published' ? new Date() : null;
    }
    await course.save();

    res.json({
      success: true,
      message: `Course ${course.status === 'published' ? 'published' : 'unpublished'} successfully`,
      data: course
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course status',
      error: error.message
    });
  }
};
