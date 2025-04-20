const Candidate = require('../models/Candidate');
const fs = require('fs');
const path = require('path');

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message
    });
  }
};

exports.getCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate',
      error: error.message
    });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    // Add user to req.body if authenticated
    if (req.user) {
      req.body.user = req.user.id;
    }

    // Add resume path if file was uploaded
    if (req.file) {
      req.body.resume = `uploads/resumes/${req.file.filename}`;
    }

    const candidate = await Candidate.create(req.body);

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating candidate',
      error: error.message
    });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Add resume path if file was uploaded
    if (req.file) {
      // Delete old resume if exists
      if (candidate.resume) {
        const oldResumePath = path.join(__dirname, '..', candidate.resume);
        if (fs.existsSync(oldResumePath)) {
          fs.unlinkSync(oldResumePath);
        }
      }
      req.body.resume = `uploads/resumes/${req.file.filename}`;
    }

    candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating candidate',
      error: error.message
    });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Delete resume file if exists
    if (candidate.resume) {
      const resumePath = path.join(__dirname, '..', candidate.resume);
      if (fs.existsSync(resumePath)) {
        fs.unlinkSync(resumePath);
      }
    }

    await candidate.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting candidate',
      error: error.message
    });
  }
};

exports.downloadResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    if (!candidate.resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const resumePath = path.join(__dirname, '..', candidate.resume);

    if (!fs.existsSync(resumePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found'
      });
    }

    res.download(resumePath);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error downloading resume',
      error: error.message
    });
  }
};

exports.convertToEmployee = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Create employee data from candidate
    const employeeData = {
      fullName: candidate.fullName,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      position: candidate.position,
      department: req.body.department,
      dateOfJoining: req.body.dateOfJoining,
      user: req.user.id
    };

    // This will be handled in the frontend by creating an employee
    res.status(200).json({
      success: true,
      data: employeeData
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error converting candidate to employee',
      error: error.message
    });
  }
};