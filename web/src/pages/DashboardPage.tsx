import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

interface UserAnalytics {
  total_users: number;
  active_users: number;
  inactive_users: number;
  role_breakdown: Record<string, number>;
  recent_signups_7d: number;
}

interface OrderAnalytics {
  total_orders: number;
  total_revenue: string;
  status_breakdown: Record<string, number>;
  recent_orders_7d: number;
  recent_orders: Array<{
    id: string;
    user_id: number;
    total: string;
    status: string;
    created_at: string;
  }>;
}

interface InventoryAnalytics {
  total_items: number;
  total_quantity: number;
  out_of_stock: number;
  low_stock: number;
  low_stock_items: Array<{
    id: number;
    sku: string;
    qty: number;
  }>;
}

export function DashboardPage() {
  const { user } = useAuth();

  const { data: userAnalytics } = useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: async (): Promise<UserAnalytics> => {
      const response = await fetch('/users/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch user analytics');
      return response.json();
    }
  });

  const { data: orderAnalytics } = useQuery({
    queryKey: ['analytics', 'orders'],
    queryFn: async (): Promise<OrderAnalytics> => {
      const response = await fetch('/orders/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order analytics');
      return response.json();
    }
  });

  const { data: inventoryAnalytics } = useQuery({
    queryKey: ['analytics', 'inventory'],
    queryFn: async (): Promise<InventoryAnalytics> => {
      const response = await fetch('/inventory/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch inventory analytics');
      return response.json();
    }
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-onSurface">Dashboard</h2>
        <p className="text-muted mt-1">Analytics and key metrics overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Total Revenue</p>
              <p className="text-2xl font-bold text-onSurface mt-1">
                ${orderAnalytics?.total_revenue || '0.00'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            {orderAnalytics?.total_orders || 0} total orders
          </p>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Recent Orders</p>
              <p className="text-2xl font-bold text-onSurface mt-1">
                {orderAnalytics?.recent_orders_7d || 0}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Last 7 days</p>
        </div>

        {/* Users Card */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Active Users</p>
                <p className="text-2xl font-bold text-onSurface mt-1">
                  {userAnalytics?.active_users || 0}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-muted mt-2">
              {userAnalytics?.total_users || 0} total users
            </p>
          </div>
        )}

        {/* Inventory Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {inventoryAnalytics?.low_stock || 0}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-muted mt-2">
            {inventoryAnalytics?.out_of_stock || 0} out of stock
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-onSurface mb-4">Recent Orders</h3>
          {orderAnalytics?.recent_orders && orderAnalytics.recent_orders.length > 0 ? (
            <div className="space-y-3">
              {orderAnalytics.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-surface rounded">
                  <div>
                    <p className="font-medium text-onSurface">{order.id}</p>
                    <p className="text-sm text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-onSurface">${order.total}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">No recent orders</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-onSurface mb-4">Low Stock Alerts</h3>
          {inventoryAnalytics?.low_stock_items && inventoryAnalytics.low_stock_items.length > 0 ? (
            <div className="space-y-3">
              {inventoryAnalytics.low_stock_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded">
                  <div>
                    <p className="font-medium font-mono text-onSurface">{item.sku}</p>
                    <p className="text-sm text-muted">SKU</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        item.qty === 0
                          ? 'text-red-600'
                          : item.qty < 10
                          ? 'text-orange-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {item.qty} units
                    </p>
                    <p className="text-xs text-muted">
                      {item.qty === 0 ? 'Out of stock' : 'Low stock'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-4">No low stock items</p>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      {user?.role === 'admin' && orderAnalytics?.status_breakdown && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-bold text-onSurface mb-4">Order Status Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(orderAnalytics.status_breakdown).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-surface rounded">
                <p className="text-2xl font-bold text-onSurface">{count}</p>
                <p className="text-sm text-muted capitalize mt-1">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
