import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { analyzeRestockNeeds } from '../services/geminiService';
import { RestockSuggestion } from '../types';
import { ShoppingCart, CheckCircle, Loader, FileText, ArrowRight } from 'lucide-react';

export const Restock: React.FC = () => {
  const { products, addOrder, navigate } = useInventory();
  const { notify } = useNotification();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RestockSuggestion[]>([]);
  const [generatedPOs, setGeneratedPOs] = useState<string[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    const data = await analyzeRestockNeeds(products);
    setSuggestions(data);
    setLoading(false);
  };

  const handleCreatePO = (suggestion: RestockSuggestion) => {
    const product = products.find(p => p.sku === suggestion.sku);
    if (!product) return;

    addOrder({
      sku: suggestion.sku,
      productName: suggestion.productName,
      quantity: suggestion.suggestedQuantity,
      vendor: suggestion.vendor,
      totalCost: suggestion.suggestedQuantity * product.unitPrice
    });

    setGeneratedPOs(prev => [...prev, suggestion.sku]);
    notify(`Purchase Order generated for ${suggestion.productName}`, 'success');
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Auto-Restock Recommendations</h2>
          <p className="text-gray-500 text-sm mt-1">AI-Suggested Purchase Orders</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all"
          >
             <span>View All Orders</span>
             <ArrowRight size={18} />
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition-all disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <ShoppingCart size={20} />}
            <span>Analyze Stock Needs</span>
          </button>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((item) => {
            const isOrdered = generatedPOs.includes(item.sku);
            return (
              <div key={item.sku} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg text-gray-800">{item.productName}</h3>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{item.sku}</span>
                  </div>
                  <p className="text-sm text-gray-600">Vendor: <span className="font-medium text-gray-900">{item.vendor}</span></p>
                  <p className="text-xs text-red-500 mt-2 font-medium bg-red-50 inline-block px-2 py-1 rounded">
                    Reason: {item.reason}
                  </p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Current</p>
                    <p className="font-bold text-gray-800">{item.currentStock}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase">Suggested Order</p>
                    <p className="font-bold text-indigo-600 text-xl">{item.suggestedQuantity}</p>
                  </div>
                </div>

                <div className="w-full md:w-auto">
                   {isOrdered ? (
                     <button disabled className="w-full flex items-center justify-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg cursor-default">
                        <CheckCircle size={18} />
                        <span>PO Created</span>
                     </button>
                   ) : (
                     <button 
                       onClick={() => handleCreatePO(item)}
                       className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <FileText size={18} />
                        <span>Generate PO</span>
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !loading && (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No immediate restock recommendations found or analysis not yet run.</p>
          </div>
        )
      )}
    </div>
  );
};