import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, RefreshCw } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/AttendanceList.css';
import { getApiUrl } from '../../utils/api';

const AttendanceList = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [taskInputOpen, setTaskInputOpen] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const actionMenuRef = useRef(null);
  const menuButtonRefs = useRef({});

  // Fetch employees and attendance data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Authentication token is missing. Please log in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch employees
        const employeesResponse = await axios.get(getApiUrl('api/employees'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Fetch attendance for the selected date
        const attendanceResponse = await axios.get(getApiUrl(`api/attendance?date=${selectedDate}`), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const employeesData = employeesResponse.data.data || [];
        const attendanceData = attendanceResponse.data.data || [];

        // Create a map of employee IDs to their attendance records
        const attendanceMap = {};
        attendanceData.forEach(record => {
          if (record.attendance) {
            attendanceMap[record._id] = record.attendance;
          }
        });

        // Initialize employees with default status of 'Absent' unless they have an attendance record
        const employeesWithAttendance = employeesData.map(emp => {
          const attendance = attendanceMap[emp._id];
          return {
            ...emp,
            status: attendance ? attendance.status : 'Absent',
            task: attendance ? attendance.task : '',
            attendanceId: attendance ? attendance._id : null
          };
        });

        setEmployees(employeesWithAttendance);
        setFilteredEmployees(employeesWithAttendance);
        setError(null);

      } catch (error) {
        console.error('Error fetching data:', error);

        if (error.response) {
          if (error.response.status === 401) {
            setError('Your session has expired. Please log in again.');
            setTimeout(() => {
              logout();
              navigate('/login');
            }, 3000);
          } else {
            setError(`Server error: ${error.response.data.message || error.message}`);
          }
        } else if (error.request) {
          setError('No response from server. Please check your connection.');
        } else {
          setError(`Error: ${error.message}`);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();
  }, [token, logout, navigate, selectedDate, refreshing]);

  // Filter employees based on search and status filter
  useEffect(() => {
    let result = [...employees];

    if (statusFilter) {
      result = result.filter(emp => emp.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(emp =>
        emp.fullName.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        (emp.task && emp.task.toLowerCase().includes(query))
      );
    }

    setFilteredEmployees(result);
  }, [employees, statusFilter, searchQuery]);

  // Handle status change and save to backend
  const handleStatusChange = async (empId, newStatus) => {
    try {
      const employee = employees.find(emp => emp._id === empId);
      if (!employee) return;

      // Only save to backend if status is not 'Absent' or if there's a task
      if (newStatus !== 'Absent' || (employee.task && employee.task.trim() !== '')) {
        const attendanceData = {
          employee: empId,
          date: selectedDate,
          status: newStatus,
          task: employee.task || ''
        };

        // If we already have an attendance record, update it
        if (employee.attendanceId) {
          await axios.put(getApiUrl(`api/attendance/${employee.attendanceId}`), attendanceData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          // Otherwise create a new record
          await axios.post(getApiUrl('api/attendance'), attendanceData, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
      } else if (employee.attendanceId) {
        // If status is 'Absent' and there's no task but we have an attendance record, delete it
        await axios.delete(getApiUrl(`api/attendance/${employee.attendanceId}`), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Update local state
      const updatedEmployees = employees.map(emp =>
        emp._id === empId ? { ...emp, status: newStatus } : emp
      );
      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);

      // Refresh data to get updated attendance IDs
      setRefreshing(true);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update attendance status. Please try again.');
    }
  };

  // Handle adding task and save to backend
  const handleAddTask = async (empId) => {
    if (!newTask.trim()) return;

    try {
      const employee = employees.find(emp => emp._id === empId);
      if (!employee) return;

      // Prepare attendance data
      const attendanceData = {
        employee: empId,
        date: selectedDate,
        status: employee.status === 'Absent' ? 'Present' : employee.status, // Change to Present if currently Absent
        task: newTask
      };

      // If we already have an attendance record, update it
      if (employee.attendanceId) {
        await axios.put(getApiUrl(`api/attendance/${employee.attendanceId}`), attendanceData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        // Otherwise create a new record
        await axios.post(getApiUrl('api/attendance'), attendanceData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      // Update local state
      const updatedEmployees = employees.map(emp =>
        emp._id === empId ? {
          ...emp,
          task: newTask,
          status: emp.status === 'Absent' ? 'Present' : emp.status // Change to Present if currently Absent
        } : emp
      );

      setEmployees(updatedEmployees);
      setFilteredEmployees(updatedEmployees);
      setNewTask('');
      setTaskInputOpen(null);

      // Refresh data to get updated attendance IDs
      setRefreshing(true);
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to save task. Please try again.');
    }
  };

  // Toggle action menu
  const toggleActionMenu = (empId, e) => {
    e.stopPropagation();
    setActionMenuOpen(prevId => prevId === empId ? null : empId);
  };

  // Handle outside clicks to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target) &&
        !Object.values(menuButtonRefs.current).some(ref => ref && ref.contains(event.target))
      ) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="attendance-list-wrapper">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="attendance-list-controls">
        <div className="filter-group">
          <div className="date-filter">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              aria-label="Select date"
            />
          </div>

          <div className="filter-dropdown">
            <select
              className="filter-button"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="WFH">WFH</option>
            </select>
          </div>


        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search employee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Task</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp._id}>
                <td>{emp.fullName}</td>
                <td>{emp.position}</td>
                <td>{emp.department}</td>
                <td>
                  {taskInputOpen === emp._id ? (
                    <div className="task-input-container">
                      <input
                        type="text"
                        className="task-input"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        placeholder="Enter task..."
                      />
                      <button className="save-task-btn" onClick={() => handleAddTask(emp._id)}>
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="task-display"
                      onClick={() => {
                        setTaskInputOpen(emp._id);
                        setNewTask(emp.task || '');
                      }}
                    >
                      {emp.task || '--'}
                    </div>
                  )}
                </td>
                <td>
                  <div className="status-dropdown-container">
                    <select
                      className={`status-dropdown ${emp.status.toLowerCase().replace(' ', '-')}`}
                      value={emp.status}
                      onChange={(e) => handleStatusChange(emp._id, e.target.value)}
                    >
                      <option value="Absent">Absent</option>
                      <option value="Present">Present</option>
                      <option value="Half Day">Half Day</option>
                      <option value="WFH">WFH</option>
                    </select>
                  </div>
                </td>
                <td className="action-cell">
                  <div className="action-wrapper">
                    <button
                      className="action-button"
                      onClick={(e) => toggleActionMenu(emp._id, e)}
                      ref={el => menuButtonRefs.current[emp._id] = el}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {actionMenuOpen === emp._id && (
                      <div className="action-menu" ref={actionMenuRef}>
                        <button
                          onClick={() => {
                            setTaskInputOpen(emp._id);
                            setNewTask(emp.task || '');
                          }}
                          className="menu-item"
                        >
                          {emp.task ? 'Edit Task' : 'Add Task'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(
                            emp._id,
                            emp.status === 'Present' ? 'Absent' : 'Present'
                          )}
                          className="menu-item"
                        >
                          Mark as {emp.status === 'Present' ? 'Absent' : 'Present'}
                        </button>
                        <button
                          onClick={() => handleStatusChange(emp._id, 'Half Day')}
                          className="menu-item"
                        >
                          Mark as Half Day
                        </button>
                        <button
                          onClick={() => handleStatusChange(emp._id, 'WFH')}
                          className="menu-item"
                        >
                          Mark as WFH
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="loading">Loading employees...</div>
        )}

        {!loading && !error && filteredEmployees.length === 0 && (
          <div className="no-employees">No employees found.</div>
        )}
      </div>
    </div>
  );
};

export default AttendanceList;