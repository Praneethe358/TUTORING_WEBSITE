const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const LMSCourse = require('../models/LMSCourse');

/**
 * Module Controller - Handles course modules
 */

// @desc    Create a new module
// @route   POST /api/lms/courses/:courseId/modules
// @access  Instructor only
exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    // Verify course ownership
    const course = await LMSCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Auto-assign order if not provided
    let moduleOrder = order;
    if (moduleOrder === undefined) {
      const lastModule = await Module.findOne({ courseId }).sort({ order: -1 });
      moduleOrder = lastModule ? lastModule.order + 1 : 0;
    }

    const module = await Module.create({
      courseId,
      title,
      description,
      order: moduleOrder
    });

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create module',
      error: error.message
    });
  }
};

// @desc    Get all modules for a course
// @route   GET /api/lms/courses/:courseId/modules
// @access  Public (if course is published)
exports.getModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const modules = await Module.find({ courseId }).sort({ order: 1 });

    res.json({
      success: true,
      data: modules
    });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch modules',
      error: error.message
    });
  }
};

// @desc    Update module
// @route   PUT /api/lms/modules/:id
// @access  Instructor only
exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

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

    const { title, description, order } = req.body;
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;

    await module.save();

    res.json({
      success: true,
      message: 'Module updated successfully',
      data: module
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update module',
      error: error.message
    });
  }
};

// @desc    Delete module
// @route   DELETE /api/lms/modules/:id
// @access  Instructor only
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);

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

    // Delete all lessons in this module
    await Lesson.deleteMany({ moduleId: module._id });

    await module.deleteOne();

    res.json({
      success: true,
      message: 'Module deleted successfully'
    });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete module',
      error: error.message
    });
  }
};

// @desc    Reorder modules
// @route   PATCH /api/lms/courses/:courseId/modules/reorder
// @access  Instructor only
exports.reorderModules = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleIds } = req.body; // Array of module IDs in new order

    // Verify course ownership
    const course = await LMSCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update order for each module
    const updatePromises = moduleIds.map((moduleId, index) =>
      Module.findByIdAndUpdate(moduleId, { order: index }, { new: true })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Modules reordered successfully'
    });
  } catch (error) {
    console.error('Reorder modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder modules',
      error: error.message
    });
  }
};
