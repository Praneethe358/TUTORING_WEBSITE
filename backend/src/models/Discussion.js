const mongoose = require('mongoose');

// Discussion comment/thread in a course
const discussionSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LMSCourse',
      required: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
      // Optional - if null, discussion is course-level
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isQuestion: {
      type: Boolean,
      default: false // Mark if it's a question vs general discussion
    },
    isPinned: {
      type: Boolean,
      default: false // Pinned by instructor
    },
    isAnswered: {
      type: Boolean,
      default: false // If isQuestion, mark when answered
    },
    replies: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        content: String,
        isInstructorReply: Boolean,
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
          }
        ],
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    views: {
      type: Number,
      default: 0
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    tags: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Discussion', discussionSchema);
