import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../shared/Modal';
import { Upload } from 'lucide-react';
import '../../styles/CandidateFormModal.css';
import { getApiUrl } from '../../utils/api';

const CandidateFormModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    position: '',
    experience: '',
    resume: null
  });
  const [declaration, setDeclaration] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      resume: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!declaration) {
      setError('Please confirm the declaration');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        setError('Authentication token not found. Please login again.');
        setLoading(false);
        return;
      }

      // Create FormData object for file upload
      const form = new FormData();

      // Add all form fields
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phoneNumber', formData.phoneNumber);
      form.append('position', formData.position);
      form.append('experience', formData.experience);

      // Add resume file if it exists
      if (formData.resume) {
        form.append('resume', formData.resume);
      }

      // Adding default status
      form.append('status', 'New');

      // Make the API request
      const response = await axios.post('getApiUrl('api/candidates')', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't manually set Content-Type for FormData, axios will set it with the correct boundary
        }
      });

      console.log('Success response:', response.data);

      // Call onSuccess to refresh the list and close the modal
      onSuccess();
      onClose();
    } catch (err) {
      console.error('API Error:', err.response || err);

      // Handle specific error cases
      if (err.response?.status === 403) {
        setError('You do not have permission to add candidates. Please contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Error saving candidate');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Candidate">
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="candidate-modal-form">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Full Name*"
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Email Address*"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Phone Number*"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Position*"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="Experience*"
            />
          </div>

          <div className="form-group">
            <div className="resume-input-container">
              <input
                type="text"
                className="resume-text"
                placeholder="Resume*"
                value={formData.resume ? formData.resume.name : ''}
                readOnly
              />
              <Upload size={20} className="upload-icon" />
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                required
                className="file-input"
              />
            </div>
          </div>
        </div>

        <div className="declaration-container">
          <label className="declaration-label">
            <input
              type="checkbox"
              checked={declaration}
              onChange={(e) => setDeclaration(e.target.checked)}
              required
            />
            <span>I hereby declare that the above information is true to the best of my knowledge and belief</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CandidateFormModal;