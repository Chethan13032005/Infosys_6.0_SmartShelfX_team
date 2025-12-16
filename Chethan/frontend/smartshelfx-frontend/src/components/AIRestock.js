import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { getToken } from '../utils/auth';
import { toast } from 'react-toastify';
import { getUserRole } from '../utils/auth';

const AIRestock = () => {
  const [predictions, setPredictions] = useState([]);
  const [modifiedPredictions, setModifiedPredictions] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    fetchAIPredictions();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${config.apiUrl}/users/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const fetchAIPredictions = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.get(`${config.apiUrl}/ai-restock/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle both old and new response formats
      const suggestions = res.data.suggestions || res.data;
      setPredictions(suggestions);
      
      // Initialize modified predictions with AI recommendations
      setModifiedPredictions(suggestions.map(p => ({
        ...p,
        modifiedQuantity: p.recommendedOrderQuantity || p.recommendedQuantity,
        modifiedVendorId: p.vendorId,
        modifiedVendorName: p.vendorName,
        isDeleted: false
      })));
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch AI predictions';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorChange = (productId, newVendorId) => {
    const vendor = vendors.find(v => v.id === parseInt(newVendorId));
    setModifiedPredictions(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { 
              ...p, 
              modifiedVendorId: parseInt(newVendorId),
              modifiedVendorName: vendor ? vendor.fullName : p.vendorName
            }
          : p
      )
    );
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setModifiedPredictions(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, modifiedQuantity: Math.max(0, parseInt(newQuantity) || 0) }
          : p
      )
    );
  };

  const handleDeleteItem = (productId) => {
    setModifiedPredictions(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, isDeleted: true }
          : p
      )
    );
    // Remove from selection if it was selected
    const newSelected = new Set(selectedItems);
    newSelected.delete(productId);
    setSelectedItems(newSelected);
    toast.info('Item marked for deletion');
  };

  const handleRestoreItem = (productId) => {
    setModifiedPredictions(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { ...p, isDeleted: false }
          : p
      )
    );
    toast.success('Item restored');
  };

  const handleResetQuantity = (productId) => {
    const original = predictions.find(p => p.productId === productId);
    setModifiedPredictions(prev => 
      prev.map(p => 
        p.productId === productId 
          ? { 
              ...p, 
              modifiedQuantity: original?.recommendedOrderQuantity || original?.recommendedQuantity || p.recommendedQuantity,
              modifiedVendorId: original?.vendorId,
              modifiedVendorName: original?.vendorName
            }
          : p
      )
    );
    toast.info('Reset to AI recommendation');
  };

  const getActiveItems = () => {
    return modifiedPredictions.filter(p => !p.isDeleted);
  };

  const getDeletedItems = () => {
    return modifiedPredictions.filter(p => p.isDeleted);
  };

  const handleProceedToReview = () => {
    const activeItems = getActiveItems();
    if (activeItems.length === 0) {
      toast.warning('No items to review. Please restore some items or refresh predictions.');
      return;
    }
    setShowReviewModal(true);
  };

  const handleSelectItem = (prediction) => {
    if (prediction.isDeleted) return; // Can't select deleted items
    const newSelected = new Set(selectedItems);
    if (newSelected.has(prediction.productId)) {
      newSelected.delete(prediction.productId);
    } else {
      newSelected.add(prediction.productId);
    }
    setSelectedItems(newSelected);
  };

  const handleCreatePurchaseOrder = async () => {
    const role = (getUserRole() || '').toLowerCase();
    const canCreate = role === 'manager' || role === 'admin';
    if (!canCreate) {
      toast.warning('Only Managers or Admins can create purchase orders');
      return;
    }
    if (selectedItems.size === 0) {
      toast.warning('Please select at least one product');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      
      // Build the edited items list from modified predictions
      const itemsToCreate = modifiedPredictions
        .filter(p => !p.isDeleted && selectedItems.has(p.productId))
        .map(p => ({
          productId: p.productId,
          quantity: p.modifiedQuantity,
          vendorId: p.modifiedVendorId || p.vendorId
        }));

      if (itemsToCreate.length === 0) {
        toast.error('No valid items to create purchase orders');
        setLoading(false);
        return;
      }

      // Call the new endpoint to create POs
      const response = await axios.post(
        `${config.apiUrl}/purchase-orders/create`,
        { items: itemsToCreate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`✅ ${response.data.totalOrders} Purchase Orders created successfully!`);
      setShowReviewModal(false);
      setSelectedItems(new Set());
      
      // Refresh predictions
      fetchAIPredictions();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create purchase orders';
      toast.error(errorMsg);
      console.error('Error creating POs:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectCritical = () => {
    const ids = getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'CRITICAL').map(p => p.productId);
    setSelectedItems(new Set(ids));
  };

  const selectHigh = () => {
    const ids = getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'HIGH').map(p => p.productId);
    setSelectedItems(new Set(ids));
  };

  const selectAll = () => {
    const ids = getActiveItems().map(p => p.productId);
    setSelectedItems(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const getSelectedPredictions = () => {
    return modifiedPredictions
      .filter(p => !p.isDeleted && selectedItems.has(p.productId))
      .map(p => ({
        id: p.productId,
        name: p.productName,
        sku: p.sku,
        reorderLevel: p.reorderLevel,
        reorderQuantity: p.modifiedQuantity, // Use modified quantity
        currentStock: p.currentStock
      }));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🤖</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Auto-Restock
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Review AI predictions, modify quantities, and approve items for restocking
          </p>
          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={fetchAIPredictions}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >🔄 Refresh Predictions</button>
            {((getUserRole() || '').toLowerCase() === 'manager' || (getUserRole() || '').toLowerCase() === 'admin') && (
              <button
                onClick={handleProceedToReview}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 font-semibold"
                disabled={getActiveItems().length === 0}
              >
                📋 Review & Create Orders ({getActiveItems().length})
              </button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Critical Items</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'CRITICAL').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide">High Priority</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'HIGH').length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Active Products</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{getActiveItems().length}</div>
            {getDeletedItems().length > 0 && (
              <div className="text-xs text-red-600 mt-1">{getDeletedItems().length} removed</div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Quantity</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">
              {getActiveItems().reduce((sum, p) => sum + (p.modifiedQuantity || 0), 0)}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* AI Predictions Table */}
        {predictions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <span className="text-6xl mb-4 block">📦</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All Stock Levels Healthy!</h3>
            <p className="text-gray-500">No products need restocking at this time.</p>
          </div>
        ) : (
          <>
            {/* Active Items Section */}
            {getActiveItems().length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>🎯</span>
                    AI Restock Recommendations - Review & Modify
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Adjust quantities or remove items before creating purchase orders
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 border-b-2 border-indigo-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Current Stock
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          AI Analysis
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          AI Recommended
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Your Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getActiveItems().map((prediction, index) => (
                        <tr 
                          key={prediction.productId}
                          className={`hover:bg-indigo-50 transition-colors ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{prediction.productName}</div>
                            <div className="text-sm text-gray-500">SKU: {prediction.sku}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{prediction.currentStock}</div>
                            <div className="text-xs text-gray-500">Reorder: {prediction.reorderLevel}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(prediction.urgency || prediction.riskLevel)}`}>
                              {prediction.urgency || prediction.riskLevel}
                            </span>
                            {prediction.consumptionRate && (
                              <div className="text-xs text-gray-600 mt-1">
                                {Math.ceil(prediction.currentStock / prediction.consumptionRate)} days left
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-md">
                              {prediction.aiAnalysis || (
                                <div className="space-y-1">
                                  {prediction.consumptionRate && (
                                    <div>
                                      <span className="font-semibold">{prediction.consumptionRate.toFixed(2)}</span> /day
                                    </div>
                                  )}
                                  {prediction.confidence && (
                                    <div className={`text-xs font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                                      {prediction.confidence.toFixed(0)}% confidence
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-lg text-indigo-600">
                              {prediction.recommendedOrderQuantity || prediction.recommendedQuantity}
                            </div>
                            {prediction.consumptionRate && (
                              <div className="text-xs text-gray-500">
                                ≈{Math.ceil((prediction.recommendedOrderQuantity || prediction.recommendedQuantity) / prediction.consumptionRate)} days supply
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                value={prediction.modifiedQuantity}
                                onChange={(e) => handleQuantityChange(prediction.productId, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-semibold text-center"
                              />
                              {prediction.modifiedQuantity !== (prediction.recommendedOrderQuantity || prediction.recommendedQuantity) && (
                                <button
                                  onClick={() => handleResetQuantity(prediction.productId)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                  title="Reset to AI recommendation"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                            {prediction.modifiedQuantity !== (prediction.recommendedOrderQuantity || prediction.recommendedQuantity) && (
                              <div className="text-xs mt-1 text-orange-600">
                                Modified from AI: {prediction.recommendedOrderQuantity || prediction.recommendedQuantity}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={prediction.modifiedVendorId || prediction.vendorId}
                              onChange={(e) => handleVendorChange(prediction.productId, e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            >
                              {vendors.map(vendor => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.fullName || vendor.email}
                                </option>
                              ))}
                            </select>
                            <div className="text-xs text-gray-500 mt-1">
                              {prediction.modifiedVendorName || prediction.vendorName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteItem(prediction.productId)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-semibold"
                              title="Remove this item from restock list"
                            >
                              🗑️ Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Deleted Items Section */}
            {getDeletedItems().length > 0 && (
              <div className="bg-gray-100 rounded-2xl shadow-lg overflow-hidden mb-6">
                <div className="bg-gray-700 px-6 py-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>🗑️</span>
                    Removed Items ({getDeletedItems().length})
                  </h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getDeletedItems().map((prediction) => (
                      <div key={prediction.productId} className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-700">{prediction.productName}</div>
                          <div className="text-xs text-gray-500">SKU: {prediction.sku}</div>
                        </div>
                        <button
                          onClick={() => handleRestoreItem(prediction.productId)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm font-semibold"
                        >
                          ↩️ Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Review & Create Orders Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>📋</span>
                  Review AI Restock Recommendations
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  Review your selections and create purchase orders
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="text-sm text-indigo-600 font-semibold mb-1">Total Items</div>
                    <div className="text-3xl font-bold text-indigo-700">{getActiveItems().length}</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-sm text-red-600 font-semibold mb-1">Critical</div>
                    <div className="text-3xl font-bold text-red-700">
                      {getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'CRITICAL').length}
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="text-sm text-orange-600 font-semibold mb-1">High Priority</div>
                    <div className="text-3xl font-bold text-orange-700">
                      {getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'HIGH').length}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-semibold mb-1">Total Units</div>
                    <div className="text-3xl font-bold text-green-700">
                      {getActiveItems().reduce((sum, p) => sum + (p.modifiedQuantity || 0), 0)}
                    </div>
                  </div>
                </div>

                {/* Selection Options */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Quick Selection Options</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={selectCritical}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >Select Critical ({getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'CRITICAL').length})</button>
                    <button
                      onClick={selectHigh}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                    >Select High ({getActiveItems().filter(p => (p.urgency || p.riskLevel) === 'HIGH').length})</button>
                    <button
                      onClick={selectAll}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >Select All ({getActiveItems().length})</button>
                    <button
                      onClick={clearSelection}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >Clear Selection</button>
                  </div>
                </div>

                {/* Items Review Table */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <span>📦</span>
                    Items Ready for Purchase Order Creation
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                            <input
                              type="checkbox"
                              checked={selectedItems.size === getActiveItems().length && getActiveItems().length > 0}
                              onChange={() => selectedItems.size === getActiveItems().length ? clearSelection() : selectAll()}
                              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Urgency</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Stock</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">AI Recommended</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Your Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Vendor</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getActiveItems().map((pred, idx) => (
                          <tr key={pred.productId} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${selectedItems.has(pred.productId) ? 'bg-indigo-50' : ''}`}>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(pred.productId)}
                                onChange={() => handleSelectItem(pred)}
                                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{pred.productName}</div>
                              <div className="text-xs text-gray-500">SKU: {pred.sku}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(pred.urgency || pred.riskLevel)}`}>
                                {pred.urgency || pred.riskLevel}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-gray-900">{pred.currentStock}</div>
                              {pred.consumptionRate && (
                                <div className="text-xs text-gray-500">{Math.ceil(pred.currentStock / pred.consumptionRate)} days left</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-indigo-600">{pred.recommendedOrderQuantity || pred.recommendedQuantity}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-lg text-gray-900">{pred.modifiedQuantity}</div>
                              {pred.modifiedQuantity !== (pred.recommendedOrderQuantity || pred.recommendedQuantity) && (
                                <div className="text-xs text-orange-600">✏️ Modified</div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">{pred.modifiedVendorName || pred.vendorName}</div>
                            </td>
                            <td className="px-4 py-3">
                              {pred.confidence && (
                                <div className={`text-xs font-semibold ${getConfidenceColor(pred.confidence)}`}>
                                  {pred.confidence.toFixed(0)}% AI confidence
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Notice */}
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div>
                      <h4 className="font-bold text-yellow-800 mb-1">Next Steps</h4>
                      <p className="text-sm text-yellow-700">
                        Click \"Create Purchase Orders\" to generate POs grouped by vendor. 
                        All POs will be set to \"Pending Approval\" status and vendors will receive email notifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{selectedItems.size}</span> of <span className="font-semibold">{getActiveItems().length}</span> items selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                    disabled={loading}
                  >
                    ← Back to Edit
                  </button>
                  <button
                    onClick={handleCreatePurchaseOrder}
                    disabled={selectedItems.size === 0 || loading}
                    className={`px-6 py-2 rounded-lg font-semibold shadow-lg ${
                      selectedItems.size === 0 || loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                    }`}
                  >
                    {loading ? '⏳ Creating...' : `✅ Create Purchase Orders (${selectedItems.size})`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRestock;
