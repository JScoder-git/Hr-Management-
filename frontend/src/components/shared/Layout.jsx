import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import '../../styles/Layout.css';

const Layout = () => {
  const { currentUser, loading } = useContext(AuthContext);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      
      <div className="content-container">
        <Sidebar />
        <main className="main-content">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;