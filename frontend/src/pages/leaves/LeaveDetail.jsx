import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/LeaveDetail.css';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'hr');

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/leaves/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setLeave(response.data.data);
        setComment(response.data.data.comment || '');
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching leave details');
        setLoading(false);
      }
    };

    fetchLeave();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/leaves/${id}`, 
        { status, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setLeave(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating leave status');
    }
  };

  const downloadAttachment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/leaves/${id}/attachment`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attachment.pdf'); // Default filename
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error downloading attachment');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      case 'Pending':
      default:
        return 'yellow';
    }
  };

  if (loading) {
    return <div className="loading">Loading leave details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="leave-detail-container">
      <div className="leave-detail-header">
        <div>
          <h1>Leave Request Details</h1>
          <span className={`status-badge badge-${getStatusColor(leave.status)}`}>
            {leave.status}
          </span>
        </div>
        <Link to="/leaves" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to List
        </Link>
      </div>
      
      <div className="detail-section">
        <h2>Employee Information</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{leave.employee?.fullName}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Position:</span>
            <span className="detail-value">{leave.employee?.position}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Department:</span>
            <span className="detail-value">{leave.employee?.department}</span>
          </div>
        </div>
      </div>
      
      <div className="detail-section">
        <h2>Leave Details</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Leave Type:</span>
            <span className="detail-value">{leave.leaveType}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Start Date:</span>
            <span className="detail-value">{formatDate(leave.startDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">End Date:</span>
            <span className="detail-value">{formatDate(leave.endDate)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Days:</span>
            <span className="detail-value">{leave.totalDays}</span>
          </div>
          <div className="detail-item full-width">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{leave.reason}</span>
          </div>
          {leave.attachments && (
            <div className="detail-item">
              <span className="detail-label">Attachment:</span>
              <button onClick={downloadAttachment} className="download-btn">
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="detail-section">
        <h2>Review Information</h2>
        <div className="detail-grid">
          {leave.reviewedBy ? (
            <>
              <div className="detail-item">
                <span className="detail-label">Reviewed By:</span>
                <span className="detail-value">{leave.reviewedBy?.fullName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Reviewed On:</span>
                <span className="detail-value">
                  {formatDate(leave.reviewedAt)}
                </span>
              </div>
            </>
          ) : (
            <div className="detail-item">
              <span className="detail-value">Not reviewed yet</span>
            </div>
          )}
        </div>
      </div>
      
      {isAdmin && leave.status === 'Pending' && (
        <div className="detail-section">
          <h2>Admin Actions</h2>
          <div className="admin-actions">
            <div className="comment-box">
              <label htmlFor="comment">Comment:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)"
                rows="2"
              ></textarea>
            </div>
            <div className="action-buttons">
              <button 
                onClick={() => handleStatusUpdate('Approved')} 
                className="approve-button"
              >
                <i className="fas fa-check"></i> Approve
              </button>
              <button 
                onClick={() => handleStatusUpdate('Rejected')} 
                className="reject-button"
              >
                <i className="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      )}
      
      {leave.comment && (
        <div className="detail-section">
          <h2>Comment</h2>
          <div className="comment">{leave.comment}</div>
        </div>
      )}
    </div>
  );
};

export default LeaveDetail;