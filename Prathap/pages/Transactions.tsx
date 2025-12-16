import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';

export const Transactions: React.FC = () => {
  const { products, recordTransaction, user } = useInventory();
  const { notify } = useNotification();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [type, setType] = useState<'IN' | 'OUT'>('IN');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      notify('Please select a product first.', 'error');
      return;
    }

    const product = products.find(p => p.id === Number(selectedProduct));
    if (!product) {
      notify('Product not found.', 'error');
      return;
    }

    if (type === 'OUT' && product.currentStock < quantity) {
      notify(`Insufficient stock! Only ${product.currentStock} units available.`, 'error');
      return;
    }

    recordTransaction({
      productId: product.id,
      productName: product.name,
      type,
      quantity,
      handledBy: user?.name || 'Unknown'
    });

    notify(`Successfully ${type === 'IN' ? 'received' : 'dispatched'} ${quantity} units of ${product.name}.`, 'success');
    setQuantity(1);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-scale-up">
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${type === 'IN' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setType('IN')}
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowDownCircle size={20} className={type === 'IN' ? 'animate-bounce' : ''} />
              <span>Stock In (Receiving)</span>
            </div>
          </button>
          <button 
            className={`flex-1 py-4 text-center font-medium transition-all duration-200 ${type === 'OUT' ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setType('OUT')}
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowUpCircle size={20} className={type === 'OUT' ? 'animate-bounce' : ''} />
              <span>Stock Out (Dispatch)</span>
            </div>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition-shadow"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                required
              >
                <option value="">-- Choose Item --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku}) - Current: {p.currentStock}
                  </option>
                ))}
              </select>
            </div>

            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input 
                type="number" 
                min="1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <button 
              type="submit" 
              className={`w-full py-3 rounded-lg text-white font-medium shadow-md transition-all transform hover:scale-[1.01] active:scale-[0.99] flex justify-center items-center space-x-2 ${type === 'IN' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              <Check size={18} />
              <span>Confirm {type === 'IN' ? 'Receipt' : 'Dispatch'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};