import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../utils/auth';

const AdminRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!hasRole('Admin')) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default AdminRoute;
