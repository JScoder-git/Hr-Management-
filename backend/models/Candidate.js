const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add candidate name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add candidate email'],
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
    required: [true, 'Please add position applied for']
  },
  status: {
    type: String,
    enum: ['New', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'New'
  },
  experience: {
    type: String,
    required: [true, 'Please add years of experience']
  },
  resume: {
    type: String,
    required: [true, 'Please upload resume']
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
});

module.exports = mongoose.model('Candidate', CandidateSchema);