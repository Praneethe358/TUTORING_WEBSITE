const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Booking = require('../models/Booking');
const Course = require('../models/Course');
const CourseEnrollment = require('../models/CourseEnrollment');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const { signToken } = require('../utils/token');
const { sendTutorStatusEmail } = require('../utils/email');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
}

async function logAction(adminId, action, targetType, targetId, targetEmail, details, req) {
  try {
    await AuditLog.create({
      admin: adminId,
      action,
      targetType,
      targetId,
      targetEmail,
      details,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

exports.login = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    if (!admin.isActive) return res.status(403).json({ message: 'Admin account disabled' });
    
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = signToken(admin);
    setAuthCookie(res, token);
    res.json({ message: 'Login successful', redirect: '/admin/dashboard', token });
  } catch (err) { next(err); }
};

exports.profile = async (req, res, next) => {
  try {
    res.json({ admin: req.user });
  } catch (err) { next(err); }
};

exports.logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};

// DASHBOARD STATS
exports.dashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, totalTutors, pendingTutors, totalBookings, activeCourses] = await Promise.all([
      Student.countDocuments({}),
      Tutor.countDocuments({}),
      Tutor.countDocuments({ status: 'pending' }),
      Booking.countDocuments({}),
      Course.countDocuments({ status: 'approved' })
    ]);

    res.json({
      totalStudents,
      totalTutors,
      pendingTutors,
      totalBookings,
      activeCourses
    });
  } catch (err) { next(err); }
};

// TUTOR MANAGEMENT
exports.getTutors = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const skip = (page - 1) * limit;
    const tutors = await Tutor.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Tutor.countDocuments(filter);

    res.json({ tutors, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// EXPORT TUTORS CSV
exports.exportTutorsCSV = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const tutors = await Tutor.find(filter)
      .select('name email phone status subjects experienceYears qualifications createdAt approvedAt isActive timezone')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Status',
      'Active',
      'Subjects',
      'Experience (years)',
      'Qualifications',
      'Timezone',
      'Applied At',
      'Approved At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = tutors.map((tutor) => [
      escapeCsv(tutor.name || ''),
      escapeCsv(tutor.email || ''),
      escapeCsv(tutor.phone || ''),
      escapeCsv(tutor.status || ''),
      escapeCsv(tutor.isActive ? 'Yes' : 'No'),
      escapeCsv(Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : ''),
      escapeCsv(tutor.experienceYears ?? ''),
      escapeCsv(tutor.qualifications || ''),
      escapeCsv(tutor.timezone || ''),
      escapeCsv(tutor.createdAt ? tutor.createdAt.toISOString() : ''),
      escapeCsv(tutor.approvedAt ? tutor.approvedAt.toISOString() : '')
    ]);

    const csv = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="tutors_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export tutors CSV error:', err);
    next(err);
  }
};

exports.approveTutor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutor = await Tutor.findById(id);
    
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    
    tutor.status = 'approved';
    tutor.isActive = true;
    tutor.approvedBy = req.user._id;
    tutor.approvedAt = new Date();
    await tutor.save();

    await logAction(req.user._id, 'approve_tutor', 'Tutor', id, tutor.email, {}, req);

    try {
      await sendTutorStatusEmail(tutor.email, tutor.name, 'approved');
    } catch (emailErr) {
      console.error('Failed to send tutor approval email:', emailErr.message || emailErr);
    }

    res.json({ message: 'Tutor approved', tutor });
  } catch (err) { next(err); }
};

exports.rejectTutor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const tutor = await Tutor.findById(id);
    
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    
    tutor.status = 'rejected';
    tutor.rejectionReason = reason;
    await tutor.save();

    await logAction(req.user._id, 'reject_tutor', 'Tutor', id, tutor.email, { reason }, req);

    try {
      await sendTutorStatusEmail(tutor.email, tutor.name, 'rejected', reason);
    } catch (emailErr) {
      console.error('Failed to send tutor rejection email:', emailErr.message || emailErr);
    }

    res.json({ message: 'Tutor rejected', tutor });
  } catch (err) { next(err); }
};

exports.blockTutor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const tutor = await Tutor.findById(id);
    
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });
    
    tutor.status = 'blocked';
    tutor.isActive = false;
    await tutor.save();

    await logAction(req.user._id, 'block_tutor', 'Tutor', id, tutor.email, { reason }, req);

    try {
      await sendTutorStatusEmail(tutor.email, tutor.name, 'blocked', reason);
    } catch (emailErr) {
      console.error('Failed to send tutor block email:', emailErr.message || emailErr);
    }

    res.json({ message: 'Tutor blocked', tutor });
  } catch (err) { next(err); }
};

