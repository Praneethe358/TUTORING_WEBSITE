const DemoRequest = require('../models/DemoRequest');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');

/**
 * DEMO REQUEST CONTROLLER
 * Handles demo class booking (public), admin management, and tutor feedback
 */

// ============ PUBLIC (No Auth) ============

// @desc    Submit a demo request (public - no login needed)
// @route   POST /api/demo-requests
exports.submitDemoRequest = async (req, res) => {
  try {
    const { studentName, classGrade, subjects, preferredTimeSlot, contactEmail, contactPhone, whatsapp } = req.body;

    // Basic validation
    if (!studentName || !classGrade || !subjects || !preferredTimeSlot || !contactPhone) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    // Prevent duplicate pending requests from same phone
    const existing = await DemoRequest.findOne({
      contactPhone,
      status: { $in: ['pending', 'scheduled'] }
    }).lean();

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A demo request with this phone number is already pending. We will contact you soon!'
      });
    }

    const demoRequest = await DemoRequest.create({
      studentName,
      classGrade,
      subjects,
      preferredTimeSlot,
      contactEmail: contactEmail || '',
      contactPhone,
      whatsapp: whatsapp || contactPhone
    });

    res.status(201).json({
      success: true,
      message: 'Demo class request submitted successfully! We will contact you shortly.',
      data: { id: demoRequest._id }
    });
  } catch (error) {
    console.error('Submit demo request error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit request. Please try again.' });
  }
};

// ============ ADMIN ============

// @desc    Get all demo requests
// @route   GET /api/admin/demo-requests
exports.getAllDemoRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      DemoRequest.find(query)
        .populate('assignedTutor', 'name email subjects')
        .populate('convertedStudentId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      DemoRequest.countDocuments(query)
    ]);

    res.json({ success: true, data: requests, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error('Get demo requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch demo requests' });
  }
};

// @desc    Update demo request (assign tutor, schedule, update status, add notes)
// @route   PUT /api/admin/demo-requests/:id
exports.updateDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTutor, scheduledDate, scheduledTime, status, adminNotes } = req.body;

    const demoRequest = await DemoRequest.findById(id);
    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    if (assignedTutor !== undefined) demoRequest.assignedTutor = assignedTutor;
    if (scheduledDate !== undefined) demoRequest.scheduledDate = scheduledDate;
    if (scheduledTime !== undefined) demoRequest.scheduledTime = scheduledTime;
    if (status !== undefined) demoRequest.status = status;
    if (adminNotes !== undefined) demoRequest.adminNotes = adminNotes;

    // If scheduling, auto-set status
    if (scheduledDate && scheduledTime && assignedTutor && demoRequest.status === 'pending') {
      demoRequest.status = 'scheduled';
    }

    await demoRequest.save();
    await demoRequest.populate('assignedTutor', 'name email subjects');

    res.json({ success: true, message: 'Demo request updated', data: demoRequest });
  } catch (error) {
    console.error('Update demo request error:', error);
    res.status(500).json({ success: false, message: 'Failed to update demo request' });
  }
};

// @desc    Convert demo request to student account
// @route   POST /api/admin/demo-requests/:id/convert
exports.convertToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;

    const demoRequest = await DemoRequest.findById(id);
    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }

    if (demoRequest.status === 'converted') {
      return res.status(400).json({ success: false, message: 'Already converted to student' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required for student account creation' });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(409).json({ success: false, message: 'A student with this email already exists' });
    }

    // Create student account
    const student = await Student.create({
      name: demoRequest.studentName,
      email: email.toLowerCase(),
      password,
      phone: demoRequest.contactPhone,
      isVerified: true
    });

    // Update demo request
    demoRequest.status = 'converted';
    demoRequest.convertedStudentId = student._id;
    demoRequest.convertedAt = new Date();
    await demoRequest.save();

    res.json({
      success: true,
      message: 'Demo request converted to student account',
      data: { studentId: student._id, studentName: student.name, studentEmail: student.email }
    });
  } catch (error) {
    console.error('Convert demo error:', error);
    res.status(500).json({ success: false, message: 'Failed to convert demo request' });
  }
};

// @desc    Delete demo request
// @route   DELETE /api/admin/demo-requests/:id
exports.deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const demoRequest = await DemoRequest.findByIdAndDelete(id);
    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo request not found' });
    }
    res.json({ success: true, message: 'Demo request deleted' });
  } catch (error) {
    console.error('Delete demo request error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete demo request' });
  }
};

// ============ TUTOR ============

// @desc    Get demo classes assigned to current tutor
// @route   GET /api/tutor/demo-classes
exports.getTutorDemoClasses = async (req, res) => {
  try {
    const tutorId = req.user._id || req.user.id;
    const demoClasses = await DemoRequest.find({
      assignedTutor: tutorId,
      status: { $in: ['scheduled', 'completed'] }
    }).sort({ scheduledDate: -1 });

    res.json({ success: true, data: demoClasses });
  } catch (error) {
    console.error('Get tutor demo classes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch demo classes' });
  }
};

// @desc    Mark demo as completed and add feedback
// @route   PUT /api/tutor/demo-classes/:id/complete
exports.completeDemoClass = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user._id || req.user.id;
    const { tutorFeedback } = req.body;

    const demoRequest = await DemoRequest.findOne({ _id: id, assignedTutor: tutorId });
    if (!demoRequest) {
      return res.status(404).json({ success: false, message: 'Demo class not found or not assigned to you' });
    }

    demoRequest.status = 'completed';
    demoRequest.tutorFeedback = tutorFeedback || '';
    demoRequest.demoCompletedAt = new Date();
    await demoRequest.save();

    res.json({ success: true, message: 'Demo marked as completed', data: demoRequest });
  } catch (error) {
    console.error('Complete demo class error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete demo class' });
  }
};

module.exports = exports;
