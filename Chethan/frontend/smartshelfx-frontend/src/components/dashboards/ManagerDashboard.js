import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { getUser, getToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const KPI = ({ label, value, icon, color = 'emerald' }) => {
  const gradients = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600',
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
        <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{title}</h3>
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'Manager';
  
  const [stats, setStats] = useState({
    totalSKUs: null,
    lowStockItems: null,
    pendingPurchaseOrders: null,
    stockValue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({});
  const [products, setProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [poPage, setPoPage] = useState(1);
  const [txnPage, setTxnPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${config.apiUrl}/stats/manager`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setStats(res.data || {});
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    const fetchPurchaseOrders = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${config.apiUrl}/purchase-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPurchaseOrders(response.data); // Show all orders
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };

    const fetchInventory = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/products`);
        const allProducts = Array.isArray(response.data) ? response.data : [];
        // Filter low stock items
        const lowStock = allProducts.filter(p => 
          Number(p.quantity || 0) <= Number(p.reorderLevel || 0)
        ).slice(0, 5); // Top 5
        setProducts(lowStock);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    const fetchRecentTransactions = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${config.apiUrl}/stock-transactions/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentTransactions(response.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const fetchForecast = async () => {
      try {
        const token = getToken();
        const response = await axios.get(`${config.apiUrl}/forecast/predictions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && Array.isArray(response.data)) {
          setForecastData(response.data.slice(0, 7)); // 7-day forecast
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
      }
    };

    fetchStats();
    fetchPurchaseOrders();
    fetchInventory();
    fetchRecentTransactions();
    fetchForecast();
  }, []);

  const fmt = (v, suffix = '') =>
    v === null || v === undefined || loading ? '—' : `${v}${suffix}`;

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

  const paginate = (arr, page) => {
    const start = (page - 1) * pageSize;
    return arr.slice(start, start + pageSize);
  };

  useEffect(() => {
    setPoPage(1);
  }, [purchaseOrders]);

  useEffect(() => {
    setTxnPage(1);
  }, [recentTransactions]);

  const openActionModal = (po, action) => {
    setSelectedPO(po);
    setActionType(action);
    setActionData({});
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedPO) return;
    if (actionType === 'reject' && !actionData.reason) {
      toast.warning('Please provide a rejection reason');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      let endpoint = '';

      switch (actionType) {
        case 'approve':
          endpoint = `/purchase-orders/${selectedPO.id}/approve`;
          await axios.put(`${config.apiUrl}${endpoint}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'reject':
          endpoint = `/purchase-orders/${selectedPO.id}/reject`;
          await axios.put(`${config.apiUrl}${endpoint}`, { reason: actionData.reason }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        case 'complete':
          endpoint = `/purchase-orders/${selectedPO.id}/complete`;
          await axios.put(`${config.apiUrl}${endpoint}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          break;
        default:
          return;
      }

      toast.success(`Purchase Order ${actionType}d successfully!`);
      setShowActionModal(false);
      setSelectedPO(null);
      setActionData({});
      
      // Refresh PO list
      const response = await axios.get(`${config.apiUrl}/purchase-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPurchaseOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data || `Error ${actionType}ing purchase order`);
    } finally {
      setLoading(false);
    }
  };

  const canPerformAction = (po, action) => {
    if (action === 'approve') {
      return po.status === 'PENDING';
    }
    if (action === 'reject') {
      return po.status === 'PENDING' || po.status === 'APPROVED';
    }
    if (action === 'complete') {
      return po.status === 'DISPATCHED';
    }
    return false;
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-purple-100 text-purple-800',
      'DISPATCHED': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl text-white p-10 shadow-2xl mb-8 transform hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl animate-bounce">📋</span>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">Welcome, {userName}! 👋</h1>
              <p className="mt-3 text-xl text-emerald-100">Your warehouse management dashboard</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              📦 Stock Management
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              ⚡ Quick Actions
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              🎯 Restock Alerts
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Total SKUs" value={fmt(stats.totalSKUs)} icon="📦" color="emerald" />
        <KPI label="Low Stock Items" value={fmt(stats.lowStockItems)} icon="⚠️" color="amber" />
        <KPI label="Pending Orders" value={fmt(stats.pendingPurchaseOrders)} icon="📋" color="blue" />
        <KPI label="Stock Value" value={fmt(stats.stockValue, '₹')} icon="💰" color="emerald" />
      </div>

      {error && (
        <div className="mt-6 text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg p-4 shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tables */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section 
          title="Purchase Orders" 
          icon="📋"
          action={
            <button 
              onClick={() => navigate('/purchase-orders')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View All →
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                  <th className="py-3 pr-4 font-semibold">PO No</th>
                  <th className="py-3 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Qty</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr className="border-t border-gray-100">
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📦</span>
                        <span>No purchase orders yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginate(sortByRecency(purchaseOrders), poPage).map((po) => (
                    <tr key={po.id} className="border-t border-gray-100 hover:bg-emerald-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-900 font-medium">#{po.id}</td>
                      <td className="py-3 pr-4 text-gray-600">{po.productName || 'Unknown'}</td>
                      <td className="py-3 pr-4 text-gray-600">{po.quantity}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {po.status === 'COMPLETED' || po.status === 'REJECTED' ? (
                          <span className="text-xs text-gray-500 italic">No actions available</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button 
                              onClick={() => openActionModal(po, 'approve')}
                              disabled={!canPerformAction(po, 'approve')}
                              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                canPerformAction(po, 'approve')
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              onClick={() => openActionModal(po, 'reject')}
                              disabled={!canPerformAction(po, 'reject')}
                              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                canPerformAction(po, 'reject')
                                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:shadow-md cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              ❌ Reject
                            </button>
                            <button 
                              onClick={() => openActionModal(po, 'complete')}
                              disabled={!canPerformAction(po, 'complete')}
                              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                canPerformAction(po, 'complete')
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-md cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              🏁 Complete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {purchaseOrders.length > pageSize && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-600">
                <span>Showing {((poPage - 1) * pageSize) + 1}-{Math.min(poPage * pageSize, purchaseOrders.length)} of {purchaseOrders.length}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPoPage((p) => Math.max(1, p - 1))}
                    disabled={poPage === 1}
                    className={`px-3 py-1 rounded-lg border ${poPage === 1 ? 'text-gray-300 border-gray-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    ◀ Prev 10
                  </button>
                  <button
                    onClick={() => setPoPage((p) => (p * pageSize < purchaseOrders.length ? p + 1 : p))}
                    disabled={poPage * pageSize >= purchaseOrders.length}
                    className={`px-3 py-1 rounded-lg border ${poPage * pageSize >= purchaseOrders.length ? 'text-gray-300 border-gray-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    Next 10 ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>
        <Section title="Inventory Overview" icon="📊">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                  <th className="py-3 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Stock</th>
                  <th className="py-3 pr-4 font-semibold">Reorder</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-emerald-50 transition-colors">
                      <td className="py-3 pr-4 text-gray-900 font-medium">{item.name || item.productName}</td>
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
      </div>

      {/* Charts */}
      <div className="mt-8">
        <Section title="Recent Transactions" icon="📝">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b-2 border-gray-200">
                  <th className="py-3 pr-4 font-semibold">Type</th>
                  <th className="py-3 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Qty</th>
                  <th className="py-3 pr-4 font-semibold">By</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length > 0 ? (
                  paginate(sortByRecency(recentTransactions), txnPage).map((txn, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-emerald-50 transition-colors">
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          txn.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {txn.type === 'IN' ? '📥 IN' : '📤 OUT'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-900 font-medium">
                        {txn.product?.name || `Product #${txn.productId}`}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{txn.quantity}</td>
                      <td className="py-3 pr-4 text-gray-600 text-xs">{txn.performedBy?.split('@')[0] || 'System'}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-gray-100">
                    <td colSpan="4" className="py-3 pr-4 text-gray-500 text-center">No recent transactions</td>
                  </tr>
                )}
              </tbody>
            </table>
            {recentTransactions.length > pageSize && (
              <div className="flex items-center justify-between pt-3 text-xs text-gray-600">
                <span>Showing {((txnPage - 1) * pageSize) + 1}-{Math.min(txnPage * pageSize, recentTransactions.length)} of {recentTransactions.length}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                    disabled={txnPage === 1}
                    className={`px-3 py-1 rounded-lg border ${txnPage === 1 ? 'text-gray-300 border-gray-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    ◀ Prev 10
                  </button>
                  <button
                    onClick={() => setTxnPage((p) => (p * pageSize < recentTransactions.length ? p + 1 : p))}
                    disabled={txnPage * pageSize >= recentTransactions.length}
                    className={`px-3 py-1 rounded-lg border ${txnPage * pageSize >= recentTransactions.length ? 'text-gray-300 border-gray-200' : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}
                  >
                    Next 10 ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      <div className="mt-8">
        <Section 
          title="AI Demand Forecast" 
          icon="📈"
          action={
            forecastData.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                  {forecastData.length} Days Forecast
                </span>
              </div>
            )
          }
        >
          {forecastData.length > 0 ? (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <div className="bg-white rounded-lg shadow-sm p-4" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={forecastData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      tickLine={{ stroke: '#9ca3af' }}
                      axisLine={{ stroke: '#9ca3af' }}
                      padding={{ left: 10, right: 10 }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                      tickLine={{ stroke: '#9ca3af' }}
                      axisLine={{ stroke: '#9ca3af' }}
                      label={{ 
                        value: 'Demand Units', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { fill: '#374151', fontSize: 14, fontWeight: 600 }
                      }}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '2px solid #10b981', 
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{
                        color: '#111827',
                        fontWeight: 600,
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                      itemStyle={{
                        color: '#6b7280',
                        fontSize: '13px',
                        fontWeight: 500,
                        padding: '4px 0'
                      }}
                      cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                      iconType="line"
                      iconSize={20}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predictedDemand" 
                      name="AI Predicted Demand"
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ 
                        fill: '#10b981', 
                        r: 5,
                        strokeWidth: 2,
                        stroke: '#fff'
                      }}
                      activeDot={{ 
                        r: 8,
                        fill: '#10b981',
                        stroke: '#fff',
                        strokeWidth: 3
                      }}
                      fill="url(#colorPredicted)"
                    />
                    {forecastData[0]?.actualDemand !== undefined && (
                      <Line 
                        type="monotone" 
                        dataKey="actualDemand" 
                        name="Actual Demand"
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ 
                          fill: '#3b82f6', 
                          r: 5,
                          strokeWidth: 2,
                          stroke: '#fff'
                        }}
                        activeDot={{ 
                          r: 8,
                          fill: '#3b82f6',
                          stroke: '#fff',
                          strokeWidth: 3
                        }}
                        fill="url(#colorActual)"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Info Footer */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-600">AI-Powered Predictions based on historical data</span>
                </div>
                {forecastData[0]?.actualDemand !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Historical actual demand</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-dashed border-emerald-200">
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                  <span className="text-4xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Forecast Data Available</h3>
                <p className="text-gray-500 max-w-md">
                  Forecast data will appear here once there's sufficient historical transaction data to analyze.
                </p>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button 
          onClick={() => navigate('/inventory')}
          className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer">
          <span>➕</span>
          <span>Add Product</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button 
          onClick={() => navigate('/purchase-orders/create')}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer">
          <span>📋</span>
          <span>Create Purchase Order</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <button 
          onClick={() => navigate('/purchase-orders')}
          className="group px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold flex items-center gap-2 cursor-pointer">
          <span>✅</span>
          <span>Approve Restock</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-600 capitalize">
                {actionType === 'approve' ? '✅' : actionType === 'reject' ? '❌' : '🏁'} {actionType} Purchase Order
              </h2>
              <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl">
                <p className="text-sm text-gray-600">PO Number: <span className="font-semibold text-gray-900">#{selectedPO.id}</span></p>
                <p className="text-sm text-gray-600">Product: <span className="font-semibold text-gray-900">{selectedPO.productName}</span></p>
                <p className="text-sm text-gray-600">Quantity: <span className="font-semibold text-gray-900">{selectedPO.quantity}</span></p>
              </div>

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <textarea
                    value={actionData.reason || ''}
                    onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows="3"
                    placeholder="Enter reason for rejection..."
                  />
                </div>
              )}

              {actionType === 'approve' && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-800">This will notify the vendor to accept and process the order.</p>
                </div>
              )}

              {actionType === 'complete' && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-800">This will mark the purchase order as completed.</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={actionType === 'reject' && !actionData.reason}
                  className={`flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all ${
                    actionType === 'reject' && !actionData.reason
                      ? 'bg-gray-400 cursor-not-allowed'
                      : actionType === 'approve'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg'
                      : actionType === 'reject'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg'
                  }`}
                >
                  Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
