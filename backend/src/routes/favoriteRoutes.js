const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const { protectStudent } = require('../middleware/authMiddleware');

// Get student's favorite tutors
router.get('/', protectStudent, async (req, res) => {
  try {
    const favorites = await Favorite.find({ student: req.user._id })
      .populate('tutor', 'name email subjects experienceYears avatar qualifications')
      .sort({ createdAt: -1 });
    res.json({ favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add tutor to favorites
router.post('/', protectStudent, async (req, res) => {
  try {
    const { tutorId } = req.body;
    
    // Check if already favorited
    const existing = await Favorite.findOne({ student: req.user._id, tutor: tutorId });
    if (existing) {
      return res.status(400).json({ message: 'Tutor already in favorites' });
    }
    
    const favorite = await Favorite.create({
      student: req.user._id,
      tutor: tutorId
    });
    
    await favorite.populate('tutor', 'name email subjects experienceYears avatar');
    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove tutor from favorites
router.delete('/:tutorId', protectStudent, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ 
      student: req.user._id, 
      tutor: req.params.tutorId 
    });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if tutor is favorited
router.get('/check/:tutorId', protectStudent, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ 
      student: req.user._id, 
      tutor: req.params.tutorId 
    });
    res.json({ isFavorited: !!favorite });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
