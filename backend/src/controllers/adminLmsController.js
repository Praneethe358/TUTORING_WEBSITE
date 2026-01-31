const LMSCourse = require('../models/LMSCourse');
const CourseEnrollment = require('../models/CourseEnrollment');
const LessonProgress = require('../models/LessonProgress');
const Certificate = require('../models/Certificate');
const QuizAttempt = require('../models/QuizAttempt');
const Student = require('../models/Student');

/**
 * ADMIN LMS CONTROLLER
 * New APIs for admin LMS monitoring, reporting, analytics
 * All routes are admin-only
 */

// @desc    Get admin LMS dashboard (overview stats)
// @route   GET /api/lms/admin/dashboard
// @access  Admin only
exports.getAdminLmsDashboard = async (req, res) => {
  try {
    const totalCourses = await LMSCourse.countDocuments({ status: 'active' });
    const totalEnrollments = await CourseEnrollment.countDocuments();
    const activeEnrollments = await CourseEnrollment.countDocuments({ status: 'active' });
    const completedEnrollments = await CourseEnrollment.countDocuments({ status: 'completed' });
    const totalStudents = await Student.countDocuments();

    // Get completion stats
    const completionStats = await CourseEnrollment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          avgCompletionTime: { $avg: '$completionTime' },
          avgProgress: { $avg: '$progress' }
        }
      }
    ]);

    // Get courses with enrollment count
    const topCourses = await LMSCourse.aggregate([
      {
        $lookup: {
          from: 'courseenrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $project: {
          title: 1,
          category: 1,
          totalEnrollments: { $size: '$enrollments' },
          completionRate: {
            $cond: [
              { $eq: [{ $size: '$enrollments' }, 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      {
                        $size: {
                          $filter: {
                            input: '$enrollments',
                            as: 'e',
                            cond: { $eq: ['$$e.status', 'completed'] }
                          }
                        }
                      },
                      { $size: '$enrollments' }
                    ]
                  },
                  100
                ]
              }
            ]
          }
        }
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalCourses,
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          totalStudents,
          enrollmentRate: totalStudents > 0 ? Math.round((totalEnrollments / totalStudents) * 100) : 0
        },
        performance: {
          avgCompletionTime: completionStats[0]?.avgCompletionTime || 0,
          avgProgress: completionStats[0]?.avgProgress || 0,
          overallCompletion: totalEnrollments > 0 
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0
        },
        topCourses
      }
    });
  } catch (error) {
    console.error('Get admin LMS dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
};

// @desc    Get all LMS courses with enrollment stats
// @route   GET /api/lms/admin/courses
// @access  Admin only
exports.getAdminCoursesList = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await LMSCourse.find(query)
      .populate('instructor', 'name email')
      .select('-content -materials');

    // Add enrollment stats
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollments = await CourseEnrollment.find({ courseId: course._id });
        const completed = enrollments.filter(e => e.status === 'completed').length;

        return {
          ...course.toObject(),
          stats: {
            totalEnrollments: enrollments.length,
            activeEnrollments: enrollments.filter(e => e.status === 'active').length,
            completedEnrollments: completed,
            completionRate: enrollments.length > 0 ? Math.round((completed / enrollments.length) * 100) : 0,
            avgProgress: enrollments.length > 0
              ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
              : 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: coursesWithStats
    });
  } catch (error) {
    console.error('Get admin courses list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// @desc    Get detailed course info with student breakdown
// @route   GET /api/lms/admin/courses/:courseId
// @access  Admin only
exports.getAdminCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await LMSCourse.findById(courseId).populate('instructor', 'name email avatar');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const enrollments = await CourseEnrollment.find({ courseId })
      .populate('studentId', 'name email role');

    // Add detailed student progress
    const studentBreakdown = await Promise.all(
      enrollments.map(async (enrollment) => {
        const certificates = await Certificate.findOne({
          courseId,
          studentId: enrollment.studentId._id
        });

        const lastActivity = enrollment.lastActivityAt || enrollment.enrolledAt;

        return {
          studentId: enrollment.studentId._id,
          studentName: enrollment.studentId.name,
          studentEmail: enrollment.studentId.email,
          enrolledAt: enrollment.enrolledAt,
          lastActivityAt: lastActivity,
          progress: enrollment.progress || 0,
          completedLessons: enrollment.completedLessons || 0,
          totalLessons: enrollment.totalLessons || 0,
          status: enrollment.status,
          hasCompletionCertificate: !!certificates,
          completionTime: enrollment.completionTime // hours
        };
      })
    );

    // Summary stats
    const stats = {
      totalEnrollments: enrollments.length,
      activeEnrollments: enrollments.filter(e => e.status === 'active').length,
      completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
      avgProgress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
        : 0,
      completionRate: enrollments.length > 0
        ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
        : 0,
      avgCompletionTime: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.completionTime || 0), 0) / enrollments.length)
        : 0
    };

    res.json({
      success: true,
      data: {
        course,
        stats,
        students: studentBreakdown
      }
    });
  } catch (error) {
    console.error('Get admin course detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course details',
      error: error.message
    });
  }
};

