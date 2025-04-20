import React from 'react';
import { Routes, Route } from 'react-router-dom';

import CandidateList from '../components/candidates/CandidateList';
import EmployeeList from '../components/employees/EmployeeList';
import AttendanceList from '../components/attendance/AttendanceList';
import EnhancedLeaveList from '../components/leaves/EnhancedLeaveList';

import '../styles/Dashboard.css';

const Dashboard = () => {

  return (
    <div className="dashboard-container">

      <div className="dashboard-content">
        <Routes>


          <Route path="/candidates" element={<CandidateList />} />

          <Route path="/employees" element={<EmployeeList />} />

          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/leaves" element={<EnhancedLeaveList />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;