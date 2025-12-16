import React from 'react';
import { getUser } from '../../../utils/auth';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.311 6.022c1.733.64 3.56 1.085 5.454 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const DashboardHeader = () => {
  const user = getUser();
  const initials = (user.fullName || user.email || 'User')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-xl font-bold text-gray-900">SmartShelf<span className="text-indigo-600">X</span></div>
        <div className="flex-1" />
        <div className="hidden md:block w-full max-w-md">
          <div className="relative">
            <input
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search products, POs, vendors..."
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        <button className="ml-3 relative rounded-full p-2 hover:bg-gray-100 text-gray-600" aria-label="Notifications">
          <BellIcon />
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none text-white bg-rose-500 rounded-full">3</span>
        </button>
        <div className="ml-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">{initials}</div>
            <div className="hidden sm:block text-sm text-gray-700">
              <div className="font-medium">{user.fullName || user.email || 'User'}</div>
              <div className="text-gray-500 text-xs">{user.role || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
