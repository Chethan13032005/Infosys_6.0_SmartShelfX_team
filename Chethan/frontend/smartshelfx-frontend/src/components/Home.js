import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from './Alert';
import Spinner from './Spinner';
import './Responsive.css';

const Home = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const quickLinks = [
    { title: 'View Inventory', description: 'Browse all products and stock levels', action: '/view', color: 'from-blue-500 to-indigo-600' },
    { title: 'Add Product', description: 'Create a new inventory item', action: '/add', color: 'from-emerald-500 to-teal-600' },
    { title: 'Update Product', description: 'Modify existing product details', action: '/update', color: 'from-amber-500 to-orange-600' },
    { title: 'Delete Product', description: 'Remove a product from inventory', action: '/delete', color: 'from-rose-500 to-red-600' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const authed = Boolean(token);
    setIsAuthenticated(authed);
    if (authed) {
      fetchInventory();
    } else {
      // Public home: don't fetch protected data
      setLoading(false);
    }
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/view`);
      setItems(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load inventory');
    } finally { setLoading(false); }
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const name = user.fullName || user.email || 'User';
  const [stats, setStats] = useState({ totalProducts: '—', lowStock: '—', suppliers: '—' });
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      axios.get('/stats')
        .then((res) => setStats({
          totalProducts: res.data?.totalProducts ?? '0',
          lowStock: res.data?.lowStock ?? '0',
          suppliers: res.data?.suppliers ?? '0',
        }))
        .catch(() => {});
      
      // Fetch low stock items
      axios.get('/view')
        .then((res) => {
          const lowStock = res.data.filter(item => item.quantity <= 10);
          setLowStockItems(lowStock);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const renderPublicHome = () => (
    <div className="home-public-container">
        <h1 className="home-public-title">Welcome to SmartShelfX</h1>
        <p className="home-public-subtitle">AI-Powered Inventory Management to streamline your business operations, reduce waste, and improve your bottom line.</p>
        <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-3 rounded-md bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition"
            >
              Learn More
            </button>
        </div>
        <div className="home-public-features">
            <div className="feature-card">
                <h3 className="feature-card-title">Real-Time Inventory Tracking</h3>
                <p className="feature-card-description">Monitor your stock levels in real-time, so you always know what you have and what you need.</p>
            </div>
            <div className="feature-card">
                <h3 className="feature-card-title">AI-Powered Demand Forecasting</h3>
                <p className="feature-card-description">Leverage our predictive analytics to forecast demand and optimize your inventory levels.</p>
            </div>
            <div className="feature-card">
                <h3 className="feature-card-title">Automated Reordering</h3>
                <p className="feature-card-description">Set up automated reordering to ensure you never run out of your most popular items.</p>
            </div>
        </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {!isAuthenticated ? renderPublicHome() : (
        <>
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl text-white p-8 shadow">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {`Welcome back, ${name}`}
            </h1>
            <p className="mt-2 text-indigo-100">Manage your inventory, forecast demand, and keep shelves restocked—effortlessly.</p>
          </div>

            {/* Low Stock Alert Banner */}
            {lowStockItems.length > 0 && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700 font-medium">
                      ⚠️ Low Stock Alert: {lowStockItems.length} product{lowStockItems.length > 1 ? 's' : ''} running low!
                    </p>
                    <div className="mt-2 text-sm text-yellow-600">
                      <ul className="list-disc list-inside space-y-1">
                        {lowStockItems.slice(0, 5).map((item) => (
                          <li key={item.id}>
                            <span className="font-medium">{item.name}</span> - Only {item.quantity} units left
                          </li>
                        ))}
                        {lowStockItems.length > 5 && (
                          <li className="text-yellow-700 font-medium">
                            and {lowStockItems.length - 5} more item{lowStockItems.length - 5 > 1 ? 's' : ''}...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Low Stock Alerts</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500">Suppliers</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.suppliers}</p>
              </div>
            </div>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickLinks.map((q) => (
                <button
                  key={q.title}
                  onClick={() => navigate(q.action)}
                  className={`text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${q.color} text-white flex items-center justify-center shadow-md`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{q.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{q.description}</p>
                </button>
              ))}
            </div>
            {error && <Alert type="error" className="mb-4">{error}</Alert>}
            {loading && <Spinner label="Loading products..." />}
            <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items && items.length ? (
                    items.map((it) => (
                      <tr key={it.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{it.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{it.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{it.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{it.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{it.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{it.supplier}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{it.location}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center p-6 text-gray-500">No items found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;