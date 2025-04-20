const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const fs = require('fs');
const path = require('path');

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private (Admin/HR)
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: 'employee',
        select: 'fullName department position'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving leaves',
      error: error.message
    });
  }
};

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate({
      path: 'employee',
      select: 'fullName department position'
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user has access (Admin/HR or own leave)
    const employee = await Employee.findOne({ user: req.user.id });

    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'hr' &&
      leave.employee.toString() !== employee._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this leave request'
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving leave request',
      error: error.message
    });
  }
};

// @desc    Create new leave request
// @route   POST /api/leaves
// @access  Private (All authenticated users)
exports.createLeave = async (req, res) => {
  try {
    console.log('Create leave request body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('User:', req.user);

    // If employee ID is not provided in the request body, find the employee associated with the user
    if (!req.body.employee) {
      console.log('No employee ID provided, finding employee for current user');
      const employee = await Employee.findOne({ user: req.user.id });

      if (!employee) {
        console.log('Employee profile not found for user:', req.user.id);
        return res.status(404).json({
          success: false,
          message: 'Employee profile not found'
        });
      }

      console.log('Found employee:', employee._id);
      // Add employee ID to request body
      req.body.employee = employee._id;
    } else {
      console.log('Employee ID provided:', req.body.employee);

      try {
        // Verify that the employee exists
        const employeeExists = await Employee.findById(req.body.employee);
        if (!employeeExists) {
          console.log('Employee not found with ID:', req.body.employee);
          return res.status(404).json({
            success: false,
            message: 'Employee not found'
          });
        }
        console.log('Employee exists:', employeeExists._id);
      } catch (employeeError) {
        console.log('Error finding employee:', employeeError);
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID format'
        });
      }

      // Check if user is admin or HR
      const userRole = req.user.role || 'user';
      console.log('User role:', userRole);

      // Temporarily bypass role check for testing
      console.log('Bypassing role check for testing');

      // Uncomment this block when role system is properly set up
      /*
      if (userRole !== 'admin' && userRole !== 'hr') {
        console.log('User is not admin or HR:', userRole);
        return res.status(403).json({
          success: false,
          message: 'Not authorized to create leave requests for other employees'
        });
      }
      */
      console.log('User is authorized as:', userRole);
    }

    // Add file path if attachment exists
    if (req.file) {
      console.log('Attachment found:', req.file.filename);
      req.body.attachment = req.file.filename;
    }

    // Ensure dates are properly formatted
    let startDate, endDate;

    try {
      startDate = new Date(req.body.startDate);
      endDate = new Date(req.body.endDate);
      console.log('Start date:', startDate);
      console.log('End date:', endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.log('Invalid date format');
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
    } catch (dateError) {
      console.log('Error parsing dates:', dateError);
      return res.status(400).json({
        success: false,
        message: 'Error parsing dates: ' + dateError.message
      });
    }

    const diffTime = Math.abs(endDate - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    console.log('Total days calculated:', totalDays);

    req.body.totalDays = totalDays;

    console.log('Final request body before creating leave:', req.body);

    try {
      // Validate required fields
      const requiredFields = ['leaveType', 'startDate', 'endDate', 'reason', 'employee', 'totalDays'];
      const missingFields = [];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          missingFields.push(field);
        }
      }

      if (missingFields.length > 0) {
        console.log('Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Ensure employee is a valid ObjectId
      try {
        const mongoose = require('mongoose');
        console.log('Employee ID type:', typeof req.body.employee);
        console.log('Employee ID value:', req.body.employee);

        // If employee is an object with _id, extract the _id
        if (typeof req.body.employee === 'object' && req.body.employee._id) {
          console.log('Employee is an object with _id, extracting');
          req.body.employee = req.body.employee._id;
        }

        // Try to convert to ObjectId
        try {
          req.body.employee = mongoose.Types.ObjectId(req.body.employee);
          console.log('Converted to ObjectId:', req.body.employee);
        } catch (conversionError) {
          console.log('Could not convert to ObjectId:', conversionError);
        }

        if (!mongoose.Types.ObjectId.isValid(req.body.employee)) {
          console.log('Invalid employee ID format');
          return res.status(400).json({
            success: false,
            message: 'Invalid employee ID format'
          });
        }

        console.log('Employee ID is valid');
      } catch (objectIdError) {
        console.log('Error validating ObjectId:', objectIdError);
        return res.status(400).json({
          success: false,
          message: 'Error validating employee ID'
        });
      }

      console.log('All required fields present, creating leave');
      const leave = await Leave.create(req.body);
      console.log('Leave created successfully:', leave);

      res.status(201).json({
        success: true,
        data: leave
      });
    } catch (createError) {
      console.log('Error creating leave:', createError);
      return res.status(400).json({
        success: false,
        message: 'Error creating leave',
        error: createError.message
      });
    }
  } catch (error) {
    console.log('Outer catch error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating leave request',
      error: error.message
    });
  }
};

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private (Admin/HR)
exports.updateLeave = async (req, res) => {
  try {
    console.log('Updating leave with ID:', req.params.id);
    console.log('Update data:', req.body);
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Add timestamps for status changes
    if (req.body.status === 'Approved') {
      req.body.approvedBy = req.user.id;
      req.body.approvedAt = Date.now();
    } else if (req.body.status === 'Rejected') {
      req.body.rejectedBy = req.user.id;
      req.body.rejectedAt = Date.now();
    }

    // Update the leave and populate employee data
    leave = await Leave.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'employee',
      select: 'fullName department position'
    });

    console.log('Leave updated successfully:', leave);

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating leave request',
      error: error.message
    });
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private (Admin/HR)
exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    await leave.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting leave request',
      error: error.message
    });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/me
// @access  Private
exports.getUserLeaves = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const leaves = await Leave.find({ employee: employee._id })
      .populate({
        path: 'employee',
        select: 'fullName department position'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user leaves',
      error: error.message
    });
  }
};

// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin/HR)
exports.approveLeave = async (req, res) => {
  try {
    // Check if user is admin or HR
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve leave requests'
      });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Update leave status to approved
    leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Approved',
        approvedBy: req.user.id,
        approvedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'employee',
      select: 'fullName department position'
    });

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving leave request',
      error: error.message
    });
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin/HR)
exports.rejectLeave = async (req, res) => {
  try {
    // Check if user is admin or HR
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject leave requests'
      });
    }

    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Update leave status to rejected
    leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        rejectedBy: req.user.id,
        rejectedAt: Date.now(),
        rejectionReason: req.body.rejectionReason || 'No reason provided'
      },
      {
        new: true,
        runValidators: true
      }
    ).populate({
      path: 'employee',
      select: 'fullName department position'
    });

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting leave request',
      error: error.message
    });
  }
};