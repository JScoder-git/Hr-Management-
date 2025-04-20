const express = require('express');
const path = require('path');
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  getUserLeaves
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { uploadLeaveAttachment } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getLeaves)
  .post(protect, uploadLeaveAttachment, createLeave);

router
  .route('/:id')
  .get(protect, getLeave)
  .put(protect, updateLeave)
  .delete(protect, deleteLeave);

router.put('/:id/approve', protect, approveLeave);
router.put('/:id/reject', protect, rejectLeave);
router.get('/me', protect, getUserLeaves);

router.get('/documents/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', 'uploads', 'leaves', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
  });
});

module.exports = router;