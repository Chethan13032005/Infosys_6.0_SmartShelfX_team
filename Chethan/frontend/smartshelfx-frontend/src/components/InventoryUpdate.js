import React, { useState } from 'react';
import axios from 'axios';

import Alert from './Alert';

const InventoryUpdate = () => {
  const [form, setForm] = useState({ 
    id: '', 
    name: '',
    sku: '',
    category: '', 
    vendor: '',
    reorderLevel: 10,
    quantity: 0, 
    price: 0, 
    supplier: '', 
    location: '',
    imageUrl: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      await axios.put(`/products/update/${form.id}`, { 
        name: form.name,
        sku: form.sku,
        category: form.category,
        vendor: form.vendor,
        reorderLevel: Number(form.reorderLevel),
        quantity: Number(form.quantity),
        price: Number(form.price),
        supplier: form.supplier,
        location: form.location,
        imageUrl: form.imageUrl
      });
      setMessage('Product updated successfully!');
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access denied: Only Admin and Manager can update products.');
      } else if (err.response?.status === 401) {
        setError('Please log in to update products.');
      } else {
        setError('Error: ' + (err.response?.data || err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Update Inventory</h2>
  {error && <Alert type="error" className="mb-4">{error}</Alert>}
  {message && !error && <Alert type="success" className="mb-4">{message}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Product ID</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="id" value={form.id} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">SKU</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="sku" value={form.sku} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="category" value={form.category} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Vendor</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="vendor" value={form.vendor} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Reorder Level</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="reorderLevel" type="number" value={form.reorderLevel} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="quantity" type="number" value={form.quantity} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Supplier</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="supplier" value={form.supplier} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="location" value={form.location} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL (optional)</label>
          <input 
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" 
            name="imageUrl" 
            type="url"
            placeholder="https://example.com/image.jpg"
            value={form.imageUrl} 
            onChange={handleChange} 
          />
          {form.imageUrl && (
            <div className="mt-2">
              <img src={form.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
        <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700" type="submit">Update Product</button>
      </form>
    </div>
  );
};

export default InventoryUpdate;
