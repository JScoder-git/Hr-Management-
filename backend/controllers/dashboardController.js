const Employee = require('../models/Employee');
const Candidate = require('../models/Candidate');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const employeeCount = await Employee.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    
    const pendingLeaveCount = await Leave.countDocuments({ status: 'Pending' });
    const approvedLeaveCount = await Leave.countDocuments({ status: 'Approved' });
    
    // Get today's attendance stats
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const todayAttendance = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    const presentCount = todayAttendance.filter(record => record.status === 'Present').length;
    const absentCount = todayAttendance.filter(record => record.status === 'Absent').length;
    const wfhCount = todayAttendance.filter(record => record.status === 'WFH').length;
    const halfDayCount = todayAttendance.filter(record => record.status === 'Half Day').length;
    
    // Get candidate pipeline stats
    const newCandidates = await Candidate.countDocuments({ status: 'New' });
    const shortlistedCandidates = await Candidate.countDocuments({ status: 'Shortlisted' });
    const interviewCandidates = await Candidate.countDocuments({ status: 'Interview' });
    const selectedCandidates = await Candidate.countDocuments({ status: 'Selected' });
    const rejectedCandidates = await Candidate.countDocuments({ status: 'Rejected' });
    
    // Get department distribution
    const departments = await Employee.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    
    // Get monthly leave distribution (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    const monthlyLeaves = await Leave.aggregate([
      {
        $match: {
          startDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$startDate' },
            month: { $month: '$startDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format monthly leaves data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const leaveChartData = Array(6).fill(0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthLabels = [];
    
    for (let i = 5; i >= 0; i--) {
      let monthIndex = currentMonth - i;
      let year = currentYear;
      
      if (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      monthLabels.unshift(`${months[monthIndex]}`);
      
      const foundData = monthlyLeaves.find(
        item => item._id.month === monthIndex + 1 && item._id.year === year
      );
      
      if (foundData) {
        leaveChartData[5-i] = foundData.count;
      }
    }
    
    // Send response
    res.status(200).json({
      success: true,
      data: {
        counts: {
          employees: employeeCount,
          candidates: candidateCount,
          pendingLeaves: pendingLeaveCount,
          approvedLeaves: approvedLeaveCount
        },
        attendance: {
          present: presentCount,
          absent: absentCount,
          wfh: wfhCount,
          halfDay: halfDayCount
        },
        recruitmentPipeline: {
          new: newCandidates,
          shortlisted: shortlistedCandidates,
          interview: interviewCandidates,
          selected: selectedCandidates,
          rejected: rejectedCandidates
        },
        departments: departments.map(dept => ({
          name: dept._id,
          count: dept.count
        })),
        leavesTrend: {
          labels: monthLabels,
          data: leaveChartData
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    // Get recent candidates (last 5)
    const recentCandidates = await Candidate.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName position status createdAt');
      
    // Get recent leaves (last 5)
    const recentLeaves = await Leave.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employee', 'fullName')
      .select('leaveType startDate endDate status createdAt');
    
    // Format data for frontend
    const candidates = recentCandidates.map(candidate => ({
      id: candidate._id,
      type: 'candidate',
      title: `New candidate: ${candidate.fullName}`,
      subtitle: `Applied for ${candidate.position}`,
      status: candidate.status,
      timestamp: candidate.createdAt
    }));
    
    const leaves = recentLeaves.map(leave => ({
      id: leave._id,
      type: 'leave',
      title: `${leave.leaveType} leave request`,
      subtitle: `By ${leave.employee ? leave.employee.fullName : 'Employee'}`,
      status: leave.status,
      timestamp: leave.createdAt
    }));
    
    // Combine and sort by timestamp
    const activities = [...candidates, ...leaves].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};