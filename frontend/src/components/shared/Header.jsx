import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import NotificationDropdown from '../notifications/NotificationDropdown';
import LogoutModal from './LogoutModal';
import IconComponent from '../common/IconComponent';
import { COLORS } from '../../styles/constants';
import '../../styles/Header.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [unreadMailCount, setUnreadMailCount] = useState(2); // Added state for unread mail count
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to determine header text based on current path
  const getHeaderText = () => {
    const path = location.pathname;

    if (path.includes('/candidates')) return 'Candidates';
    if (path.includes('/employees')) return 'Employees';
    if (path.includes('/attendance')) return 'Attendance';
    if (path.includes('/leaves')) return 'Leaves';
    if (path.includes('/logout')) return 'Logout';

    // You can add more conditions for other pages
    // Default or dashboard
    return 'Dashboard';
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
    setShowUserDropdown(false); // Close the dropdown when opening logout modal
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Close user dropdown when opening notifications
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    // Close notifications when opening user dropdown
    setShowNotifications(false);
  };

  const getProfileImageUrl = () => {
    if (currentUser?.profilePicture) {
      return `http://localhost:5000/api/profile/picture/${currentUser.profilePicture}`;
    }

    return `http://localhost:5000/api/profile/picture/default-avatar.jpg`;
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="page-title">{getHeaderText()}</h1>
        </div>

        <div className="header-right">
          <div className="notification-container">
            <button className="notification-button">
              <IconComponent name="mail" size={20} color={COLORS.BLACK} />
              {unreadMailCount > 0 && (
                <span className="notification-badge">{unreadMailCount}</span>
              )}
            </button>
          </div>

          <div className="notification-container">
            <button className="notification-button" onClick={toggleNotifications}>
              <IconComponent name="bell" size={20} color={COLORS.BLACK} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <NotificationDropdown />
            )}
          </div>

          <div className="user-menu" ref={userMenuRef}>
            <div className="user-profile-container" onClick={toggleUserDropdown}>
              <img
                src={getProfileImageUrl()}
                alt="Profile"
                className="user-avatar"
              />
              
            </div>

            <div className={`user-dropdown ${showUserDropdown ? 'show' : ''}`}>
              <div className="user-info">
                <p className="user-name">{currentUser?.fullName}</p>
                <p className="user-role">{currentUser?.role}</p>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setShowUserDropdown(false)}>
                My Profile
              </Link>
              <button onClick={openLogoutModal} className="dropdown-item">
                Logout
              </button>
            </div>
          </div>
          
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Header;