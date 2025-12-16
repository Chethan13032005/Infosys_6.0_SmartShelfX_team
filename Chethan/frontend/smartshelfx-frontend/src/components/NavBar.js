import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Package, TrendingUp, ShoppingCart, Bell, Users, Bot, BarChart3, FileText, LogOut } from 'lucide-react';
import axios from 'axios';
import { isAuthenticated, getUser, hasRole, getToken } from '../utils/auth';
import config from '../config';

const NavBar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const authed = isAuthenticated();
  const user = getUser();
  const role = user.role || '';

  useEffect(() => {
    if (authed) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  const fetchUnreadCount = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${config.apiUrl}/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    } catch (e) { /* noop */ }
    navigate('/login');
  };
  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-lg font-bold text-white">SX</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            SmartShelfX
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-sm">
          {authed && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}
            >
              <Home size={18} /> <span className="hidden sm:inline">Dashboard</span>
            </NavLink>
          )}
          {authed && (
            <NavLink
              to="/inventory"
              className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}
            >
              <Package size={18} /> <span className="hidden sm:inline">Inventory</span>
            </NavLink>
          )}
          {authed && (hasRole('Manager') || hasRole('Admin')) && (
            <NavLink
              to="/stock-transactions"
              className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}
            >
              <TrendingUp size={18} /> <span className="hidden sm:inline">Stock</span>
            </NavLink>
          )}
          {authed && (
            <NavLink
              to="/purchase-orders"
              className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}
            >
              <ShoppingCart size={18} /> <span className="hidden sm:inline">Orders</span>
            </NavLink>
          )}
          {authed && (
            <NavLink
              to="/notifications"
              className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all relative flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          )}
          {authed && hasRole('Admin') && (
            <>
              <NavLink to="/users" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}>
                <Users size={18} /> <span className="hidden lg:inline">Users</span>
              </NavLink>
              <NavLink to="/ai-restock" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}>
                <Bot size={18} /> <span className="hidden lg:inline">AI Restock</span>
              </NavLink>
              <NavLink to="/forecast" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}>
                <BarChart3 size={18} /> <span className="hidden lg:inline">Forecast</span>
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => `px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}>
                <FileText size={18} /> <span className="hidden lg:inline">Reports</span>
              </NavLink>
            </>
          )}

          {!authed ? (
            <>
              <NavLink to="/login" className={({ isActive }) => `px-4 py-2 rounded-lg font-medium transition-all ${isActive ? 'bg-gray-100 text-teal-600' : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'}`}>Login</NavLink>
              <NavLink to="/signup" className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg hover:shadow-teal-500/30 transition transform hover:scale-105">Sign Up</NavLink>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-2 pl-2 border-l border-gray-300">
              <div className="hidden md:block text-gray-700 text-xs">
                {user.fullName || user.email} 
                {role && <span className="text-gray-500"> · {role}</span>}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg font-medium transition-all text-gray-700 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-300 flex items-center gap-2"
              >
                <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
