import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DashboardProvider } from './context/DashboardContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/shared/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import CandidateList from './components/candidates/CandidateList';

import CandidateDetail from './pages/candidates/CandidateDetail';
import ConvertCandidate from './pages/candidates/ConvertCandidate';
import EmployeeList from './components/employees/EmployeeList';

import AttendanceList from './components/attendance/AttendanceList';
import EnhancedLeaveList from './components/leaves/EnhancedLeaveList';

import LeaveDetail from './pages/leaves/LeaveDetail';
import UserProfile from './pages/profile/UserProfile';
import ProtectedRoute from './components/common/ProtectedRoute';
import './App.css';


const ProtectedRouteWrapper = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};


const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (currentUser) {
    return <Navigate to="/candidates" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <DashboardProvider>
          <NotificationProvider>
            <Routes>

              <Route path="/" element={<Navigate to="/login" replace />} />


              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />


              <Route
                path="/"
                element={
                  <ProtectedRouteWrapper>
                    <Layout />
                  </ProtectedRouteWrapper>
                }
              >

                <Route path="dashboard" element={<Dashboard />} />


                <Route path="candidates" element={<CandidateList />} />

                <Route path="candidates/:id" element={<CandidateDetail />} />
                <Route path="candidates/:id/convert" element={<ConvertCandidate />} />


                <Route path="employees" element={<EmployeeList />} />


                <Route path="attendance" element={
                  <ProtectedRoute>
                    <AttendanceList />
                  </ProtectedRoute>
                } />


                <Route path="leaves" element={<EnhancedLeaveList />} />

                <Route path="leaves/:id" element={<LeaveDetail />} />


                <Route path="profile" element={<UserProfile />} />


                <Route path="*" element={<Navigate to="/candidates" replace />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </DashboardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;