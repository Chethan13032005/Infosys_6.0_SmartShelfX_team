import React from 'react';
import { BookOpen, UserCheck, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export const UserGuide: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-indigo-600 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen size={32} />
          SmartShelfX User Guide
        </h1>
        <p className="text-indigo-100 mt-2 max-w-2xl">
          Welcome to the comprehensive guide for using the SmartShelfX Inventory Management System. 
          This page outlines the features available to different roles and how to effectively utilize them.
        </p>
      </div>

      {/* Role Definitions */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserCheck className="text-indigo-600" />
          Roles & Permissions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="font-bold text-gray-900">Admin</h3>
            <p className="text-sm text-gray-600 mt-2">
              Complete control over the system. Can manage all inventory, users, settings, and view all financial reports.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-gray-900">Manager</h3>
            <p className="text-sm text-gray-600 mt-2">
              Focuses on day-to-day operations. Can manage stock, record transactions, and generate restock requests.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
            <h3 className="font-bold text-gray-900">Vendor</h3>
            <p className="text-sm text-gray-600 mt-2">
              External partners. Can view stock levels of their own products and receive purchase orders.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Inventory Management */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-indigo-600" />
            Inventory Management
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="text-gray-900">Adding Products:</strong> 
                <p className="text-sm mt-1">Navigate to the Inventory page and click "Add Product". Fill in SKU, Name, and Price details. (Admin/Manager only)</p>
              </li>
              <li>
                <strong className="text-gray-900">Editing:</strong> 
                <p className="text-sm mt-1">Click the "Edit" button next to any item in the table to update stock or price.</p>
              </li>
              <li>
                <strong className="text-gray-900">Low Stock Indicators:</strong> 
                <p className="text-sm mt-1">Items below their reorder level are highlighted in red with a "Restock Needed" badge.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Transactions */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-indigo-600" />
            Stock Operations
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
             <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="text-gray-900">Stock In (Receiving):</strong> 
                <p className="text-sm mt-1">Use the Transactions page to record new shipments arriving at the warehouse.</p>
              </li>
              <li>
                <strong className="text-gray-900">Stock Out (Dispatch):</strong> 
                <p className="text-sm mt-1">Record sales or internal usage. The system prevents dispatching more than available stock.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* AI Features */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" />
            AI Forecasting & Restock
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
             <ul className="space-y-4 text-gray-700">
              <li>
                <strong className="text-gray-900">Demand Prediction:</strong> 
                <p className="text-sm mt-1">The "AI Forecast" page uses historical data to predict sales for the next 7 days, helping you plan ahead.</p>
              </li>
              <li>
                <strong className="text-gray-900">Auto-Restock:</strong> 
                <p className="text-sm mt-1">The "Auto Restock" page analyzes current stock vs reorder levels and automatically suggests purchase orders.</p>
              </li>
            </ul>
          </div>
        </section>

        {/* General Tips */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" />
            Best Practices
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
             <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
               <li>Regularly audit physical stock against the system numbers.</li>
               <li>Set accurate "Reorder Levels" to ensure alerts trigger correctly.</li>
               <li>Review the "Reports" section weekly to track inventory value and turnover.</li>
               <li>Ensure all staff log out when leaving shared terminals.</li>
             </ul>
          </div>
        </section>

      </div>
    </div>
  );
};