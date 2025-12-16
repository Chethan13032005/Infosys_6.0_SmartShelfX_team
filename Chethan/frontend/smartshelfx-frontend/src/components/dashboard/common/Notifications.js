import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../../config';
import { getToken, getUserRole } from '../../../utils/auth';

const Notifications = ({ items = [] }) => {
  const [list, setList] = useState(items);

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        const role = getUserRole();
        
        // Fetch dynamic notifications from backend
        const notifRes = await axios.get(`${config.apiUrl}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const backendNotifs = Array.isArray(notifRes.data) ? notifRes.data : [];
        
        // Also check inventory for low/out of stock
        const res = await axios.get(`${config.apiUrl}/products`);
        const products = Array.isArray(res.data) ? res.data : [];
        const stockNotifs = [];
        
        products.forEach(p => {
          const qty = Number(p.quantity || 0);
          const rl = Number(p.reorderLevel || 0);
          if (qty <= 0) {
            stockNotifs.push({ 
              id: `out-${p.id}`, 
              type: 'Out of Stock', 
              message: `${p.name || p.productName} is out of stock`, 
              level: 'error',
              priority: 'HIGH'
            });
          } else if (qty <= rl) {
            stockNotifs.push({ 
              id: `low-${p.id}`, 
              type: 'Low Stock', 
              message: `${p.name || p.productName} below reorder level (${qty} ≤ ${rl})`, 
              level: 'warn',
              priority: 'NORMAL'
            });
          }
        });
        
        // Combine backend notifications with stock notifications
        const combined = [
          ...backendNotifs.map(n => ({
            id: n.id,
            type: n.type || 'System',
            message: n.message,
            level: n.priority === 'HIGH' ? 'error' : n.priority === 'NORMAL' ? 'warn' : 'info',
            priority: n.priority,
            createdAt: n.createdAt
          })),
          ...stockNotifs
        ];
        
        setList(combined.length ? combined : items);
      } catch (e) {
        console.error('Error loading notifications:', e);
        // Fallback to inventory check only
        try {
          const res = await axios.get(`${config.apiUrl}/products`);
          const products = Array.isArray(res.data) ? res.data : [];
          const notifs = [];
          products.forEach(p => {
            const qty = Number(p.quantity || 0);
            const rl = Number(p.reorderLevel || 0);
            if (qty <= 0) notifs.push({ id: `out-${p.id}`, type: 'Out of Stock', message: `${p.name || p.productName} is out of stock`, level: 'error' });
            else if (qty <= rl) notifs.push({ id: `low-${p.id}`, type: 'Low Stock', message: `${p.name || p.productName} below reorder level (${qty} ≤ ${rl})`, level: 'warn' });
          });
          setList(notifs.length ? notifs : items);
        } catch (e2) {
          if (!items.length) setList([
            { id: 1, type: 'Info', message: 'Welcome back! Check your inventory status.', level: 'info' },
          ]);
        }
      }
    };
    load();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [items]);
  const badge = (lvl) => {
    if (lvl === 'warn') return 'bg-amber-100 text-amber-700';
    if (lvl === 'error') return 'bg-rose-100 text-rose-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  const dismiss = (id) => setList(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setList([]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <button onClick={clearAll} className="text-xs text-gray-500 hover:text-gray-700">Dismiss All</button>
      </div>
      <ul className="mt-4 space-y-3 text-sm">
        {list.map((n) => (
          <li key={n.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge(n.level)}`}>{n.type}</span>
              <span className="text-gray-700">{n.message}</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-indigo-600 hover:text-indigo-800 text-xs">View</button>
              <button onClick={() => dismiss(n.id)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
