const path = require('path');
const multer = require('multer');
const fs = require('fs');

const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

createDir(path.join(__dirname, '..', 'uploads'));
createDir(path.join(__dirname, '..', 'uploads', 'candidates'));
createDir(path.join(__dirname, '..', 'uploads', 'leaves'));
createDir(path.join(__dirname, '..', 'uploads', 'profiles'));

const getStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', 'uploads', folder));
    },
    filename: (req, file, cb) => {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, fileName);
    }
  });
};

const candidateStorage = getStorage('candidates');
const leaveStorage = getStorage('leaves');
const profileStorage = getStorage('profiles');

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed!'), false);
  }
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG files are allowed!'), false);
  }
};

const uploadResume = multer({
  storage: candidateStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('resume');

const uploadLeaveAttachment = multer({
  storage: leaveStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: documentFilter
}).single('attachment');

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).single('profile');

const handleUpload = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

exports.uploadResume = handleUpload(uploadResume);
exports.uploadLeaveAttachment = handleUpload(uploadLeaveAttachment);
exports.uploadProfile = handleUpload(uploadProfile);