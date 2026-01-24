const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');

/**
 * MATERIAL CONTROLLER
 * Handles file uploads and material management
 */

// Upload material
exports.uploadMaterial = async (req, res) => {
  try {
    const { title, description, category, visibility } = req.body;
    const tutor = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const material = await Material.create({
      tutor,
      title,
      description,
      category: category || 'Other',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      visibility: visibility || 'public'
    });

    await material.populate('tutor', 'name email');

    res.json({ message: 'File uploaded successfully', material });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Get materials uploaded by tutor
exports.getTutorMaterials = async (req, res) => {
  try {
    const tutor = req.user.id;

    const materials = await Material.find({ tutor, isActive: true })
      .populate('tutor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get materials for students (public + shared)
exports.getStudentMaterials = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const studentId = req.user.id;

    const materials = await Material.find({
      tutor: tutorId,
      isActive: true,
      $or: [
        { visibility: 'public' },
        { 'sharedWith.student': studentId }
      ]
    })
      .populate('tutor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all available materials for student
exports.getAllAvailableMaterials = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all public materials + materials shared with student
    const materials = await Material.find({
      isActive: true,
      $or: [
        { visibility: 'public' },
        { 'sharedWith.student': studentId }
      ]
    })
      .populate('tutor', 'name email')
      .sort({ createdAt: -1 });

    res.json({ materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download material
exports.downloadMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user.id;

    const material = await Material.findById(materialId);

    if (!material || !material.isActive) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Check access
    const hasAccess =
      material.visibility === 'public' ||
      material.sharedWith.some(s => s.student.toString() === studentId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Record download
    await Material.updateOne(
      { _id: materialId },
      {
        $push: {
          downloads: {
            student: studentId,
            downloadedAt: new Date()
          }
        }
      }
    );

    // Send file
    res.download(material.filePath, material.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete material
exports.deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const tutor = req.user.id;

    const material = await Material.findOneAndUpdate(
      { _id: materialId, tutor },
      { isActive: false },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // Optionally delete file
    try {
      if (fs.existsSync(material.filePath)) {
        fs.unlinkSync(material.filePath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }

    res.json({ message: 'Material deleted', material });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share material with student
exports.shareMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { studentId, access } = req.body;
    const tutor = req.user.id;

    const material = await Material.findOneAndUpdate(
      { _id: materialId, tutor },
      {
        $addToSet: {
          sharedWith: {
            student: studentId,
            access: access || 'view'
          }
        }
      },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ message: 'Material shared', material });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
