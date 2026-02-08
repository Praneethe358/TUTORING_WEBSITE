const mongoose = require('mongoose');
const Message = require('../models/Message');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const TutorAssignment = require('../models/TutorAssignment');

async function ensureConversationAllowed(currentUserId, currentRole, targetUserId, targetRole) {
  // Messaging is only allowed between admin-assigned tutor-student pairs
  if (currentRole === 'student' && targetRole === 'tutor') {
    const assignment = await TutorAssignment.findOne({
      student: currentUserId,
      tutor: targetUserId,
      status: 'active'
    }).lean();
    return Boolean(assignment);
  }

  if (currentRole === 'tutor' && targetRole === 'student') {
    const assignment = await TutorAssignment.findOne({
      tutor: currentUserId,
      student: targetUserId,
      status: 'active'
    }).lean();
    return Boolean(assignment);
  }

  return false;
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
      return res.status(403).json({ message: 'Messaging is only allowed with your admin-assigned tutors/students.' });
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

    // Filter to only show conversations with admin-assigned counterparts
    const assignedIds = (await TutorAssignment.find({
      $or: [{ tutor: userId }, { student: userId }],
      status: 'active'
    }).select('tutor student').lean()).map(a =>
      a.tutor.toString() === userId.toString() ? a.student.toString() : a.tutor.toString()
    );
    const assignedSet = new Set(assignedIds);
    const filteredConversations = populatedConversations.filter(c => assignedSet.has(c.userId.toString()));

    res.json({
      conversations: filteredConversations,
      pagination: {
        page,
        limit,
        total: filteredConversations.length,
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
      return res.status(403).json({ message: 'Messaging is only allowed between admin-assigned tutors and students.' });
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
