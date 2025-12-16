import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { generateSalesForecast } from '../services/geminiService';
import { ForecastData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sparkles, Loader } from 'lucide-react';

export const Forecast: React.FC = () => {
  const { products } = useInventory();
  const [loading, setLoading] = useState(false);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);

  const handleGenerateForecast = async () => {
    setLoading(true);
    const data = await generateSalesForecast(products);
    setForecasts(data);
    setLoading(false);
  };

  // Transform data for chart
  const chartData = forecasts.map(f => ({
    name: f.productName,
    Current: f.currentStock,
    Predicted: f.predictedDemand
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Demand Forecasting</h2>
          <p className="text-gray-500 text-sm mt-1">Powered by Google Gemini Models</p>
        </div>
        <button
          onClick={handleGenerateForecast}
          disabled={loading}
          className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
        >
          {loading ? <Loader className="animate-spin" size={20} /> : <Sparkles size={20} />}
          <span>{loading ? 'Analyzing...' : 'Generate 7-Day Forecast'}</span>
        </button>
      </div>

      {forecasts.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-semibold mb-4">Predicted vs Current Stock</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Current" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="Predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Current Stock</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Predicted Sales (7 Days)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forecasts.map((f) => (
                  <tr key={f.sku}>
                    <td className="px-6 py-4 font-medium">{f.productName}</td>
                    <td className="px-6 py-4">{f.currentStock}</td>
                    <td className="px-6 py-4">{f.predictedDemand}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        f.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                        f.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {f.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{f.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-xl font-medium text-gray-800">Ready to Forecast</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Click the button above to let our AI model analyze historical data and seasonal trends to predict your inventory needs.
          </p>
        </div>
      )}
    </div>
  );
};
