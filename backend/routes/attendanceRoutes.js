const express = require('express');
const {
  getAttendance,
  getTodayAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  assignBulkTask
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getAttendance)
  .post(protect, createAttendance);

router.get('/today', protect, getTodayAttendance);
router.post('/bulk-task', protect, assignBulkTask);

router
  .route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance);

module.exports = router;