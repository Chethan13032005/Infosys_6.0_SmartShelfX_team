import React, { useState } from 'react';
import axios from 'axios';
import Alert from './Alert';
import { toast } from 'react-toastify';
import AuthDebug from './AuthDebug';

const InventoryCreate = () => {
  const [form, setForm] = useState({ 
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
      const response = await axios.post(`/products/add`, form);
      setMessage('Product added successfully!');
      toast.success('Product added successfully');
      setForm({ name: '', sku: '', category: '', vendor: '', reorderLevel: 10, quantity: 0, price: 0, supplier: '', location: '', imageUrl: '' });
      console.log('Created product:', response.data);
    } catch (err) {
      // Show actual backend error message
      console.error('Full error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      // Extract the most useful error message
  let errorMsg = 'Unknown error';
      if (err.response?.data) {
        // If backend returned a string message
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } 
        // If backend returned an object with message property
        else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        }
        // If backend returned an object, stringify it
        else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      const status = err.response?.status || 'N/A';
      setError(`Error: ${errorMsg} (Status: ${status})`);
      toast.error(`Add failed (${status}): ${errorMsg}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <AuthDebug />
      <h2 className="text-xl font-semibold mb-4">Add Inventory</h2>
  {error && <Alert type="error" className="mb-4">{error}</Alert>}
  {message && !error && <Alert type="success" className="mb-4">{message}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Product Name</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">SKU</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="sku" value={form.sku} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="category" value={form.category} onChange={handleChange} required />
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
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Price (₹)</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Supplier</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="supplier" value={form.supplier} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 border" name="location" value={form.location} onChange={handleChange} required />
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
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default InventoryCreate;
