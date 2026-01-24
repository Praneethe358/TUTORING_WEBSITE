const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const Admin = require('../models/Admin');

function extractToken(req) {
  return req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
}

async function resolveUser(decoded) {
  if (decoded.role === 'student') {
    return Student.findById(decoded.id).select('-password');
  }
  if (decoded.role === 'tutor') {
    return Tutor.findById(decoded.id).select('-password');
  }
  if (decoded.role === 'admin' || decoded.role === 'super-admin') {
    return Admin.findById(decoded.id).select('-password');
  }
  return null;
}

async function protectAny(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await resolveUser(decoded);
    if (!user) return res.status(403).json({ message: 'Access denied' });
    req.user = user;
    req.authRole = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.authRole !== role) return res.status(403).json({ message: 'Access denied' });
    next();
  };
}

const protectStudent = [protectAny, requireRole('student')];
const protectTutor = [protectAny, requireRole('tutor')];
const protectAdmin = [protectAny, (req, res, next) => {
  if (req.authRole !== 'admin' && req.authRole !== 'super-admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}];

module.exports = { protectAny, protectStudent, protectTutor, protectAdmin };
