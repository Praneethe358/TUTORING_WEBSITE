const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');
const Booking = require('../models/Booking');
const Course = require('../models/Course');
const Message = require('../models/Message');

/**
 * ANALYTICS CONTROLLER
 * Advanced analytics and reporting for admin dashboard
 */

// @desc    Get comprehensive platform analytics
// @route   GET /api/analytics/platform
// @access  Private (Admin only)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = parseInt(period);
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysAgo);
    
    // User statistics
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalTutors = await Tutor.countDocuments({ status: 'approved', isActive: true });
    const pendingTutors = await Tutor.countDocuments({ status: 'pending' });
    const blockedTutors = await Tutor.countDocuments({ status: 'blocked' });
    
    // New registrations in period
    const newStudents = await Student.countDocuments({ 
      createdAt: { $gte: dateFrom } 
    });
    const newTutors = await Tutor.countDocuments({ 
      createdAt: { $gte: dateFrom } 
    });
    
    // Class statistics
    const totalClasses = await Class.countDocuments({});
    const completedClasses = await Class.countDocuments({ status: 'completed' });
    const upcomingClasses = await Class.countDocuments({ 
      scheduledAt: { $gte: new Date() },
      status: 'scheduled'
    });
    const cancelledClasses = await Class.countDocuments({ status: 'cancelled' });
    
    // Classes in period
    const classesInPeriod = await Class.countDocuments({
      createdAt: { $gte: dateFrom }
    });
    
    // Attendance statistics
    const totalAttendance = await Attendance.countDocuments({});
    const presentCount = await Attendance.countDocuments({ status: 'present' });
    const absentCount = await Attendance.countDocuments({ status: 'absent' });
    const attendanceRate = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2)
      : 0;
    
    // Course statistics
    const totalCourses = await Course.countDocuments({});
    const activeCourses = await Course.countDocuments({ status: 'approved' });
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    
    // Calculate total teaching hours
    const completedClassesData = await Class.find({ status: 'completed' });
    const totalHours = completedClassesData.reduce((sum, c) => sum + (c.duration / 60), 0);
    
    // Message activity
    const totalMessages = await Message.countDocuments({});
    const messagesInPeriod = await Message.countDocuments({
      createdAt: { $gte: dateFrom }
    });
    
    // Growth trends (compare with previous period)
    const prevPeriodStart = new Date(dateFrom);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - daysAgo);
    
    const prevStudents = await Student.countDocuments({
      createdAt: { $gte: prevPeriodStart, $lt: dateFrom }
    });
    const prevClasses = await Class.countDocuments({
      createdAt: { $gte: prevPeriodStart, $lt: dateFrom }
    });
    
    const studentGrowth = prevStudents > 0 
      ? (((newStudents - prevStudents) / prevStudents) * 100).toFixed(1)
      : 100;
    const classGrowth = prevClasses > 0
      ? (((classesInPeriod - prevClasses) / prevClasses) * 100).toFixed(1)
      : 100;
    
    res.json({
      success: true,
      data: {
        users: {
          students: {
            total: totalStudents,
            new: newStudents,
            growth: `${studentGrowth}%`
          },
          tutors: {
            total: totalTutors,
            new: newTutors,
            pending: pendingTutors,
            blocked: blockedTutors
          }
        },
        classes: {
          total: totalClasses,
          completed: completedClasses,
          upcoming: upcomingClasses,
          cancelled: cancelledClasses,
          inPeriod: classesInPeriod,
          growth: `${classGrowth}%`,
          totalHours: totalHours.toFixed(1)
        },
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: absentCount,
          rate: `${attendanceRate}%`
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          pending: pendingCourses
        },
        communication: {
          totalMessages,
          messagesInPeriod
        },
        period: `Last ${daysAgo} days`
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Export analytics summary as CSV
// @route   GET /api/admin/export/analytics-report
// @access  Private (Admin only)
exports.exportAnalyticsReport = async (req, res) => {
  try {
    const { period = '30', startDate, endDate } = req.query;

    const useCustomRange = startDate && endDate;
    const dateFrom = useCustomRange ? new Date(startDate) : (() => {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(period));
      return d;
    })();
    const dateTo = useCustomRange ? new Date(endDate) : new Date();

    const [
      totalStudents,
      totalTutors,
      pendingTutors,
      blockedTutors,
      newStudents,
      newTutors,
      totalClasses,
      completedClasses,
      upcomingClasses,
      cancelledClasses,
      classesInPeriod,
      totalAttendance,
      presentCount,
      absentCount,
      totalCourses,
      activeCourses,
      pendingCourses,
      totalMessages,
      messagesInPeriod
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Tutor.countDocuments({ status: 'approved', isActive: true }),
      Tutor.countDocuments({ status: 'pending' }),
      Tutor.countDocuments({ status: 'blocked' }),
      Student.countDocuments({ createdAt: { $gte: dateFrom, $lte: dateTo } }),
      Tutor.countDocuments({ createdAt: { $gte: dateFrom, $lte: dateTo } }),
      Class.countDocuments({}),
      Class.countDocuments({ status: 'completed' }),
      Class.countDocuments({ scheduledAt: { $gte: new Date() }, status: 'scheduled' }),
      Class.countDocuments({ status: 'cancelled' }),
      Class.countDocuments({ createdAt: { $gte: dateFrom, $lte: dateTo } }),
      Attendance.countDocuments({}),
      Attendance.countDocuments({ status: 'present' }),
      Attendance.countDocuments({ status: 'absent' }),
      Course.countDocuments({}),
      Course.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'pending' }),
      Message.countDocuments({}),
      Message.countDocuments({ createdAt: { $gte: dateFrom, $lte: dateTo } })
    ]);

    const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : '0';

    const rows = [
      ['Metric', 'Value'],
      ['Period Start', dateFrom.toISOString().split('T')[0]],
      ['Period End', dateTo.toISOString().split('T')[0]],
      ['Students (active)', totalStudents],
      ['Students (new in period)', newStudents],
      ['Tutors (active approved)', totalTutors],
      ['Tutors (pending)', pendingTutors],
      ['Tutors (blocked)', blockedTutors],
      ['Tutors (new in period)', newTutors],
      ['Classes (total)', totalClasses],
      ['Classes (completed)', completedClasses],
      ['Classes (upcoming)', upcomingClasses],
      ['Classes (cancelled)', cancelledClasses],
      ['Classes (created in period)', classesInPeriod],
      ['Courses (total)', totalCourses],
      ['Courses (approved)', activeCourses],
      ['Courses (pending)', pendingCourses],
      ['Attendance rate %', attendanceRate],
      ['Messages (total)', totalMessages],
      ['Messages (in period)', messagesInPeriod]
    ];

    const csv = rows
      .map((r) => r.map((cell) => {
        const str = cell === null || cell === undefined ? '' : String(cell);
        const escaped = str.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="analytics_report_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export analytics report error:', error);
    res.status(500).json({ success: false, message: 'Failed to export analytics report', error: error.message });
  }
};

// @desc    Get tutor performance analytics (OPTIMIZED with aggregation)
// @route   GET /api/analytics/tutors
// @access  Private (Admin only)
exports.getTutorAnalytics = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'classes' } = req.query;
    
    // OPTIMIZED: Use aggregation pipeline instead of N+1 queries
    const tutorStats = await Tutor.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: 'tutor',
          as: 'allClasses'
        }
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'tutor',
          as: 'attendanceRecords'
        }
      },
      {
        $addFields: {
          completedClasses: {
            $size: {
              $filter: {
                input: '$allClasses',
                as: 'class',
                cond: { $eq: ['$$class.status', 'completed'] }
              }
            }
          },
          upcomingClasses: {
            $size: {
              $filter: {
                input: '$allClasses',
                as: 'class',
                cond: {
                  $and: [
                    { $eq: ['$$class.status', 'scheduled'] },
                    { $gte: ['$$class.scheduledAt', new Date()] }
                  ]
                }
              }
            }
          },
          cancelledClasses: {
            $size: {
              $filter: {
                input: '$allClasses',
                as: 'class',
                cond: { $eq: ['$$class.status', 'cancelled'] }
              }
            }
          },
          totalHours: {
            $divide: [
              {
                $reduce: {
                  input: {
                    $filter: {
                      input: '$allClasses',
                      as: 'class',
                      cond: { $eq: ['$$class.status', 'completed'] }
                    }
                  },
                  initialValue: 0,
                  in: { $add: ['$$value', '$$this.duration'] }
                }
              },
              60
            ]
          },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$attendanceRecords' }, 0] },
              then: {
                $avg: {
                  $map: {
                    input: '$attendanceRecords',
                    as: 'record',
                    in: {
                      $divide: [
                        {
                          $add: [
                            { $ifNull: ['$$record.attentiveness', 0] },
                            { $ifNull: ['$$record.understanding', 0] },
                            { $ifNull: ['$$record.preparation', 0] }
                          ]
                        },
                        3
                      ]
                    }
                  }
                }
              },
              else: 0
            }
          }
        }
      },
      {
        $addFields: {
          cancellationRate: {
            $cond: {
              if: { $gt: [{ $add: ['$completedClasses', '$cancelledClasses'] }, 0] },
              then: {
                $multiply: [
                  {
                    $divide: [
                      '$cancelledClasses',
                      { $add: ['$completedClasses', '$cancelledClasses'] }
                    ]
                  },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          email: 1,
          subjects: 1,
          experience: '$experienceYears',
          completedClasses: 1,
          upcomingClasses: 1,
          cancelledClasses: 1,
          totalHours: { $round: ['$totalHours', 1] },
          averageRating: { $round: ['$averageRating', 1] },
          cancellationRate: { $round: ['$cancellationRate', 1] }
        }
      },
      {
        $sort: 
          sortBy === 'rating' ? { averageRating: -1 } :
          sortBy === 'hours' ? { totalHours: -1 } :
          { completedClasses: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);
    
    res.json({
      success: true,
      count: tutorStats.length,
      data: tutorStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get student engagement analytics
// @route   GET /api/analytics/students
// @access  Private (Admin only)
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'classes' } = req.query;
    
    const students = await Student.find({ isActive: true })
      .select('name email')
      .lean();
    
    const studentStats = await Promise.all(
      students.map(async (student) => {
        const classCount = await Class.countDocuments({ 
          student: student._id 
        });
        
        const completedCount = await Class.countDocuments({ 
          student: student._id,
          status: 'completed'
        });
        
        const upcomingCount = await Class.countDocuments({ 
          student: student._id,
          status: 'scheduled',
          scheduledAt: { $gte: new Date() }
        });
        
        // Attendance stats
        const attendance = await Attendance.find({ student: student._id });
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendanceRate = attendance.length > 0
          ? ((presentCount / attendance.length) * 100).toFixed(1)
          : 0;
        
        // Calculate total hours
        const classes = await Class.find({ 
          student: student._id,
          status: 'completed'
        });
        const totalHours = classes.reduce((sum, c) => sum + (c.duration / 60), 0);
        
        return {
          id: student._id,
          name: student.name,
          email: student.email,
          totalClasses: classCount,
          completedClasses: completedCount,
          upcomingClasses: upcomingCount,
          totalHours: totalHours.toFixed(1),
          attendanceRate: `${attendanceRate}%`,
          engagement: classCount > 0 ? 'Active' : 'Inactive'
        };
      })
    );
    
    // Sort students
    if (sortBy === 'attendance') {
      studentStats.sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate));
    } else if (sortBy === 'hours') {
      studentStats.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));
    } else {
      studentStats.sort((a, b) => b.totalClasses - a.totalClasses);
    }
    
    res.json({
      success: true,
      count: studentStats.length,
      data: studentStats.slice(0, parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get class trends (daily/weekly/monthly)
// @route   GET /api/analytics/trends
// @access  Private (Admin only)
exports.getClassTrends = async (req, res) => {
  try {
    const { period = 'week' } = req.query; // day, week, month
    
    let groupBy;
    let daysBack;
    
    switch (period) {
      case 'day':
        daysBack = 7;
        groupBy = { 
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        };
        break;
      case 'month':
        daysBack = 365;
        groupBy = { 
          $dateToString: { format: '%Y-%m', date: '$createdAt' }
        };
        break;
      default: // week
        daysBack = 30;
        groupBy = { 
          $dateToString: { format: '%Y-W%V', date: '$createdAt' }
        };
    }
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysBack);
    
    const classTrends = await Class.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFrom }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    res.json({
      success: true,
      period,
      data: classTrends
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = exports;
