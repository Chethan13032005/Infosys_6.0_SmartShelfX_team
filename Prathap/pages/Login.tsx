import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types';
import { Box, Lock, User as UserIcon, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, navigate } = useInventory();
  const { notify } = useNotification();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      notify('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      login(email || 'demo@smartshelfx.com', role);
      notify(`Welcome back, ${role.toLowerCase()}!`, 'success');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col z-10 animate-scale-up">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30 shadow-inner">
              <Box className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">SmartShelfX</h1>
            <p className="text-indigo-100 mt-2 font-light">AI-Driven Inventory Intelligence</p>
          </div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <select 
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.MANAGER}>Warehouse Manager</option>
                  <option value={UserRole.VENDOR}>Vendor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center space-x-2 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {loading && <Loader className="animate-spin" size={18} />}
              <span>{loading ? 'Authenticating...' : 'Login to Dashboard'}</span>
            </button>
          </form>
          
          <div className="mt-6 text-center space-y-1">
            <p className="text-xs text-gray-400">&copy; 2024 SmartShelfX Systems. All rights reserved.</p>
            <p className="text-xs text-gray-500">Designed & Developed by <span className="font-semibold text-indigo-600">Pratap Sakthivel</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};