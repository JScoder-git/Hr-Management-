const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add employee name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add employee email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add phone number']
  },
  position: {
    type: String,
    required: [true, 'Please add position']
  },
  department: {
    type: String,
    required: [true, 'Please add department']
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Please add joining date']
  },
  salary: {
    type: Number,
    required: [true, 'Please add salary']
  },
  profile: {
    type: String,
    default: 'default-avatar.jpg'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Employee', EmployeeSchema);