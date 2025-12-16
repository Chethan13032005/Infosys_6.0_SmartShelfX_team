import React, { useState } from 'react';
import axios from 'axios';

import Alert from './Alert';

const InventoryDelete = () => {
  const [id, setId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await axios.delete(`/products/delete/${id}`);
      setMessage('Product deleted successfully!');
      setId('');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied: Only Admin can delete products.');
      } else if (err.response?.status === 401) {
        setError('Please log in to delete products.');
      } else {
        setError('Error: ' + (err.response?.data || err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Delete Inventory</h2>
  {error && <Alert type="error" className="mb-4">{error}</Alert>}
  {message && !error && <Alert type="success" className="mb-4">{message}</Alert>}
      <form onSubmit={handleDelete} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Product ID</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="id" value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" type="submit">Delete Product</button>
      </form>
    </div>
  );
};

export default InventoryDelete;
