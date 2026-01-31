const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads/submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `submission-${uniqueSuffix}${ext}`);
  }
});

// File filter for common document and image types (strict)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-zip-compressed'
  ];

  const allowedExtensions = /\.(pdf|doc|docx|ppt|pptx|txt|jpg|jpeg|png|gif|zip)$/i;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

  if (allowedMimes.includes(file.mimetype) && extname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, Word, PPT, TXT, Images, ZIP'));
  }
};

// Multer upload configuration
const uploadSubmission = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

module.exports = { uploadSubmission, uploadDir };
