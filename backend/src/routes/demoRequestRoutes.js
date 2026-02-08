const express = require('express');
const router = express.Router();
const { submitDemoRequest } = require('../controllers/demoRequestController');

/**
 * DEMO REQUEST ROUTES (PUBLIC - No Auth Required)
 */

// Submit a demo class request
router.post('/', submitDemoRequest);

module.exports = router;
