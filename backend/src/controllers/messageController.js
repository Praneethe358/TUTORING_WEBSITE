const mongoose = require('mongoose');
const Message = require('../models/Message');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const CourseEnrollment = require('../models/CourseEnrollment');

async function ensureConversationAllowed(currentUserId, currentRole, targetUserId, targetRole) {
  // Only enforce enrollment for student-to-tutor conversations to prevent unsolicited outreach
  if (currentRole === 'student' && targetRole === 'tutor') {
    const tutorObjectId = new mongoose.Types.ObjectId(targetUserId);
    const tutorCourseIds = await Tutor.aggregate([
      { $match: { _id: tutorObjectId } },
      {
        $lookup: {
          from: 'lmscourses',
          localField: '_id',
          foreignField: 'instructor',
          as: 'courses'
        }
      },
      { $project: { courseIds: '$courses._id' } }
    ]);

    const courseIds = tutorCourseIds?.[0]?.courseIds || [];
    if (courseIds.length === 0) return false;

    const enrollment = await CourseEnrollment.findOne({
      studentId: currentUserId,
      courseId: { $in: courseIds },
      status: { $ne: 'dropped' }
    }).lean();

    return Boolean(enrollment);
  }

  if (currentRole === 'tutor' && targetRole === 'student') {
    // Tutors can message students only if they share a course
    const course = await CourseEnrollment.findOne({
      studentId: targetUserId,
      status: { $ne: 'dropped' }
    })
      .populate({ path: 'courseId', select: 'instructor', options: { lean: true } })
      .lean();

    if (!course?.courseId) return false;
    return course.courseId.instructor.toString() === currentUserId.toString();
  }

  return true;
}

/**
 * MESSAGE CONTROLLER
 * Handles message operations (get, send, mark as read)
 */

// Get conversation history between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const requesterRole = req.authRole || req.user?.role;
    const targetIsTutor = Boolean(await Tutor.exists({ _id: userId }));
    const targetRole = targetIsTutor ? 'tutor' : 'student';

    const allowed = await ensureConversationAllowed(currentUserId, requesterRole, userId, targetRole);
    if (!allowed) {
      return res.status(403).json({ message: 'Messaging is only allowed with tutors you are enrolled with.' });
    }

    const query = {
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    };

    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate({ path: 'sender', select: 'name email', strictPopulate: false })
        .populate({ path: 'receiver', select: 'name email', strictPopulate: false })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(query)
    ]);

    // Mark messages as read
    await Message.updateMany(
      { receiver: currentUserId, sender: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const basePipeline = [
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', userId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ];

    const [conversations, totalResult] = await Promise.all([
      Message.aggregate([...basePipeline, { $skip: skip }, { $limit: limit }]),
      Message.aggregate([...basePipeline, { $count: 'total' }])
    ]);

    const total = totalResult?.[0]?.total || 0;

    // Populate user details
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const Student = require('../models/Student');
        const Tutor = require('../models/Tutor');
        let user = await Student.findById(conv._id).select('name email');
        if (!user) {
          user = await Tutor.findById(conv._id).select('name email');
        }
        return {
          userId: conv._id,
          user,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount
        };
      })
    );

    res.json({
      conversations: populatedConversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save message to database (called after Socket.io emission)
exports.saveMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const senderType = (req.authRole || req.user?.role) === 'tutor' ? 'tutor' : 'student';
    const receiverIsTutor = Boolean(await Tutor.exists({ _id: receiverId }));
    const receiverType = receiverIsTutor ? 'tutor' : 'student';

    const allowed = await ensureConversationAllowed(senderId, senderType, receiverId, receiverType);
    if (!allowed) {
      return res.status(403).json({ message: 'Messaging is only allowed between enrolled students and their tutors.' });
    }

    const senderModel = senderType === 'tutor' ? 'Tutor' : 'Student';
    const receiverModel = receiverType === 'tutor' ? 'Tutor' : 'Student';

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      senderModel,
      receiverModel,
      content,
      senderType,
      receiverType
    });

    const populated = await Message.findById(message._id)
      .populate({ path: 'sender', select: 'name email', strictPopulate: false })
      .populate({ path: 'receiver', select: 'name email', strictPopulate: false });

    res.json({ message: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationUserId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { receiver: userId, sender: conversationUserId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
