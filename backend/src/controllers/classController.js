const Class = require('../models/Class');
const Availability = require('../models/Availability');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const TutorAssignment = require('../models/TutorAssignment');

/**
 * CLASS CONTROLLER
 * Handles class scheduling, rescheduling, cancellation
 */

// @desc    Get all classes for current user
// @route   GET /api/classes
// @access  Private (Student/Tutor/Admin)
exports.getClasses = async (req, res) => {
  try {
    const { role, id } = req.user;
    const { status, upcoming, past, limit = 50 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (role === 'student') {
      // Students see classes where they are listed in students array or as student
      query.$or = [
        { student: id },
        { students: id }
      ];
    } else if (role === 'tutor') {
      query.tutor = id;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Time-based filters
    const now = new Date();
    if (upcoming === 'true') {
      query.scheduledAt = { $gte: now };
    } else if (past === 'true') {
      query.scheduledAt = { $lt: now };
    }
    
    const classes = await Class.find(query)
      .populate('tutor', 'name email subjects')
      .populate('student', 'name email phone')
      .populate('students', 'name email phone')
      .populate('course', 'subject durationMinutes')
      .sort({ scheduledAt: upcoming === 'true' ? 1 : -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get single class details
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id)
      .populate('tutor', 'name email phone subjects profileImage')
      .populate('student', 'name email phone')
      .populate('course', 'subject durationMinutes description')
      .populate('materials');
    
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    // Authorization check
    const userId = req.user.id || req.user._id;
    if (
      req.user.role !== 'admin' &&
      classItem.student.toString() !== userId.toString() &&
      classItem.tutor.toString() !== userId.toString()
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    res.json({
      success: true,
      data: classItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create/schedule new class
// @route   POST /api/classes
// @access  Private (Student/Tutor/Admin)
exports.createClass = async (req, res) => {
  try {
    const {
      tutorId,
      studentId,
      studentIds,
      courseId,
      scheduledAt,
      duration,
      topic,
      description,
      meetingLink,
      meetingPlatform,
      isRecurring,
      recurrencePattern
    } = req.body;
    
    console.log('📍 Creating class with data:', { tutorId, studentIds: studentIds || [studentId], courseId, scheduledAt, duration, topic });
    
    // Support both single studentId and multiple studentIds
    const finalStudentIds = studentIds && Array.isArray(studentIds) ? studentIds : (studentId ? [studentId] : []);
    
    // Validate required fields
    if (!tutorId || finalStudentIds.length === 0 || !scheduledAt || !topic) {
      const missingFields = [];
      if (!tutorId) missingFields.push('tutorId');
      if (finalStudentIds.length === 0) missingFields.push('studentIds');
      if (!scheduledAt) missingFields.push('scheduledAt');
      if (!topic) missingFields.push('topic');
      console.log('❌ Missing fields:', missingFields);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Check tutor exists and is approved
    const tutor = await Tutor.findById(tutorId);
    if (!tutor || tutor.status !== 'approved') {
      console.log('❌ Tutor not available:', { tutorFound: !!tutor, status: tutor?.status });
      return res.status(400).json({ 
        success: false, 
        message: 'Tutor not available' 
      });
    }
    console.log('✅ Tutor verified:', tutor._id);
    
    // Check all students exist
    const students = await Student.find({ _id: { $in: finalStudentIds } });
    if (students.length !== finalStudentIds.length) {
      console.log('❌ Some students not found:', { requested: finalStudentIds.length, found: students.length });
      return res.status(400).json({ 
        success: false, 
        message: 'One or more students not found' 
      });
    }
    console.log('✅ All students verified:', students.map(s => s._id));
    
    // Verify all students are assigned to this tutor (skip for admin)
    if (req.authRole !== 'admin' && req.authRole !== 'super-admin') {
      const assignments = await TutorAssignment.find({
        tutor: tutorId,
        student: { $in: finalStudentIds },
        status: 'active'
      });
      const assignedStudentIds = assignments.map(a => a.student.toString());
      const unassigned = finalStudentIds.filter(sid => !assignedStudentIds.includes(sid.toString()));
      if (unassigned.length > 0) {
        console.log('❌ Unassigned students:', unassigned);
        return res.status(403).json({
          success: false,
          message: 'Some students are not assigned to you by admin. Only assigned students can be added to classes.'
        });
      }
      console.log('✅ All students are assigned to this tutor');
    }
    
    // Check for scheduling conflicts
    const scheduledDate = new Date(scheduledAt);
    const classDuration = duration || 60;
    const endTime = new Date(scheduledDate.getTime() + classDuration * 60000);
    
    // Overlap rule: existing.start < newEnd AND existing.end > newStart
    // We calculate existing.end with $add(existing.start, duration*60000)
    const conflict = await Class.findOne({
      tutor: tutorId,
      status: { $in: ['scheduled', 'ongoing'] },
      $expr: {
        $and: [
          { $lt: ['$scheduledAt', endTime] },
          {
            $gt: [
              { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
              scheduledDate
            ]
          }
        ]
      }
    });
    
    if (conflict) {
      console.log('❌ Scheduling conflict detected:', { conflictAt: conflict.scheduledAt });
      return res.status(400).json({ 
        success: false, 
        message: 'Tutor has a conflicting class at this time' 
      });
    }
    console.log('✅ No scheduling conflicts');
    
    // Create class
    const newClass = await Class.create({
      tutor: tutorId,
      students: finalStudentIds,
      student: finalStudentIds[0],
      course: courseId,
      scheduledAt: scheduledDate,
      duration: classDuration,
      topic,
      description,
      meetingLink: meetingLink || undefined,
      meetingPlatform: meetingPlatform || 'meet',
      isRecurring: isRecurring || false,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      status: 'scheduled'
    });
    
    // Create notification for tutor
    await Notification.create({
      recipient: tutorId,
      recipientRole: 'tutor',
      title: 'New Class Scheduled',
      message: `A new class has been scheduled with ${students.length} student(s) on ${scheduledDate.toLocaleDateString()}`,
      type: 'class_scheduled',
      relatedClass: newClass._id,
      priority: 'normal'
    });
    
    // Create notifications for all students
    for (const student of students) {
      await Notification.create({
        recipient: student._id,
        recipientRole: 'student',
        title: 'Class Scheduled',
        message: `Your class with ${tutor.name} is scheduled for ${scheduledDate.toLocaleDateString()}`,
        type: 'class_scheduled',
        relatedClass: newClass._id,
        priority: 'normal'
      });
    }
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('tutor', 'name email subjects')
      .populate('student', 'name email')
      .populate('students', 'name email')
      .populate('course', 'subject durationMinutes');
    
    console.log('✅ Class created successfully:', newClass._id);
    res.status(201).json({
      success: true,
      message: 'Class scheduled successfully',
      data: populatedClass
    });
  } catch (error) {
    console.error('❌ Class creation error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update class (reschedule/update details)
// @route   PUT /api/classes/:id
// @access  Private (Student/Tutor/Admin)
exports.updateClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    // Authorization check
    const userId = req.user.id || req.user._id;
    if (
      req.user.role !== 'admin' &&
      classItem.student.toString() !== userId.toString() &&
      classItem.tutor.toString() !== userId.toString()
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const { scheduledAt, duration, topic, description, meetingLink, notes, tutorRemarks, status } = req.body;
    
    // Handle rescheduling
    if (scheduledAt && new Date(scheduledAt).getTime() !== classItem.scheduledAt.getTime()) {
      classItem.rescheduledFrom = classItem.scheduledAt;
      classItem.scheduledAt = new Date(scheduledAt);
      classItem.rescheduledReason = req.body.rescheduledReason || 'Rescheduled by user';
      classItem.status = 'rescheduled';
    }
    
    // Update fields
    if (duration) classItem.duration = duration;
    if (topic) classItem.topic = topic;
    if (description) classItem.description = description;
    if (meetingLink) classItem.meetingLink = meetingLink;
    if (notes) classItem.notes = notes;
    if (tutorRemarks) classItem.tutorRemarks = tutorRemarks;
    if (status) classItem.status = status;
    
    if (status === 'completed') {
      classItem.completedAt = new Date();
    }
    
    await classItem.save();
    
    const updatedClass = await Class.findById(classItem._id)
      .populate('tutor', 'name email')
      .populate('student', 'name email');
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Cancel class
// @route   DELETE /api/classes/:id
// @access  Private (Student/Tutor/Admin)
exports.cancelClass = async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.id);
    
    if (!classItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }
    
    // Authorization check
    const userId = req.user.id || req.user._id;
    if (
      req.user.role !== 'admin' &&
      classItem.student.toString() !== userId.toString() &&
      classItem.tutor.toString() !== userId.toString()
    ) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    classItem.status = 'cancelled';
    classItem.cancelledBy = req.user.role;
    classItem.cancellationReason = req.body.reason || 'Cancelled by user';
    classItem.cancelledAt = new Date();
    
    await classItem.save();
    
    // Notify other party
    const otherPartyId = req.user.role === 'student' ? classItem.tutor : classItem.student;
    const otherPartyRole = req.user.role === 'student' ? 'tutor' : 'student';
    
    await Notification.create({
      recipient: otherPartyId,
      recipientRole: otherPartyRole,
      title: 'Class Cancelled',
      message: `A scheduled class has been cancelled. Reason: ${classItem.cancellationReason}`,
      type: 'class_cancelled',
      relatedClass: classItem._id,
      priority: 'high'
    });
    
    res.json({
      success: true,
      message: 'Class cancelled successfully',
      data: classItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Get class statistics
// @route   GET /api/classes/stats
// @access  Private
exports.getClassStats = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { role } = req.user;
    
    let query = {};
    if (role === 'student') {
      query.student = userId;
    } else if (role === 'tutor') {
      query.tutor = userId;
    }
    
    const now = new Date();
    
    const stats = {
      total: await Class.countDocuments(query),
      upcoming: await Class.countDocuments({ ...query, scheduledAt: { $gte: now }, status: 'scheduled' }),
      completed: await Class.countDocuments({ ...query, status: 'completed' }),
      cancelled: await Class.countDocuments({ ...query, status: 'cancelled' }),
      totalHours: 0
    };
    
    // Calculate total hours
    const classes = await Class.find({ ...query, status: 'completed' });
    stats.totalHours = classes.reduce((sum, c) => sum + (c.duration / 60), 0);
    
    res.json({
      success: true,
      data: stats
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
