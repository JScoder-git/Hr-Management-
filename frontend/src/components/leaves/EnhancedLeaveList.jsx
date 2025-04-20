import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, FileText } from 'lucide-react';
import LeaveModal from './LeaveModal';
import LeaveCalendar from './LeaveCalendar';
import '../../styles/NewLeaveList.css';
import '../../styles/CalendarStyles.css';
import { getApiUrl } from '../../utils/api';

const EnhancedLeaveList = () => {
  // Using AuthContext for authentication
  const { currentUser } = useContext(AuthContext);
  // Force isAdmin to true if you're testing and know you should have admin access
  const isAdmin = true; // For testing only - remove this line later

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);

  // Add this state to manage the dropdown visibility
  const [activeDocMenu, setActiveDocMenu] = useState(null);

  // Add this function to handle document menu toggling
  const toggleDocMenu = (leaveId, event) => {
    event.stopPropagation();
    setActiveDocMenu(activeDocMenu === leaveId ? null : leaveId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDocMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Function to fetch leaves
  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Using token for fetch:', token ? 'Token exists' : 'No token');
      let url = getApiUrl('api/leaves');

      if (statusFilter) {
        url = `${url}?status=${statusFilter}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Fetched leaves:', response.data.data);
      setLeaves(response.data.data);
    } catch (err) {
      console.error("Error fetching leaves:", err);
      setError(err.response?.data?.message || 'Error fetching leave requests');
    }
  };

  useEffect(() => {
    const loadLeaves = async () => {
      try {
        await fetchLeaves();
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching leave requests');
        setLoading(false);
      }
    };

    loadLeaves();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Show what we're changing in console
      console.log(`Changing leave ${id} status to ${newStatus}`);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      // Update on the server with better error handling
      console.log(`Sending request to: ${getApiUrl(`api/leaves/${id}`)}`);
      console.log(`With data: ${JSON.stringify({ status: newStatus })}`);

      const response = await axios.put(
        getApiUrl(`api/leaves/${id}`),
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response.data);

      // Update local state immediately for smoother UI
      setLeaves(prevLeaves =>
        prevLeaves.map(leave =>
          leave._id === id ? { ...leave, status: newStatus } : leave
        )
      );

      // Show success message
      alert(`Leave status updated to ${newStatus}`);

      // Refresh the leaves list
      await fetchLeaves();
    } catch (err) {
      console.error("Error updating leave status:", err);
      console.error("Error details:", err.response?.data || err.message);
      setError(`Error updating leave status: ${err.message}`);
      alert(`Failed to update status: ${err.response?.data?.message || err.message}`);
    }
  };

  const formatDate = (dateString) => {
    // Format as MM/DD/YY with padding zeros if needed
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${month}/${day}/${year}`;
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      case 'Pending':
      default:
        return 'status-pending';
    }
  };



  const filteredLeaves = leaves.filter(leave => {
    // Filter by status if a status filter is selected
    if (statusFilter && leave.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        leave.employee?.fullName.toLowerCase().includes(query) ||
        leave.reason.toLowerCase().includes(query) ||
        leave.leaveType.toLowerCase().includes(query)
      );
    }

    return true;
  });

  if (loading) {
    return <div className="loading">Loading leave requests...</div>;
  }

  const handleLeaveSuccess = () => {
    // Refresh the leaves list
    fetchLeaves();
  };

  return (
    <div className="enhanced-leave-container">
      {/* Leave Modal */}
      <LeaveModal
        isOpen={showAddLeaveModal}
        onClose={() => setShowAddLeaveModal(false)}
        onSuccess={handleLeaveSuccess}
      />
       <div className="leave-controls">
            <div className="status-filter">
              <select
                className="status-dropdown"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
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

            <button className="add-leave-btn" onClick={() => setShowAddLeaveModal(true)}>
              Add Leave
            </button>
          </div>
      <div className="leave-grid">
        {/* Left Section - Leave List */}
        <div className="leave-list-section">


          <div className="applied-leaves-header">Applied Leaves</div>

          {error && <div className="error-message">{error}</div>}

          {filteredLeaves.length === 0 ? (
            <div className="no-leaves">No leave requests found.</div>
          ) : (
            <div className="leave-table-container">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Profile</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Docs</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <div className="employee-avatar">
                          <img src={getApiUrl('api/profile/picture/default-avatar.jpg')} alt={leave.employee?.fullName} />
                        </div>
                      </td>
                      <td>
                        <div className="employee-info">
                          <div className="employee-name">{leave.employee?.fullName}</div>
                          <div className="employee-position">{leave.employee?.position || 'Employee'}</div>
                        </div>
                      </td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>
                        <div className="reason-text">{leave.reason}</div>
                      </td>
                      <td>
                        <div className="status-dropdown-container">
                          {isAdmin ? (
                            <select
                              className={`status-select ${getStatusClass(leave.status)}`}
                              value={leave.status || "Pending"}
                              onChange={(e) => handleStatusChange(leave._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${getStatusClass(leave.status)}`}>
                              {leave.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          className={`doc-button ${activeDocMenu === leave._id ? 'active' : ''}`}
                          onClick={(e) => toggleDocMenu(leave._id, e)}
                          disabled={!leave.attachment}
                          title={leave.attachment ? "Document options" : "No document available"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#4B0082"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>

                          {activeDocMenu === leave._id && leave.attachment && (
                            <div className="doc-menu">
                              <a
                                href={getApiUrl(`api/leaves/documents/${leave.attachment}`)}
                                className="doc-menu-item"
                                download
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7 10 12 15 17 10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Medical Document
                              </a>
                            </div>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Section - Calendar */}
        <LeaveCalendar
          leaves={leaves}
          approvedLeaves={leaves.filter(leave => leave.status === "Approved")}
        />
      </div>
    </div>
  );
};

export default EnhancedLeaveList;
