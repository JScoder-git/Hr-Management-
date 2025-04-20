const multer = require('multer');

// Use memory storage instead of disk storage for Vercel
const storage = multer.memoryStorage();

// Document filter
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed!'), false);
  }
};

// Image filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG files are allowed!'), false);
  }
};

// Create multer instances with memory storage
const uploadResume = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('resume');

const uploadLeaveAttachment = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('attachment');

const uploadProfile = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('profile');

// Handle upload middleware
const handleUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // For Vercel, we'll just pass the file in memory
    // The actual controllers will need to be modified to handle this
    next();
  });
};

exports.uploadResume = handleUpload(uploadResume);
exports.uploadLeaveAttachment = handleUpload(uploadLeaveAttachment);
exports.uploadProfile = handleUpload(uploadProfile);
