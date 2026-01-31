const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const Student = require('../models/Student');
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
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
}

exports.register = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { name, email, phone, course, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const student = await Student.create({ 
      name, 
      email, 
      phone, 
      course, 
      password: hashed, 
      role: 'student',
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      isEmailVerified: false
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name);
    } catch (emailError) {
      // Don't fail registration if email fails
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to send verification email:', emailError);
      }
    }

    const token = signToken(student);
    setAuthCookie(res, token);
    res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.', 
      student: { id: student._id, name, email, phone, course, role: student.role, isEmailVerified: false }
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
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(200).json({ message: 'If email exists, reset link sent' });
    const token = crypto.randomBytes(32).toString('hex');
    student.resetPasswordToken = token;
    const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 30);
    student.resetPasswordExpires = Date.now() + minutes * 60 * 1000;
    await student.save();
    await sendResetEmail(email, token);
    res.json({ message: 'Reset link sent' });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    if (handleValidation(req, res)) return;
    const { token, password } = req.body;
    const student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!student) return res.status(400).json({ message: 'Invalid or expired token' });
    student.password = await bcrypt.hash(password, 10);
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;
    await student.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) { next(err); }
};
