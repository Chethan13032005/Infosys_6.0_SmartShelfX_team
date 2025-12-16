import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { getUser, getToken } from '../../utils/auth';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const KPI = ({ label, value, icon, color = 'amber' }) => {
  const gradients = {
    amber: 'from-amber-500 to-orange-600',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600'
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
        <h3 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{title}</h3>
      </div>
      {action}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const VendorDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.fullName || user?.firstName || user?.email?.split('@')[0] || 'Vendor';
  
  const [stats, setStats] = useState({
    pendingOrders: null,
    dispatchedOrders: null,
    completedOrders: null,
    ontimePercentage: null,
  });
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [poPage, setPoPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionData, setActionData] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await axios.get(`${config.apiUrl}/stats/vendor`, {
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
        // Backend already filters for vendor's own orders, show all
        setPurchaseOrders(response.data);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };

    fetchStats();
    fetchPurchaseOrders();
  }, [user?.email]);

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

  // Calculate delivery performance metrics from purchase orders
  const deliveryPerformance = useMemo(() => {
    if (!purchaseOrders || purchaseOrders.length === 0) {
      return {
        statusBreakdown: [],
        onTimeDeliveries: 0,
        totalDelivered: 0,
        performanceRate: 0
      };
    }

    // Status breakdown for pie chart
    const statusCounts = purchaseOrders.reduce((acc, po) => {
      const status = po.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      percentage: ((count / purchaseOrders.length) * 100).toFixed(1)
    }));

    // Calculate on-time delivery rate
    const deliveredOrders = purchaseOrders.filter(po => 
      po.status === 'DELIVERED' || po.status === 'COMPLETED'
    );
    
    const onTimeDeliveries = deliveredOrders.filter(po => {
      if (!po.deliveryDate) return false;
      const deliveryDate = new Date(po.deliveryDate);
      const expectedDate = new Date(po.createdAt);
      expectedDate.setDate(expectedDate.getDate() + 7); // Assuming 7 days standard delivery
      return deliveryDate <= expectedDate;
    }).length;

    const performanceRate = deliveredOrders.length > 0 
      ? ((onTimeDeliveries / deliveredOrders.length) * 100).toFixed(1)
      : 0;

    return {
      statusBreakdown,
      onTimeDeliveries,
      totalDelivered: deliveredOrders.length,
      performanceRate
    };
  }, [purchaseOrders]);

  // Color mapping for status (hex for charts)
  const getStatusFillColor = (status) => {
    const colors = {
      'Pending': '#f59e0b',
      'Accepted': '#3b82f6',
      'Dispatched': '#8b5cf6',
      'Delivered': '#10b981',
      'Completed': '#059669',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const openActionModal = (po, action) => {
    setSelectedPO(po);
    setActionType(action);
    setActionData({});
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedPO) return;
    setLoading(true);
    try {
      const token = getToken();
      let endpoint = '';
      let payload = {};

      switch (actionType) {
        case 'accept':
          endpoint = `/purchase-orders/${selectedPO.id}/accept`;
          payload = { deliveryDate: actionData.deliveryDate };
          break;
        case 'reject':
          endpoint = `/purchase-orders/${selectedPO.id}/reject`;
          payload = { reason: actionData.reason };
          break;
        case 'dispatch':
          endpoint = `/purchase-orders/${selectedPO.id}/dispatch`;
          payload = { trackingInfo: actionData.trackingNumber };
          break;
        default:
          return;
      }

      await axios.put(`${config.apiUrl}${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Purchase Order ${actionType}ed successfully!`);
      setShowActionModal(false);
      setSelectedPO(null);
      setActionData({});
      
      // Refresh PO list - backend filters for vendor automatically
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
    // Vendors can manage their own orders more flexibly
    if (po.vendorEmail !== user?.email) return false;

    const status = (po.status || '').toUpperCase();
    const vendorDecisionStatuses = ['PENDING', 'PENDING APPROVAL', 'APPROVED', 'ACCEPTED'];
    
    if (action === 'accept') {
      // Vendors should be able to respond as soon as the PO is created
      return vendorDecisionStatuses.includes(status);
    }
    if (action === 'reject') {
      // Allow vendors to decline before dispatching starts
      return vendorDecisionStatuses.includes(status);
    }
    if (action === 'dispatch') {
      // Can dispatch if ACCEPTED or update if DISPATCHED
      return status === 'ACCEPTED' || status === 'DISPATCHED';
    }
    return false;
  };

  const getStatusColor = (status) => {
    const normalized = (status || '').toUpperCase();
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PENDING APPROVAL': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-purple-100 text-purple-800',
      'DISPATCHED': 'bg-indigo-100 text-indigo-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[normalized] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-3xl text-white p-10 shadow-2xl mb-8 transform hover:scale-[1.02] transition-transform duration-300 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl animate-bounce">🏪</span>
            <div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight">Welcome, {userName}! 👋</h1>
              <p className="mt-3 text-xl text-amber-100">Your order management hub</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              📦 Order Tracking
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              🚚 Dispatch Management
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
              📊 Performance Metrics
            </span>
          </div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI label="Pending Orders" value={fmt(stats.pendingOrders)} icon="⏳" color="amber" />
        <KPI label="Dispatched" value={fmt(stats.dispatchedOrders)} icon="🚚" color="blue" />
        <KPI label="Completed" value={fmt(stats.completedOrders)} icon="✅" color="emerald" />
        <KPI label="On-time %" value={fmt(stats.ontimePercentage, '%')} icon="🎯" color="purple" />
      </div>

      {error && (
        <div className="mt-6 text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg p-4 shadow-sm animate-shake">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tables and Charts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section 
          title="Purchase Orders" 
          icon="📋"
          action={
            <button 
              onClick={() => navigate('/purchase-orders')}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold"
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
                    <tr key={po.id} className="border-t border-gray-100 hover:bg-amber-50 transition-colors">
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
                              onClick={() => openActionModal(po, 'accept')}
                              disabled={!canPerformAction(po, 'accept')}
                              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                canPerformAction(po, 'accept')
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              ✅ Accept
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
                              onClick={() => openActionModal(po, 'dispatch')}
                              disabled={!canPerformAction(po, 'dispatch')}
                              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                canPerformAction(po, 'dispatch')
                                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-md cursor-pointer'
                                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              🚚 Dispatch
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
                    className={`px-3 py-1 rounded-lg border ${poPage === 1 ? 'text-gray-300 border-gray-200' : 'text-amber-700 border-amber-200 hover:bg-amber-50'}`}
                  >
                    ◀ Prev 10
                  </button>
                  <button
                    onClick={() => setPoPage((p) => (p * pageSize < purchaseOrders.length ? p + 1 : p))}
                    disabled={poPage * pageSize >= purchaseOrders.length}
                    className={`px-3 py-1 rounded-lg border ${poPage * pageSize >= purchaseOrders.length ? 'text-gray-300 border-gray-200' : 'text-amber-700 border-amber-200 hover:bg-amber-50'}`}
                  >
                    Next 10 ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        </Section>
        <Section 
          title="Performance Analytics" 
          icon="📊"
          action={
            purchaseOrders.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold shadow-sm border border-amber-200">
                  {purchaseOrders.length} Total Orders
                </span>
                <span className={`px-3 py-1 rounded-full font-semibold shadow-sm border ${
                  parseFloat(deliveryPerformance.performanceRate) >= 80
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : parseFloat(deliveryPerformance.performanceRate) >= 60
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  On-Time {deliveryPerformance.performanceRate}%
                </span>
              </div>
            )
          }
        >
          {purchaseOrders.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
              {/* Order Status Distribution */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 h-full shadow-md border border-orange-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📦</span>
                  Order Status Distribution
                </h4>
                <div className="bg-white rounded-lg shadow-sm p-4" style={{ height: '360px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <Pie
                        data={deliveryPerformance.statusBreakdown}
                        cx="40%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={110}
                        labelLine={false}
                        dataKey="value"
                      >
                        {deliveryPerformance.statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getStatusFillColor(entry.name)} />
                        ))}
                      </Pie>
                      {/* Center summary to avoid label overlap */}
                      <text x="40%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-sm font-semibold" fill="#374151">
                        {purchaseOrders.length} Orders
                      </text>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '2px solid #f59e0b',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '12px 16px'
                        }}
                      />
                      <Legend 
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingLeft: '10px' }}
                        iconType="circle"
                        iconSize={10}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Delivery Performance Metrics */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 h-full shadow-md border border-emerald-100">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🚚</span>
                  Delivery Performance
                </h4>
                <div className="space-y-4">
                  {/* Performance Rate */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">On-Time Delivery Rate</span>
                      <span className={`text-3xl font-bold ${
                        parseFloat(deliveryPerformance.performanceRate) >= 80 ? 'text-emerald-600' :
                        parseFloat(deliveryPerformance.performanceRate) >= 60 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {deliveryPerformance.performanceRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          parseFloat(deliveryPerformance.performanceRate) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' :
                          parseFloat(deliveryPerformance.performanceRate) >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-pink-600'
                        }`}
                        style={{ width: `${deliveryPerformance.performanceRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {deliveryPerformance.onTimeDeliveries} of {deliveryPerformance.totalDelivered} deliveries on time
                    </p>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                      <p className="text-xs font-medium text-gray-500 uppercase">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{purchaseOrders.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-emerald-500">
                      <p className="text-xs font-medium text-gray-500 uppercase">Delivered</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{deliveryPerformance.totalDelivered}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                      <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {purchaseOrders.filter(po => po.status === 'PENDING').length}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
                      <p className="text-xs font-medium text-gray-500 uppercase">In Transit</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {purchaseOrders.filter(po => po.status === 'DISPATCHED').length}
                      </p>
                    </div>
                  </div>

                  {/* Performance Badge */}
                  <div className={`rounded-lg p-4 text-center ${
                    parseFloat(deliveryPerformance.performanceRate) >= 80 ? 'bg-emerald-100 border-2 border-emerald-500' :
                    parseFloat(deliveryPerformance.performanceRate) >= 60 ? 'bg-amber-100 border-2 border-amber-500' :
                    'bg-red-100 border-2 border-red-500'
                  }`}>
                    <p className={`text-sm font-bold ${
                      parseFloat(deliveryPerformance.performanceRate) >= 80 ? 'text-emerald-700' :
                      parseFloat(deliveryPerformance.performanceRate) >= 60 ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {parseFloat(deliveryPerformance.performanceRate) >= 80 ? '⭐ Excellent Performance!' :
                       parseFloat(deliveryPerformance.performanceRate) >= 60 ? '👍 Good Performance' :
                       '⚠️ Needs Improvement'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-400 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200">
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Performance Data</h3>
                <p className="text-gray-500 max-w-md">
                  Performance analytics will appear here once you start processing orders.
                </p>
              </div>
            </div>
          )}
        </Section>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-600 capitalize">
                {actionType === 'accept' ? '✅' : actionType === 'reject' ? '❌' : '🚚'} {actionType} Purchase Order
              </h2>
              <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              {actionType === 'accept' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                  <input
                    type="datetime-local"
                    value={actionData.deliveryDate || ''}
                    onChange={(e) => setActionData({ ...actionData, deliveryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              )}

              {actionType === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                  <textarea
                    value={actionData.reason || ''}
                    onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows="3"
                    placeholder="Provide reason for rejection..."
                    required
                  />
                </div>
              )}

              {actionType === 'dispatch' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={actionData.trackingNumber || ''}
                    onChange={(e) => setActionData({ ...actionData, trackingNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter tracking number..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAction}
                  disabled={loading || (actionType === 'accept' && !actionData.deliveryDate) || (actionType === 'reject' && !actionData.reason) || (actionType === 'dispatch' && !actionData.trackingNumber)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
