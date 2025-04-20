const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  getProfilePicture
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, uploadProfile, updateProfile);
router.put('/password', protect, changePassword);
router.get('/picture/:filename', getProfilePicture);

module.exports = router;