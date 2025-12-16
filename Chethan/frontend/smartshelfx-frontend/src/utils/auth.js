// Simple auth utilities for role-aware UI and route guards

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return {};
  }
};

export const getUserEmail = () => getUser().email || '';

export const getUserRole = () => getUser().role || '';

export const isAuthenticated = () => Boolean(getToken());

export const getRole = () => (getUser().role || '').trim();

export const hasRole = (role) => {
  const current = getRole();
  // role names are stored as plain strings like "Admin" or "Store Manager"
  return current.toLowerCase() === String(role).toLowerCase();
};
