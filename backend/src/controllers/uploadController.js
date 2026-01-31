const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const path = require('path');
const fs = require('fs');

// Upload profile photo for student
exports.uploadStudentPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete old photo if exists
    if (student.avatar) {
      const oldPhotoPath = path.join(__dirname, '../../uploads/profiles', path.basename(student.avatar));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo path (relative URL)
    student.avatar = `/uploads/profiles/${req.file.filename}`;
    await student.save();

    res.json({
      message: 'Profile photo uploaded successfully',
      avatar: student.avatar
    });
  } catch (error) {
    console.error('Error uploading student photo:', error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
};

// Upload profile photo for tutor
exports.uploadTutorPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const tutor = await Tutor.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    // Delete old photo if exists
    if (tutor.avatar) {
      const oldPhotoPath = path.join(__dirname, '../../uploads/profiles', path.basename(tutor.avatar));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Save new photo path (relative URL)
    tutor.avatar = `/uploads/profiles/${req.file.filename}`;
    await tutor.save();

    res.json({
      message: 'Profile photo uploaded successfully',
      avatar: tutor.avatar
    });
  } catch (error) {
    console.error('Error uploading tutor photo:', error);
    res.status(500).json({ message: 'Error uploading photo', error: error.message });
  }
};

// Delete student profile photo
exports.deleteStudentPhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.avatar) {
      const photoPath = path.join(__dirname, '../../uploads/profiles', path.basename(student.avatar));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      student.avatar = '';
      await student.save();
    }

    res.json({ message: 'Profile photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting student photo:', error);
    res.status(500).json({ message: 'Error deleting photo', error: error.message });
  }
};

// Delete tutor profile photo
exports.deleteTutorPhoto = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.user._id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }

    if (tutor.avatar) {
      const photoPath = path.join(__dirname, '../../uploads/profiles', path.basename(tutor.avatar));
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      tutor.avatar = '';
      await tutor.save();
    }

    res.json({ message: 'Profile photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting tutor photo:', error);
    res.status(500).json({ message: 'Error deleting photo', error: error.message });
  }
};
