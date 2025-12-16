import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { getUser, getToken } from '../../utils/auth';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { SkeletonCard } from '../common/Skeleton';

const KPI = ({ label, value, icon, color = 'indigo' }) => {
  const gradients = {
    indigo: 'from-indigo-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-pink-600'
  };
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="mt-3 text-4xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients[color]} shadow-lg`}>
          <span className="text-2xl text-white">{icon}</span>
        </div>
      </div>
      <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${gradients[color]} w-3/4 rounded-full transition-all duration-1000`}></div>
      </div>
    </div>
  );
};

const Section = ({ title, children, action, icon }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{title}</h3>
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'Admin';
  
  const [stats, setStats] = useState({
    totalProducts: null,
    totalVendors: null,
    totalManagers: null,
    activePurchaseOrders: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const token = getToken();
        
        // Load admin stats (open endpoint in backend), ignore auth header if not needed
        try {
          const res = await axios.get(`${config.apiUrl}/stats/admin`);
          setStats(res.data || {});
        } catch (e) {
          // stats endpoint might be protected or unavailable; fall back gracefully
        }

        // Load products for charts/notifications
        const prodRes = await axios.get(`${config.apiUrl}/products`);
        const allProducts = Array.isArray(prodRes.data) ? prodRes.data : [];
        setProducts(allProducts);

        // Filter low stock items
        const lowStock = allProducts.filter(p => 
          Number(p.quantity || 0) <= Number(p.reorderLevel || 0)
        ).slice(0, 5); // Top 5
        setLowStockItems(lowStock);

        // Load recent stock transactions for activity
        try {
          const activityRes = await axios.get(`${config.apiUrl}/stock-transactions/recent`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRecentActivity(activityRes.data?.slice(0, 5) || []); // Top 5
        } catch (e) {
          // Activity endpoint might not exist
          console.log('Recent activity not available');
        }
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Compute inventory breakdown for charts
  const stockBreakdown = useMemo(() => {
    let low = 0, out = 0, ok = 0;
    products.forEach(p => {
      const qty = Number(p.quantity || 0);
      const rl = Number(p.reorderLevel || 0);
      if (qty <= 0) out += 1;
      else if (qty <= rl) low += 1;
      else ok += 1;
    });
    return [
      { name: 'In Stock', value: ok, color: '#16a34a' },
      { name: 'Low', value: low, color: '#f59e0b' },
      { name: 'Out', value: out, color: '#dc2626' },
    ];
  }, [products]);

  const barData = useMemo(() => {
    return stockBreakdown.map(s => ({ label: s.name, count: s.value, color: s.color }));
  }, [stockBreakdown]);

  const fmt = (v, suffix = '') =>
    v === null || v === undefined || loading ? '—' : `${v}${suffix}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl text-white p-10 shadow-2xl mb-8 transform hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl animate-bounce">👨‍💼</span>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">Welcome back, {userName}! 👋</h1>
              <p className="mt-3 text-xl text-indigo-100">Here's your command center overview</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              🎯 Real-time Analytics
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              ⚡ Quick Actions
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              📊 Live Metrics
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Total Products" value={fmt(stats.totalProducts)} icon="📦" color="indigo" />
        <KPI label="Total Vendors" value={fmt(stats.totalVendors)} icon="🏪" color="blue" />
        <KPI label="Total Managers" value={fmt(stats.totalManagers)} icon="👥" color="green" />
        <KPI label="Active Orders" value={fmt(stats.activePurchaseOrders)} icon="🚀" color="amber" />
      </div>

      {error && (
        <div className="mt-6 text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg p-4 shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Section title="Inventory Status" icon="📊">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                      {stockBreakdown.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Section>
            <Section title="Stock Analysis" icon="📈">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="label" stroke="#6b7280" />
                    <YAxis allowDecimals={false} stroke="#6b7280" />
                    <ReTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="count" name="Products" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Tables */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Section title="Latest Activities" icon="⚡">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                      <th className="py-3 pr-4 font-semibold">Type</th>
                      <th className="py-3 pr-4 font-semibold">Product</th>
                      <th className="py-3 pr-4 font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4 text-gray-600">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              activity.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {activity.type === 'IN' ? '📥 IN' : '📤 OUT'}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-900 font-medium">
                            {activity.product?.name || `Product #${activity.productId}`}
                          </td>
                          <td className="py-3 pr-4 text-gray-600">{activity.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-gray-100">
                        <td colSpan="3" className="py-3 pr-4 text-gray-500 text-center">No recent activity</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
            <Section title="Low Stock Alerts" icon="⚠️">
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                      <th className="py-3 pr-4 font-semibold">Product</th>
                      <th className="py-3 pr-4 font-semibold">Qty</th>
                      <th className="py-3 pr-4 font-semibold">Reorder Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 pr-4 text-gray-900 font-medium">{item.name}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              Number(item.quantity) === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-600">{item.reorderLevel}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-t border-gray-100">
                        <td colSpan="3" className="py-3 pr-4 text-gray-500 text-center">✅ All stock levels healthy</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button onClick={() => navigate('/users')} className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2">
          <span>👥</span>
          <span>Manage Users</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button onClick={() => navigate('/inventory')} className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2">
          <span>📦</span>
          <span>Manage Inventory</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button onClick={() => navigate('/ai-restock')} className="group px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2">
          <span>🤖</span>
          <span>AI Auto-Restock</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button onClick={() => navigate('/forecast')} className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2">
          <span>🔮</span>
          <span>Demand Forecasting</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="group px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl shadow hover:shadow-lg hover:border-gray-300 transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <span>📊</span>
          <span>Export Reports</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
