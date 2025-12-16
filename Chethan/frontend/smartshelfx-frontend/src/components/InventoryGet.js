import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const InventoryGet = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [lowStockItems, setLowStockItems] = useState([]);
  const [filters, setFilters] = useState({ category: 'All', vendor: 'All', stock: 'All' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
  const res = await axios.get(`/products/view`);
      setItems(res.data);
      
      // Filter low stock items (quantity <= 10)
  const lowStock = res.data.filter(item => (item.reorderLevel ? item.quantity <= item.reorderLevel : item.quantity <= 10));
      setLowStockItems(lowStock);
      
      setError('');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) {
        setError('Please log in to view inventory.');
      } else if (status === 403) {
        setError('You do not have permission to view inventory.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch items');
      }
    }
  };

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))], [items]);
  const vendors = useMemo(() => ['All', ...Array.from(new Set(items.map(i => i.vendor || i.supplier).filter(Boolean)))], [items]);



  const onCsvSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = (results.data || []).map(r => ({
            name: (r.name || r.productName || '').trim(),
            sku: (r.sku || '').trim(),
            category: (r.category || '').trim(),
            vendor: (r.vendor || r.supplier || '').trim(),
            supplier: (r.supplier || r.vendor || '').trim(),
            reorderLevel: r.reorderLevel ? Number(r.reorderLevel) : 10,
            quantity: r.quantity ? Number(r.quantity) : 0,
            price: r.price ? Number(r.price) : 0,
            location: (r.location || '').trim(),
            imageUrl: (r.imageUrl || '').trim()
          })).filter(r => r.name && r.sku);
          if (!rows.length) {
            setError('No valid rows found in CSV. Ensure at least name and sku columns are present.');
            setUploading(false);
            return;
          }
          await axios.post('/products/batch-import', rows);
          await fetchItems();
        } catch (err) {
          setError(err.response?.data || err.message || 'Failed to import CSV');
        } finally {
          setUploading(false);
          e.target.value = '';
        }
      },
      error: (err) => {
        setError('CSV parse error: ' + err.message);
        setUploading(false);
      }
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <select className="border rounded px-2 py-1" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="border rounded px-2 py-1" value={filters.vendor} onChange={e => setFilters(f => ({ ...f, vendor: e.target.value }))}>
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="border rounded px-2 py-1" value={filters.stock} onChange={e => setFilters(f => ({ ...f, stock: e.target.value }))}>
              {['All', 'In', 'Low', 'Out'].map(s => <option key={s} value={s}>{s} Stock</option>)}
            </select>
          </div>
          <label className="px-3 py-2 bg-indigo-600 text-white rounded cursor-pointer hover:bg-indigo-700">
            {uploading ? 'Importing…' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={onCsvSelected} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
      
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Low Stock Alert</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p className="mb-2">⚠️ {lowStockItems.length} product{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock (≤ 10 units):</p>
                <ul className="list-disc list-inside space-y-1">
                  {lowStockItems.slice(0, 5).map(item => (
                    <li key={item.id}>
                      <span className="font-semibold">{item.name}</span> - Only {item.quantity} unit{item.quantity !== 1 ? 's' : ''} left
                    </li>
                  ))}
                  {lowStockItems.length > 5 && (
                    <li className="text-yellow-600 italic">...and {lowStockItems.length - 5} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reorder Level</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items && items.length ? (
                    items.map((it) => (
                      <tr key={it.id} className={`hover:bg-gray-50 ${it.quantity <= 10 ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.name} className="h-12 w-12 object-cover rounded" onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image' }} />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{it.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{it.sku || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{it.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          { (it.reorderLevel ? it.quantity <= it.reorderLevel : it.quantity <= 10) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ⚠️ {it.quantity}
                            </span>
                          ) : (
                            <span className="text-gray-500">{it.quantity}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{it.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.vendor || it.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.reorderLevel ?? 10}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.createdBy || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{it.updatedBy || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{it.createdAt ? new Date(it.createdAt).toLocaleString() : 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-gray-500">
                        <p>No products found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryGet;
