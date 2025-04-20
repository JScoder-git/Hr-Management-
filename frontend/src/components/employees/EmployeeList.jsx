import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../../styles/EmployeeList.css';
import { MoreVertical, Search } from 'lucide-react';
import EmployeeEditModal from './EmployeeEditModal';
import { getApiUrl } from '../../utils/api';
import defaultAvatar from './empicon/1.jpg'; // Import the default avatar image

// Helper function to format phone numbers
const formatPhoneNumber = (phoneNumberString) => {
  // Strip all non-numeric characters
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  
  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  
  // Return the original if it doesn't match the pattern
  return phoneNumberString;
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positionFilter, setPositionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const actionMenuRef = useRef(null);
  const menuButtonRefs = useRef({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(getApiUrl('api/employees'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const employeesData = response.data.data;
        setEmployees(employeesData);

        // Extract unique positions from employees
        const positions = [...new Set(employeesData.map(employee => employee.position))];
        setAvailablePositions(positions);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching employees');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(employees.filter((emp) => emp._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting employee');
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuOpen) {
        // Check if the click is outside the action menu and not on the button that opened it
        const activeButtonRef = menuButtonRefs.current[actionMenuOpen];
        const clickedOnButton = activeButtonRef && activeButtonRef.contains(event.target);
        
        if (!clickedOnButton && 
            actionMenuRef.current && 
            !actionMenuRef.current.contains(event.target)) {
          setActionMenuOpen(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

  const toggleActionMenu = (id, e) => {
    e.stopPropagation();
    // Toggle the menu - close if already open, open if closed
    setActionMenuOpen(prevState => prevState === id ? null : id);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
    setActionMenuOpen(null);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditSuccess = () => {
    // Refresh the employee list after successful edit
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(getApiUrl('api/employees'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const employeesData = response.data.data;
        setEmployees(employeesData);

        // Extract unique positions from employees
        const positions = [...new Set(employeesData.map(employee => employee.position))];
        setAvailablePositions(positions);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching employees');
      }
    };
    fetchEmployees();
  };

  const filteredEmployees = employees
    .filter(emp =>
      (positionFilter ? emp.position === positionFilter : true) &&
      (searchQuery ? emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );

  if (loading) return <div className="loading">Loading employees...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="employee-list-wrapper">
      <div className="employee-list-controls">
        <div className="filter-dropdown">
          <select
            className={`filter-button ${positionFilter ? 'filter-button-active' : ''}`}
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
          >
            <option value="">Position</option>
            {availablePositions.map(position => (
              <option key={position} value={position}>{position}</option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="employee-table-container">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Profile</th>
              <th>Employee Name</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>Position</th>
              <th>Department</th>
              <th>Date of Joining</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp._id}>
                <td>
                  <div className="employee-avatar">
                    <img
                      src={emp.profile ? `https://cdn-icons-png.flaticon.com/512/6188/6188625.png` : defaultAvatar}
                      alt={emp.fullName}
                    />
                  </div>
                </td>
                <td>{emp.fullName}</td>
                <td>{emp.email}</td>
                <td>{formatPhoneNumber(emp.phoneNumber)}</td>
                <td>{emp.position}</td>
                <td>{emp.department}</td>
                <td>{new Date(emp.dateOfJoining).toLocaleDateString()}</td>
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
                        <button onClick={() => handleEditEmployee(emp)} className="menu-item">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(emp._id)} className="menu-item">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEmployees.length === 0 && (
          <div className="no-employees">No employees found.</div>
        )}
      </div>

      {/* Employee Edit Modal */}
      <EmployeeEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        employee={selectedEmployee}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default EmployeeList;