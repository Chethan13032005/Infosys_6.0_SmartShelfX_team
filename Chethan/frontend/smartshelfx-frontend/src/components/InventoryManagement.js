import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Alert from './Alert';
import Spinner from './Spinner';
import { toast } from 'react-toastify';
import { hasRole } from '../utils/auth';

// Unified Inventory CRUD page (list + create/edit modal + delete)
const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null); // null for new, object for edit
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const emptyForm = {
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
  };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/products');
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const isVendor = hasRole('Vendor');

  const openCreate = () => {
    if (isVendor) {
      toast.warn('Vendors cannot create products');
      return;
    }
    setEditing({ id: null });
    setForm(emptyForm);
  };
  const openEdit = (p) => {
    if (isVendor) {
      toast.warn('Vendors cannot edit products');
      return;
    }
    setEditing(p);
    setForm({
      name: p.name || p.productName || '',
      sku: p.sku || '',
      category: p.category || '',
      vendor: p.vendor || '',
      reorderLevel: p.reorderLevel ?? 10,
      quantity: p.quantity ?? 0,
      price: (p.price?.toString?.() || p.price || 0),
      supplier: p.supplier || '',
      location: p.location || '',
      imageUrl: p.imageUrl || ''
    });
  };
  const closeModal = () => setEditing(null);

  const upsert = async () => {
    try {
      setError('');
      const payload = { ...form };
      // normalize numeric fields
      payload.quantity = Number(payload.quantity || 0);
      payload.reorderLevel = Number(payload.reorderLevel || 0);
      payload.price = Number(payload.price || 0);

      if (!payload.name || !payload.sku) {
        toast.error('Name and SKU are required');
        return;
      }

      if (editing && editing.id) {
        await axios.put(`/products/${editing.id}`, payload);
        toast.success('Product updated');
        setSuccess('Product updated');
      } else {
        await axios.post('/products', payload); // supports POST /api/products in backend
        toast.success('Product created');
        setSuccess('Product created');
      }
      setTimeout(() => setSuccess(''), 2000);
      setEditing(null);
      await load();
    } catch (e) {
      const status = e?.response?.status || 'N/A';
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Request failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error(`Save failed (${status}): ${msg}`);
    }
  };

  const del = async (p) => {
    if (isVendor) {
      toast.warn('Vendors cannot delete products');
      return;
    }
    if (!window.confirm(`Delete ${p.name || p.productName || p.sku}? This cannot be undone.`)) return;
    try {
      await axios.delete(`/products/${p.id}`);
      toast.success('Product deleted');
      await load();
    } catch (e) {
      const status = e?.response?.status || 'N/A';
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Delete failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      toast.error(`Delete failed (${status}): ${msg}`);
    }
  };

  const sortByRecency = (arr) => {
    return [...arr].sort((a, b) => {
      const aDate = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const bDate = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      if (aDate === 0 && bDate === 0) {
        return (b?.id || 0) - (a?.id || 0);
      }
      return bDate - aDate;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q ? items : items.filter(p =>
      (p.name || p.productName || '').toLowerCase().includes(q)
      || (p.sku || '').toLowerCase().includes(q)
      || (p.category || '').toLowerCase().includes(q)
      || (p.vendor || '').toLowerCase().includes(q)
    );
    return sortByRecency(base);
  }, [items, query]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtered]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl text-white p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-5xl">📦</span>
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Inventory Hub</h1>
                <p className="text-lg text-blue-100 mt-2">Manage your entire product catalog in one powerful interface</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 text-xl">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, category, vendor..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>
          {!isVendor && (
          <button onClick={openCreate} className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2 whitespace-nowrap">
            <span className="text-xl">+</span>
            <span>Add Product</span>
            <span className="group-hover:rotate-90 transition-transform">✨</span>
          </button>
          )}
        </div>

        {error && <Alert type="error" className="mb-4 border-l-4 border-rose-500 shadow-sm animate-shake">{error}</Alert>}
        {success && <Alert type="success" className="mb-4 border-l-4 border-green-500 shadow-sm">{success}</Alert>}
        {loading && <Spinner label="Loading products..." />}

        {!loading && (
          <>
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6">
              {paginated && paginated.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginated.map(p => (
                    <div key={p.id} className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name || p.productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e)=> { e.currentTarget.style.display='none'; }} />
                        ) : (
                          <span className="text-8xl text-gray-300">🖼️</span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={p.name || p.productName}>{p.name || p.productName}</h3>
                        <p className="text-xs text-gray-500 mb-2">SKU: <span className="font-semibold text-gray-700">{p.sku}</span></p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold text-indigo-600">₹{p.price}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            p.quantity <= 0 ? 'bg-rose-100 text-rose-800' : 
                            p.quantity <= (p.reorderLevel || 0) ? 'bg-amber-100 text-amber-800' : 
                            'bg-green-100 text-green-800'
                          }`}>Stock: {p.quantity}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mb-3">
                          {p.category && <p>📁 {p.category}</p>}
                          {p.vendor && <p>🏪 {p.vendor}</p>}
                          {p.location && <p>📍 {p.location}</p>}
                          {p.supplier && <p>🚚 {p.supplier}</p>}
                          <p>⚠️ Reorder at: {p.reorderLevel}</p>
                        </div>
                        {!isVendor ? (
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(p)} className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors">✏️ Edit</button>
                            <button onClick={() => del(p)} className="flex-1 px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-colors">🗑️ Delete</button>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 font-medium">Vendor view: edit/delete disabled</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-6xl">📭</span>
                    <span className="text-gray-500 text-lg">No products found</span>
                  </div>
                </div>
              )}
            </div>
            {filtered.length > pageSize && (
              <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-4">
                <span className="text-sm text-gray-600">Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} products</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-indigo-700 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    ◀ Prev 10
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => (p * pageSize < filtered.length ? p + 1 : p))}
                    disabled={currentPage * pageSize >= filtered.length}
                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${currentPage * pageSize >= filtered.length ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-indigo-700 border-indigo-200 hover:bg-indigo-50'}`}
                  >
                    Next 10 ▶
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl transform transition-all animate-slideUp">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{editing.id ? '✏️' : '➕'}</span>
                <div>
                  <h2 className="text-2xl font-bold">{editing.id ? 'Edit Product' : 'Add New Product'}</h2>
                  <p className="text-sm text-indigo-100">{editing.id ? 'Update product details below' : 'Fill in the details to create a new product'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.name} onChange={(e)=> setForm({ ...form, name: e.target.value })} placeholder="e.g., Premium Widget" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SKU *</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.sku} onChange={(e)=> setForm({ ...form, sku: e.target.value })} placeholder="e.g., WDG-001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.category} onChange={(e)=> setForm({ ...form, category: e.target.value })} placeholder="e.g., Electronics" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.vendor} onChange={(e)=> setForm({ ...form, vendor: e.target.value })} placeholder="e.g., Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reorder Level</label>
                  <input type="number" className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.reorderLevel} onChange={(e)=> setForm({ ...form, reorderLevel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input type="number" className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.quantity} onChange={(e)=> setForm({ ...form, quantity: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input type="number" step="0.01" className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.price} onChange={(e)=> setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.supplier} onChange={(e)=> setForm({ ...form, supplier: e.target.value })} placeholder="e.g., GlobalSupply Inc" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.location} onChange={(e)=> setForm({ ...form, location: e.target.value })} placeholder="e.g., Warehouse A, Shelf 3" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                  <input type="url" className="block w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" value={form.imageUrl} onChange={(e)=> setForm({ ...form, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
                  {form.imageUrl && (
                    <div className="mt-3 flex justify-center">
                      <img src={form.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-xl shadow-lg border-4 border-gray-100" onError={(e)=> e.currentTarget.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-3xl flex justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-all">Cancel</button>
              <button onClick={upsert} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                {editing.id ? '💾 Save Changes' : '✨ Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryManagement;
