import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Calendar, ChevronDown } from 'lucide-react';
import '../../styles/EmployeeEditModal.css';

const EmployeeEditModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    position: 'Intern',
    department: '',
    dateOfJoining: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [positions] = useState(['Intern', 'Full Time', 'Junior', 'Senior', 'Team Lead']);
  const positionDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    if (employee) {
      // Format date to YYYY-MM-DD for input field
      const formattedDate = employee.dateOfJoining
        ? new Date(employee.dateOfJoining).toISOString().split('T')[0]
        : '';

      setFormData({
        fullName: employee.fullName || '',
        email: employee.email || '',
        phoneNumber: employee.phoneNumber || '',
        position: employee.position || 'Intern',
        department: employee.department || '',
        dateOfJoining: formattedDate,
      });
    }
  }, [employee]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (positionDropdownRef.current && !positionDropdownRef.current.contains(event.target)) {
        setShowPositionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const selectPosition = (position) => {
    setFormData({
      ...formData,
      position,
    });
    setShowPositionDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phoneNumber ||
        !formData.position || !formData.department || !formData.dateOfJoining) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      await axios.put(`http://localhost:5000/api/employees/${employee._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating employee');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="employee-edit-modal">
        <div className="modal-header">
          <h2>Edit Employee Details</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name*</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number*</label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department*</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position*</label>
              <div className="position-input-container">
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  readOnly
                  onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                />
                <span className="dropdown-arrow" onClick={() => setShowPositionDropdown(!showPositionDropdown)}>
                  <ChevronDown size={16} />
                </span>
                {showPositionDropdown && (
                  <div className="position-dropdown">
                    {positions.map((position) => (
                      <div
                        key={position}
                        className={`position-option ${formData.position === position ? 'selected' : ''}`}
                        onClick={() => selectPosition(position)}
                      >
                        {position}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dateOfJoining">Date of Joining*</label>
              <div className="date-input-container">
                <input
                  type="text"
                  id="dateOfJoining"
                  name="dateOfJoining"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  onClick={() => datePickerRef.current.showPicker()}
                  readOnly
                />
                <span className="calendar-icon" onClick={() => datePickerRef.current.showPicker()}>
                  <Calendar size={16} />
                </span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={loading}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeEditModal;
