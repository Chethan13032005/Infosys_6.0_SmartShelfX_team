import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { toast } from 'react-toastify';
import config from '../config';
import { getToken } from '../utils/auth';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DemandForecasting = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
  const [filterRisk, setFilterRisk] = useState('ALL'); // 'ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      // Use detailed forecast endpoint that returns rich analytics
      const response = await axios.get(`${config.apiUrl}/forecast/detailed`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setForecasts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      toast.error('Failed to load demand forecasts');
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getConfidenceBadgeClass = (confidence) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const filteredForecasts = forecasts.filter(f => 
    filterRisk === 'ALL' || f.riskLevel === filterRisk
  );

  // Prepare chart data for selected product
  const getChartData = (forecast) => {
    if (!forecast || !forecast.dailyForecasts) return null;

    const labels = forecast.dailyForecasts.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Projected Stock Level',
          data: forecast.dailyForecasts.map(d => d.cumulativeStock),
          borderColor: 'rgb(16, 185, 129)', // emerald-500
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 9,
          borderWidth: 3
        },
        {
          label: 'Forecasted Demand',
          data: forecast.dailyForecasts.map(d => d.forecastedDemand),
          borderColor: 'rgb(251, 146, 60)', // orange-400
          backgroundColor: 'rgba(251, 146, 60, 0.15)',
          fill: false,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 9,
          borderWidth: 3
        },
        {
          label: 'Reorder Level',
          data: Array(forecast.dailyForecasts.length).fill(forecast.reorderLevel),
          borderColor: 'rgb(245, 158, 11)', // amber-500
          borderDash: [8, 6],
          fill: false,
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedProduct ? `7-Day Demand Forecast: ${selectedProduct.productName}` : 'Demand Forecast',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  const getActionIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return '🚨';
      case 'HIGH':
        return '⚠️';
      case 'MEDIUM':
        return '📊';
      case 'LOW':
        return '✅';
      default:
        return '📦';
    }
  };

  const getSeasonalIcon = (pattern) => {
    switch (pattern) {
      case 'Weekday High':
        return '📈';
      case 'Weekend High':
        return '📅';
      case 'Stable':
        return '➡️';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      {/* Header - Sunrise Gradient */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-400 to-amber-300 rounded-3xl shadow-2xl p-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-5xl">�</span> AI-Based Demand Forecasting
          </h1>
          <p className="text-orange-50 text-lg font-medium">
            Predictive analytics powered by machine learning algorithms
          </p>
        </div>
      </div>

      {/* Statistics Cards - Nature-Inspired Gradients */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Critical - Sunset Red */}
        <div className="bg-gradient-to-br from-red-500 via-orange-400 to-amber-300 rounded-2xl shadow-xl p-6 border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wide">Critical Risk</p>
              <p className="text-5xl font-black text-white mt-2">
                {forecasts.filter(f => f.riskLevel === 'CRITICAL').length}
              </p>
            </div>
            <div className="text-6xl opacity-90">�</div>
          </div>
        </div>

        {/* High - Desert Orange */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-400 to-yellow-300 rounded-2xl shadow-xl p-6 border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wide">High Risk</p>
              <p className="text-5xl font-black text-white mt-2">
                {forecasts.filter(f => f.riskLevel === 'HIGH').length}
              </p>
            </div>
            <div className="text-6xl opacity-90">⚡</div>
          </div>
        </div>

        {/* Medium - Golden Hour */}
        <div className="bg-gradient-to-br from-amber-400 via-yellow-300 to-lime-200 rounded-2xl shadow-xl p-6 border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-900/90 text-sm font-bold uppercase tracking-wide">Medium Risk</p>
              <p className="text-5xl font-black text-amber-900 mt-2">
                {forecasts.filter(f => f.riskLevel === 'MEDIUM').length}
              </p>
            </div>
            <div className="text-6xl opacity-90">☀️</div>
          </div>
        </div>

        {/* Total - Fresh Meadow */}
        <div className="bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-300 rounded-2xl shadow-xl p-6 border-4 border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wide">Total Products</p>
              <p className="text-5xl font-black text-white mt-2">{forecasts.length}</p>
            </div>
            <div className="text-6xl opacity-90">📦</div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle - Cloudy Sky Gradient */}
      <div className="bg-gradient-to-r from-slate-100 via-stone-50 to-amber-50 rounded-2xl shadow-xl p-5 mb-6 flex flex-wrap gap-4 items-center justify-between border-4 border-white/50">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilterRisk('ALL')}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              filterRisk === 'ALL'
                ? 'bg-gradient-to-r from-orange-500 to-rose-400 text-white shadow-xl'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-md border-2 border-slate-200'
            }`}
          >
            ✦ All Products
          </button>
          <button
            onClick={() => setFilterRisk('CRITICAL')}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              filterRisk === 'CRITICAL'
                ? 'bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-xl'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-md border-2 border-slate-200'
            }`}
          >
            🔥 Critical
          </button>
          <button
            onClick={() => setFilterRisk('HIGH')}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              filterRisk === 'HIGH'
                ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-xl'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-md border-2 border-slate-200'
            }`}
          >
            ⚡ High
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('table')}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              viewMode === 'table'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-white shadow-xl'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-md border-2 border-slate-200'
            }`}
          >
            ◫ Table View
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-5 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
              viewMode === 'chart'
                ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-xl'
                : 'bg-white/80 text-slate-700 hover:bg-white shadow-md border-2 border-slate-200'
            }`}
          >
            ▲ Chart View
          </button>
          <button
            onClick={fetchForecasts}
            className="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 shadow-xl transform hover:scale-105"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-200">
              <thead className="bg-gradient-to-r from-orange-500 via-rose-400 to-amber-400">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ◆ SKU / Product
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ■ Current Stock
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ▲ Avg Daily Demand
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ● 7-Day Forecast
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ★ Risk Level
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ⏱ Days Until Stockout
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ➤ Recommended Action
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ✓ Confidence
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black text-white uppercase tracking-wider">
                    ⚙ Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-amber-100">
                {filteredForecasts.map((forecast, index) => (
                  <tr
                    key={forecast.productId}
                    className={`hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{forecast.sku}</div>
                      <div className="text-sm text-gray-500">{forecast.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{forecast.currentStock}</div>
                      <div className="text-xs text-gray-500">Reorder: {forecast.reorderLevel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {forecast.avgDailyDemand.toFixed(1)} units/day
                      </div>
                      <div className="text-xs text-gray-500">
                        Peak: {forecast.peakDailyDemand} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(forecast.avgDailyDemand * 7).toFixed(0)} units
                      </div>
                      <div className="text-xs text-gray-500">
                        {getSeasonalIcon(forecast.seasonalPattern)} {forecast.seasonalPattern}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskBadgeClass(
                          forecast.riskLevel
                        )}`}
                      >
                        {getActionIcon(forecast.riskLevel)} {forecast.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-bold ${
                          forecast.daysUntilStockout <= 3
                            ? 'text-red-600'
                            : forecast.daysUntilStockout <= 7
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {forecast.daysUntilStockout} days
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{forecast.recommendedAction}</div>
                      <div className="text-xs text-gray-500 font-medium">
                        Order: {forecast.recommendedOrderQuantity} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded ${getConfidenceBadgeClass(
                          forecast.confidenceScore
                        )}`}
                      >
                        {forecast.confidenceScore.toFixed(0)}%
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{forecast.forecastMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedProduct(forecast)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-500 transition-all duration-300 font-bold shadow-lg transform hover:scale-105"
                      >
                        ▶ View Chart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredForecasts.length === 0 && (
            <div className="text-center py-16 text-slate-600 bg-gradient-to-b from-amber-50 to-orange-50">
              <p className="text-2xl font-bold">📭 No forecasts available</p>
              <p className="text-sm mt-3 text-slate-500">Try adjusting your filters or add more products</p>
            </div>
          )}
        </div>
      )}

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredForecasts.slice(0, 6).map((forecast) => (
            <div key={forecast.productId} className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-amber-100 hover:border-orange-200 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-800">{forecast.productName}</h3>
                <p className="text-sm text-slate-500 font-medium">SKU: {forecast.sku}</p>
                <div className="flex gap-2 mt-3">
                  <span
                    className={`px-3 py-1.5 text-xs font-black rounded-xl ${getRiskBadgeClass(
                      forecast.riskLevel
                    )}`}
                  >
                    {forecast.riskLevel}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-2 border-emerald-200">
                    Confidence: {forecast.confidenceScore.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={getChartData(forecast)} options={chartOptions} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-2xl border-2 border-orange-100">
                  <p className="text-slate-600 font-bold">Current Stock</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{forecast.currentStock}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-100">
                  <p className="text-slate-600 font-bold">Avg Daily Demand</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {forecast.avgDailyDemand.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 rounded-2xl border-2 border-red-100">
                  <p className="text-slate-600 font-bold">Days to Stockout</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{forecast.daysUntilStockout}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-2xl border-2 border-amber-100">
                  <p className="text-slate-600 font-bold">Recommended Order</p>
                  <p className="text-2xl font-black text-amber-700 mt-1">
                    {forecast.recommendedOrderQuantity}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-orange-200">
            <div className="bg-gradient-to-r from-orange-500 via-rose-400 to-amber-400 p-8 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">
                    {selectedProduct.productName}
                  </h2>
                  <p className="text-orange-50 font-bold">SKU: {selectedProduct.sku}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-white hover:bg-white/20 rounded-2xl p-3 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Chart */}
              <div className="mb-8 bg-gradient-to-br from-slate-50 to-amber-50 p-6 rounded-3xl border-4 border-amber-100" style={{ height: '420px' }}>
                <Line data={getChartData(selectedProduct)} options={chartOptions} />
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-5 rounded-2xl border-3 border-orange-200 shadow-lg">
                  <p className="text-sm text-slate-700 mb-2 font-bold">Current Stock</p>
                  <p className="text-3xl font-black text-orange-600">{selectedProduct.currentStock}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-5 rounded-2xl border-3 border-emerald-200 shadow-lg">
                  <p className="text-sm text-slate-700 mb-2 font-bold">Avg Daily Demand</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {selectedProduct.avgDailyDemand.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-100 to-yellow-100 p-5 rounded-2xl border-3 border-amber-200 shadow-lg">
                  <p className="text-sm text-slate-700 mb-2 font-bold">Peak Demand</p>
                  <p className="text-3xl font-black text-amber-600">
                    {selectedProduct.peakDailyDemand}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-rose-100 to-orange-100 p-5 rounded-2xl border-3 border-rose-200 shadow-lg">
                  <p className="text-sm text-slate-700 mb-2 font-bold">Volatility</p>
                  <p className="text-3xl font-black text-rose-600">
                    {(selectedProduct.demandVolatility * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Daily Forecast Table */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📅</span> 7-Day Forecast Details
                </h3>
                <div className="overflow-x-auto rounded-2xl border-4 border-amber-100">
                  <table className="min-w-full divide-y divide-amber-200">
                    <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                      <tr>
                        <th className="px-5 py-4 text-left text-xs font-black text-slate-700 uppercase">
                          Date
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black text-slate-700 uppercase">
                          Day
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black text-slate-700 uppercase">
                          Forecasted Demand
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-black text-slate-700 uppercase">
                          Projected Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-amber-100">
                      {selectedProduct.dailyForecasts.map((day, index) => (
                        <tr key={index} className="hover:bg-orange-50 transition-colors duration-200">
                          <td className="px-5 py-4 text-sm font-bold text-slate-900">{day.date}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 font-medium">{day.dayOfWeek}</td>
                          <td className="px-5 py-4 text-sm font-bold text-slate-900">
                            {day.forecastedDemand} units
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <span
                              className={`font-black ${
                                day.cumulativeStock <= selectedProduct.reorderLevel
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {day.cumulativeStock} units
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 rounded-3xl border-4 border-orange-200 shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💡</span> AI Recommendation
                </h3>
                <p className="text-slate-700 mb-5 font-bold text-lg">{selectedProduct.recommendedAction}</p>
                <div className="flex flex-wrap gap-5">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-3 border-orange-200 flex-1 min-w-[200px]">
                    <p className="text-sm text-slate-600 font-bold mb-2">Recommended Order Quantity</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                      {selectedProduct.recommendedOrderQuantity} units
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-3 border-emerald-200 flex-1 min-w-[200px]">
                    <p className="text-sm text-slate-600 font-bold mb-2">Forecast Confidence</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {selectedProduct.confidenceScore.toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-3 border-amber-200 flex-1 min-w-[200px]">
                    <p className="text-sm text-slate-600 font-bold mb-2">Method Used</p>
                    <p className="text-base font-black text-slate-900 mt-2">
                      {selectedProduct.forecastMethod}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemandForecasting;
