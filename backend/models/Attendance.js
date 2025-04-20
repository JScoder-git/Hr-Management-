const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add attendance date'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'WFH'],
    required: [true, 'Please add attendance status']
  },
  checkIn: {
    type: String
  },
  checkOut: {
    type: String
  },
  task: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);