import React, { useEffect, useState, useCallback } from 'react';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import api from '../lib/api';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const enrollmentsRes = await api.get('/lms/enrollments/student');
      const enrollments = enrollmentsRes.data.data || [];

      const allQuizzes = [];
      for (const enrollment of enrollments) {
        try {
          const quizzesRes = await api.get(`/lms/courses/${enrollment.courseId._id}/quizzes`);
          const courseQuizzes = (quizzesRes.data.data || []).map(q => ({
            ...q,
            courseName: enrollment.courseId.title,
            courseId: enrollment.courseId._id
          }));
          allQuizzes.push(...courseQuizzes);
        } catch (err) {
          console.error('Failed to fetch quizzes:', err);
        }
      }

      setQuizzes(allQuizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    if (quiz.attempts >= quiz.maxAttempts) {
      alert('You have reached the maximum number of attempts for this quiz');
      return;
    }

    try {
      const res = await api.get(`/lms/quizzes/${quiz._id}`);
      setQuizData(res.data.data);
      setSelectedQuiz(quiz);
      setAnswers({});
      setResult(null);
      setTimeLeft(res.data.data.timeLimit * 60); // Convert minutes to seconds
      setQuizStartTime(Date.now());
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('Failed to load quiz');
    }
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return;
    
    if (!quizData) return;

    if (!isAutoSubmit && Object.keys(answers).length < quizData.questions.length) {
      if (!window.confirm('You have not answered all questions. Submit anyway?')) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      const formattedAnswers = quizData.questions.map((_, index) => ({
        questionIndex: index,
        answer: answers[index] || null
      }));

      const res = await api.post(`/lms/quizzes/${quizData._id}/attempt`, {
        answers: formattedAnswers,
        timeSpent
      });

      setResult(res.data.data);
      setTimeLeft(null);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      alert(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, quizData, answers, quizStartTime]);

  const handleAutoSubmit = useCallback(async () => {
    if (!quizData) return;
    await handleSubmit(true);
  }, [quizData, handleSubmit]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleAutoSubmit]);

  const closeQuiz = () => {
    setSelectedQuiz(null);
    setQuizData(null);
    setAnswers({});
    setResult(null);
    setTimeLeft(null);
    fetchQuizzes();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (quiz) => {
    if (quiz.attempts >= quiz.maxAttempts) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Completed</span>;
    }
    if (quiz.bestScore !== null) {
      const passed = quiz.bestScore >= quiz.passingScore;
      return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          passed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          Best: {quiz.bestScore}%
        </span>
      );
    }
    return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Not Started</span>;
  };

  if (result) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl ${
              result.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.passed ? '✅' : '❌'}
            </div>
            <h2 className="text-3xl font-bold text-black mb-2">
              {result.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-black mb-6">
              {result.passed ? 'You passed the quiz!' : 'You did not pass this time.'}
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-black">Score</p>
                <p className="text-2xl font-bold text-black">{result.score}/{result.totalPoints}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-black">Percentage</p>
                <p className="text-2xl font-bold text-black">{result.percentage}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-black">Attempts Left</p>
                <p className="text-2xl font-bold text-black">{result.remainingAttempts}</p>
              </div>
            </div>

            <button
              onClick={closeQuiz}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  if (quizData) {
    return (
      <StudentDashboardLayout>
        <div className="max-w-4xl mx-auto">
          {/* Quiz Header */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-black">{quizData.title}</h1>
                <p className="text-black mt-1">{selectedQuiz.courseName}</p>
              </div>
              {timeLeft !== null && (
                <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-black'}`}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
            </div>
            <p className="text-black">{quizData.description}</p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {quizData.questions.map((question, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-lg font-medium text-black mb-4">{question.questionText}</p>
                    <p className="text-sm text-black mb-4">Points: {question.points}</p>

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                              answers[index] === option
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={answers[index] === option}
                              onChange={() => handleAnswerChange(index, option)}
                              className="mr-3"
                            />
                            <span className="text-black">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'true-false' && (
                      <div className="space-y-2">
                        {['True', 'False'].map((option) => (
                          <label
                            key={option}
                            className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition ${
                              answers[index] === option
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${index}`}
                              value={option}
                              checked={answers[index] === option}
                              onChange={() => handleAnswerChange(index, option)}
                              className="mr-3"
                            />
                            <span className="text-black">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'short-answer' && (
                      <input
                        type="text"
                        value={answers[index] || ''}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-semibold text-lg disabled:opacity-50 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  closeQuiz();
                }
              }}
              className="px-8 py-4 bg-gray-200 hover:bg-gray-300 rounded-lg text-black font-semibold transition"
            >
              Exit
            </button>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">My Quizzes</h1>
        <p className="text-black mt-1">Take quizzes and test your knowledge</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
          <p className="text-black">No quizzes available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-black">{quiz.title}</h3>
                    {getStatusBadge(quiz)}
                  </div>
                  <p className="text-sm text-black mb-2">{quiz.courseName}</p>
                  <p className="text-black mb-3">{quiz.description}</p>
                  <div className="flex items-center gap-4 text-sm text-black">
                    <span>⏱️ Time Limit: {quiz.timeLimit} min</span>
                    <span>📊 Passing Score: {quiz.passingScore}%</span>
                    <span>🔄 Attempts: {quiz.attempts}/{quiz.maxAttempts}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => startQuiz(quiz)}
                    disabled={quiz.attempts >= quiz.maxAttempts}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {quiz.attempts >= quiz.maxAttempts ? 'No Attempts Left' : quiz.attempts > 0 ? 'Retake' : 'Start Quiz'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentDashboardLayout>
  );
};

export default StudentQuizzes;
