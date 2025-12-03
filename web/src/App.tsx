import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UsersPage } from './pages/UsersPage';
import { OrdersPage } from './pages/OrdersPage';
import { InventoryPage } from './pages/InventoryPage';

const queryClient = new QueryClient();

type Tab = 'users' | 'orders' | 'inventory';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Microservices Dashboard</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'users'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'orders'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === 'inventory'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Inventory
              </button>
            </nav>
          </div>

          <div>
            {activeTab === 'users' && <UsersPage />}
            {activeTab === 'orders' && <OrdersPage />}
            {activeTab === 'inventory' && <InventoryPage />}
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
