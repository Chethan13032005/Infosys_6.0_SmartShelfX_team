import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, User } from '../types';
import { Users as UsersIcon, Plus, Trash2, Shield, Search } from 'lucide-react';

export const Users: React.FC = () => {
  const { users, addUser, deleteUser, user: currentUser } = useInventory();
  const { notify } = useNotification();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '', email: '', role: UserRole.MANAGER
  });

  // Filter Logic:
  // Admin: Sees everyone
  // Manager: Sees only Vendors
  const visibleUsers = users.filter(u => {
    // Basic search filter
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Role visibility filter
    if (currentUser?.role === UserRole.ADMIN) return true;
    if (currentUser?.role === UserRole.MANAGER) return u.role === UserRole.VENDOR;
    
    return false; // Vendors see nothing here essentially, but the route is guarded in Layout usually.
  });

  const canManage = currentUser?.role === UserRole.ADMIN;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newUser.name && newUser.email && newUser.role) {
      addUser(newUser as Omit<User, 'id'>);
      notify(`${newUser.role} added successfully`, 'success');
      setShowModal(false);
      setNewUser({ name: '', email: '', role: UserRole.MANAGER });
    } else {
      notify('Please fill all fields', 'error');
    }
  };

  const handleDelete = (id: number) => {
    if (id === currentUser?.id) {
      notify("You cannot delete yourself.", 'error');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      notify('User removed successfully', 'success');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-purple-100 text-purple-700';
      case UserRole.MANAGER: return 'bg-blue-100 text-blue-700';
      case UserRole.VENDOR: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Team & Users</h2>
           <p className="text-sm text-gray-500 mt-1">
             {currentUser?.role === UserRole.ADMIN ? 'Manage system access and roles.' : 'View vendor directory.'}
           </p>
        </div>
        {canManage && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
              {canManage && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                       {u.name.charAt(0)}
                     </div>
                     <span className="font-medium text-gray-900">{u.name}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                {canManage && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {visibleUsers.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                   No users found.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-scale-up">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield size={20} className="text-indigo-600" />
              Add New User
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" className="w-full border rounded-lg px-3 py-2" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full border rounded-lg px-3 py-2 bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value={UserRole.MANAGER}>Manager</option>
                  <option value={UserRole.VENDOR}>Vendor</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};