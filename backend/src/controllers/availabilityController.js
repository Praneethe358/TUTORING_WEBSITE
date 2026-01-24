const Availability = require('../models/Availability');
const Class = require('../models/Class');
const Tutor = require('../models/Tutor');

/**
 * AVAILABILITY CONTROLLER
 * Manages tutor availability slots
 */

// @desc    Get tutor availability
// @route   GET /api/availability/:tutorId?
// @access  Public (for students browsing), Private (for own availability)
exports.getAvailability = async (req, res) => {
  try {
    const tutorId = req.params.tutorId || (req.user && req.user.role === 'tutor' ? req.user.id : null);
    
    if (!tutorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tutor ID required' 
      });
    }
    
    const { date, dayOfWeek, onlyAvailable } = req.query;
    
    let query = { tutor: tutorId, isActive: true };
    
    if (date) {
      query.specificDate = new Date(date);
    } else if (dayOfWeek !== undefined) {
      query.dayOfWeek = parseInt(dayOfWeek);
      query.specificDate = null;
    }
    
    if (onlyAvailable === 'true') {
      query.isBooked = false;
    }
    
    const slots = await Availability.find(query)
      .populate('bookedBy', 'name email')
      .populate('classId')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Create availability slot
// @route   POST /api/availability
// @access  Private (Tutor/Admin)
exports.createAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'tutor' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const tutorId = req.user.role === 'tutor' ? req.user.id : req.body.tutorId;
    
    if (!tutorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tutor ID required' 
      });
    }
    
    const {
      dayOfWeek,
      startTime,
      endTime,
      specificDate,
      isRecurring,
      validFrom,
      validUntil,
      timezone,
      notes
    } = req.body;
    
    if (!dayOfWeek && !specificDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either dayOfWeek or specificDate is required' 
      });
    }
    
    if (!startTime || !endTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start time and end time are required' 
      });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid time format. Use HH:MM (24-hour)' 
      });
    }
    
    // Check for overlapping slots
    let overlapQuery = {
      tutor: tutorId,
      isActive: true,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    };
    
    if (specificDate) {
      overlapQuery.specificDate = new Date(specificDate);
    } else {
      overlapQuery.dayOfWeek = dayOfWeek;
      overlapQuery.specificDate = null;
    }
    
    const overlap = await Availability.findOne(overlapQuery);
    if (overlap) {
      return res.status(400).json({ 
        success: false, 
        message: 'This slot overlaps with an existing availability' 
      });
    }
    
    const availability = await Availability.create({
      tutor: tutorId,
      dayOfWeek: specificDate ? null : dayOfWeek,
      startTime,
      endTime,
      specificDate: specificDate ? new Date(specificDate) : null,
      isRecurring: isRecurring !== undefined ? isRecurring : !specificDate,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      timezone: timezone || 'UTC',
      notes
    });
    
    res.status(201).json({
      success: true,
      message: 'Availability slot created',
      data: availability
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Update availability slot
// @route   PUT /api/availability/:id
// @access  Private (Tutor/Admin)
exports.updateAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Availability slot not found' 
      });
    }
    
    // Authorization check
    if (req.user.role !== 'admin' && slot.tutor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Prevent updating if already booked
    if (slot.isBooked && req.body.isBooked !== undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify a booked slot' 
      });
    }
    
    const { startTime, endTime, isActive, notes, validUntil } = req.body;
    
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (isActive !== undefined) slot.isActive = isActive;
    if (notes !== undefined) slot.notes = notes;
    if (validUntil !== undefined) slot.validUntil = validUntil ? new Date(validUntil) : null;
    
    await slot.save();
    
    res.json({
      success: true,
      message: 'Availability slot updated',
      data: slot
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Delete availability slot
// @route   DELETE /api/availability/:id
// @access  Private (Tutor/Admin)
exports.deleteAvailability = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Availability slot not found' 
      });
    }
    
    // Authorization check
    if (req.user.role !== 'admin' && slot.tutor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Prevent deleting if booked
    if (slot.isBooked) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete a booked slot. Cancel the class first.' 
      });
    }
    
    await slot.deleteOne();
    
    res.json({
      success: true,
      message: 'Availability slot deleted'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Book availability slot
// @route   POST /api/availability/:id/book
// @access  Private (Student/Admin)
exports.bookSlot = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ 
        success: false, 
        message: 'Availability slot not found' 
      });
    }
    
    if (!slot.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'This slot is not active' 
      });
    }
    
    if (slot.isBooked) {
      return res.status(400).json({ 
        success: false, 
        message: 'This slot is already booked' 
      });
    }
    
    const studentId = req.user.role === 'student' ? req.user.id : req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student ID required' 
      });
    }
    
    // Calculate class date
    let classDate;
    if (slot.specificDate) {
      classDate = new Date(slot.specificDate);
    } else {
      // Calculate next occurrence of this day of week
      const now = new Date();
      const daysUntil = (slot.dayOfWeek - now.getDay() + 7) % 7 || 7;
      classDate = new Date(now.getTime() + daysUntil * 24 * 60 * 60 * 1000);
    }
    
    // Set time
    const [hours, minutes] = slot.startTime.split(':');
    classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // Calculate duration
    const [endHours, endMinutes] = slot.endTime.split(':');
    const startMinutes = parseInt(hours) * 60 + parseInt(minutes);
    const endTotalMinutes = parseInt(endHours) * 60 + parseInt(endMinutes);
    const duration = endTotalMinutes - startMinutes;
    
    // Create class
    const newClass = await Class.create({
      tutor: slot.tutor,
      student: studentId,
      course: req.body.courseId,
      scheduledAt: classDate,
      duration,
      topic: req.body.topic || 'Tutoring Session',
      description: req.body.description || '',
      status: 'scheduled'
    });
    
    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = studentId;
    slot.classId = newClass._id;
    await slot.save();
    
    const populatedClass = await Class.findById(newClass._id)
      .populate('tutor', 'name email subjects')
      .populate('student', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Slot booked successfully',
      data: {
        class: populatedClass,
        slot
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

// @desc    Get tutor weekly schedule
// @route   GET /api/availability/schedule/:tutorId?
// @access  Public/Private
exports.getWeeklySchedule = async (req, res) => {
  try {
    const tutorId = req.params.tutorId || (req.user.role === 'tutor' ? req.user.id : null);
    
    if (!tutorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tutor ID required' 
      });
    }
    
    // Get recurring availability
    const availability = await Availability.find({
      tutor: tutorId,
      isActive: true,
      isRecurring: true,
      specificDate: null
    }).sort({ dayOfWeek: 1, startTime: 1 });
    
    // Group by day
    const schedule = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    days.forEach((day, index) => {
      schedule[day] = availability
        .filter(slot => slot.dayOfWeek === index)
        .map(slot => ({
          id: slot._id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
          notes: slot.notes
        }));
    });
    
    res.json({
      success: true,
      data: schedule
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
