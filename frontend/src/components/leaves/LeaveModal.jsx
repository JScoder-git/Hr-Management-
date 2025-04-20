import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Calendar, Upload } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/LeaveModal.css';
import { getApiUrl } from '../../utils/api';

const LeaveModal = ({ isOpen, onClose, onSuccess }) => {
  // Using AuthContext is available but we're using localStorage for token
  useContext(AuthContext);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    employeeData: null, // Store the complete employee object
    designation: '',
    leaveDate: '',
    reason: '',
    document: null,
    leaveType: 'Annual' // Default leave type
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch employees when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/employees'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Employees fetched:', response.data);
      if (response.data && response.data.data) {
        setEmployees(response.data.data);
      } else {
        console.error('Invalid employee data format:', response.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Filter employees when typing in the search field
    if (name === 'employeeName') {
      if (value.trim() === '') {
        setFilteredEmployees([]);
        setShowSuggestions(false);
      } else {
        // Make sure employees is an array before filtering
        if (Array.isArray(employees)) {
          const filtered = employees.filter(emp =>
            emp.fullName && emp.fullName.toLowerCase().includes(value.toLowerCase())
          );
          console.log('Filtered employees:', filtered);
          setFilteredEmployees(filtered);
          setShowSuggestions(true);
        } else {
          console.error('Employees is not an array:', employees);
          setFilteredEmployees([]);
          setShowSuggestions(false);
        }
      }
    }
  };

  const handleSelectEmployee = (employee) => {
    console.log('Selected employee:', employee);

    // Store the entire employee object for reference
    const employeeData = {
      _id: employee._id,
      fullName: employee.fullName,
      position: employee.position || ''
    };

    console.log('Employee data to store:', employeeData);

    setFormData({
      ...formData,
      employeeName: employee.fullName,
      employeeId: employee._id, // Store the raw ID
      employeeData: employeeData, // Store the whole object
      designation: employee.position || ''
    });
    setShowSuggestions(false);
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      document: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form data
    if (!formData.employeeId) {
      setError('Please select an employee from the suggestions');
      setLoading(false);
      return;
    }

    if (!formData.leaveDate) {
      setError('Please select a leave date');
      setLoading(false);
      return;
    }

    if (!formData.reason) {
      setError('Please provide a reason for the leave');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Submitting leave request with data:', {
        employeeId: formData.employeeId,
        leaveDate: formData.leaveDate,
        reason: formData.reason
      });

      // Format the date properly for the backend
      const formattedDate = new Date(formData.leaveDate).toISOString();

      // Create request data
      const requestData = {
        leaveType: formData.leaveType || 'Annual',
        startDate: formattedDate,
        endDate: formattedDate, // Same as start date for single day
        reason: formData.reason,
        totalDays: 1, // Single day leave
      };

      // Use the stored employee data if available
      if (formData.employeeData && formData.employeeData._id) {
        console.log('Using stored employee data:', formData.employeeData);
        requestData.employee = formData.employeeData._id;
      } else if (formData.employeeId) {
        console.log('Using employee ID:', formData.employeeId);
        requestData.employee = formData.employeeId;
      } else {
        console.error('No employee data available');
        setError('Please select an employee from the suggestions');
        setLoading(false);
        return;
      }

      // Make sure employee ID is a string
      if (typeof requestData.employee !== 'string') {
        console.log('Converting employee ID to string:', requestData.employee);
        requestData.employee = String(requestData.employee);
      }

      console.log('Final employee ID format:', requestData.employee);

      // Get the current user's role from localStorage if available
      const currentUserData = localStorage.getItem('user');
      let userRole = 'user';
      try {
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          userRole = userData.role || 'user';
          console.log('Current user role:', userRole);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }

      // Log the data being sent
      console.log('Request data being sent:', requestData);

      // Use JSON request
      let response;
      try {
        console.log('Sending leave request with JSON');
        console.log('Final request data:', JSON.stringify(requestData));
        response = await axios.post(getApiUrl('api/leaves'), requestData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Leave request successful');
      } catch (error) {
        console.error('Leave request failed:', error);

        // Check if the error is related to the employee ID
        if (error.response && error.response.data &&
            (error.response.data.message.includes('employee') ||
             error.response.data.message.includes('Employee'))) {

          console.error('Employee ID error detected, trying to fix...');

          // Try to fix the employee ID format
          try {
            console.log('Trying to fetch employee with ID:', formData.employeeId);
            // Try to fetch the employee again to get a valid ID
            const employeeResponse = await axios.get(getApiUrl(`api/employees/${formData.employeeId}`), {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Employee response:', employeeResponse.data);

            if (employeeResponse.data && employeeResponse.data.data && employeeResponse.data.data._id) {
              console.log('Got valid employee ID:', employeeResponse.data.data._id);
              requestData.employee = employeeResponse.data.data._id;

              // Try the request again with the fixed ID
              response = await axios.post(getApiUrl('api/leaves'), requestData, {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('Leave request successful after fixing employee ID');
            } else {
              throw new Error('Could not get valid employee ID');
            }
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            throw error; // Throw the original error
          }
        } else {
          throw error; // Re-throw the error if it's not related to employee ID
        }
      }

      console.log('Leave created successfully:', response.data);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating leave:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        console.error('Error headers:', err.response.headers);
        setError(err.response.data.message || 'Error submitting leave request');
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('Network error. Please check your connection.');
      } else {
        console.error('Error message:', err.message);
        setError('An unexpected error occurred.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="leave-modal-overlay">
      <div className="leave-modal">
        <div className="leave-modal-header">
          <h2>Add New Leave</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="leave-modal-content">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="employeeName"
                    name="employeeName"
                    placeholder="Search Employee Name"
                    value={formData.employeeName}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    required
                    className="search-input"
                    ref={searchInputRef}
                  />
                  <span className="search-icon"></span>

                  {showSuggestions && (
                    <div className="employee-suggestions" ref={suggestionRef}>
                      {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                          <div
                            key={employee._id}
                            className="suggestion-item"
                            onClick={() => handleSelectEmployee(employee)}
                          >
                            <div className="suggestion-name">{employee.fullName}</div>
                            <div className="suggestion-position">{employee.position || 'Employee'}</div>
                          </div>
                        ))
                      ) : (
                        <div className="suggestion-item no-results">No employees found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="Designation*"
                  value={formData.designation}
                  readOnly
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="date"
                    id="leaveDate"
                    name="leaveDate"
                    placeholder="Leave Date*"
                    value={formData.leaveDate}
                    onChange={handleChange}
                    required
                    className="date-input"
                  />
                  <Calendar size={18} className="calendar-icon" onClick={() => document.getElementById('leaveDate').showPicker()} />
                </div>
              </div>

              <div className="form-group">
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="documents"
                    name="documents"
                    placeholder="Documents"
                    readOnly
                    value={formData.document ? formData.document.name : ''}
                    onClick={() => document.getElementById('file-upload').click()}
                  />
                  <Upload size={18} className="upload-icon" />
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                id="reason"
                name="reason"
                placeholder="Reason*"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;
