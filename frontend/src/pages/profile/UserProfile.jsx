import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/UserProfile.css';
import { getApiUrl } from '../../utils/api';

const UserProfile = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    jobTitle: '',
    role: '',
    profilePicture: null
  });


  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });


  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('getApiUrl('api/profile')', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = response.data.data;
        setProfileData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber || '',
          jobTitle: userData.jobTitle || '',
          role: userData.role || '',
          profilePicture: null
        });

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profilePicture: file
      });


      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');


      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('phoneNumber', profileData.phoneNumber);
      formData.append('jobTitle', profileData.jobTitle);

      if (profileData.profilePicture) {
        formData.append('profile', profileData.profilePicture);
      }

      const response = await axios.put('getApiUrl('api/profile')',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );


      updateCurrentUser(response.data.data);

      setSuccess('Profile updated successfully');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();


    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.put('getApiUrl('api/profile/password')',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setSuccess('Password changed successfully');
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin':
        return 'admin-badge';
      case 'hr':
        return 'hr-badge';
      default:
        return 'employee-badge';
    }
  };

  const getProfileImageUrl = () => {
    if (previewImage) {
      return previewImage;
    }

    if (currentUser?.profilePicture) {
      return `http://localhost:5000/api/profile/picture/${currentUser.profilePicture}`;
    }

    return `http://localhost:5000/api/profile/picture/default-avatar.jpg`;
  };

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-image-container">
            <img
              src={getProfileImageUrl()}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-name">{currentUser?.fullName || 'User'}</div>
            <div className={`role-badge ${getRoleBadgeClass(currentUser?.role)}`}>
              {currentUser?.role || 'employee'}
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              <i className="fas fa-user"></i> Basic Information
            </button>
            <button
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <i className="fas fa-key"></i> Change Password
            </button>
          </div>
        </div>

        <div className="profile-details">
          {activeTab === 'info' ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <h2>Basic Information</h2>

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  readOnly
                  disabled
                  className="disabled-input"
                />
                <small className="help-text">Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="jobTitle">Job Title</label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={profileData.jobTitle}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={profileData.role}
                  readOnly
                  disabled
                  className="disabled-input"
                />
                <small className="help-text">Role cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/jpg"
                  className="file-input"
                />
                <small className="help-text">JPG, JPEG or PNG (Max: 5MB)</small>
              </div>

              <div className="form-buttons">
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="password-form">
              <h2>Change Password</h2>

              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-buttons">
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;