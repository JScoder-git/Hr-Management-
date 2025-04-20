import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Download,
  Edit,
  Trash2,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  Clock
} from 'lucide-react';
import '../../styles/CandidateDetail.css';
import { getApiUrl } from '../../utils/api';

const CandidateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(getApiUrl(`api/candidates/${id}`), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCandidate(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching candidate details');
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.delete(getApiUrl(`api/candidates/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      navigate('/candidates');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting candidate');
    }
  };

  const downloadResume = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(getApiUrl(`api/candidates/${id}/resume`), {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'blob'
      });


      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${candidate.fullName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading resume');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'new';
      case 'Shortlisted':
        return 'shortlisted';
      case 'Interview':
        return 'interview';
      case 'Selected':
        return 'selected';
      case 'Rejected':
        return 'rejected';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading-container">Loading candidate details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!candidate) {
    return <div className="not-found-container">Candidate not found</div>;
  }

  return (
    <div className="candidate-detail-container">
      <div className="candidate-detail-header">
        <Link to="/candidates" className="back-button">
          <ArrowLeft size={16} />
          Back to Candidates
        </Link>
        <h1>Candidate Details</h1>
        <div className="header-actions">
          <button className="action-button edit" onClick={() => navigate(`/candidates/edit/${id}`)}>
            <Edit size={16} />
            Edit
          </button>
          <button className="action-button delete" onClick={handleDelete}>
            <Trash2 size={16} />
            Delete
          </button>
          <button className="action-button resume" onClick={downloadResume}>
            <Download size={16} />
            Resume
          </button>
          <button className="action-button convert" onClick={() => navigate(`/candidates/${id}/convert`)}>
            <UserPlus size={16} />
            Convert to Employee
          </button>
        </div>
      </div>

      <div className="candidate-detail-content">
        <div className="candidate-info-card">
          <div className="candidate-header">
            <div className="candidate-avatar">
              {candidate.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="candidate-title">
              <h2>{candidate.fullName}</h2>
              <div className={`status-badge ${getStatusColor(candidate.status)}`}>
                {candidate.status}
              </div>
            </div>
          </div>

          <div className="candidate-details">
            <div className="detail-item">
              <Mail size={18} />
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{candidate.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <Phone size={18} />
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{candidate.phoneNumber}</span>
              </div>
            </div>

            <div className="detail-item">
              <Briefcase size={18} />
              <div className="detail-content">
                <span className="detail-label">Position</span>
                <span className="detail-value">{candidate.position}</span>
              </div>
            </div>

            <div className="detail-item">
              <Clock size={18} />
              <div className="detail-content">
                <span className="detail-label">Experience</span>
                <span className="detail-value">{candidate.experience}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={18} />
              <div className="detail-content">
                <span className="detail-label">Applied On</span>
                <span className="detail-value">
                  {new Date(candidate.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {candidate.notes && (
              <div className="detail-item notes">
                <FileText size={18} />
                <div className="detail-content">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{candidate.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
