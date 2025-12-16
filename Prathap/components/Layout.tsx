import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  TrendingUp, 
  ShoppingCart, 
  LogOut, 
  Menu,
  X,
  Bell,
  FileText,
  UserCircle,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  ClipboardList
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useNotification } from '../context/NotificationContext';
import { UserRole } from '../types';
import { AIChatWidget } from './AIChatWidget';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, products, currentPath, navigate } = useInventory();
  const { notification, closeNotification } = useNotification();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderLevel).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Define all possible routes
  const allNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
    { icon: Package, label: 'Inventory', path: '/inventory', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
    { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: TrendingUp, label: 'AI Forecast', path: '/forecast', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: ShoppingCart, label: 'Auto Restock', path: '/restock', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: ClipboardList, label: 'Orders', path: '/orders', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
    { icon: FileText, label: 'Reports', path: '/reports', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: Users, label: 'Team & Users', path: '/users', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: UserCircle, label: 'My Role & Profile', path: '/profile', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
    { icon: BookOpen, label: 'User Guide', path: '/guide', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.VENDOR] },
  ];

  // Filter based on current user role
  const navItems = allNavItems.filter(item => user && item.roles.includes(user.role));

  const getToastStyles = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getToastIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'error': return <AlertCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] animate-slide-in flex items-center p-4 mb-4 rounded-lg border shadow-lg max-w-sm w-full ${getToastStyles(notification.type)}`}>
           <div className="flex-shrink-0">
             {getToastIcon(notification.type)}
           </div>
           <div className="ml-3 text-sm font-medium flex-1">
             {notification.message}
           </div>
           <button 
             type="button" 
             onClick={closeNotification}
             className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-white/50 transition-colors"
           >
             <X size={16} />
           </button>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            SmartShelfX
          </h1>
          <p className="text-xs text-slate-400 mt-1">AI-Powered Inventory</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={`#${item.path}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                currentPath === item.path 
                  ? 'bg-indigo-600 text-white shadow-md translate-x-1' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-left text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white md:hidden flex flex-col animate-fade-in">
          <div className="p-6 flex justify-between items-center border-b border-slate-700">
             <h1 className="text-xl font-bold">SmartShelfX</h1>
             <button onClick={() => setIsMobileMenuOpen(false)}>
               <X size={24} />
             </button>
          </div>
          <nav className="flex-1 p-4 space-y-4">
             {navItems.map((item) => (
              <a
                key={item.path}
                href={`#${item.path}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${
                   currentPath === item.path ? 'bg-indigo-600' : 'hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
             ))}
             <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-400">
                <LogOut size={20} />
                <span>Logout</span>
             </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 md:justify-end z-10">
          <button className="md:hidden text-gray-600" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex items-center space-x-4">
             <div className="relative">
               <button 
                 className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors"
                 onClick={() => setShowNotifications(!showNotifications)}
               >
                 <Bell size={20} />
                 {lowStockCount > 0 && (
                   <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                 )}
               </button>
               {showNotifications && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-4 animate-scale-up origin-top-right">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                     <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{lowStockCount} New</span>
                   </div>
                   {lowStockCount === 0 ? (
                     <div className="text-center py-4">
                        <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">All inventory levels are healthy!</p>
                     </div>
                   ) : (
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                       <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r shadow-sm">
                         <div className="flex items-start">
                           <AlertCircle size={16} className="text-red-600 mt-0.5 mr-2 shrink-0" />
                           <div>
                             <p className="text-xs font-bold text-red-800">Low Stock Warning</p>
                             <p className="text-xs text-red-700 mt-1">{lowStockCount} items are below reorder level. Check Inventory immediately.</p>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </header>

        {/* Page Content with Transition */}
        <div className="flex-1 overflow-auto p-6 scroll-smooth flex flex-col">
          <div key={currentPath} className="animate-fade-in flex-1">
             {children}
          </div>
          <footer className="mt-12 py-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} SmartShelfX. All rights reserved.</p>
              <p>Designed & Developed by <span className="font-semibold text-indigo-600">Pratap Sakthivel</span></p>
            </div>
          </footer>
        </div>

        {/* Floating AI Chat Widget */}
        {user && <AIChatWidget />}
      </main>
    </div>
  );
};