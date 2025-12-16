import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import LandingPage from './components/LandingPage';
import DashboardRouter from './components/DashboardRouter';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ManagerDashboard from './components/dashboards/ManagerDashboard';
import VendorDashboard from './components/dashboards/VendorDashboard';
import NavBar from './components/NavBar';
import InventoryManagement from './components/InventoryManagement';
import StockTransactions from './components/StockTransactions';
import PurchaseOrders from './components/PurchaseOrders';
import Notifications from './components/Notifications';
import PurchaseOrderCreate from './components/PurchaseOrderCreate';
import SuggestedRestock from './components/SuggestedRestock';
import AIRestock from './components/AIRestock';
import DemandForecasting from './components/DemandForecasting';
import Reports from './components/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ManagerRoute from './components/ManagerRoute';
import VendorRoute from './components/VendorRoute';
import UserManagement from './components/UserManagement';
import { isAuthenticated } from './utils/auth';
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/';

  return (
    <div className="App">
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/inventory" element={<ProtectedRoute><InventoryManagement /></ProtectedRoute>} />
        <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
        <Route path="/restock" element={<AdminRoute><SuggestedRestock /></AdminRoute>} />
        <Route path="/ai-restock" element={<AdminRoute><AIRestock /></AdminRoute>} />
        <Route path="/forecast" element={<AdminRoute><DemandForecasting /></AdminRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/stock-transactions" element={<ProtectedRoute><StockTransactions /></ProtectedRoute>} />
        <Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrders /></ProtectedRoute>} />
        <Route path="/purchase-orders/create" element={<ProtectedRoute><PurchaseOrderCreate /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        {/* Role-based dashboards */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/dashboard/manager" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
        <Route path="/dashboard/vendor" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
        {/* Redirect root based on auth status */}
        <Route path="*" element={isAuthenticated() ? <Navigate to="/dashboard" /> : <Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </Router>
  );
}

export default App;