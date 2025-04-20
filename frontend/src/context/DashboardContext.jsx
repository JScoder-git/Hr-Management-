import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../utils/api';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');


      const response = await axios.get(getApiUrl('api/dashboard/stats'), {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDashboardData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData();
    }
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        loading,
        error,
        refreshDashboard: fetchDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};