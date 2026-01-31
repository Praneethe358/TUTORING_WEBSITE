const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const LMSCourse = require('../models/LMSCourse');

/**
 * Quiz Controller
 */

// @desc    Create quiz
// @route   POST /api/lms/courses/:courseId/quizzes
// @access  Instructor only
exports.createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, questions, timeLimit, passingScore, maxAttempts, moduleId } = req.body;

    // Verify course ownership
    const course = await LMSCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const quiz = await Quiz.create({
      courseId,
      moduleId,
      title,
      description,
      questions,
      timeLimit,
      passingScore: passingScore || 60,
      maxAttempts: maxAttempts || 3,
      instructor: req.userId
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to create quiz', error: error.message });
  }
};

// @desc    Get quizzes for a course
// @route   GET /api/lms/courses/:courseId/quizzes
// @access  Enrolled students / Instructor
exports.getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    // For students, hide correct answers
    const quizzes = await Quiz.find({ courseId });

    if (req.user?.role === 'student') {
      const quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz) => {
          const attempts = await QuizAttempt.find({
            quizId: quiz._id,
            studentId: req.userId
          }).sort({ createdAt: -1 });

          const quizObj = quiz.toObject();
          // Remove correct answers for students
          quizObj.questions = quizObj.questions.map(q => ({
            questionText: q.questionText,
            type: q.type,
            options: q.options,
            points: q.points
          }));

          return {
            ...quizObj,
            attempts: attempts.length,
            bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null
          };
        })
      );

      return res.json({ success: true, data: quizzesWithAttempts });
    }

    res.json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
};

// @desc    Get single quiz
// @route   GET /api/lms/quizzes/:id
// @access  Enrolled students / Instructor
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // For students, hide correct answers
    if (req.user?.role === 'student') {
      const quizObj = quiz.toObject();
      quizObj.questions = quizObj.questions.map(q => ({
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        points: q.points
      }));

      // Check attempts
      const attempts = await QuizAttempt.countDocuments({
        quizId: quiz._id,
        studentId: req.userId
      });

      return res.json({
        success: true,
        data: {
          ...quizObj,
          remainingAttempts: quiz.maxAttempts - attempts
        }
      });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/lms/quizzes/:id
// @access  Instructor only
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, questions, timeLimit, passingScore, maxAttempts } = req.body;
    if (title) quiz.title = title;
    if (description) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (passingScore) quiz.passingScore = passingScore;
    if (maxAttempts) quiz.maxAttempts = maxAttempts;

    await quiz.save();

    res.json({ success: true, message: 'Quiz updated successfully', data: quiz });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quiz', error: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/lms/quizzes/:id
// @access  Instructor only
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.instructor.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await QuizAttempt.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quiz', error: error.message });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/lms/quizzes/:id/attempt
// @access  Student only
exports.submitQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Check remaining attempts
    const attemptCount = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: req.userId
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({ success: false, message: 'Maximum attempts reached' });
    }

    const { answers, timeSpent } = req.body; // answers: [{ questionIndex, answer }]

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      const studentAnswer = answers.find(a => a.questionIndex === index);
      
      if (studentAnswer && studentAnswer.answer === question.correctAnswer) {
        score += question.points;
      }
    });

    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      studentId: req.userId,
      answers,
      score,
      totalPoints,
      percentage,
      passed,
      attemptNumber: attemptCount + 1,
      timeSpent
    });

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        totalPoints,
        percentage,
        passed,
        attemptNumber: attemptCount + 1,
        remainingAttempts: quiz.maxAttempts - (attemptCount + 1)
      }
    });
  } catch (error) {
    console.error('Submit quiz attempt error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
};

// @desc    Get quiz attempts
// @route   GET /api/lms/quizzes/:id/attempts
// @access  Student (own) / Instructor (all)
exports.getQuizAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let attempts;

    if (req.user.role === 'student') {
      attempts = await QuizAttempt.find({
        quizId: quiz._id,
        studentId: req.userId
      }).sort({ createdAt: -1 });
    } else if (req.user.role === 'tutor' && quiz.instructor.toString() === req.userId) {
      attempts = await QuizAttempt.find({ quizId: quiz._id })
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz attempts', error: error.message });
  }
};
