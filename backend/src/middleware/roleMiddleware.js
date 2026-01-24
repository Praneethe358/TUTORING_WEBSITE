function allowStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}

module.exports = { allowStudent };
