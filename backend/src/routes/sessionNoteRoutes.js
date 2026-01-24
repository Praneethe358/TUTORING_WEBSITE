const express = require('express');
const router = express.Router();
const SessionNote = require('../models/SessionNote');
const Class = require('../models/Class');
const { protectAny } = require('../middleware/authMiddleware');

// Get notes for a specific class
router.get('/class/:classId', protectAny, async (req, res) => {
  try {
    const classItem = await Class.findById(req.params.classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const userId = req.user._id.toString();
    const isTutor = classItem.tutor.toString() === userId;
    const isStudent = classItem.student.toString() === userId;
    
    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get notes - show private notes only to author
    const notes = await SessionNote.find({
      class: req.params.classId,
      $or: [
        { isPrivate: false },
        { author: req.user._id }
      ]
    })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 });
    
    res.json({ notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a note for a class
router.post('/', protectAny, async (req, res) => {
  try {
    const { classId, content, isPrivate } = req.body;
    
    const classItem = await Class.findById(classId);
    if (!classItem) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    const userId = req.user._id.toString();
    const isTutor = classItem.tutor.toString() === userId;
    const isStudent = classItem.student.toString() === userId;
    
    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const note = await SessionNote.create({
      class: classId,
      author: req.user._id,
      authorModel: isTutor ? 'Tutor' : 'Student',
      content,
      isPrivate: isPrivate || false
    });
    
    await note.populate('author', 'name avatar');
    res.status(201).json({ message: 'Note created', note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a note
router.put('/:id', protectAny, async (req, res) => {
  try {
    const note = await SessionNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { content, isPrivate } = req.body;
    note.content = content || note.content;
    note.isPrivate = isPrivate !== undefined ? isPrivate : note.isPrivate;
    note.updatedAt = Date.now();
    
    await note.save();
    await note.populate('author', 'name avatar');
    
    res.json({ message: 'Note updated', note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a note
router.delete('/:id', protectAny, async (req, res) => {
  try {
    const note = await SessionNote.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (note.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await note.deleteOne();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
