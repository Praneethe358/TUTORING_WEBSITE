const Certificate = require('../models/Certificate');
const CourseEnrollment = require('../models/CourseEnrollment');
const LessonProgress = require('../models/LessonProgress');
const Lesson = require('../models/Lesson');
const LMSCourse = require('../models/LMSCourse');

/**
 * Certificate Controller - Handle course completion certificates
 */

// @desc    Issue certificate upon course completion
// @route   POST /api/lms/certificates/issue/:courseId
// @access  Instructor or Automatic on completion
exports.issueCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId, completionDate, finalScore } = req.body;

    const course = await LMSCourse.findById(courseId).populate('instructor');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify permissions (instructor of course)
    if (course.instructor._id.toString() !== req.userId && req.body.issueBy !== 'system') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if student is enrolled and completed
    const enrollment = await CourseEnrollment.findOne({
      courseId,
      studentId
    }).populate('studentId');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Student not enrolled in this course'
      });
    }

    if (enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'Student has not completed the course'
      });
    }

    // Check if certificate already issued
    const existing = await Certificate.findOne({
      courseId,
      studentId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued to this student'
      });
    }

    const certificate = await Certificate.create({
      courseId,
      studentId,
      instructorId: course.instructor._id,
      completionDate: completionDate || new Date(),
      finalScore: finalScore || enrollment.progress,
      courseTitle: course.title,
      studentName: enrollment.studentId.name,
      instructorName: course.instructor.name
    });

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: certificate
    });
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue certificate',
      error: error.message
    });
  }
};

// @desc    Get certificates for student
// @route   GET /api/lms/certificates/my
// @access  Student
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ studentId: req.userId })
      .populate('courseId', 'title')
      .populate('instructorId', 'name email')
      .sort({ issuedDate: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// @desc    Get all certificates for a course
// @route   GET /api/lms/courses/:courseId/certificates
// @access  Instructor (own courses)
exports.getCourseCertificates = async (req, res) => {
  try {
    const { courseId } = req.params;

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

    const certificates = await Certificate.find({ courseId })
      .populate('studentId', 'name email')
      .sort({ issuedDate: -1 });

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Get course certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificates',
      error: error.message
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/lms/certificates/:id
// @access  Student (own) or Instructor
exports.getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('courseId')
      .populate('studentId', 'name email')
      .populate('instructorId', 'name email');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Access control: own certificate or instructor of course
    if (certificate.studentId._id.toString() !== req.userId && 
        certificate.instructorId._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch certificate',
      error: error.message
    });
  }
};

// @desc    Delete certificate (admin/instructor only)
// @route   DELETE /api/lms/certificates/:id
// @access  Instructor
exports.deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate('courseId');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    if (certificate.courseId.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await certificate.deleteOne();

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete certificate',
      error: error.message
    });
  }
};
