const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');

/**
 * ATTENDANCE CONTROLLER
 * Manages class attendance and progress tracking
 */

// @desc    Mark attendance for a class
// @route   POST /api/attendance
// @access  Private (Tutor/Admin)
exports.markAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors and admins can mark attendance' 
      });
    }
    
    const {
      classId,
      studentId,
      status,
      arrivalTime,
      minutesLate,
      participationLevel,
      tutorRemarks,
      topicsCovered,
      homeworkAssigned,
      attentiveness,
      understanding,
      preparation,
      duration
    } = req.body;
    
    if (!classId || !studentId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Verify class exists
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    // Verify student is enrolled in this class
    if (classItem.student.toString() !== studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student not enrolled in this class' 
      });
    }
    
    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      class: classId,
      student: studentId
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attendance already marked for this class' 
      });
    }
    
    const attendance = await Attendance.create({
      class: classId,
      student: studentId,
      tutor: classItem.tutor,
      status,
      markedBy: req.user.role,
      arrivalTime: arrivalTime ? new Date(arrivalTime) : null,
      minutesLate: minutesLate || 0,
      participationLevel: participationLevel || 'good',
      tutorRemarks,
      topicsCovered: topicsCovered || [],
      homeworkAssigned,
      attentiveness,
      understanding,
      preparation,
      duration: duration || classItem.duration
    });
    
    // Update class status to completed if not already
    if (classItem.status !== 'completed') {
      classItem.status = 'completed';
      classItem.completedAt = new Date();
      await classItem.save();
    }
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('class');
    
    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populatedAttendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    const { studentId, tutorId, classId, status, from, to, limit = 50 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'tutor') {
      query.tutor = req.user.id;
    }
    
    // Override with specific filters if provided
    if (studentId) query.student = studentId;
    if (tutorId) query.tutor = tutorId;
    if (classId) query.class = classId;
    if (status) query.status = status;
    
    // Date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    
    const records = await Attendance.find(query)
      .populate('student', 'name email')
      .populate('tutor', 'name email subjects')
      .populate('class', 'topic scheduledAt duration')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
exports.getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'name email phone')
      .populate('tutor', 'name email subjects')
      .populate('class');
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    // Authorization check
    const userId = req.user.id || req.user._id;
    if (
      req.user.role !== 'admin' &&
      attendance.student._id.toString() !== userId.toString() &&
      attendance.tutor._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Tutor/Admin)
exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    // Authorization check
    if (req.user.role !== 'admin' && req.user.role !== 'tutor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only tutors and admins can update attendance' 
      });
    }
    
    if (req.user.role === 'tutor' && attendance.tutor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const {
      status,
      tutorRemarks,
      topicsCovered,
      homeworkAssigned,
      attentiveness,
      understanding,
      preparation,
      participationLevel,
      studentNotes,
      studentFeedback,
      adminNotes
    } = req.body;
    
    if (status) attendance.status = status;
    if (tutorRemarks) attendance.tutorRemarks = tutorRemarks;
    if (topicsCovered) attendance.topicsCovered = topicsCovered;
    if (homeworkAssigned) attendance.homeworkAssigned = homeworkAssigned;
    if (attentiveness) attendance.attentiveness = attentiveness;
    if (understanding) attendance.understanding = understanding;
    if (preparation) attendance.preparation = preparation;
    if (participationLevel) attendance.participationLevel = participationLevel;
    
    // Student can add their notes
    if (req.user.role === 'student') {
      if (studentNotes !== undefined) attendance.studentNotes = studentNotes;
      if (studentFeedback !== undefined) attendance.studentFeedback = studentFeedback;
    }
    
    // Admin can add notes and verify
    if (req.user.role === 'admin') {
      if (adminNotes !== undefined) attendance.adminNotes = adminNotes;
      if (req.body.isVerified !== undefined) {
        attendance.isVerified = req.body.isVerified;
        attendance.verifiedBy = req.user.id;
        attendance.verifiedAt = new Date();
      }
    }
    
    await attendance.save();
    
    const updatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('class');
    
    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: updatedAttendance
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get attendance statistics for a student
// @route   GET /api/attendance/stats/:studentId?
// @access  Private
exports.getAttendanceStats = async (req, res) => {
  try {
    const studentId = req.params.studentId || (req.user.role === 'student' ? req.user.id : null);
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID required' 
      });
    }
    
    // Authorization check
    if (req.user.role === 'student' && req.user.id.toString() !== studentId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const total = await Attendance.countDocuments({ student: studentId });
    const present = await Attendance.countDocuments({ student: studentId, status: 'present' });
    const absent = await Attendance.countDocuments({ student: studentId, status: 'absent' });
    const late = await Attendance.countDocuments({ student: studentId, status: 'late' });
    const excused = await Attendance.countDocuments({ student: studentId, status: 'excused' });
    
    const attendancePercentage = total > 0 ? ((present + late + excused) / total * 100).toFixed(2) : 0;
    
    // Get average ratings
    const records = await Attendance.find({ 
      student: studentId,
      attentiveness: { $exists: true, $ne: null }
    });
    
    let avgRatings = {
      attentiveness: 0,
      understanding: 0,
      preparation: 0,
      overall: 0
    };
    
    if (records.length > 0) {
      avgRatings.attentiveness = (records.reduce((sum, r) => sum + (r.attentiveness || 0), 0) / records.length).toFixed(1);
      avgRatings.understanding = (records.reduce((sum, r) => sum + (r.understanding || 0), 0) / records.length).toFixed(1);
      avgRatings.preparation = (records.reduce((sum, r) => sum + (r.preparation || 0), 0) / records.length).toFixed(1);
      avgRatings.overall = ((parseFloat(avgRatings.attentiveness) + parseFloat(avgRatings.understanding) + parseFloat(avgRatings.preparation)) / 3).toFixed(1);
    }
    
    res.json({
      success: true,
      data: {
        total,
        present,
        absent,
        late,
        excused,
        attendancePercentage: parseFloat(attendancePercentage),
        averageRatings: avgRatings
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

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
exports.deleteAttendance = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can delete attendance records' 
      });
    }
    
    const attendance = await Attendance.findById(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found' 
      });
    }
    
    await attendance.deleteOne();
    
    res.json({
      success: true,
      message: 'Attendance record deleted'
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
