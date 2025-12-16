import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import config from './config';

// Initialize axios Authorization header from localStorage on app load
// Set base URL once
axios.defaults.baseURL = config.apiUrl;

// Clear old/invalid tokens on startup (safety after backend secret change)
// Check if token looks valid (should be a JWT with 3 parts separated by dots)
const existingToken = localStorage.getItem('token');
if (existingToken) {
  const parts = existingToken.split('.');
  if (parts.length === 3) {
    try {
      // Test if token parts are valid base64
      atob(parts[0]);
      atob(parts[1]);
      axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
    } catch (e) {
      // Invalid token format - clear it
      console.warn('Clearing invalid token from storage');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  } else {
    // Not a JWT - clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// Global response interceptor for auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // Only treat 401 (unauthenticated/invalid token) as a reason to logout
    if (status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      } catch (_) {}
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.replace('/login');
      }
    }
    // For 403 (forbidden), keep the token and let UI handle permission errors gracefully
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
