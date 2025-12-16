import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { getToken, getUserRole } from '../utils/auth';
import { toast } from 'react-toastify';

const PurchaseOrderModal = ({ isOpen, onClose, items }) => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      const initialQuantities = {};
      items.forEach(item => {
        // Use the reorderQuantity (modified quantity from AI Restock) if available, otherwise fallback
        const defaultQty = item.reorderQuantity || (item.reorderLevel && item.reorderLevel > 0) 
          ? item.reorderLevel * 2 
          : 10;
        initialQuantities[item.id] = defaultQty;
      });
      setItemQuantities(initialQuantities);
    }
  }, [isOpen, items]);

  const fetchVendors = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${config.apiUrl}/users/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data);
      if (res.data.length > 0) {
        // Store the first vendor's email as selected
        setSelectedVendor(res.data[0].email);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to fetch vendors');
      toast.error('Failed to load vendors');
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    setItemQuantities(prev => ({ ...prev, [itemId]: quantity }));
  };

  const handleCreate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const role = (getUserRole() || '').toLowerCase();
      const canCreate = role === 'manager' || role === 'admin';
      if (!canCreate) {
        toast.error('Only Managers or Admins can create purchase orders');
        setIsLoading(false);
        return;
      }
      const token = getToken();
      
      // Validate inputs
      if (!selectedVendor) {
        toast.error('Please select a vendor');
        setIsLoading(false);
        return;
      }

      const items = Object.keys(itemQuantities).map(itemId => ({
        productId: parseInt(itemId, 10),
        quantity: parseInt(itemQuantities[itemId], 10) || 1,
      }));

      if (items.length === 0) {
        toast.error('No items selected');
        setIsLoading(false);
        return;
      }

      const payload = {
        vendorEmail: selectedVendor,
        items: items
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${config.apiUrl}/purchase-orders/batch`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response:', response.data);
      toast.success('Purchase orders created successfully!');
      onClose();
    } catch (err) {
      console.error('Error creating purchase orders:', err);
      console.error('Error response:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create purchase order';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Create Purchase Order</h3>
            { (getUserRole() || '').toLowerCase() !== 'manager' && (getUserRole() || '').toLowerCase() !== 'admin' && (
              <p className="mt-2 text-sm text-red-600">You do not have permission to create orders.</p>
            )}
            <div className="mt-4">
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
              <select
                id="vendor"
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {vendors.map(vendor => (
                  <option key={vendor.email} value={vendor.email}>{vendor.fullName || vendor.email}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Items:</p>
              <ul className="mt-2 space-y-2">
                {items.map(item => (
                  <li key={item.id} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <input
                      type="number"
                      min="1"
                      value={itemQuantities[item.id] || ''}
                      onChange={e => handleQuantityChange(item.id, parseInt(e.target.value, 10))}
                      className="w-20 text-center border-gray-300 rounded-md"
                    />
                  </li>
                ))}
              </ul>
            </div>
            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
