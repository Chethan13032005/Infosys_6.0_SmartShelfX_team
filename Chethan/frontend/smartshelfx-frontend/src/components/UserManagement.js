import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Alert from './Alert';
import Spinner from './Spinner';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', company: '', phoneNumber: '', warehouseLocation: '', role: 'Manager' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
  const res = await axios.get('/users');
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      company: user.company || '',
      phoneNumber: user.phoneNumber || '',
      warehouseLocation: user.warehouseLocation || '',
  role: user.role || 'Manager'
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      // Update profile fields
      const { role, ...profile } = form;
      await axios.put(`/users/${editingUser.id}`, profile);

      // Update role only if changed
      if ((editingUser.role || '').trim() !== (role || '').trim()) {
        await axios.put(`/users/${editingUser.id}/role`, { role });
      }
      setSuccess('User details updated');
      setTimeout(() => setSuccess(''), 3000);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data || 'Failed to update user');
    }
  };

  const updateRole = async (userId, currentRole) => {
  const newRole = currentRole === 'Admin' ? 'Manager' : 'Admin';
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      await axios.put(`/users/${userId}/role`, { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data || 'Failed to update role');
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await axios.put(`/users/${userId}/toggle-status`);
      setSuccess(res.data.message);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data || 'Failed to toggle user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axios.delete(`/users/${userId}`);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete user');
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl text-white p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <span className="text-5xl">👥</span>
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">User Management</h1>
              <p className="text-lg text-purple-100 mt-2">Control access and manage system users with ease</p>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert type="error" className="mb-4 border-l-4 border-rose-500 shadow-sm animate-shake">{error}</Alert>}
      {success && <Alert type="success" className="mb-4 border-l-4 border-green-500 shadow-sm">{success}</Alert>}
      {loading && <Spinner label="Loading users..." />}

      {!loading && (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">ID</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Email</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Role</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Company</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users && users.length ? (
                  users.map((user) => (
                    <tr key={user.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 ${user.enabled ? '' : 'opacity-60'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">#{user.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.role === 'Admin' ? '👨‍💼' : user.role === 'Manager' ? '📋' : '🏪'}</span>
                          <span className="text-sm font-semibold text-gray-900">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                          user.role === 'Admin' 
                            ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' 
                            : user.role === 'Manager'
                            ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800'
                            : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.company || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full ${
                          user.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.enabled ? '✅ Active' : '⛔ Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold hover:underline transition-colors"
                            title="Edit user details"
                          >
                            ✏️ Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => updateRole(user.id, user.role)}
                            className="text-purple-600 hover:text-purple-900 font-semibold hover:underline transition-colors"
                            title="Toggle role"
                          >
                            🔄 Role
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => toggleStatus(user.id, user.enabled)}
                            className={`${user.enabled ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} font-semibold hover:underline transition-colors`}
                            title={user.enabled ? 'Disable user' : 'Enable user'}
                          >
                            {user.enabled ? '⏸️ Disable' : '▶️ Enable'}
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-rose-600 hover:text-rose-900 font-semibold hover:underline transition-colors"
                            title="Delete user"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center p-12">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-6xl">👤</span>
                        <span className="text-gray-500 text-lg">No users found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
  </div>
  {editingUser && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all animate-slideUp">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              <div>
                <h2 className="text-2xl font-bold">Edit User Profile</h2>
                <p className="text-sm text-purple-100">Update user information and role settings</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="Admin">👨‍💼 Admin</option>
                  <option value="Manager">📋 Manager</option>
                  <option value="Vendor">🏪 Vendor</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Warehouse Location</label>
                <input
                  type="text"
                  value={form.warehouseLocation}
                  onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
                  className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="e.g., Building A"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-end gap-3">
            <button onClick={closeEdit} className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all">Cancel</button>
            <button onClick={saveEdit} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
              💾 Save Changes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default UserManagement;
