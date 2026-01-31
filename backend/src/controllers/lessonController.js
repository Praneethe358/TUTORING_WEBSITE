const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const LMSCourse = require('../models/LMSCourse');
const LessonProgress = require('../models/LessonProgress');

/**
 * Lesson Controller - Handles course lessons
 */

// @desc    Create a new lesson
// @route   POST /api/lms/modules/:moduleId/lessons
// @access  Instructor only
exports.createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      type,
      contentUrl,
      textContent,
      resourceLinks,
      duration,
      isFree,
      isLocked,
      order
    } = req.body;

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Verify course ownership
    const course = await LMSCourse.findById(module.courseId);
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Auto-assign order if not provided
    let lessonOrder = order;
    if (lessonOrder === undefined) {
      const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 });
      lessonOrder = lastLesson ? lastLesson.order + 1 : 0;
    }

    const lesson = await Lesson.create({
      moduleId,
      courseId: module.courseId,
      title,
      description,
      type,
      contentUrl,
      textContent,
      resourceLinks,
      duration,
      isFree: isFree || false,
      isLocked: isLocked !== undefined ? isLocked : true,
      order: lessonOrder
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lesson',
      error: error.message
    });
  }
};

// @desc    Get all lessons for a module
// @route   GET /api/lms/modules/:moduleId/lessons
// @access  Public (if course is published)
exports.getLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });

    // If student, attach progress
    if (req.user?.role === 'student') {
      const lessonsWithProgress = await Promise.all(
        lessons.map(async (lesson) => {
          const progress = await LessonProgress.findOne({
            studentId: req.userId,
            lessonId: lesson._id
          });
          
          return {
            ...lesson.toObject(),
            progress: progress ? progress.progress : 0,
            completed: progress ? progress.completed : false
          };
        })
      );

      return res.json({
        success: true,
        data: lessonsWithProgress
      });
    }

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lessons',
      error: error.message
    });
  }
};

// @desc    Get single lesson
// @route   GET /api/lms/lessons/:id
// @access  Enrolled students / Instructor
exports.getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Check access permissions (free lessons or enrolled)
    // Simplified for MVP - implement proper enrollment check later

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lesson',
      error: error.message
    });
  }
};

// @desc    Update lesson
// @route   PUT /api/lms/lessons/:id
// @access  Instructor only
exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Verify course ownership
    const course = await LMSCourse.findById(lesson.courseId);
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const allowedFields = [
      'title',
      'description',
      'type',
      'contentUrl',
      'textContent',
      'resourceLinks',
      'duration',
      'isFree',
      'isLocked',
      'order'
    ];

    let updated = false;
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        lesson[field] = req.body[field];
        updated = true;
      }
    });

    if (updated) {
      lesson.versionHistory.push({
        version: lesson.version,
        updatedAt: new Date(),
        updatedBy: req.userId,
        snapshot: {
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          type: lesson.type,
          contentUrl: lesson.contentUrl,
          textContent: lesson.textContent,
          resourceLinks: lesson.resourceLinks,
          duration: lesson.duration,
          isFree: lesson.isFree,
          isLocked: lesson.isLocked
        }
      });
      lesson.version += 1;
    }

    await lesson.save();

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lesson',
      error: error.message
    });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lms/lessons/:id
// @access  Instructor only
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Verify course ownership
    const course = await LMSCourse.findById(lesson.courseId);
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Delete lesson progress records
    await LessonProgress.deleteMany({ lessonId: lesson._id });

    await lesson.deleteOne();

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lesson',
      error: error.message
    });
  }
};

// @desc    Mark lesson as complete
// @route   POST /api/lms/lessons/:id/complete
// @access  Student only
exports.completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    // Find or create progress record
    let progress = await LessonProgress.findOne({
      studentId: req.userId,
      lessonId: lesson._id
    });

    if (!progress) {
      progress = await LessonProgress.create({
        studentId: req.userId,
        courseId: lesson.courseId,
        lessonId: lesson._id,
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
    const CourseEnrollment = require('../models/CourseEnrollment');
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
        lastLessonId: lesson._id
      },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: { progress, courseProgress }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson as complete',
      error: error.message
    });
  }
};

// @desc    Reorder lessons
// @route   PATCH /api/lms/modules/:moduleId/lessons/reorder
// @access  Instructor only
exports.reorderLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { lessonIds } = req.body; // Array of lesson IDs in new order

    // Verify module exists
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    // Verify course ownership
    const course = await LMSCourse.findById(module.courseId);
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update order for each lesson
    const updatePromises = lessonIds.map((lessonId, index) =>
      Lesson.findByIdAndUpdate(lessonId, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('Reorder lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder lessons',
      error: error.message
    });
  }
};
