import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-toastify';
import { getToken } from '../utils/auth';

const StockTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [transactionType, setTransactionType] = useState('IN');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        notes: ''
    });

    useEffect(() => {
        fetchTransactions();
        fetchProducts();
    }, []);

    const fetchTransactions = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/stock-transactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const sorted = [...(response.data || [])].sort((a, b) => {
                const aDate = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
                const bDate = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
                if (aDate === 0 && bDate === 0) {
                    return (b?.id || 0) - (a?.id || 0);
                }
                return bDate - aDate;
            });

            setTransactions(sorted);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error fetching transactions:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = getToken();
            const endpoint =
                transactionType === 'IN'
                    ? '/stock-transactions/stock-in'
                    : '/stock-transactions/stock-out';

            await axios.post(`${config.apiUrl}${endpoint}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Stock-${transactionType} recorded successfully!`);
            setShowModal(false);
            setFormData({ productId: '', quantity: '', notes: '' });
            fetchTransactions();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data || 'Error recording transaction');
        } finally {
            setLoading(false);
        }
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    const paginatedTransactions = () => {
        const start = (currentPage - 1) * pageSize;
        return transactions.slice(start, start + pageSize);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                📦 Stock Transactions
                            </h1>
                            <p className="text-gray-600">Manage inventory stock movements</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { fetchTransactions(); fetchProducts(); }}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 transition-all"
                            >
                                <span>🔄</span> Refresh
                            </button>

                            <button
                                onClick={() => { setTransactionType('IN'); setShowModal(true); }}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <span>📥</span> Stock-IN
                            </button>

                            <button
                                onClick={() => { setTransactionType('OUT'); setShowModal(true); }}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                                <span>📤</span> Stock-OUT
                            </button>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Quantity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Notes</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Performed By</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <span className="text-6xl">📊</span>
                                                <p className="text-lg font-medium">No transactions yet</p>
                                                <p className="text-sm">Record your first stock movement</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions().map(transaction => (
                                        <tr key={transaction.id} className="hover:bg-emerald-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">#{transaction.id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{getProductName(transaction.productId)}</td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                                        transaction.type === 'IN'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}
                                                >
                                                    {transaction.type === 'IN' ? '📥' : '📤'} {transaction.type}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">{transaction.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{transaction.notes || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{transaction.performedBy}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(transaction.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.length > pageSize && (
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * pageSize + 1}–
                                {Math.min(currentPage * pageSize, transactions.length)} of {transactions.length}
                            </span>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${
                                        currentPage === 1
                                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                >
                                    ◀ Prev 10
                                </button>

                                <button
                                    onClick={() =>
                                        setCurrentPage(p =>
                                            p * pageSize < transactions.length ? p + 1 : p
                                        )
                                    }
                                    disabled={currentPage * pageSize >= transactions.length}
                                    className={`px-4 py-2 rounded-lg border font-semibold text-sm ${
                                        currentPage * pageSize >= transactions.length
                                            ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                >
                                    Next 10 ▶
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
                        <div className="flex justify-between items-center mb-6">
                            <h2
                                className={`text-2xl font-bold ${
                                    transactionType === 'IN'
                                        ? 'text-green-600'
                                        : 'text-orange-600'
                                }`}
                            >
                                {transactionType === 'IN' ? '📥 Record Stock-IN' : '📤 Record Stock-OUT'}
                            </h2>

                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product
                                </label>

                                <select
                                    value={formData.productId}
                                    onChange={e =>
                                        setFormData({ ...formData, productId: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={e =>
                                        setFormData({ ...formData, quantity: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>

                                <textarea
                                    value={formData.notes}
                                    onChange={e =>
                                        setFormData({ ...formData, notes: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    rows="3"
                                    placeholder="Add any notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex-1 px-6 py-3 ${
                                        transactionType === 'IN'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                                            : 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700'
                                    } text-white rounded-xl font-medium transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading ? 'Recording...' : 'Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockTransactions;
