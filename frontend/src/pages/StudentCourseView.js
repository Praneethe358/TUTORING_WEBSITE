import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StudentSidebar from '../components/StudentSidebar';
import api from '../lib/api';

/**
 * Student Course View
 * View course content with modules and lessons
 */
const StudentCourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // seconds
  const [submittingAssignment, setSubmittingAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content'); // content, assignments, quizzes

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/lms/courses/${courseId}`);
      if (res.data?.data) {
        setCourse(res.data.data.course);
        setModules(res.data.data.modules || []);
        setAssignments(res.data.data.assignments || []);
        setQuizzes(res.data.data.quizzes || []);
        setEnrollment(res.data.data.enrollment);

        // Auto-select first incomplete lesson or first lesson
        if (res.data.data.modules && res.data.data.modules.length > 0) {
          const firstModule = res.data.data.modules[0];
          if (firstModule.lessons && firstModule.lessons.length > 0) {
            setSelectedLesson(firstModule.lessons[0]);
          }
        }
      }
    } catch (err) {
      console.error('Fetch course error:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  const handleQuizSubmit = useCallback(async (autoSubmit = false) => {
    if (!takingQuiz) return;
    
    if (!autoSubmit && takingQuiz.answers.length < takingQuiz.quiz.questions.length) {
      if (!window.confirm('You haven\'t answered all questions. Submit anyway?')) return;
    }

    try {
      const timeSpent = takingQuiz.quiz.timeLimit * 60 - timeLeft;
      const res = await api.post(`/lms/quizzes/${takingQuiz.quiz._id}/attempt`, {
        answers: takingQuiz.answers,
        timeSpent: Math.max(0, timeSpent)
      });
      
      alert(`Quiz ${autoSubmit ? 'Auto-Submitted (Time up)!' : 'Submitted!'} Result: ${res.data.data.passed ? 'PASSED' : 'FAILED'} (${res.data.data.percentage}%)`);
      setTakingQuiz(null);
      setTimeLeft(null);
      fetchCourseData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit quiz');
    }
  }, [takingQuiz, timeLeft, fetchCourseData]);

  useEffect(() => {
    let timer;
    if (takingQuiz && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (takingQuiz && timeLeft === 0) {
      handleQuizSubmit(true);
    }
    return () => clearInterval(timer);
  }, [takingQuiz, timeLeft, handleQuizSubmit]);

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      await api.post(`/lms/lessons/${lessonId}/complete`);
      // Refresh course data to update progress
      fetchCourseData();
      alert('Lesson marked as complete!');
    } catch (err) {
      console.error('Complete lesson error:', err);
      alert('Failed to mark lesson as complete');
    }
  };

  const renderLessonContent = (lesson) => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'video':
        return (
          <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
            {lesson.contentUrl ? (
              <iframe
                src={lesson.contentUrl}
                title={lesson.title || 'Video content'}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            ) : (
              <p className="text-slate-400">Video content not available</p>
            )}
          </div>
        );

      case 'text':
        return (
          <div className="prose prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: lesson.textContent }} />
          </div>
        );

      case 'pdf':
      case 'ppt':
        return (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-slate-300 mb-4">View {lesson.type.toUpperCase()} content</p>
            {lesson.contentUrl && (
              <a
                href={lesson.contentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium inline-block"
              >
                Open File
              </a>
            )}
          </div>
        );

      case 'resource':
        return (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Resources</h4>
            {lesson.resourceLinks && lesson.resourceLinks.length > 0 ? (
              lesson.resourceLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                >
                  <p className="text-white font-medium">{link.title}</p>
                  <p className="text-sm text-slate-400">{link.url}</p>
                </a>
              ))
            ) : (
              <p className="text-slate-400">No resources available</p>
            )}
          </div>
        );

      default:
        return <p className="text-slate-400">Content not available</p>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={StudentSidebar}>
        <div className="text-center py-12 text-slate-400">Loading course...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout sidebar={StudentSidebar}>
        <div className="text-center py-12 text-slate-400">Course not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={StudentSidebar}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">{course.title}</h1>
        <div className="flex border-b border-slate-700">
          {['content', 'assignments', 'quizzes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          {activeTab === 'content' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              {selectedLesson ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    {selectedLesson.title}
                  </h2>

                  {selectedLesson.description && (
                    <p className="text-slate-400 mb-6">{selectedLesson.description}</p>
                  )}

                  <div className="mb-6">
                    {renderLessonContent(selectedLesson)}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {selectedLesson.duration && (
                        <span>{selectedLesson.duration} minutes</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCompleteLesson(selectedLesson._id)}
                      className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium"
                    >
                      Mark as Complete
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  Select a lesson to start learning
                </div>
              )}
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {submittingAssignment ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-white">Submit: {submittingAssignment.title}</h2>
                      <button onClick={() => setSubmittingAssignment(null)} className="text-slate-400 hover:text-white font-medium">Cancel</button>
                   </div>
                   <form onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.target);
                     // Map 'content' textarea to 'submissionText' for backend
                     formData.append('submissionText', formData.get('content'));
                     
                     try {
                        await api.post(`/lms/assignments/${submittingAssignment._id}/submit`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        alert('Assignment submitted!');
                        setSubmittingAssignment(null);
                        fetchCourseData();
                     } catch (err) {
                        console.error(err);
                        alert(err.response?.data?.message || 'Submission failed');
                     }
                   }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Your Submission (Text Content)</label>
                        <textarea 
                          name="content" 
                          rows="6" 
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4" 
                          placeholder="Type your submission here..."
                          defaultValue={submittingAssignment.submission?.submissionText || ''}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Upload File {submittingAssignment.submission?.submissionUrl && '(Replace current file)'}</label>
                        <input 
                          type="file" 
                          name="file" 
                          className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white" 
                        />
                        <p className="text-xs text-slate-500 mt-1">Supported: PDF, Word, PPT, Images, ZIP (Max 10MB)</p>
                        
                        {submittingAssignment.submission?.submissionUrl && submittingAssignment.submission.submissionUrl !== 'text-only' && (
                          <div className="mt-2 p-2 bg-slate-900/50 rounded flex items-center gap-2">
                            <span className="text-xs text-slate-400">Current file:</span>
                            <a 
                              href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${submittingAssignment.submission.submissionUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:underline truncate max-w-[200px]"
                            >
                              {submittingAssignment.submission.submissionUrl.split('/').pop()}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end pt-4">
                        <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium">
                          {submittingAssignment.submission ? 'Update Submission' : 'Submit Now'}
                        </button>
                      </div>
                   </form>
                </div>
              ) : (
                <>
                  {assignments.map((assignment) => (
                    <div key={assignment._id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{assignment.title}</h3>
                        {assignment.submission && (
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            assignment.submission.status === 'graded' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'
                          }`}>
                            {assignment.submission.status}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 mb-4">{assignment.description}</p>
                      
                      {assignment.submission?.status === 'graded' && (
                        <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-indigo-500/30">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-indigo-400">Grade: {assignment.submission.score} / {assignment.maxScore}</span>
                            <span className="text-xs text-slate-500">Graded on {new Date(assignment.submission.gradedAt).toLocaleDateString()}</span>
                          </div>
                          {assignment.submission.feedback && (
                            <p className="text-sm text-slate-300 italic">" {assignment.submission.feedback} "</p>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Max Score: {assignment.maxScore}</span>
                        <button 
                          onClick={() => setSubmittingAssignment(assignment)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            assignment.submission 
                              ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {assignment.submission ? 'Edit Submission' : 'Submit Assignment'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                      <p className="text-slate-500">No assignments available for this course.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              {takingQuiz ? (
                 <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-6">
                       <h2 className="text-2xl font-bold text-white">{takingQuiz.quiz.title}</h2>
                       <div className={`font-mono text-xl ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>
                         Time Remaining: {formatTime(timeLeft)}
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       {takingQuiz.quiz.questions.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-4">
                             <p className="text-lg text-white"><span className="text-slate-500">Q{qIdx+1}.</span> {q.questionText}</p>
                             <div className="grid gap-2">
                                {q.options.map((opt, oIdx) => (
                                   <label key={oIdx} className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-700/30 transition">
                                      <input 
                                        type="radio" 
                                        name={`q-${qIdx}`} 
                                        checked={takingQuiz.answers.find(a => a.questionIndex === qIdx)?.answer === opt}
                                        onChange={() => {
                                           const newAnswers = [...takingQuiz.answers];
                                           const existingIdx = newAnswers.findIndex(a => a.questionIndex === qIdx);
                                           if (existingIdx !== -1) newAnswers[existingIdx].answer = opt;
                                           else newAnswers.push({ questionIndex: qIdx, answer: opt });
                                           setTakingQuiz({ ...takingQuiz, answers: newAnswers });
                                        }}
                                        className="w-4 h-4 text-indigo-600" 
                                      />
                                      <span className="text-slate-200">{opt}</span>
                                   </label>
                                ))}
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-700 flex justify-end gap-3">
                       <button 
                         onClick={() => {
                           if (window.confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                             setTakingQuiz(null);
                             setTimeLeft(null);
                           }
                         }}
                         className="px-6 py-3 text-slate-400 hover:text-white font-medium"
                       >
                          Cancel
                       </button>
                       <button 
                         onClick={() => handleQuizSubmit(false)}
                         className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20"
                       >
                          Submit Quiz
                       </button>
                    </div>
                 </div>
              ) : (
                <>
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white">{quiz.title}</h3>
                        {quiz.bestScore !== null && (
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                            quiz.bestScore >= (quiz.passingScore || 60) ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                          }`}>
                            Best: {quiz.bestScore}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 mb-4">{quiz.description}</p>
                      
                      {quiz.attemptsCount > 0 && (
                        <p className="text-xs text-slate-500 mb-4">
                          Attempts: {quiz.attemptsCount} / {quiz.maxAttempts}
                        </p>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">{quiz.questions?.length || 0} Questions • {quiz.timeLimit} mins</span>
                        <button 
                          onClick={async () => {
                             if (quiz.attemptsCount >= quiz.maxAttempts) {
                               alert('Maximum attempts reached for this quiz.');
                               return;
                             }
                             try {
                               const res = await api.get(`/lms/quizzes/${quiz._id}`);
                               setTakingQuiz({ quiz: res.data.data, answers: [] });
                               setTimeLeft(res.data.data.timeLimit * 60);
                             } catch (err) {
                               alert(err.response?.data?.message || 'Failed to start quiz');
                             }
                          }}
                          disabled={quiz.attemptsCount >= quiz.maxAttempts}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            quiz.attemptsCount >= quiz.maxAttempts
                              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {quiz.attemptsCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {quizzes.length === 0 && (
                    <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
                      <p className="text-slate-500">No quizzes available for this course.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Course Outline */}
        <div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Course Outline
            </h3>

            {enrollment && (
              <div className="mb-4 pb-4 border-b border-slate-700">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Overall Progress</span>
                  <span>{enrollment.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {modules.map((module, modIdx) => (
                <div key={module._id}>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">
                    {modIdx + 1}. {module.title}
                  </h4>
                  <div className="space-y-1">
                    {module.lessons && module.lessons.map((lesson, lessonIdx) => (
                      <button
                        key={lesson._id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                          selectedLesson?._id === lesson._id
                            ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-700'
                            : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{modIdx + 1}.{lessonIdx + 1}</span>
                          <span className="flex-1">{lesson.title}</span>
                          {lesson.completed && (
                            <span className="text-green-400">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentCourseView;
