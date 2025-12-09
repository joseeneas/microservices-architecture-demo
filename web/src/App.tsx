import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { UsersPage } from './pages/UsersPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';

const queryClient = new QueryClient();

type Tab = 'users' | 'orders' | 'inventory';

function Dashboard() {
  const { isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-blue-50">
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'users' && <UsersPage />}
          {activeTab === 'orders' && <OrdersPage />}
          {activeTab === 'inventory' && <InventoryPage />}
        </Layout>
      </div>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

export default App;
