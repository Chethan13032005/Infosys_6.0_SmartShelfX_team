import React from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Transactions } from './pages/Transactions';
import { Forecast } from './pages/Forecast';
import { Restock } from './pages/Restock';
import { Orders } from './pages/Orders';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { UserGuide } from './pages/UserGuide';
import { Users } from './pages/Users';

const AppRoutes = () => {
  const { user, currentPath } = useInventory();
  
  // Normalize path ensures consistency (e.g. hash can be #dashboard or #/dashboard)
  const path = currentPath.startsWith('/') ? currentPath : '/' + currentPath;

  // Public Routes
  if (path === '/' || path === '/login') {
    return <Login />;
  }

  // Protected Routes Handling
  if (!user) {
    // If user tries to access protected route without login, show Login
    return <Login />;
  }

  const PageContent = () => {
     switch(path) {
        case '/dashboard': return <Dashboard />;
        case '/inventory': return <Inventory />;
        case '/transactions': return <Transactions />;
        case '/forecast': return <Forecast />;
        case '/restock': return <Restock />;
        case '/orders': return <Orders />;
        case '/reports': return <Reports />;
        case '/profile': return <Profile />;
        case '/guide': return <UserGuide />;
        case '/users': return <Users />;
        default: return <Dashboard />; // Redirect unknown protected routes to Dashboard
     }
  };

  return (
    <Layout>
      <PageContent />
    </Layout>
  );
};

function App() {
  return (
    <NotificationProvider>
      <InventoryProvider>
        <AppRoutes />
      </InventoryProvider>
    </NotificationProvider>
  );
}

export default App;