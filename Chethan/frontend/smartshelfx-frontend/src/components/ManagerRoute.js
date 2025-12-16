import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../utils/auth';

const ManagerRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!hasRole('Manager')) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

export default ManagerRoute;
