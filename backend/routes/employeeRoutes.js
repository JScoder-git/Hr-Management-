const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

const router = express.Router();

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, uploadProfile, createEmployee);

router
  .route('/:id')
  .get(protect, getEmployee)
  .put(protect, uploadProfile, updateEmployee)
  .delete(protect, deleteEmployee);

module.exports = router;