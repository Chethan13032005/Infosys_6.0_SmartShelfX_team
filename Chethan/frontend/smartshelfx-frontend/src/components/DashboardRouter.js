import React from 'react';
import { Navigate } from 'react-router-dom';
import { getRole } from '../utils/auth';

const roleToPath = (role) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin') return '/dashboard/admin';
  if (r === 'manager') return '/dashboard/manager';
  if (r === 'vendor') return '/dashboard/vendor';
  return '/home';
};

const DashboardRouter = () => {
  const path = roleToPath(getRole());
  return <Navigate to={path} replace />;
};

export default DashboardRouter;
