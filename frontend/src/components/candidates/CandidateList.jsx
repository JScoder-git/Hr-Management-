import React, { useState, useEffect, useRef, useCallback } from 'react';
// No need for useNavigate since we're not navigating in this component
import axios from 'axios';
import CandidateFormModal from './CandidateFormModal';
import IconComponent from '../common/IconComponent';
import { COLORS } from '../../styles/constants';
import '../../styles/CandidateList.css';
import '../../styles/CommonButton.css';
import { getApiUrl } from '../../utils/api';

const CandidateList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [availablePositions, setAvailablePositions] = useState([]);
  const actionMenuRef = useRef(null);

  // Fetch candidates from backend API - wrapped in useCallback to prevent infinite re-renders
  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build the API URL with query parameters for filtering
      let url = getApiUrl('api/candidates');
      const params = new URLSearchParams();

      if (statusFilter) params.append('status', statusFilter);
      if (positionFilter) params.append('position', positionFilter);
      if (searchTerm) params.append('search', searchTerm);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Make the API request
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Set the candidates from the API response
      const candidatesData = response.data.data;
      setCandidates(candidatesData);

      // Extract unique positions from candidates
      const positions = [...new Set(candidatesData.map(candidate => candidate.position))];
      setAvailablePositions(positions);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err.response?.data?.message || 'Error fetching candidates');
      setLoading(false);
    }
  }, [statusFilter, positionFilter, searchTerm]);

  useEffect(() => {
    fetchCandidates();
  }, [statusFilter, positionFilter, searchTerm, fetchCandidates]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    fetchCandidates(); // Refresh the list
  };

  // We're using hardcoded options in the dropdowns instead of dynamically generating them

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActionMenuOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleActionMenu = (id, e) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.delete(getApiUrl(`api/candidates/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Show success message if needed
        // setSuccessMessage('Candidate deleted successfully');
      }

      fetchCandidates(); // Refresh the list
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError(err.response?.data?.message || 'Error deleting candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToEmployee = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Get candidate data
      const candidateResponse = await axios.get(getApiUrl(`api/candidates/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const candidate = candidateResponse.data.data;

      // Prepare employee data
      const today = new Date().toISOString().split('T')[0];
      const employeeData = {
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        position: 'Intern', // Set position as 'Intern'
        department: candidate.position, // Use candidate's position as department
        dateOfJoining: today,
        salary: 50000 // Required field, default value
      };

      // Create new employee
      await axios.post(getApiUrl('api/employees'), employeeData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert('Candidate successfully added to employees list!');
    } catch (err) {
      console.error('Error converting candidate to employee:', err);
      setError(err.response?.data?.message || 'Error converting candidate to employee');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (id, name) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(getApiUrl(`api/candidates/${id}/resume`), {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL object
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      setActionMenuOpen(null);
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError(err.response?.data?.message || 'Error downloading resume');
    } finally {
      setLoading(false);
    }
  };

  // Format phone number to (XXX) XXX-XXXX
  const formatPhoneNumber = (phoneNumber) => {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if the input is of correct length
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }

    // If input doesn't match pattern, return the original
    return phoneNumber;
  };

  // Add this function with your other formatting functions
  const formatExperience = (experience) => {
    if (!experience) return '0+';
    return experience.endsWith('+') ? experience : `${experience}+`;
  };

  return (
    <div className="candidate-list-container">
      <div className="candidate-controls">
        <div className="filter-controls">
          <div className="filter-dropdown">
            <select
              className="filter-button"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="New">New</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-dropdown">
            <select
              className="filter-button"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">Position</option>
              {availablePositions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-box">
          <IconComponent name="search" size={16} color={COLORS.DARK_GREY} className="search-icon-candidate" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-candidate"
          />
        </div>

        <button className="btn-primary" onClick={handleOpenModal}>
          Add Candidate
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading candidates...</div>
      ) : (
        <div className="candidates-table-container">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Sr no.</th>
                <th>Candidates Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Position</th>
                <th>Status</th>
                <th>Experience</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-candidates">No candidates found</td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <tr key={candidate._id} className="candidate-row">
                    <td>{String(index + 1).padStart(2, '0')}</td>
                    <td>{candidate.fullName}</td>
                    <td>{candidate.email}</td>
                    <td>{formatPhoneNumber(candidate.phoneNumber)}</td>
                    <td>{candidate.position}</td>
                    <td>
                      <div className="status-selector">
                        <select
                          className={`status-badge ${candidate.status?.toLowerCase()}`}
                          value={candidate.status}
                          onChange={async (e) => {
                            try {
                              const newStatus = e.target.value;
                              const token = localStorage.getItem('token');
                              await axios.put(getApiUrl(`api/candidates/${candidate._id}`),
                                { status: newStatus },
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`
                                  }
                                }
                              );

                              // If status is changed to 'Selected', ask if they want to convert to employee
                              if (newStatus === 'Selected') {
                                if (window.confirm('Do you want to add this candidate to the employees list?')) {
                                  handleConvertToEmployee(candidate._id);
                                }
                              }

                              fetchCandidates(); // Refresh the list after update
                            } catch (err) {
                              setError(err.response?.data?.message || 'Error updating candidate status');
                            }
                          }}
                        >
                          <option value="New">New</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                    <td>{formatExperience(candidate.experience)}</td>
                    <td className="action-cell">
                      <button
                        className="action-button"
                        onClick={(e) => toggleActionMenu(candidate._id, e)}
                      >
                        <IconComponent name="more" size={16} color={COLORS.BLACK} />
                      </button>
                      {actionMenuOpen === candidate._id && (
                        <div className="action-menu" ref={actionMenuRef}>
                          {candidate.status !== 'Selected' && (
                            <button onClick={() => downloadResume(candidate._id, candidate.fullName)} className="menu-item">
                              Download Resume
                            </button>
                          )}
                          {candidate.status === 'Selected' && (
                            <button onClick={() => handleConvertToEmployee(candidate._id)} className="menu-item">
                              Convert to Employee
                            </button>
                          )}
                          <button onClick={() => handleDeleteCandidate(candidate._id)} className="menu-item">
                            Delete Candidate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <CandidateFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CandidateList;