// @desc    Get student grades and performance (across all courses)
// @route   GET /api/lms/admin/students/:studentId/grades
// @access  Admin only
exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;

    const user = await Student.findById(studentId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get course enrollments and quiz attempts
    const enrollments = await CourseEnrollment.find({ studentId })
      .populate('courseId', 'title category');

    const gradesData = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Get quiz attempts for this course
        const quizAttempts = await QuizAttempt.find({
          courseId: enrollment.courseId._id,
          studentId
        });

        // Get assignments (from AssignmentSubmission)
        const AssignmentSubmission = require('../models/AssignmentSubmission');
        const assignments = await AssignmentSubmission.find({
          studentId,
          courseId: enrollment.courseId._id
        }).populate('assignmentId', 'title maxPoints');

        return {
          courseId: enrollment.courseId._id,
          courseName: enrollment.courseId.title,
          courseCategory: enrollment.courseId.category,
          progress: enrollment.progress || 0,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completionTime: enrollment.completionTime,
          quizzes: {
            attempted: quizAttempts.length,
            avgScore: quizAttempts.length > 0
              ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
              : 0,
            bestScore: quizAttempts.length > 0 ? Math.max(...quizAttempts.map(a => a.percentage)) : 0
          },
          assignments: {
            submitted: assignments.filter(a => a.status === 'submitted').length,
            total: assignments.length,
            avgScore: assignments.length > 0
              ? Math.round(assignments.reduce((sum, a) => sum + (a.score || 0), 0) / assignments.length)
              : 0
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        student: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        grades: gradesData
      }
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student grades',
      error: error.message
    });
  }
};

// @desc    Export student grades as CSV
// @route   GET /api/lms/admin/export/grades
// @access  Admin only
exports.exportGradesCSV = async (req, res) => {
  try {
    const { courseId, format = 'csv' } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;

    const enrollments = await CourseEnrollment.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    const data = [];
    data.push(['Student Name', 'Email', 'Course', 'Progress', 'Status', 'Quiz Avg Score', 'Assignment Score']);

    for (const enrollment of enrollments) {
      const quizAttempts = await QuizAttempt.find({
        studentId: enrollment.studentId._id,
        courseId: enrollment.courseId._id
      });

      const AssignmentSubmission = require('../models/AssignmentSubmission');
      const assignments = await AssignmentSubmission.find({
        studentId: enrollment.studentId._id,
        courseId: enrollment.courseId._id
      });

      const quizAvg = quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
        : 0;

      const assignmentAvg = assignments.length > 0
        ? Math.round(assignments.reduce((sum, a) => sum + (a.score || 0), 0) / assignments.length)
        : 0;

      data.push([
        enrollment.studentId.name,
        enrollment.studentId.email,
        enrollment.courseId.title,
        enrollment.progress || 0,
        enrollment.status,
        quizAvg,
        assignmentAvg
      ]);
    }

    // Convert to CSV
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lms-grades.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export grades error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export grades',
      error: error.message
    });
  }
};

