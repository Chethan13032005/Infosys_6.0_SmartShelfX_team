import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole, OrderStatus } from '../types';
import { Search, Filter, Truck, Check, X, Clock, PackageCheck } from 'lucide-react';

export const Orders: React.FC = () => {
  const { orders, updateOrderStatus, user } = useInventory();
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Logic: 
  // Vendors only see orders where the 'vendor' field matches their name/company (simulated by checking if the order vendor name partially matches user name or simply show all for demo purposes if specific mapping isn't set)
  // For this demo, if role is VENDOR, we filter by orders where Vendor Name contains "TechSolutions" or "Comfort" etc.
  // Ideally user.companyId would map to order.vendorId
  
  const filteredOrders = orders.filter(o => {
    // Search Filter
    const matchesSearch = o.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    // Role Visibility
    let matchesRole = true;
    if (user?.role === UserRole.VENDOR) {
       // Simple fuzzy match for demo: If user name is "TechSolutions Rep", they see orders for "TechSolutions Inc"
       matchesRole = o.vendor.toLowerCase().includes(user.name.split(' ')[0].toLowerCase());
    }

    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    if (confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateOrderStatus(id, newStatus);
      if (newStatus === 'DELIVERED') {
        notify('Order delivered! Stock updated automatically.', 'success');
      } else {
        notify(`Order status updated to ${newStatus}`, 'success');
      }
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1"><Clock size={12}/> Pending</span>;
      case 'APPROVED': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1"><Check size={12}/> Approved</span>;
      case 'SHIPPED': return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1"><Truck size={12}/> Shipped</span>;
      case 'DELIVERED': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1"><PackageCheck size={12}/> Delivered</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1"><X size={12}/> Cancelled</span>;
      default: return null;
    }
  };

  const isVendor = user?.role === UserRole.VENDOR;
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Purchase Orders</h2>
          <p className="text-gray-500 text-sm mt-1">Track and manage vendor supplies</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search Order ID or Product..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-indigo-600">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-800">{order.productName}</div>
                  <div className="text-xs text-gray-500">Qty: {order.quantity} | Total: ${order.totalCost}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{order.vendor}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{order.createdAt}</td>
                <td className="px-6 py-4">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2">
                     
                     {/* Vendor Actions */}
                     {isVendor && order.status === 'PENDING' && (
                       <button onClick={() => handleStatusChange(order.id, 'APPROVED')} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 border border-blue-200">
                         Approve
                       </button>
                     )}
                     {isVendor && order.status === 'APPROVED' && (
                       <button onClick={() => handleStatusChange(order.id, 'SHIPPED')} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100 border border-indigo-200">
                         Ship Order
                       </button>
                     )}

                     {/* Admin/Manager Actions */}
                     {isAdmin && order.status === 'SHIPPED' && (
                       <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 border border-green-200">
                         Receive (Stock In)
                       </button>
                     )}
                     
                     {/* Cancel Action (Admin/Manager usually, or Vendor if Pending) */}
                     {order.status === 'PENDING' && (
                       <button onClick={() => handleStatusChange(order.id, 'CANCELLED')} className="text-gray-400 hover:text-red-500 transition-colors">
                         <X size={18} />
                       </button>
                     )}

                     {order.status === 'DELIVERED' && (
                       <span className="text-xs text-gray-400 italic">Completed</span>
                     )}
                   </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};