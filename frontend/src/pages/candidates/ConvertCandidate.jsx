import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/ConvertCandidate.css';
import { getApiUrl } from '../../utils/api';

const ConvertCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [candidate, setCandidate] = useState(null);

  const [formData, setFormData] = useState({
    dateOfJoining: '',
    department: '',
    salary: '',
  });

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setCandidate(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching candidate data');
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');


      const employeeData = {
        fullName: candidate.fullName,
        email: candidate.email,
        phoneNumber: candidate.phoneNumber,
        position: candidate.position,
        department: formData.department,
        dateOfJoining: formData.dateOfJoining,
        salary: formData.salary,
      };


      const response = await axios.post(getApiUrl('api/employees'), employeeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      await axios.put(getApiUrl(`api/candidates/${id}`),
        { status: 'Selected' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Error converting candidate to employee');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading candidate data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="convert-candidate-container">
      <h1>Convert Candidate to Employee</h1>

      <div className="candidate-info">
        <h2>Candidate Details</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{candidate.fullName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{candidate.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{candidate.phoneNumber}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Position:</span>
            <span className="info-value">{candidate.position}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Experience:</span>
            <span className="info-value">{candidate.experience}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value">
              <span className={`status-badge badge-${candidate.status.toLowerCase()}`}>
                {candidate.status}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="employee-form-section">
        <h2>Additional Employee Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="dateOfJoining">Date of Joining</label>
            <input
              type="date"
              id="dateOfJoining"
              name="dateOfJoining"
              value={formData.dateOfJoining}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              id="salary"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-buttons">
            <button
              type="button"
              onClick={() => navigate('/candidates')}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="convert-button"
              disabled={submitting}
            >
              {submitting ? 'Converting...' : 'Convert to Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertCandidate;