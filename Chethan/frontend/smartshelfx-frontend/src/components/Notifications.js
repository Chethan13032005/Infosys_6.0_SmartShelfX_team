import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { toast } from 'react-toastify';
import { getToken } from '../utils/auth';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const token = getToken();
            const response = await axios.get(`${config.apiUrl}/notifications/unread/count`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(response.data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = getToken();
            await axios.put(`${config.apiUrl}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setLoading(true);
        try {
            const token = getToken();
            await axios.put(`${config.apiUrl}/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('All notifications marked as read');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            toast.error('Error marking all as read');
        } finally {
            setLoading(false);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = getToken();
            await axios.delete(`${config.apiUrl}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Notification deleted');
            fetchNotifications();
            fetchUnreadCount();
        } catch (error) {
            toast.error('Error deleting notification');
        }
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'URGENT': 'bg-red-100 border-l-4 border-red-500',
            'HIGH': 'bg-orange-100 border-l-4 border-orange-500',
            'NORMAL': 'bg-blue-100 border-l-4 border-blue-500',
            'LOW': 'bg-gray-100 border-l-4 border-gray-500'
        };
        return colors[priority] || colors['NORMAL'];
    };

    const getTypeIcon = (type) => {
        const icons = {
            'LOW_STOCK': '⚠️',
            'PO_STATUS': '📦',
            'SYSTEM': '✨',
            'GENERAL': '📢'
        };
        return icons[type] || '📢';
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'ALL') return true;
        if (filter === 'UNREAD') return !notification.isRead;
        return notification.type === filter;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                                🔔 Notifications
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-500 text-white text-sm font-bold animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </h1>
                            <p className="text-gray-600">Stay updated with important alerts</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
                            >
                                <span>✓</span> Mark All Read
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                        {['ALL', 'UNREAD', 'LOW_STOCK', 'PO_STATUS', 'SYSTEM'].map((filterOption) => (
                            <button
                                key={filterOption}
                                onClick={() => setFilter(filterOption)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                    filter === filterOption
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-500'
                                }`}
                            >
                                {filterOption.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-100">
                            <div className="flex flex-col items-center gap-3">
                                <span className="text-6xl">🔕</span>
                                <p className="text-lg font-medium text-gray-700">No notifications</p>
                                <p className="text-sm text-gray-500">You're all caught up!</p>
                            </div>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                                    getPriorityColor(notification.priority)
                                } ${!notification.isRead ? 'ring-2 ring-purple-400' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                                                        {notification.type.replace('_', ' ')}
                                                    </span>
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                                                        {notification.priority}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-800 font-medium mb-2">{notification.message}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-all"
                                                title="Mark as read"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notification.id)}
                                            className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
