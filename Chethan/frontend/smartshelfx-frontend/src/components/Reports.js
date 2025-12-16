import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';

const Reports = () => {
  const [availableReports, setAvailableReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [format, setFormat] = useState('xlsx');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    days: 7
  });

  useEffect(() => {
    fetchAvailableReports();
  }, []);

  const fetchAvailableReports = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${config.apiUrl}/reports/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableReports(res.data.reports);
    } catch (err) {
      console.error('Failed to fetch available reports:', err);
      toast.error('Failed to load available reports');
    }
  };

  const handleExportReport = async () => {
    if (!selectedReport) {
      toast.warning('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      let url = `${config.apiUrl}/reports/${selectedReport}?format=${format}`;

      // Add filters based on report type
      if (['stock-transactions', 'user-activity'].includes(selectedReport)) {
        if (filters.startDate) url += `&startDate=${filters.startDate}`;
        if (filters.endDate) url += `&endDate=${filters.endDate}`;
      }
      
      if (selectedReport === 'purchase-orders' && filters.status) {
        url += `&status=${filters.status}`;
      }

      if (selectedReport === 'ai-forecast' && filters.days) {
        url += `&days=${filters.days}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([res.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Extract filename from content-disposition header or generate one
      const contentDisposition = res.headers['content-disposition'];
      let filename = `report_${Date.now()}.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) filename = filenameMatch[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error('Failed to export report:', err);

      // Try to surface server error details even when axios is using blob responseType
      let message = err.response?.data;
      if (message instanceof Blob) {
        try {
          const text = await message.text();
          try {
            const parsed = JSON.parse(text);
            message = parsed.error || parsed.message || text;
          } catch (_) {
            message = text;
          }
        } catch (_) {
          message = null;
        }
      } else if (typeof message === 'object' && message !== null) {
        message = message.error || message.message;
      }

      toast.error(message || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const getReportIcon = (reportId) => {
    const icons = {
      'inventory': '📦',
      'stock-transactions': '🔁',
      'purchase-orders': '🧾',
      'low-stock': '🚨',
      'ai-forecast': '🤖',
      'vendor-performance': '🧩',
      'user-activity': '👨‍💼',
      'notifications': '🔔'
    };
    return icons[reportId] || '📄';
  };

  const needsDateFilter = ['stock-transactions', 'user-activity'].includes(selectedReport);
  const needsStatusFilter = selectedReport === 'purchase-orders';
  const needsDaysFilter = selectedReport === 'ai-forecast';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Export Reports</h1>
          <p className="text-gray-600">
            Generate and download comprehensive reports for auditing, analytics, and record-keeping
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Selection Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Reports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedReport === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start">
                      <span className="text-3xl mr-3">{getReportIcon(report.id)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                      {selectedReport === report.id && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {availableReports.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p>No reports available for your role</p>
                </div>
              )}
            </div>
          </div>

          {/* Export Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Export Settings</h2>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">File Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['xlsx', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        format === fmt
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {format === 'xlsx' && 'Excel spreadsheet with formatting'}
                  {format === 'csv' && 'Comma-separated values, universal format'}
                </p>
              </div>

              {/* Date Range Filter */}
              {needsDateFilter && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range (Optional)</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Date</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Filter */}
              {needsStatusFilter && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Status</h3>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="DISPATCHED">Dispatched</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}

              {/* Days Filter */}
              {needsDaysFilter && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Forecast Period</h3>
                  <select
                    value={filters.days}
                    onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="7">Next 7 days</option>
                    <option value="30">Next 30 days</option>
                  </select>
                </div>
              )}

              {/* Export Button */}
              <button
                onClick={handleExportReport}
                disabled={!selectedReport || loading}
                className={`w-full py-3 px-4 rounded-md font-semibold transition-all ${
                  !selectedReport || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Report
                  </div>
                )}
              </button>

              {selectedReport && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  Selected: <span className="font-medium">
                    {availableReports.find(r => r.id === selectedReport)?.name}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Report Information</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Reports are generated in real-time with the latest data</li>
                <li>• XLSX format includes formatting and is recommended for analysis</li>
                <li>• CSV format is universal and works with all spreadsheet software</li>
                <li>• Use date filters to export data for specific time periods</li>
                <li>• All exports include timestamps in the filename</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
