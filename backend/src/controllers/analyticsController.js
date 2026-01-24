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

// @desc    Get tutor performance analytics
// @route   GET /api/analytics/tutors
// @access  Private (Admin only)
exports.getTutorAnalytics = async (req, res) => {
  try {
    const { limit = 10, sortBy = 'classes' } = req.query;
    
    // Get tutor statistics
    const tutors = await Tutor.find({ status: 'approved' })
      .select('name email subjects experienceYears')
      .lean();
    
    const tutorStats = await Promise.all(
      tutors.map(async (tutor) => {
        const classCount = await Class.countDocuments({ 
          tutor: tutor._id, 
          status: 'completed' 
        });
        
        const upcomingCount = await Class.countDocuments({ 
          tutor: tutor._id, 
          status: 'scheduled',
          scheduledAt: { $gte: new Date() }
        });
        
        const cancelledCount = await Class.countDocuments({ 
          tutor: tutor._id, 
          status: 'cancelled' 
        });
        
        const classes = await Class.find({ 
          tutor: tutor._id, 
          status: 'completed' 
        });
        const totalHours = classes.reduce((sum, c) => sum + (c.duration / 60), 0);
        
        // Get average rating from attendance records
        const attendanceRecords = await Attendance.find({ 
          tutor: tutor._id,
          attentiveness: { $exists: true }
        });
        
        let avgRating = 0;
        if (attendanceRecords.length > 0) {
          const totalRating = attendanceRecords.reduce((sum, record) => {
            const avg = ((record.attentiveness || 0) + 
                        (record.understanding || 0) + 
                        (record.preparation || 0)) / 3;
            return sum + avg;
          }, 0);
          avgRating = (totalRating / attendanceRecords.length).toFixed(1);
        }
        
        const cancellationRate = (classCount + cancelledCount) > 0
          ? ((cancelledCount / (classCount + cancelledCount)) * 100).toFixed(1)
          : 0;
        
        return {
          id: tutor._id,
          name: tutor.name,
          email: tutor.email,
          subjects: tutor.subjects,
          experience: tutor.experienceYears,
          completedClasses: classCount,
          upcomingClasses: upcomingCount,
          cancelledClasses: cancelledCount,
          totalHours: totalHours.toFixed(1),
          averageRating: parseFloat(avgRating),
          cancellationRate: `${cancellationRate}%`
        };
      })
    );
    
    // Sort tutors
    if (sortBy === 'rating') {
      tutorStats.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'hours') {
      tutorStats.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));
    } else {
      tutorStats.sort((a, b) => b.completedClasses - a.completedClasses);
    }
    
    res.json({
      success: true,
      count: tutorStats.length,
      data: tutorStats.slice(0, parseInt(limit))
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
