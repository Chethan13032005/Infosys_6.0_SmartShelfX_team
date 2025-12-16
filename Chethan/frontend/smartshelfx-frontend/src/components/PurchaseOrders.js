import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-toastify';
import { getToken, getUserRole, getUserEmail } from '../utils/auth';

const PurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [actionType, setActionType] = useState('');
    const [actionData, setActionData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const userRole = getUserRole();
    const userEmail = getUserEmail();

    const [formData, setFormData] = useState({
        productId: '',
        vendorEmail: '',
        quantity: '',
        expectedPrice: ''
    });

    const [batchForm, setBatchForm] = useState({
        vendorEmail: '',
        itemsText: '' // format: productId:quantity per line
    });

    useEffect(() => {
        fetchPurchaseOrders();
        fetchProducts();
        if (userRole === 'MANAGER' || userRole === 'ADMIN') {
            fetchVendors();
        }
    }, [userRole]);

    const fetchPurchaseOrders = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/purchase-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Filter based on role
            let filteredOrders = response.data;
            if (userRole === 'VENDOR') {
                filteredOrders = response.data.filter(po => po.vendorEmail === userEmail);
            }
            // Sort by recency
            const sorted = [...filteredOrders].sort((a, b) => {
                const aDate = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
                const bDate = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
                if (aDate === 0 && bDate === 0) {
                    return (b?.id || 0) - (a?.id || 0);
                }
                return bDate - aDate;
            });
            setPurchaseOrders(sorted);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchVendors = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/users/vendors`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = getToken();
            await axios.post(`${config.apiUrl}/purchase-orders`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Purchase Order created successfully!');
            setShowModal(false);
            setFormData({ productId: '', vendorEmail: '', quantity: '', expectedPrice: '' });
            fetchPurchaseOrders();
        } catch (error) {
            toast.error(error.response?.data || 'Error creating purchase order');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoGenerate = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await axios.post(`${config.apiUrl}/purchase-orders/auto-generate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${response.data.count} Purchase Orders auto-generated!`);
            fetchPurchaseOrders();
        } catch (error) {
            toast.error(error.response?.data || 'Error auto-generating purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        setLoading(true);
        try {
            const token = getToken();
            let endpoint = '';
            let payload = {};

            switch (actionType) {
                case 'approve':
                    endpoint = `/purchase-orders/${selectedPO.id}/approve`;
                    break;
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
                case 'complete':
                    endpoint = `/purchase-orders/${selectedPO.id}/complete`;
                    break;
                default:
                    return;
            }

            await axios.put(`${config.apiUrl}${endpoint}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Purchase Order ${actionType}d successfully!`);
            setShowActionModal(false);
            setSelectedPO(null);
            setActionData({});
            fetchPurchaseOrders();
        } catch (error) {
            toast.error(error.response?.data || `Error ${actionType}ing purchase order`);
        } finally {
            setLoading(false);
        }
    };

    const openActionModal = (po, action) => {
        setSelectedPO(po);
        setActionType(action);
        setActionData({});
        setShowActionModal(true);
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
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

    const getStatusIcon = (status) => {
        const icons = {
            'PENDING': '⏳',
            'APPROVED': '✅',
            'ACCEPTED': '👍',
            'DISPATCHED': '🚚',
            'COMPLETED': '✨',
            'REJECTED': '❌'
        };
        return icons[status] || '📦';
    };

    const canPerformAction = (po, action) => {
        if (action === 'approve' && userRole === 'ADMIN' && po.status === 'PENDING') return true;
        if (action === 'accept' && userRole === 'VENDOR' && po.status === 'APPROVED' && po.vendorEmail === userEmail) return true;
        if (action === 'reject' && ((userRole === 'ADMIN' && po.status === 'PENDING') || (userRole === 'VENDOR' && po.status === 'APPROVED' && po.vendorEmail === userEmail))) return true;
        if (action === 'dispatch' && userRole === 'VENDOR' && po.status === 'ACCEPTED' && po.vendorEmail === userEmail) return true;
        if (action === 'complete' && userRole === 'MANAGER' && po.status === 'DISPATCHED') return true;
        return false;
    };

    const paginatedOrders = () => {
        const start = (currentPage - 1) * pageSize;
        return purchaseOrders.slice(start, start + pageSize);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                🛒 Purchase Orders
                            </h1>
                            <p className="text-gray-600">Manage purchase order workflow</p>
                        </div>
                        {(userRole === 'MANAGER' || userRole === 'ADMIN') && (
                            <div className="flex gap-3">
                                <button
                                    onClick={fetchPurchaseOrders}
                                    disabled={loading}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <span>🔄</span> Refresh
                                </button>
                                <button
                                    onClick={handleAutoGenerate}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                                >
                                    <span>🤖</span> Auto-Generate
                                </button>
                                <button
                                    onClick={() => setShowBatchModal(true)}
                                    disabled={loading}
                                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                                >
                                    <span>📦</span> Batch Create
                                </button>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    <span>➕</span> Create PO
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Purchase Orders Table */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="flex justify-between items-center px-6 pt-6">
                        <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{purchaseOrders.length}</span></div>
                        <div className="flex gap-2 text-xs">
                            {['PENDING','APPROVED','ACCEPTED','DISPATCHED','COMPLETED','REJECTED'].map(st => (
                                <span key={st} className={`px-2 py-1 rounded-full ${getStatusColor(st)}`}>{st}: {purchaseOrders.filter(po => po.status===st).length}</span>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Vendor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Tracking</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {purchaseOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="text-6xl">🛒</span>
                                                <p className="text-lg font-medium">No purchase orders yet</p>
                                                <p className="text-sm">Create your first purchase order</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedOrders().map((po) => {
                                        const hasAnyAction = canPerformAction(po, 'approve') || canPerformAction(po, 'accept') || canPerformAction(po, 'reject') || canPerformAction(po, 'dispatch') || canPerformAction(po, 'complete');
                                        return (
                                            <tr key={po.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">#{po.id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{getProductName(po.productId)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{po.vendorEmail}</td>
                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{po.quantity}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">₹{po.expectedPrice}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(po.status)}`}>
                                                        {getStatusIcon(po.status)} {po.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{po.trackingNumber || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button
                                                            onClick={() => { setSelectedPO(po); setShowDetailModal(true); }}
                                                            className="px-3 py-1 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-all"
                                                        >
                                                            🔍 Details
                                                        </button>
                                                        {hasAnyAction ? (
                                                            <>
                                                                {canPerformAction(po, 'approve') && (
                                                                    <button
                                                                        onClick={() => openActionModal(po, 'approve')}
                                                                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-all"
                                                                    >
                                                                        ✅ Approve
                                                                    </button>
                                                                )}
                                                                {canPerformAction(po, 'accept') && (
                                                                    <button
                                                                        onClick={() => openActionModal(po, 'accept')}
                                                                        className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-all"
                                                                    >
                                                                        👍 Accept
                                                                    </button>
                                                                )}
                                                                {canPerformAction(po, 'reject') && (
                                                                    <button
                                                                        onClick={() => openActionModal(po, 'reject')}
                                                                        className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-all"
                                                                    >
                                                                        ❌ Reject
                                                                    </button>
                                                                )}
                                                                {canPerformAction(po, 'dispatch') && (
                                                                    <button
                                                                        onClick={() => openActionModal(po, 'dispatch')}
                                                                        className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-all"
                                                                    >
                                                                        🚚 Dispatch
                                                                    </button>
                                                                )}
                                                                {canPerformAction(po, 'complete') && (
                                                                    <button
                                                                        onClick={() => openActionModal(po, 'complete')}
                                                                        className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-all"
                                                                    >
                                                                        ✨ Complete
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-500 italic px-2">No actions available</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {purchaseOrders.length > pageSize && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, purchaseOrders.length)} of {purchaseOrders.length} orders</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${currentPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                                >
                                    ◀ Prev 10
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => (p * pageSize < purchaseOrders.length ? p + 1 : p))}
                                    disabled={currentPage * pageSize >= purchaseOrders.length}
                                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${currentPage * pageSize >= purchaseOrders.length ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                                >
                                    Next 10 ▶
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create PO Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-600">🛒 Create Purchase Order</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} (Stock: {product.quantity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                                <select
                                    value={formData.vendorEmail}
                                    onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(vendor => (
                                        <option key={vendor.email} value={vendor.email}>
                                            {vendor.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.expectedPrice}
                                    onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-blue-600 capitalize">
                                {getStatusIcon(actionType.toUpperCase())} {actionType} Purchase Order
                            </h2>
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            {actionType === 'accept' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                                    <input
                                        type="datetime-local"
                                        value={actionData.deliveryDate || ''}
                                        onChange={(e) => setActionData({ ...actionData, deliveryDate: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter tracking number..."
                                        required
                                    />
                                </div>
                            )}

                            {actionType === 'approve' && (
                                <p className="text-gray-600">Are you sure you want to approve this purchase order?</p>
                            )}

                            {actionType === 'complete' && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <p className="text-green-800 font-medium">✨ Completing this PO will:</p>
                                    <ul className="mt-2 space-y-1 text-green-700 text-sm">
                                        <li>• Automatically record Stock-IN transaction</li>
                                        <li>• Update product inventory</li>
                                        <li>• Mark order as completed</li>
                                    </ul>
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
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Batch Create Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-600">📦 Batch Create Purchase Orders</h2>
                            <button onClick={() => setShowBatchModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                                <select
                                    value={batchForm.vendorEmail}
                                    onChange={(e) => setBatchForm({ ...batchForm, vendorEmail: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => (
                                        <option key={v.email} value={v.email}>{v.email}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Items (one per line)</label>
                                <textarea
                                    value={batchForm.itemsText}
                                    onChange={(e) => setBatchForm({ ...batchForm, itemsText: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    rows="6"
                                    placeholder="productId:quantity\n101:50\n102:20"
                                />
                                <p className="text-xs text-gray-500 mt-2">Tip: Use suggested restock quantities from dashboard.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBatchModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={loading || !batchForm.vendorEmail || !batchForm.itemsText.trim()}
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const lines = batchForm.itemsText.split('\n').map(l => l.trim()).filter(Boolean);
                                            const items = lines.map(line => {
                                                const [pidStr, qtyStr] = line.split(':');
                                                return { productId: parseInt(pidStr, 10), quantity: parseInt(qtyStr, 10) };
                                            }).filter(i => Number.isInteger(i.productId) && Number.isInteger(i.quantity) && i.quantity > 0);

                                            if (items.length === 0) {
                                                toast.error('Please provide valid items in productId:quantity format');
                                                setLoading(false);
                                                return;
                                            }

                                            const token = getToken();
                                            const payload = { vendorEmail: batchForm.vendorEmail, items };
                                            const resp = await axios.post(`${config.apiUrl}/purchase-orders/batch`, payload, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            toast.success(`Created ${resp.data.count || items.length} purchase orders`);
                                            setShowBatchModal(false);
                                            setBatchForm({ vendorEmail: '', itemsText: '' });
                                            fetchPurchaseOrders();
                                        } catch (err) {
                                            toast.error(err.response?.data || 'Error creating batch purchase orders');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Batch'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedPO && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">🔍 Purchase Order #{selectedPO.id}</h2>
                            <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600">Product</div>
                                <div className="text-gray-900 font-semibold">{getProductName(selectedPO.productId)}</div>
                                <div className="text-sm text-gray-600 mt-4">Vendor</div>
                                <div className="text-gray-900">{selectedPO.vendorEmail}</div>
                                <div className="text-sm text-gray-600 mt-4">Quantity</div>
                                <div className="text-gray-900">{selectedPO.quantity}</div>
                                <div className="text-sm text-gray-600 mt-4">Expected Price</div>
                                <div className="text-gray-900">₹{selectedPO.expectedPrice}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-600">Status</div>
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedPO.status)} mt-1`}>
                                    {getStatusIcon(selectedPO.status)} {selectedPO.status}
                                </div>
                                <div className="text-sm text-gray-600 mt-4">Tracking Number</div>
                                <div className="text-gray-900">{selectedPO.trackingNumber || '-'}</div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Timeline</h3>
                            <div className="space-y-3">
                                {/* Note: backend should include these timestamps; show if present */}
                                {selectedPO.createdAt && (
                                    <div className="flex items-start gap-3">
                                        <span>🕒</span>
                                        <div>
                                            <div className="font-medium">Created</div>
                                            <div className="text-sm text-gray-600">{new Date(selectedPO.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedPO.approvedAt && (
                                    <div className="flex items-start gap-3">
                                        <span>✅</span>
                                        <div>
                                            <div className="font-medium">Approved</div>
                                            <div className="text-sm text-gray-600">{new Date(selectedPO.approvedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedPO.acceptedAt && (
                                    <div className="flex items-start gap-3">
                                        <span>👍</span>
                                        <div>
                                            <div className="font-medium">Accepted</div>
                                            <div className="text-sm text-gray-600">{new Date(selectedPO.acceptedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedPO.dispatchDate && (
                                    <div className="flex items-start gap-3">
                                        <span>🚚</span>
                                        <div>
                                            <div className="font-medium">Dispatched</div>
                                            <div className="text-sm text-gray-600">{new Date(selectedPO.dispatchDate).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                                {selectedPO.completedAt && (
                                    <div className="flex items-start gap-3">
                                        <span>✨</span>
                                        <div>
                                            <div className="font-medium">Completed</div>
                                            <div className="text-sm text-gray-600">{new Date(selectedPO.completedAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
