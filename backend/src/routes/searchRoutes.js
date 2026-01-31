const express = require('express');
const { optionalAuth, protectAny } = require('../middleware/authMiddleware');
const searchController = require('../controllers/searchController');

const router = express.Router();

router.get('/courses', optionalAuth, searchController.searchCourses);
router.get('/tutors', optionalAuth, searchController.searchTutors);
router.get('/suggestions', optionalAuth, searchController.getSuggestions);
router.get('/preferences', protectAny, searchController.getPreferences);
router.post('/preferences', protectAny, searchController.savePreference);
router.delete('/preferences', protectAny, searchController.clearPreferences);

module.exports = router;
