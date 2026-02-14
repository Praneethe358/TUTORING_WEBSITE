const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { signToken } = require('../utils/token');
const { sendResetEmail, sendVerificationEmail } = require('../utils/email');

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

exports.register = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { name, email, phone, contactEmail, course, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const student = await Student.create({ 
      name, 
      email, 
      phone, 
      contactEmail: contactEmail || '', // Optional real email for notifications
      course, 
      password: hashed, 
      role: 'student',
      isEmailVerified: true // No email verification required
    });

    const token = signToken(student);
    setAuthCookie(res, token);
    res.status(201).json({ 
      message: 'Registration successful. You can now login.', 
      student: { id: student._id, name, email, phone, contactEmail, course, role: student.role }
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, student.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(student);
    setAuthCookie(res, token);
    res.json({ message: 'Login successful', redirect: '/student/dashboard', token });
  } catch (err) { next(err); }
};

exports.logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ message: 'Logged out' });
};

exports.profile = async (req, res, next) => {
  try {
    res.json({ student: req.user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json({ message: 'Profile updated', student: req.user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    // Check if user has a password (should not be null)
    if (!req.user.password) {
      return res.status(400).json({ message: 'Unable to change password. Please contact support.' });
    }
    
    const match = await bcrypt.compare(oldPassword, req.user.password);
    if (!match) return res.status(400).json({ message: 'Old password incorrect' });
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ message: 'Password changed' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { email, reason } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(200).json({ message: 'If email exists, a password reset request has been submitted to admin.' });
    
    // Check if there's already a pending request
    const existingRequest = await PasswordResetRequest.findOne({ 
      studentId: student._id, 
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(200).json({ message: 'You already have a pending password reset request. Please wait for admin approval.' });
    }
    
    // Create new password reset request
    await PasswordResetRequest.create({
      studentId: student._id,
      email: student.email,
      reason: reason || 'Forgot password',
      status: 'pending'
    });
    
    res.json({ message: 'Password reset request submitted. Admin will review and approve/deny your request.' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { token, password } = req.body;
    
    // Find approved reset request with valid token
    const resetRequest = await PasswordResetRequest.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
      status: 'approved'
    });
    
    if (!resetRequest) return res.status(400).json({ message: 'Invalid or expired reset token. Please submit a new password reset request.' });
    
    const student = await Student.findById(resetRequest.studentId);
    if (!student) return res.status(400).json({ message: 'Student not found' });
    
    // Reset password
    student.password = await bcrypt.hash(password, 10);
    await student.save();
    
    // Mark reset request as completed
    resetRequest.resetCompletedAt = new Date();
    resetRequest.resetTokenExpires = undefined; // Invalidate token
    await resetRequest.save();
    
    res.json({ message: 'Password reset successful. You can now login with your new password.' });
  } catch (err) { next(err); }
};
