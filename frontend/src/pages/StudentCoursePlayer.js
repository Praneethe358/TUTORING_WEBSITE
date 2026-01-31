import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import StudentDashboardLayout from '../components/StudentDashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Card, Button, Badge, EmptyState } from '../components/ModernComponents';

/**
 * STUDENT COURSE PLAYER
 * Main learning interface for viewing modules, lessons, and content
 */
const StudentCoursePlayer = () => {
  const { courseId } = useParams();
  useAuth();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [nextLesson, setNextLesson] = useState(null);
  const [previousLesson, setPreviousLesson] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    fetchCoursePlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCoursePlayer = async () => {
    try {
      const res = await api.get(`/lms/student/courses/${courseId}/player`);
      if (res.data.success) {
        const data = res.data.data;
        setCourse(data.course);
        setModules(data.modules);
        setCurrentLesson(data.currentLesson);
        setNextLesson(data.nextLesson);
        setPreviousLesson(data.previousLesson);
        setProgress(data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch course player:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      const res = await api.post(`/lms/student/lessons/${lessonId}/complete`);
      if (res.data.success) {
        alert('Lesson marked complete!');
        fetchCoursePlayer();
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      alert('Failed to mark lesson complete');
    }
  };

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson);
    // Auto-expand module containing this lesson
    const moduleId = modules.find(m =>
      m.lessons.some(l => l._id === lesson._id)
    )?._id;
    if (moduleId) {
      setExpandedModule(moduleId);
    }
  };

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {course && (
            <div className="space-y-6">
              {/* Course Header */}
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    {course.instructor && (
                      <p className="text-gray-600 mt-2">Instructor: {course.instructor.name}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      {course.category && <Badge variant="secondary">{course.category}</Badge>}
                      {course.level && <Badge variant="secondary">{course.level}</Badge>}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">Course Progress</span>
                    <span className="text-sm font-bold text-blue-600">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {progress.completedLessons} of {progress.totalLessons} lessons completed
                  </p>
                </div>
              </Card>

              {/* Current Lesson */}
              {currentLesson ? (
                <Card className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">{currentLesson.title}</h2>

                  {/* Lesson Content */}
                  {currentLesson.content && (
                    <div className="prose max-w-none">
                      <p className="text-gray-700">{currentLesson.content}</p>
                    </div>
                  )}

                  {/* Video/Media */}
                  {currentLesson.videoUrl && (
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <iframe
                        title={currentLesson.title}
                        width="100%"
                        height="100%"
                        src={currentLesson.videoUrl}
                        frameBorder="0"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Resources */}
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
                      <div className="space-y-2">
                        {currentLesson.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            📎 {resource.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completion Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {currentLesson.completed ? (
                        <>
                          <span className="text-green-600 text-lg">✓</span>
                          <span className="text-green-600 font-semibold">Completed</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 text-lg">○</span>
                          <span className="text-gray-600">Not completed</span>
                        </>
                      )}
                    </div>
                    {!currentLesson.completed && (
                      <Button
                        onClick={() => handleCompleteLesson(currentLesson._id)}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <EmptyState
                  title="No Lesson Selected"
                  description="Select a lesson from the left sidebar to start learning."
                  icon="📖"
                />
              )}

              {/* Navigation Buttons */}
              {(previousLesson || nextLesson) && (
                <div className="flex gap-4">
                  {previousLesson && (
                    <Button
                      variant="secondary"
                      onClick={() => handleSelectLesson(previousLesson)}
                      className="flex-1"
                    >
                      ← Previous Lesson
                    </Button>
                  )}
                  {nextLesson && (
                    <Button
                      variant="primary"
                      onClick={() => handleSelectLesson(nextLesson)}
                      className="flex-1"
                    >
                      Next Lesson →
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Module List */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h3 className="font-bold text-gray-900 mb-4">Modules</h3>
            <div className="space-y-2 max-h-screen overflow-y-auto">
              {modules.map(module => (
                <div key={module._id}>
                  <button
                    onClick={() => setExpandedModule(
                      expandedModule === module._id ? null : module._id
                    )}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg transition font-semibold text-gray-900"
                  >
                    <span className="inline-block mr-2">
                      {expandedModule === module._id ? '▼' : '▶'}
                    </span>
                    {module.title}
                  </button>

                  {/* Lessons */}
                  {expandedModule === module._id && (
                    <div className="ml-4 space-y-1">
                      {module.lessons.map(lesson => (
                        <button
                          key={lesson._id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition text-sm ${
                            currentLesson?._id === lesson._id
                              ? 'bg-blue-100 text-blue-900 font-semibold'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span className="mr-2">
                            {lesson.completed ? '✓' : '○'}
                          </span>
                          {lesson.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </StudentDashboardLayout>
  );
};

export default StudentCoursePlayer;
