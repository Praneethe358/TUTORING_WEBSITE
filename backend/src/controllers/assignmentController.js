const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const LMSCourse = require('../models/LMSCourse');

/**
 * Assignment Controller
 */

// @desc    Create assignment
// @route   POST /api/lms/courses/:courseId/assignments
// @access  Instructor only
exports.createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, attachmentUrl, deadline, maxScore, moduleId } = req.body;

    // Verify course ownership
    const course = await LMSCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      courseId,
      moduleId,
      title,
      description,
      attachmentUrl,
      deadline,
      maxScore: maxScore || 100,
      instructor: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment', error: error.message });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/lms/courses/:courseId/assignments
// @access  Enrolled students / Instructor
exports.getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({ courseId })
      .sort({ deadline: 1 });

    // If student, attach submission status
    if (req.user?.role === 'student') {
      const assignmentsWithStatus = await Promise.all(
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

      return res.json({ success: true, data: assignmentsWithStatus });
    }

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch assignments', error: error.message });
  }
};

// @desc    Update assignment
// @route   PUT /api/lms/assignments/:id
// @access  Instructor only
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, attachmentUrl, deadline, maxScore } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (attachmentUrl) assignment.attachmentUrl = attachmentUrl;
    if (deadline) assignment.deadline = deadline;
    if (maxScore) assignment.maxScore = maxScore;

    await assignment.save();

    res.json({ success: true, message: 'Assignment updated successfully', data: assignment });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to update assignment', error: error.message });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/lms/assignments/:id
// @access  Instructor only
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
    await assignment.deleteOne();

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete assignment', error: error.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/lms/assignments/:id/submit
// @access  Student only
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let { submissionUrl, submissionText } = req.body;

    // If file is uploaded, use it
    if (req.file) {
      submissionUrl = `/uploads/submissions/${req.file.filename}`;
    }

    if (!submissionUrl && !submissionText) {
      return res.status(400).json({ success: false, message: 'Submission content or file is required' });
    }

    // Check if already submitted
    let submission = await AssignmentSubmission.findOne({
      assignmentId: assignment._id,
      studentId: req.userId
    });

    if (submission) {
      // Update existing submission
      if (submissionUrl) submission.submissionUrl = submissionUrl;
      if (submissionText !== undefined) submission.submissionText = submissionText;
      submission.status = 'submitted';
      await submission.save();
    } else {
      // Create new submission
      submission = await AssignmentSubmission.create({
        assignmentId: assignment._id,
        studentId: req.userId,
        submissionUrl: submissionUrl || 'text-only', // submissionUrl is required in model
        submissionText
      });
    }

    res.json({ success: true, message: 'Assignment submitted successfully', data: submission });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit assignment', error: error.message });
  }
};

// @desc    Get submissions for an assignment
// @route   GET /api/lms/assignments/:id/submissions
// @access  Instructor only
exports.getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id })
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch submissions', error: error.message });
  }
};

// @desc    Grade assignment submission
// @route   PUT /api/lms/submissions/:id/grade
// @access  Instructor only
exports.gradeSubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findById(req.params.id)
      .populate('assignmentId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify instructor owns the assignment
    if (submission.assignmentId.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { score, feedback } = req.body;

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'graded';
    submission.gradedBy = req.userId;
    submission.gradedAt = new Date();

    await submission.save();

    res.json({ success: true, message: 'Submission graded successfully', data: submission });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to grade submission', error: error.message });
  }
};
