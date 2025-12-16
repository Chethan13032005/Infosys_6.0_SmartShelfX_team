import React, { useState, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, User } from '../types';
import { Shield, CheckCircle, XCircle, Camera, Save, X, Edit3, User as UserIcon, Mail, Phone, FileText } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useInventory();
  const { notify } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && formData.name && formData.email) {
      updateUser({ ...user, ...formData } as User);
      setIsEditing(false);
      notify('Profile updated successfully', 'success');
    } else {
      notify('Name and Email are required', 'error');
    }
  };

  const handleCancel = () => {
    if (user) setFormData(user);
    setIsEditing(false);
  };

  const getCapabilities = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return [
          "Full System Access",
          "Manage Inventory (Add, Edit, Delete)",
          "Perform Stock In/Out Transactions",
          "View AI Forecasts & Predictions",
          "Generate & Approve Purchase Orders",
          "Access Financial & Activity Reports",
          "User Management"
        ];
      case UserRole.MANAGER:
        return [
          "Manage Inventory (Add, Edit)",
          "Perform Stock In/Out Transactions",
          "View AI Forecasts",
          "Generate Purchase Orders (Approval required by Admin)",
          "Access Activity Reports"
        ];
      case UserRole.VENDOR:
        return [
          "View Products supplied by you",
          "View Inventory Levels (Read-only)",
          "Receive Purchase Orders",
          "Update Dispatch Status"
        ];
      default:
        return [];
    }
  };

  const getRestrictions = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return [];
      case UserRole.MANAGER:
        return [
          "Cannot Delete System Logs",
          "Cannot Change Global Settings"
        ];
      case UserRole.VENDOR:
        return [
          "Cannot Edit Product Details",
          "Cannot View Other Vendors' Data",
          "Cannot Access Financial Reports",
          "Cannot Perform Stock Adjustments"
        ];
      default:
        return [];
    }
  };

  if (!user) return <div>Loading...</div>;

  const capabilities = getCapabilities(user.role);
  const restrictions = getRestrictions(user.role);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
         {!isEditing && (
           <button 
             onClick={() => setIsEditing(true)}
             className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
           >
             <Edit3 size={18} />
             <span>Edit Profile</span>
           </button>
         )}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Info Card */}
          <div className="lg:col-span-1">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 h-24 relative">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                      <div className="w-full h-full rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold relative group cursor-pointer">
                        {user.name.charAt(0)}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-14 pb-8 px-6 text-center">
                   {!isEditing ? (
                     <>
                        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm mb-4">{user.role} Account</p>
                        
                        <div className="flex justify-center mb-6">
                           <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1
                             ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                               user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 
                               'bg-green-100 text-green-700'}`}>
                             <Shield size={12} />
                             {user.role}
                           </span>
                        </div>
                        
                        <div className="space-y-4 text-left border-t pt-6">
                           <div className="flex items-center gap-3 text-gray-600">
                             <Mail size={18} className="text-gray-400" />
                             <span className="text-sm truncate">{user.email}</span>
                           </div>
                           <div className="flex items-center gap-3 text-gray-600">
                             <Phone size={18} className="text-gray-400" />
                             <span className="text-sm">{user.phone || 'No phone number added'}</span>
                           </div>
                           <div className="flex items-start gap-3 text-gray-600">
                             <FileText size={18} className="text-gray-400 mt-0.5" />
                             <span className="text-sm">{user.bio || 'No bio provided'}</span>
                           </div>
                        </div>
                     </>
                   ) : (
                     <form onSubmit={handleSave} className="space-y-4 mt-2">
                        <div className="text-left">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                          <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                              type="text" 
                              required
                              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                              value={formData.name} 
                              onChange={e => setFormData({...formData, name: e.target.value})} 
                            />
                          </div>
                        </div>

                        <div className="text-left">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                              type="email" 
                              required
                              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                              value={formData.email} 
                              onChange={e => setFormData({...formData, email: e.target.value})} 
                            />
                          </div>
                        </div>

                        <div className="text-left">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-2.5 text-gray-400" />
                            <input 
                              type="text" 
                              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                              value={formData.phone || ''} 
                              onChange={e => setFormData({...formData, phone: e.target.value})} 
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>
                        </div>

                        <div className="text-left">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Bio / Note</label>
                          <textarea 
                            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                            rows={3}
                            value={formData.bio || ''} 
                            onChange={e => setFormData({...formData, bio: e.target.value})} 
                            placeholder="Brief description about your role..."
                          />
                        </div>

                        <div className="flex gap-3 pt-2">
                           <button type="button" onClick={handleCancel} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
                             Cancel
                           </button>
                           <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center justify-center gap-2">
                             <Save size={16} />
                             Save
                           </button>
                        </div>
                     </form>
                   )}
                </div>
             </div>
          </div>

          {/* Right Column: Role & Permissions Info */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={20} />
                  <span>Role Capabilities</span>
               </h3>
               <p className="text-sm text-gray-500 mb-4">
                 As a <span className="font-semibold text-gray-700">{user.role}</span>, you have access to the following features:
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm text-gray-700 p-2 bg-gray-50 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                      <span>{cap}</span>
                    </div>
                  ))}
               </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <XCircle className="text-red-500" size={20} />
                  <span>System Restrictions</span>
               </h3>
                {restrictions.length > 0 ? (
                   <ul className="space-y-3">
                     {restrictions.map((res, idx) => (
                       <li key={idx} className="flex items-center space-x-3 text-sm text-gray-600">
                         <X size={14} className="text-red-400" />
                         <span>{res}</span>
                       </li>
                     ))}
                   </ul>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm">
                    <Shield size={16} />
                    <span>No specific restrictions. You have full system control.</span>
                  </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};