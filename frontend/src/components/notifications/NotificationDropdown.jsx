import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import '../../styles/NotificationDropdown.css';

const NotificationDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave':
        return <i className="fas fa-calendar-minus"></i>;
      case 'attendance':
        return <i className="fas fa-calendar-check"></i>;
      case 'employee':
        return <i className="fas fa-user"></i>;
      case 'candidate':
        return <i className="fas fa-user-tie"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read" 
            onClick={markAllAsRead}
            title="Mark all as read"
          >
            <i className="fas fa-check-double"></i>
          </button>
        )}
      </div>
      
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <i className="fas fa-bell-slash"></i>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={`notification-icon ${notification.type}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  <button 
                    className="delete-notification" 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    title="Delete notification"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">{formatTime(notification.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {notifications.length > 0 && (
        <div className="notification-footer">
          <Link to="/notifications" className="view-all">
            View All
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;