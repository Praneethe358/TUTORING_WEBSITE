const Discussion = require('../models/Discussion');
const LMSCourse = require('../models/LMSCourse');
const Lesson = require('../models/Lesson');

/**
 * Discussion Controller - Handle course discussions and Q&A
 */

// @desc    Create discussion thread
// @route   POST /api/lms/discussions
// @access  Enrolled students and instructors
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId, lessonId, title, content, isQuestion, tags } = req.body;

    // Verify course exists
    const course = await LMSCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // If lesson specified, verify it exists
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }
    }

    const discussion = await Discussion.create({
      courseId,
      lessonId: lessonId || null,
      authorId: req.userId,
      title,
      content,
      isQuestion: isQuestion || false,
      tags: tags || []
    });

    await discussion.populate('authorId', 'name avatar email');

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discussion',
      error: error.message
    });
  }
};

// @desc    Get discussions for course/lesson
// @route   GET /api/lms/discussions
// @access  Public (published courses)
exports.getDiscussions = async (req, res) => {
  try {
    const { courseId, lessonId, isQuestion } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (isQuestion) query.isQuestion = isQuestion === 'true';

    const discussions = await Discussion.find(query)
      .populate('authorId', 'name avatar email')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussions',
      error: error.message
    });
  }
};

// @desc    Get single discussion with replies
// @route   GET /api/lms/discussions/:id
// @access  Public (published courses)
exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // Increment view count
      { new: true }
    ).populate('authorId', 'name avatar email')
      .populate('replies.authorId', 'name avatar email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discussion',
      error: error.message
    });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/lms/discussions/:id/reply
// @access  Enrolled students and instructors
exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Check if user is instructor of the course
    const course = await LMSCourse.findById(discussion.courseId);
    const isInstructor = course.instructor.toString() === req.userId;

    const reply = {
      _id: new require('mongoose').Types.ObjectId(),
      authorId: req.userId,
      content,
      isInstructorReply: isInstructor,
      createdAt: new Date()
    };

    discussion.replies.push(reply);

    // If instructor replies to question, mark as answered
    if (discussion.isQuestion && isInstructor) {
      discussion.isAnswered = true;
    }

    await discussion.save();
    await discussion.populate('replies.authorId', 'name avatar email');

    res.json({
      success: true,
      message: 'Reply added successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message
    });
  }
};

// @desc    Like discussion
// @route   POST /api/lms/discussions/:id/like
// @access  Logged in users
exports.likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    const hasLiked = discussion.likes.includes(req.userId);

    if (hasLiked) {
      discussion.likes = discussion.likes.filter(
        (id) => id.toString() !== req.userId
      );
    } else {
      discussion.likes.push(req.userId);
    }

    await discussion.save();

    res.json({
      success: true,
      message: hasLiked ? 'Like removed' : 'Discussion liked',
      data: discussion
    });
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like discussion',
      error: error.message
    });
  }
};

// @desc    Pin/Unpin discussion (instructor only)
// @route   PATCH /api/lms/discussions/:id/pin
// @access  Instructor
exports.togglePin = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Verify instructor
    const course = await LMSCourse.findById(discussion.courseId);
    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      success: true,
      message: discussion.isPinned ? 'Discussion pinned' : 'Discussion unpinned',
      data: discussion
    });
  } catch (error) {
    console.error('Toggle pin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle pin',
      error: error.message
    });
  }
};

// @desc    Delete discussion (author or instructor)
// @route   DELETE /api/lms/discussions/:id
// @access  Author or Instructor
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Verify permissions
    const isAuthor = discussion.authorId.toString() === req.userId;
    const course = await LMSCourse.findById(discussion.courseId);
    const isInstructor = course.instructor.toString() === req.userId;

    if (!isAuthor && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discussion',
      error: error.message
    });
  }
};

// @desc    Edit discussion (author only)
// @route   PUT /api/lms/discussions/:id
// @access  Author
exports.updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion not found'
      });
    }

    // Verify author
    if (discussion.authorId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { title, content, tags } = req.body;
    if (title) discussion.title = title;
    if (content) discussion.content = content;
    if (tags) discussion.tags = tags;

    await discussion.save();

    res.json({
      success: true,
      message: 'Discussion updated successfully',
      data: discussion
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discussion',
      error: error.message
    });
  }
};
