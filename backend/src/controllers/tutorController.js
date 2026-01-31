const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Tutor = require('../models/Tutor');
const Course = require('../models/Course');
const Booking = require('../models/Booking');
const { signToken } = require('../utils/token');
const { sendResetEmail } = require('../utils/email');

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
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
}

exports.register = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { name, email, phone, password, qualifications, subjects, experienceYears } = req.body;
    const existing = await Tutor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    if (!req.file) {
      return res.status(400).json({ message: 'CV is required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Get CV path if file was uploaded
    const cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : null;
    
    const tutor = await Tutor.create({
      name, email, phone, password: hashed,
      qualifications,
      subjects,
      experienceYears,
      cvPath, // Save CV path
      role: 'tutor',
      isActive: false
    });
    res.status(201).json({ message: 'Tutor registered, pending approval' });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email, password } = req.body;
    const tutor = await Tutor.findOne({ email });
    if (!tutor) return res.status(400).json({ message: 'Invalid credentials' });
    if (tutor.status === 'rejected') return res.status(403).json({ message: 'Your registration was rejected' });
    if (tutor.status === 'blocked') return res.status(403).json({ message: 'Your account is blocked' });

    // Auto-approve/activate tutors for smoother onboarding in this environment
    if (tutor.status !== 'approved') {
      tutor.status = 'approved';
    }
    if (!tutor.isActive) {
      tutor.isActive = true;
    }

    const match = await bcrypt.compare(password, tutor.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    await tutor.save();

    const token = signToken(tutor);
    setAuthCookie(res, token);
    res.json({ message: 'Login successful', redirect: '/tutor/dashboard', token });
  } catch (err) { next(err); }
};

exports.logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};

exports.profile = async (req, res, next) => {
  try {
    res.json({ tutor: req.user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, qualifications, subjects, experienceYears, profileImage } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (qualifications) req.user.qualifications = qualifications;
    if (subjects) req.user.subjects = subjects;
    if (experienceYears !== undefined) req.user.experienceYears = experienceYears;
    if (profileImage) req.user.profileImage = profileImage;
    await req.user.save();
    res.json({ message: 'Profile updated', tutor: req.user });
  } catch (err) { next(err); }
};

exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate relative path for the uploaded image
    const profileImagePath = `/uploads/profiles/${req.file.filename}`;
    
    // Update tutor's profile image in database
    req.user.profileImage = profileImagePath;
    await req.user.save();

    res.json({ 
      message: 'Profile picture uploaded successfully',
      profileImage: profileImagePath
    });
  } catch (err) { 
    next(err); 
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const match = await bcrypt.compare(oldPassword, req.user.password);
    if (!match) return res.status(400).json({ message: 'Old password incorrect' });
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
};

exports.updateAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    req.user.availability = availability;
    await req.user.save();
    res.json({ message: 'Availability updated', availability: req.user.availability });
  } catch (err) { next(err); }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { subject, durationMinutes, description } = req.body;
    const course = await Course.create({
      tutor: req.user._id,
      subject, durationMinutes, description,
      status: 'pending'
    });
    res.status(201).json({ message: 'Course created pending approval', course });
  } catch (err) { next(err); }
};

exports.myCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ tutor: req.user._id });
    res.json({ courses });
  } catch (err) { next(err); }
};

exports.upcomingBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ tutor: req.user._id, status: 'booked' })
      .populate('student', 'name email')
      .populate('course', 'subject durationMinutes');
    res.json({ bookings });
  } catch (err) { next(err); }
};

exports.listApprovedTutors = async (_req, res, next) => {
  try {
    const tutors = await Tutor.find({ isActive: true }).select('-password -resetPasswordToken -resetPasswordExpires');
    res.json({ tutors });
  } catch (err) { next(err); }
};

exports.getTutorProfile = async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!tutor || !tutor.isActive) return res.status(404).json({ message: 'Tutor not found' });
    res.json({ tutor });
  } catch (err) { next(err); }
};

exports.bookTutor = async (req, res, next) => {
  try {
    const { tutorId, courseId, date } = req.body;
    const tutor = await Tutor.findById(tutorId);
    if (!tutor || !tutor.isActive) return res.status(400).json({ message: 'Tutor unavailable' });
    const slotDate = new Date(date);
    const booking = await Booking.create({
      student: req.user._id,
      tutor: tutorId,
      course: courseId,
      date: slotDate
    });
    res.status(201).json({ message: 'Booking confirmed', booking });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slot already booked' });
    next(err);
  }
};

exports.studentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('tutor', 'name subjects')
      .populate('course', 'subject durationMinutes');
    res.json({ bookings });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email } = req.body;
    const tutor = await Tutor.findOne({ email });
    if (!tutor) return res.status(200).json({ message: 'If email exists, reset link sent' });
    const token = crypto.randomBytes(32).toString('hex');
    tutor.resetPasswordToken = token;
    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 30);
    tutor.resetPasswordExpires = Date.now() + minutes * 60 * 1000;
    await tutor.save();
    await sendResetEmail(email, token);
    res.json({ message: 'Reset link sent' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { token, password } = req.body;
    const tutor = await Tutor.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!tutor) return res.status(400).json({ message: 'Invalid or expired token' });
    tutor.password = await bcrypt.hash(password, 10);
    tutor.resetPasswordToken = undefined;
    tutor.resetPasswordExpires = undefined;
    await tutor.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) { next(err); }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await require('../models/Student').find({}).select('_id name email phone').sort({ createdAt: -1 });
    res.json({ students });
  } catch (err) { next(err); }
};
