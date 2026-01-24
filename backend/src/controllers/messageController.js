const Message = require('../models/Message');

/**
 * MESSAGE CONTROLLER
 * Handles message operations (get, send, mark as read)
 */

// Get conversation history between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: 1 })
      .limit(50);

    // Mark messages as read
    await Message.updateMany(
      { receiver: currentUserId, sender: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get list of conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Message.aggregate([
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
    ]);

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

    res.json({ conversations: populatedConversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save message to database (called after Socket.io emission)
exports.saveMessage = async (req, res) => {
  try {
    const { receiverId, content, senderType, receiverType } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      senderType,
      receiverType
    });

    await message.populate('sender', 'name email').populate('receiver', 'name email');

    res.json({ message });
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
