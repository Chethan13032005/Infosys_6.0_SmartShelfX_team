import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import SuggestedRestock from './SuggestedRestock';

const quickLinks = [
    { title: 'View Inventory', description: 'Browse all products and stock levels', action: '/view', color: 'from-blue-500 to-indigo-600', icon: 'view' },
    { title: 'Add Product', description: 'Create a new inventory item', action: '/add', color: 'from-emerald-500 to-teal-600', icon: 'add' },
    { title: 'Suggested Restock', description: 'View AI-powered restock suggestions', action: '/restock', color: 'from-purple-500 to-pink-600', icon: 'restock' },
    { title: 'Delete Product', description: 'Remove a product from inventory', action: '/delete', color: 'from-rose-500 to-red-600', icon: 'delete' }
];

const Icon = ({ name }) => {
    switch (name) {
        case 'view':
            // Eye icon
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            );
        case 'add':
            // Plus icon
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            );
        case 'restock':
            // Restock icon (e.g., a refresh or circular arrow)
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
                    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
                </svg>
            );
        case 'delete':
            // Trash icon
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>
            );
        default:
            return null;
    }
};

const StatCard = ({ label, value }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const name = user.fullName || user.email || 'User';
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalProducts: '—', lowStock: '—', suppliers: '—' });
    const [lowStockItems, setLowStockItems] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/stats');
                setStats({
                    totalProducts: res.data?.totalProducts ?? '0',
                    lowStock: res.data?.lowStock ?? '0',
                    suppliers: res.data?.suppliers ?? '0'
                });
            } catch (e) {
                // leave placeholders on error
            }
        };
        
        const fetchLowStockItems = async () => {
            try {
                const res = await axios.get('/view');
                const lowStock = res.data.filter(item => item.quantity <= 10);
                setLowStockItems(lowStock);
            } catch (e) {
                // ignore errors
            }
        };
        
        fetchStats();
        fetchLowStockItems();
    }, []);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl text-white p-8 shadow">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome back, {name}</h1>
                <p className="mt-2 text-indigo-100">Manage your inventory, forecast demand, and keep shelves restocked—effortlessly.</p>
            </div>

            {lowStockItems.length > 0 && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
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

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Products" value={stats.totalProducts} />
                <StatCard label="Low Stock Alerts" value={stats.lowStock} />
                <StatCard label="Suppliers" value={stats.suppliers} />
            </div>

            <h2 className="mt-10 mb-4 text-xl font-semibold text-gray-900">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickLinks.concat([{ title: 'Create PO', description: 'Manually create a purchase order', action: '/purchase-orders/create', color: 'from-emerald-500 to-teal-600', icon: 'add' }]).map((q) => (
                    <button
                        key={q.title}
                        onClick={() => navigate(q.action)}
                        className={`text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6 group`}
                    >
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${q.color} text-white flex items-center justify-center shadow-md`}>
                            <Icon name={q.icon} />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">{q.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{q.description}</p>
                    </button>
                ))}
            </div>

            <div className="mt-10">
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Restock Suggestions</h2>
                <SuggestedRestock />
            </div>
        </div>
    );
};

export default Dashboard;