// @desc    Export student progress as CSV
// @route   GET /api/lms/admin/export/progress
// @access  Admin only
exports.exportProgressCSV = async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;

    const enrollments = await CourseEnrollment.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'title');

    const data = [];
    data.push(['Student Name', 'Email', 'Course', 'Progress %', 'Lessons Completed', 'Total Lessons', 'Status', 'Enrolled Date', 'Completion Time (hours)']);

    for (const enrollment of enrollments) {
      data.push([
        enrollment.studentId.name,
        enrollment.studentId.email,
        enrollment.courseId.title,
        enrollment.progress || 0,
        enrollment.completedLessons || 0,
        enrollment.totalLessons || 0,
        enrollment.status,
        enrollment.enrolledAt.toISOString().split('T')[0],
        enrollment.completionTime || 'N/A'
      ]);
    }

    // Convert to CSV
    const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lms-progress.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export progress',
      error: error.message
    });
  }
};

// @desc    Export students enrolled for a course as CSV
// @route   GET /api/lms/admin/export/course/:courseId/students
// @access  Admin only
exports.exportCourseStudentsCSV = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.query;

    const filter = { courseId };
    if (status && status !== 'all') filter.status = status;

    const enrollments = await CourseEnrollment.find(filter)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ enrolledAt: -1 });

    const rows = [
      ['Student Name', 'Email', 'Course', 'Status', 'Progress %', 'Completed Lessons', 'Total Lessons', 'Enrolled At', 'Last Activity']
    ];

    enrollments.forEach((enr) => {
      rows.push([
        enr.studentId?.name || '',
        enr.studentId?.email || '',
        enr.courseId?.title || '',
        enr.status || '',
        enr.progress ?? 0,
        enr.completedLessons ?? 0,
        enr.totalLessons ?? 0,
        enr.enrolledAt ? enr.enrolledAt.toISOString().split('T')[0] : '',
        enr.lastActivityAt ? enr.lastActivityAt.toISOString().split('T')[0] : ''
      ]);
    });

    const csv = rows
      .map((r) => r.map((cell) => {
        const str = cell === null || cell === undefined ? '' : String(cell);
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="course_${courseId}_students_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export course students error:', error);
    res.status(500).json({ success: false, message: 'Failed to export course students', error: error.message });
  }
};

// @desc    Get comprehensive LMS reports (trends, analytics)
// @route   GET /api/lms/admin/reports
// @access  Admin only
exports.getAdminReports = async (req, res) => {
  try {
    // Enrollment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const enrollmentTrend = await CourseEnrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Completion trends
    const completionTrend = await CourseEnrollment.aggregate([
      {
        $match: {
          status: 'completed',
          updatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Category performance
    const categoryPerformance = await LMSCourse.aggregate([
      {
        $lookup: {
          from: 'courseenrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $group: {
          _id: '$category',
          courseCount: { $sum: 1 },
          totalEnrollments: { $sum: { $size: '$enrollments' } },
          avgProgress: {
            $avg: {
              $cond: [
                { $isArray: '$enrollments' },
                { $avg: '$enrollments.progress' },
                0
              ]
            }
          }
        }
      }
    ]);

    // Student performance distribution
    const studentPerformance = await CourseEnrollment.aggregate([
      {
        $group: {
          _id: null,
          excellent: {
            $sum: { $cond: [{ $gte: ['$progress', 90] }, 1, 0] }
          },
          good: {
            $sum: { $cond: [{ $and: [{ $lt: ['$progress', 90] }, { $gte: ['$progress', 75] }] }, 1, 0] }
          },
          average: {
            $sum: { $cond: [{ $and: [{ $lt: ['$progress', 75] }, { $gte: ['$progress', 50] }] }, 1, 0] }
          },
          poor: {
            $sum: { $cond: [{ $lt: ['$progress', 50] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        enrollmentTrend,
        completionTrend,
        categoryPerformance,
        studentPerformance: studentPerformance[0] || {}
      }
    });
  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};
