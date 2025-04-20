const express = require('express');
const {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  downloadResume,
  convertToEmployee
} = require('../controllers/candidateController');
const { protect } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getCandidates)
  .post(protect, uploadResume, createCandidate);

router
  .route('/:id')
  .get(protect, getCandidate)
  .put(protect, uploadResume, updateCandidate)
  .delete(protect, deleteCandidate);

router.get('/:id/resume', protect, downloadResume);
router.post('/:id/convert', protect, convertToEmployee);

module.exports = router;
