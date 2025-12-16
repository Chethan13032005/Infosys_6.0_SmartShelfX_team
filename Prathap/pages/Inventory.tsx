import React, { useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { Search, Plus, Filter, Edit2, Trash2, History, X, Upload, Download } from 'lucide-react';
import { Product, UserRole, Transaction } from '../types';

export const Inventory: React.FC = () => {
  const { products, transactions, addProduct, updateProduct, deleteProduct, user } = useInventory();
  const { notify } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Selected Product for History
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: 'Electronics', vendor: '', reorderLevel: 10, currentStock: 0, unitPrice: 0
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'ALL' || (filter === 'LOW' && p.currentStock <= p.reorderLevel);
    return matchesSearch && matchesFilter;
  });

  const canEdit = user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER;

  const handleOpenAdd = () => {
    setFormData({ name: '', sku: '', category: 'Electronics', vendor: '', reorderLevel: 10, currentStock: 0, unitPrice: 0 });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setFormData(product);
    setIsEditing(true);
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleOpenHistory = (product: Product) => {
    setSelectedProductHistory(product);
    setShowHistoryModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(id);
      notify('Product deleted successfully', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.name && formData.sku) {
      if (isEditing && editingId) {
        updateProduct({ ...formData, id: editingId } as Product);
        notify('Product updated successfully', 'success');
      } else {
        addProduct(formData as Omit<Product, 'id'>);
        notify('Product added successfully', 'success');
      }
      setShowModal(false);
    } else {
      notify('Please fill in required fields', 'error');
    }
  };

  // CSV Import Logic
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      processCSV(csvData);
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const processCSV = (csvText: string) => {
    const lines = csvText.split('\n');
    let successCount = 0;
    let failCount = 0;

    // Skip header row if exists (assume first row is header if it contains "sku" or "name")
    const startIndex = lines[0].toLowerCase().includes('sku') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Expected format: SKU,Name,Category,Vendor,Price,Stock,ReorderLevel
      const cols = line.split(',');
      if (cols.length >= 7) {
        try {
          const newProduct: Omit<Product, 'id'> = {
            sku: cols[0].trim(),
            name: cols[1].trim(),
            category: cols[2].trim(),
            vendor: cols[3].trim(),
            unitPrice: parseFloat(cols[4]),
            currentStock: parseInt(cols[5]),
            reorderLevel: parseInt(cols[6])
          };

          if (newProduct.sku && newProduct.name) {
            addProduct(newProduct);
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      } else {
        failCount++;
      }
    }

    if (successCount > 0) {
      notify(`Successfully imported ${successCount} products.`, 'success');
    }
    if (failCount > 0) {
      notify(`Failed to import ${failCount} rows due to format errors.`, 'error');
    }
  };

  // Filter transactions for specific product
  const productTransactions = selectedProductHistory 
    ? transactions.filter(t => t.productId === selectedProductHistory.id)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Catalog</h2>
        {canEdit && (
          <div className="flex space-x-3">
             {/* Hidden File Input */}
             <input 
               type="file" 
               accept=".csv" 
               ref={fileInputRef} 
               onChange={handleFileUpload} 
               className="hidden" 
             />
             <button 
               onClick={handleImportClick}
               className="flex items-center space-x-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm active:scale-95"
             >
               <Upload size={18} />
               <span>Import CSV</span>
             </button>
             <button 
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus size={18} />
              <span>Add Product</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-500" />
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Items</option>
            <option value="LOW">Low Stock Only</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">SKU / Product</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Stock Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.sku}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.vendor}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">${p.unitPrice}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${p.currentStock <= p.reorderLevel ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    <span className={`text-sm ${p.currentStock <= p.reorderLevel ? 'text-red-700 font-medium' : 'text-gray-600'}`}>
                      {p.currentStock} Units
                    </span>
                  </div>
                  {p.currentStock <= p.reorderLevel && (
                     <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded ml-4">Restock Needed</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <button 
                      onClick={() => handleOpenHistory(p)}
                      className="text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
                      title="View History"
                    >
                      <History size={16} />
                    </button>
                    {canEdit ? (
                      <>
                        <button 
                          onClick={() => handleOpenEdit(p)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs italic">View Only</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No products found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-scale-up">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                   <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                   <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <select className="w-full border rounded-lg px-3 py-2 bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                     <option>Electronics</option>
                     <option>Furniture</option>
                     <option>Accessories</option>
                     <option>Clothing</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                   <input required type="text" className="w-full border rounded-lg px-3 py-2" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} />
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                   <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                   <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})} />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Lv</label>
                   <input required type="number" className="w-full border rounded-lg px-3 py-2" value={formData.reorderLevel} onChange={e => setFormData({...formData, reorderLevel: Number(e.target.value)})} />
                 </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isEditing ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedProductHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
               <div>
                 <h3 className="text-xl font-bold text-gray-800">Transaction History</h3>
                 <p className="text-sm text-gray-500">{selectedProductHistory.name} (SKU: {selectedProductHistory.sku})</p>
               </div>
               <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                 <X size={24} />
               </button>
            </div>
            
            <div className="overflow-auto p-6 flex-1">
               {productTransactions.length > 0 ? (
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                       <th className="px-4 py-3">Date</th>
                       <th className="px-4 py-3">Type</th>
                       <th className="px-4 py-3">Quantity</th>
                       <th className="px-4 py-3">Handler</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {productTransactions.map(tx => (
                       <tr key={tx.id}>
                         <td className="px-4 py-3 text-sm text-gray-600">{tx.timestamp}</td>
                         <td className="px-4 py-3">
                           <span className={`px-2 py-1 rounded text-xs font-bold ${
                             tx.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                             {tx.type}
                           </span>
                         </td>
                         <td className="px-4 py-3 text-sm font-medium">{tx.quantity}</td>
                         <td className="px-4 py-3 text-sm text-gray-600">{tx.handledBy}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="text-center py-10 text-gray-500">
                   No transaction history recorded for this item yet.
                 </div>
               )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center">
               <span className="text-sm font-medium text-gray-600">Current Stock: {selectedProductHistory.currentStock}</span>
               <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};