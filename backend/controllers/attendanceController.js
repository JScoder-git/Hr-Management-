const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
  try {
    // Get query parameters
    const { date, employee, status } = req.query;

    // Get all employees with more details
    const employees = await Employee.find().select('_id fullName position department profile email phoneNumber');

    // Build query for attendance
    const query = {};

    // Filter by date (to handle date range, we'd need to modify this)
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Filter by employee
    if (employee) {
      query.employee = employee;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Get attendance records
    const attendance = await Attendance.find(query);

    // Create a map of employee IDs to attendance status
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.employee.toString()] = record;
    });

    // Create response data with all employees and their attendance status
    const responseData = employees.map(employee => {
      const attendanceRecord = attendanceMap[employee._id.toString()];
      return {
        _id: employee._id,
        fullName: employee.fullName,
        position: employee.position,
        department: employee.department,
        profile: employee.profile,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        attendance: attendanceRecord ? {
          status: attendanceRecord.status,
          checkIn: attendanceRecord.checkIn,
          checkOut: attendanceRecord.checkOut,
          task: attendanceRecord.task,
          _id: attendanceRecord._id,
          date: attendanceRecord.date
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

// @desc    Get attendance for today
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res) => {
  try {
    // Get today's date range
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Get all employees with more details
    const employees = await Employee.find().select('_id fullName position department profile email phoneNumber');

    // Get today's attendance
    const attendance = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate('employee', 'fullName');

    // Create a map of employee IDs to attendance status
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.employee._id.toString()] = record;
    });

    // Create response data with all employees and their attendance status
    const responseData = employees.map(employee => {
      const attendanceRecord = attendanceMap[employee._id.toString()];
      return {
        _id: employee._id,
        fullName: employee.fullName,
        position: employee.position,
        department: employee.department,
        profile: employee.profile,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        attendance: attendanceRecord ? {
          status: attendanceRecord.status,
          checkIn: attendanceRecord.checkIn,
          checkOut: attendanceRecord.checkOut,
          task: attendanceRecord.task,
          _id: attendanceRecord._id,
          date: attendanceRecord.date
        } : null
      };
    });

    res.status(200).json({
      success: true,
      count: responseData.length,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s attendance',
      error: error.message
    });
  }
};

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Private
exports.createAttendance = async (req, res) => {
  try {
    // Add user to req.body if authenticated
    if (req.user) {
      req.body.createdBy = req.user.id;
    }

    // Check if attendance record already exists for this employee on this date
    const { employee, date } = req.body;

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const existingRecord = await Attendance.findOne({
        employee,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      });

      if (existingRecord) {
        // Update the existing record instead of creating a new one
        const updatedAttendance = await Attendance.findByIdAndUpdate(
          existingRecord._id,
          req.body,
          { new: true, runValidators: true }
        );

        return res.status(200).json({
          success: true,
          data: updatedAttendance,
          message: 'Attendance record updated'
        });
      }
    }

    const attendance = await Attendance.create(req.body);

    res.status(201).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating attendance record',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
exports.updateAttendance = async (req, res) => {
  try {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating attendance record',
      error: error.message
    });
  }
};

// @desc    Assign task to multiple employees
// @route   POST /api/attendance/bulk-task
// @access  Private
exports.assignBulkTask = async (req, res) => {
  try {
    const { task, date, employeeIds } = req.body;

    if (!task) {
      return res.status(400).json({
        success: false,
        message: 'Task description is required'
      });
    }

    // Parse the date or use today's date
    let taskDate;
    if (date) {
      taskDate = new Date(date);
    } else {
      taskDate = new Date();
    }

    // Set time to beginning of day
    taskDate.setHours(0, 0, 0, 0);

    // End of day
    const endDate = new Date(taskDate);
    endDate.setHours(23, 59, 59, 999);

    // If no employee IDs provided, get all employees
    let employees = [];
    if (!employeeIds || employeeIds.length === 0) {
      employees = await Employee.find().select('_id');
      employees = employees.map(emp => emp._id);
    } else {
      employees = employeeIds;
    }

    // Track results
    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      total: employees.length
    };

    // Process each employee
    for (const employeeId of employees) {
      try {
        // Check if attendance record exists
        const existingRecord = await Attendance.findOne({
          employee: employeeId,
          date: {
            $gte: taskDate,
            $lte: endDate
          }
        });

        if (existingRecord) {
          // Update existing record
          await Attendance.findByIdAndUpdate(
            existingRecord._id,
            { task },
            { runValidators: true }
          );
          results.updated++;
        } else {
          // Create new record
          await Attendance.create({
            employee: employeeId,
            date: taskDate,
            status: 'Present', // Default status
            task,
            checkIn: new Date().toLocaleTimeString(),
            createdBy: req.user ? req.user.id : null
          });
          results.created++;
        }
      } catch (err) {
        results.failed++;
        console.error(`Error processing employee ${employeeId}: ${err.message}`);
      }
    }

    res.status(200).json({
      success: true,
      data: results,
      message: `Task assigned to ${results.updated + results.created} employees (${results.updated} updated, ${results.created} created, ${results.failed} failed)`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning bulk task',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private
exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting attendance record',
      error: error.message
    });
  }
};