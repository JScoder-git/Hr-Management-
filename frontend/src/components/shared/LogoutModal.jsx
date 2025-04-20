import React from 'react';
import '../../styles/LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onLogout }) => {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal-container">
        <div className="logout-modal-header">
          <h2>Log Out</h2>
        </div>
        <div className="logout-modal-content">
          <p className="logout-message">Are you sure you want to log out?</p>
          <div className="logout-modal-buttons">
            <button className="cancel-button-logout" onClick={onClose}>
              Cancel
            </button>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
