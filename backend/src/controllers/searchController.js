const LMSCourse = require('../models/LMSCourse');
const Tutor = require('../models/Tutor');
const SearchPreference = require('../models/SearchPreference');

const buildCourseMatch = (req) => {
  const { category, level, status, q } = req.query;
  const match = {};

  if (category) match.category = category;
  if (level) match.level = level;
  if (status) match.status = status;
  if (q) match.title = { $regex: q, $options: 'i' };

  if (req.user?.role === 'student') {
    match.status = 'published';
    match.isPublic = true;
  }

  return match;
};

exports.searchCourses = async (req, res) => {
  try {
    const { sort } = req.query;
    const match = buildCourseMatch(req);

    const sortStage = (() => {
      if (sort === 'popularity') return { enrolledCount: -1, createdAt: -1 };
      if (sort === 'rating') return { rating: -1, createdAt: -1 };
      return { createdAt: -1 };
    })();

    const courses = await LMSCourse.aggregate([
      { $match: match },
      {
        $addFields: {
          enrolledCount: { $size: { $ifNull: ['$enrolledStudents', []] } },
          rating: { $ifNull: ['$rating', 0] }
        }
      },
      { $sort: sortStage },
      { $limit: 50 }
    ]);

    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchTutors = async (req, res) => {
  try {
    const { q, subject, sort } = req.query;
    const match = {};
    if (q) match.name = { $regex: q, $options: 'i' };
    if (subject) match.subjects = subject;
    match.status = 'approved';

    const sortStage = (() => {
      if (sort === 'rating') return { rating: -1, createdAt: -1 };
      if (sort === 'newest') return { createdAt: -1 };
      return { isActive: -1, createdAt: -1 };
    })();

    const tutors = await Tutor.find(match)
      .select('name email subjects experienceYears avatar profileImage rating isActive timezone')
      .sort(sortStage)
      .limit(50)
      .lean();

    res.json({ success: true, data: tutors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.savePreference = async (req, res) => {
  try {
    const { type, query, filters, sort } = req.body;
    const userModel = req.authRole === 'tutor' ? 'Tutor' : 'Student';
    const pref = await SearchPreference.create({
      userId: req.user.id,
      userModel,
      type,
      query,
      filters,
      sort
    });

    res.status(201).json({ success: true, data: pref });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPreferences = async (req, res) => {
  try {
    const prefs = await SearchPreference.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearPreferences = async (req, res) => {
  try {
    await SearchPreference.deleteMany({ userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const [courses, tutors] = await Promise.all([
      LMSCourse.find({ title: { $regex: q, $options: 'i' }, status: 'published' })
        .select('title')
        .limit(5)
        .lean(),
      Tutor.find({ name: { $regex: q, $options: 'i' }, status: 'approved' })
        .select('name')
        .limit(5)
        .lean()
    ]);

    res.json({ success: true, data: { courses, tutors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
