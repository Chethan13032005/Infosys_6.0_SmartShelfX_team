import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';
import { getToken } from '../utils/auth';

const PurchaseOrderCreate = () => {
  const [form, setForm] = useState({
    vendorId: '',
    productId: '',
    quantity: '',
    deliveryDate: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // ✅ KEEP ONLY THESE — the originals
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);

  const [createdPO, setCreatedPO] = useState(null);

  // -------------------------------------------
  // 🔥 FIRST USEEFFECT: Fetch vendors/products from API
  // -------------------------------------------
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const token = getToken();
        const [vRes, pRes] = await Promise.all([
          axios.get(`${config.apiUrl}/users/vendors`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${config.apiUrl}/products`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setVendors(Array.isArray(vRes.data) ? vRes.data : []);
        setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      } catch (e) {
        // Permission fallback: vendor list won't load for normal users
        setVendors([]);
      }
    };

    fetchLists();
  }, []);

  // -------------------------------------------
  // 🔥 SECOND USEEFFECT: Fallback fetch (view/users endpoints)
  // -------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken();
        const pRes = await axios.get(`${config.apiUrl}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(Array.isArray(pRes.data) ? pRes.data : []);
      } catch (e) {}

      try {
        const token = getToken();
        const uRes = await axios.get(`${config.apiUrl}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const list = Array.isArray(uRes.data) ? uRes.data : [];
        setVendors(list.filter(u => (u.role || '').toLowerCase() === 'vendor'));
      } catch (e) {}
    };

    loadData();
  }, []);

  const setField = (key, val) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const submit = async e => {
    e.preventDefault();

    if (!form.vendorId || !form.productId || !form.quantity) {
      toast.error('Vendor ID, Product ID, and Quantity are required');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        vendorId: Number(form.vendorId),
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        deliveryDate: form.deliveryDate || undefined,
        notes: form.notes || undefined
      };

      const token = getToken();
      const res = await axios.post(`${config.apiUrl}/purchase-orders`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Purchase Order created');

      setForm({
        vendorId: '',
        productId: '',
        quantity: '',
        deliveryDate: '',
        notes: ''
      });

      if (res?.data?.purchaseOrder) {
        setCreatedPO(res.data.purchaseOrder);
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err.message;
      toast.error(`Failed to create PO: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create Purchase Order</h1>
        <p className="mt-1 text-emerald-100">
          Manually create a PO by specifying vendor, product, and quantity.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-w-2xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Vendor
            </label>
            {vendors.length > 0 ? (
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.vendorId}
                onChange={e => setField('vendorId', e.target.value)}
              >
                <option value="">Select a vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.fullName || v.name || v.email} (#{v.id})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="mt-1 w-full border rounded-md p-2"
                value={form.vendorId}
                onChange={e => setField('vendorId', e.target.value)}
                placeholder="Vendor ID (permission needed to list)"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Admin/Manager can list vendors. Others must enter ID manually.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product
            </label>
            {products.length > 0 ? (
              <select
                className="mt-1 w-full border rounded-md p-2"
                value={form.productId}
                onChange={e => setField('productId', e.target.value)}
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.sku || p.id} — {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="mt-1 w-full border rounded-md p-2"
                value={form.productId}
                onChange={e => setField('productId', e.target.value)}
                placeholder="Product ID"
              />
            )}
            <p className="text-xs text-gray-500 mt-1">
              Products are listed from /api/products.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              className="mt-1 w-full border rounded-md p-2"
              value={form.quantity}
              onChange={e => setField('quantity', e.target.value)}
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Date (optional)
            </label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-md p-2"
              value={form.deliveryDate}
              onChange={e => setField('deliveryDate', e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <textarea
            className="mt-1 w-full border rounded-md p-2"
            rows={3}
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Any additional info"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading
                ? 'bg-gray-400'
                : 'bg-emerald-600 hover:bg-emerald-700'
            } transition`}
          >
            {loading ? 'Creating...' : 'Create PO'}
          </button>
          <a
            href="/purchase-orders"
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            View POs
          </a>
        </div>
      </form>

      {createdPO && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-gray-100 max-w-2xl">
          <h2 className="text-lg font-semibold text-gray-900">
            Created PO Details
          </h2>
          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <p>
              <span className="font-medium">ID:</span> {createdPO.id}
            </p>
            <p>
              <span className="font-medium">Product:</span>{' '}
              {createdPO.productName} (ID #{createdPO.productId})
            </p>
            <p>
              <span className="font-medium">Vendor Email:</span>{' '}
              {createdPO.vendorEmail} (Vendor ID #{createdPO.vendorId})
            </p>
            <p>
              <span className="font-medium">Quantity:</span>{' '}
              {createdPO.quantity}
            </p>
            <p>
              <span className="font-medium">Status:</span>{' '}
              {createdPO.status}
            </p>
            {createdPO.deliveryDate && (
              <p>
                <span className="font-medium">Delivery Date:</span>{' '}
                {new Date(createdPO.deliveryDate).toLocaleString()}
              </p>
            )}
          </div>
          <div className="mt-4">
            <a
              href="/purchase-orders"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Go to Purchase Orders
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderCreate;
