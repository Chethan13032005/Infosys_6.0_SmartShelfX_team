import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Transaction, User, UserRole, PurchaseOrder, OrderStatus } from '../types';

interface InventoryContextType {
  user: User | null;
  users: User[];
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  products: Product[];
  transactions: Transaction[];
  orders: PurchaseOrder[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  recordTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: number) => void;
  addOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, sku: 'TECH-001', name: 'Wireless Mouse', category: 'Electronics', vendor: 'TechSolutions Inc', currentStock: 120, reorderLevel: 50, unitPrice: 25 },
  { id: 2, sku: 'TECH-002', name: 'Mechanical Keyboard', category: 'Electronics', vendor: 'TechSolutions Inc', currentStock: 15, reorderLevel: 20, unitPrice: 85 },
  { id: 3, sku: 'OFF-101', name: 'Office Chair', category: 'Furniture', vendor: 'ComfortSeating', currentStock: 8, reorderLevel: 10, unitPrice: 150 },
  { id: 4, sku: 'OFF-102', name: 'Standing Desk', category: 'Furniture', vendor: 'ComfortSeating', currentStock: 45, reorderLevel: 15, unitPrice: 300 },
  { id: 5, sku: 'ACC-500', name: 'USB-C Hub', category: 'Accessories', vendor: 'GadgetWorld', currentStock: 200, reorderLevel: 30, unitPrice: 40 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 1, productId: 1, productName: 'Wireless Mouse', type: 'IN', quantity: 50, timestamp: '2023-10-25 10:00', handledBy: 'Manager' },
  { id: 2, productId: 2, productName: 'Mechanical Keyboard', type: 'OUT', quantity: 5, timestamp: '2023-10-26 14:30', handledBy: 'Admin' },
];

const INITIAL_USERS: User[] = [
  { id: 1, name: 'System Admin', email: 'admin@smartshelfx.com', role: UserRole.ADMIN, phone: '+1 (555) 010-9999', bio: 'Responsible for overall system maintenance and user access control.' },
  { id: 2, name: 'John Manager', email: 'manager@smartshelfx.com', role: UserRole.MANAGER, phone: '+1 (555) 012-3456', bio: 'Warehouse operations lead. Contact for stock discrepancies.' },
  { id: 3, name: 'TechSolutions Rep', email: 'sales@techsolutions.com', role: UserRole.VENDOR, phone: '+1 (555) 987-6543', bio: 'Official supplier account for TechSolutions Inc.' },
  { id: 4, name: 'Comfort Seating', email: 'orders@comfort.com', role: UserRole.VENDOR, phone: '+1 (555) 111-2222' },
];

const INITIAL_ORDERS: PurchaseOrder[] = [
  { id: 'PO-1001', sku: 'TECH-002', productName: 'Mechanical Keyboard', quantity: 20, vendor: 'TechSolutions Inc', status: 'PENDING', createdAt: '2023-10-27 09:00', totalCost: 1700 }
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage if available, otherwise use defaults
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ssx_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('ssx_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('ssx_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ssx_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [orders, setOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('ssx_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Router State
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.hash.replace('#', '') || '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace('#', '') || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  // Persist state changes to LocalStorage
  useEffect(() => {
    if (user) localStorage.setItem('ssx_user', JSON.stringify(user));
    else localStorage.removeItem('ssx_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ssx_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('ssx_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ssx_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ssx_orders', JSON.stringify(orders));
  }, [orders]);


  const login = (email: string, role: UserRole) => {
    const existingUser = users.find(u => u.email === email && u.role === role);
    setUser(existingUser || { id: Date.now(), name: 'Demo User', email, role });
  };

  const logout = () => setUser(null);

  const addProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts([...products, { ...newProduct, id: Date.now() }]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const recordTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    // Update product stock
    setProducts(prev => prev.map(p => {
      if (p.id === tx.productId) {
        const change = tx.type === 'IN' ? tx.quantity : -tx.quantity;
        return { ...p, currentStock: p.currentStock + change };
      }
      return p;
    }));

    // Add transaction record
    setTransactions([
      { ...tx, id: Date.now(), timestamp: new Date().toLocaleString() },
      ...transactions
    ]);
  };

  const addUser = (newUser: Omit<User, 'id'>) => {
    setUsers([...users, { ...newUser, id: Date.now() }]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) {
      setUser(updatedUser);
    }
  };

  const deleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addOrder = (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `PO-${Math.floor(Math.random() * 10000)}`,
      status: 'PENDING',
      createdAt: new Date().toLocaleString()
    };
    setOrders([newOrder, ...orders]);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If status changing to DELIVERED, automatically add stock
        if (status === 'DELIVERED' && o.status !== 'DELIVERED') {
           const product = products.find(p => p.sku === o.sku);
           if (product) {
             recordTransaction({
               productId: product.id,
               productName: product.name,
               type: 'IN',
               quantity: o.quantity,
               handledBy: 'Auto-Restock System'
             });
           }
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  return (
    <InventoryContext.Provider value={{ 
      user, users, login, logout, 
      products, transactions, orders,
      addProduct, updateProduct, deleteProduct, recordTransaction,
      addUser, updateUser, deleteUser,
      addOrder, updateOrderStatus,
      currentPath, navigate
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};