// STUDENT MANAGEMENT
exports.getStudents = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const { status } = req.query; // Added status filter
    const filter = {};
    
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    if (status === 'active') filter.isActive = true; // Filter for active students
    if (status === 'inactive') filter.isActive = false; // Filter for inactive students

    const skip = (page - 1) * limit;
    const students = await Student.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(filter);

    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id, type } = req.params; // type: 'student' or 'tutor'
    const Model = type === 'student' ? Student : Tutor;
    const user = await Model.findById(id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    await Model.findByIdAndDelete(id);
    await logAction(req.user._id, 'delete_user', type, id, user.email, {}, req);

    res.json({ message: `${type} deleted successfully` });
  } catch (err) { next(err); }
};

// BOOKINGS MANAGEMENT
exports.getBookings = async (req, res, next) => {
  try {
    const { tutor, student, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (tutor) filter.tutor = tutor;
    if (student) filter.student = student;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate('tutor', 'name email')
      .populate('student', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Booking.countDocuments(filter);

    res.json({ bookings, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'cancelled', cancellationReason: reason },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await logAction(req.user._id, 'cancel_booking', 'Booking', id, '', { reason }, req);

    res.json({ message: 'Booking cancelled', booking });
  } catch (err) { next(err); }
};

// COURSES MODERATION
exports.getCourses = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const courses = await Course.find(filter)
      .populate('tutor', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.json({ courses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.approveCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    ).populate('tutor', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    await logAction(req.user._id, 'approve_course', 'Course', id, '', {}, req);

    res.json({ message: 'Course approved', course });
  } catch (err) { next(err); }
};

exports.rejectCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const course = await Course.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    ).populate('tutor', 'name email');

    if (!course) return res.status(404).json({ message: 'Course not found' });

    await logAction(req.user._id, 'reject_course', 'Course', id, '', { reason }, req);

    res.json({ message: 'Course rejected', course });
  } catch (err) { next(err); }
};

// AUDIT LOGS
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find()
      .populate('admin', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments();

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// Settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    res.json({ settings });
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;

    const { settings } = req.body;

    let existingSettings = await Settings.findOne();
    if (!existingSettings) {
      existingSettings = await Settings.create(settings);
    } else {
      Object.assign(existingSettings, settings);
      existingSettings.updatedBy = req.user.id;
      await existingSettings.save();
    }

    // Log the action
    await logAction(req.user.id, 'UPDATE_SETTINGS', 'Settings', existingSettings._id, 'System', 'Settings updated', req);

    res.json({ message: 'Settings updated successfully', settings: existingSettings });
  } catch (err) { next(err); }
};

// EXPORT ENROLLMENTS CSV
exports.exportEnrollmentsCSV = async (req, res, next) => {
  try {
    const { status, search, courseId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (courseId) query.courseId = courseId;

    const enrollments = await CourseEnrollment.find(query)
      .populate({ path: 'studentId', select: 'name email' })
      .populate({ path: 'courseId', select: 'title category level' })
      .sort({ enrolledAt: -1 })
      .lean();

    const filtered = enrollments.filter((enr) => {
      if (!search) return true;
      const haystack = `${enr.studentId?.name || ''} ${enr.studentId?.email || ''} ${enr.courseId?.title || ''}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });

    const headers = ['Student Name', 'Student Email', 'Course', 'Category', 'Level', 'Status', 'Progress %', 'Enrolled At'];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filtered.map((enr) => [
      escapeCsv(enr.studentId?.name || ''),
      escapeCsv(enr.studentId?.email || ''),
      escapeCsv(enr.courseId?.title || ''),
      escapeCsv(enr.courseId?.category || ''),
      escapeCsv(enr.courseId?.level || ''),
      escapeCsv(enr.status || ''),
      escapeCsv(enr.progress ?? 0),
      escapeCsv(enr.enrolledAt ? enr.enrolledAt.toISOString() : '')
    ]);

    const csv = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="enrollments_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export enrollments CSV error:', err);
    next(err);
  }
};

// EXPORT STUDENTS CSV
exports.exportStudentsCSV = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') filter.isActive = true; // Filter for active students
    if (status === 'inactive') filter.isActive = false; // Filter for inactive students

    const students = await Student.find(filter)
      .select('name email phone isActive timezone createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Active',
      'Timezone',
      'Joined'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = students.map((student) => [
      escapeCsv(student.name || ''),
      escapeCsv(student.email || ''),
      escapeCsv(student.phone || ''),
      escapeCsv(student.isActive ? 'Active' : 'Inactive'),
      escapeCsv(student.timezone || ''),
      escapeCsv(student.createdAt ? student.createdAt.toISOString().split('T')[0] : '')
    ]);

    const csv = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="students_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('Export students CSV error:', err);
    next(err);
  }
};
