import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { getApiUrl } from '../utils/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    let interval;

    const fetchNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(getApiUrl('api/notifications'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setNotifications(response.data.data);
        setUnreadCount(response.data.unreadCount);
        setLoading(false);
      } catch (err) {
        setError('Error fetching notifications');
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();

      interval = setInterval(fetchNotifications, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);


  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(getApiUrl(`api/notifications/${id}/read`), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      setNotifications(notifications.map(notification =>
        notification._id === id ? { ...notification, isRead: true } : notification
      ));

      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      setError('Error marking notification as read');
    }
  };


  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(getApiUrl('api/notifications/read-all'), {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError('Error marking notifications as read');
    }
  };


  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(getApiUrl(`api/notifications/${id}`), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      const deletedNotification = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(notification => notification._id !== id));

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (err) {
      setError('Error deleting notification');
    }
  };


  const refreshNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(getApiUrl('api/notifications'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
      setLoading(false);
    } catch (err) {
      setError('Error refreshing notifications');
      setLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};