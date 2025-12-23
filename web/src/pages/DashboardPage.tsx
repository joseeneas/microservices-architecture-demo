import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { DataTable } from '../components/DataTable';
import apiClient from '../services/apiClient';

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
  const { user, token } = useAuth();

  const { data: userAnalytics } = useQuery({
    queryKey: ['analytics', 'users'],
    enabled: !!token,
    refetchOnMount: 'always',
    queryFn: async (): Promise<UserAnalytics> => {
      const { data } = await apiClient.get('/users/analytics');
      return data;
    },
  });

  const { data: orderAnalytics } = useQuery({
    queryKey: ['analytics', 'orders'],
    enabled: !!token,
    refetchOnMount: 'always',
    queryFn: async (): Promise<OrderAnalytics> => {
      const { data } = await apiClient.get('/orders/analytics');
      return data;
    },
  });

  const { data: inventoryAnalytics } = useQuery({
    queryKey: ['analytics', 'inventory'],
    enabled: !!token,
    refetchOnMount: 'always',
    queryFn: async (): Promise<InventoryAnalytics> => {
      const { data } = await apiClient.get('/inventory/analytics');
      return data;
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-onSurface">Dashboard</h2>
        <p className="text-muted mt-1">Analytics and key metrics overview</p>
      </div>

      {/* Key Metrics Table */}
      <div className="w-[50%] mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-onSurface mb-3">Key Metrics</h3>
        <DataTable
          data={[
            { metric: 'Total Revenue', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(orderAnalytics?.total_revenue ?? 0)) },
            { metric: 'Total Orders', value: String(orderAnalytics?.total_orders ?? 0) },
            { metric: 'Recent Orders (7d)', value: String(orderAnalytics?.recent_orders_7d ?? 0) },
            ...(user?.role === 'admin' ? [{ metric: 'Active Users', value: `${userAnalytics?.active_users ?? 0} (from ${userAnalytics?.total_users ?? 0})` }] : []),
            { metric: 'Low Stock', value: String(inventoryAnalytics?.low_stock ?? 0) },
            { metric: 'Inventory out of stock', value: String(inventoryAnalytics?.out_of_stock ?? 0) },
          ]}
          columns={[
            { key: 'metric', label: 'Metric' },
            { key: 'value', label: 'Value', align: 'right' as const },
          ]}
          searchable={false}
          pagination={false}
        />
      </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders (Table) */}
        <div className="w-[75%] mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-onSurface mb-4">Recent Orders</h3>
            {orderAnalytics?.recent_orders?.length ? (
              <>
              {(() => {
                const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
                return (
              <DataTable
                data={orderAnalytics.recent_orders}
                columns={[
                  { key: 'id', label: 'Order ID', sortable: true, thClassName: 'w-[28%]' },
                  { key: 'user_id', label: 'User ID', align: 'right', sortable: true, thClassName: 'w-[12%]' },
                  {
                    key: 'total', label: 'Total', align: 'right', thClassName: 'w-[18%]',
                    render: (row: any) => <span className="font-medium">{currency.format(Number(row.total))}</span>,
                  },
                  {
                    key: 'status', label: 'Status', thClassName: 'w-[18%]',
                    render: (row: any) => (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        row.status === 'completed' ? 'bg-green-100 text-green-800'
                        : row.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    )
                  },
                  {
                    key: 'created_at', label: 'Created', align: 'right', thClassName: 'w-[24%]',
                    render: (row: any) => new Date(row.created_at).toLocaleString(),
                  }
                ]}
                pagination={true}
                searchable={true}
                searchKeys={['id', 'status', 'user_id']}
                defaultPageSize={5}
              />
                );
              })()}
              </>
            ) : (
              <p className="text-muted text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Low Stock (Table) */}
        <div className="w-[75%] mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-onSurface mb-4">Low Stock Alerts</h3>
            {inventoryAnalytics?.low_stock_items?.length ? (
              <DataTable
                data={inventoryAnalytics.low_stock_items}
                columns={[
                  { key: 'sku', label: 'SKU', thClassName: 'w-[40%]', render: (row: any) => <span className="font-mono">{row.sku}</span> },
                  { key: 'qty', label: 'Quantity', align: 'right', thClassName: 'w-[20%]' },
                  { key: 'id', label: 'ID', align: 'right', thClassName: 'w-[20%]' }
                ]}
                pagination={false}
                searchable={true}
                searchKeys={['sku']}
                defaultPageSize={5}
              />
            ) : (
              <p className="text-muted text-center py-4">No low stock items</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Breakdown (Table) */}
      {user?.role === 'admin' && orderAnalytics?.status_breakdown && (
        <div className="w-[50%] mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-bold text-onSurface mb-4">Order Status Breakdown</h3>
              <DataTable
                data={Object.entries(orderAnalytics.status_breakdown).map(([status, count]) => ({ status, count }))}
                columns={[
                  { key: 'status', label: 'Status' },
                  { key: 'count', label: 'Count', align: 'right' },
                ]}
                pagination={false}
                searchable={false}
              />
          </div>
        </div>
      )}
    </div>
  );
}
