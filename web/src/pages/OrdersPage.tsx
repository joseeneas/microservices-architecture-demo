import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/ordersApi';
import { usersApi } from '../services/usersApi';
import { inventoryApi } from '../services/inventoryApi';
import { DataTable } from '../components/DataTable';
import type { Order, OrderCreate, OrderItem } from '../types';

export function OrdersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({ 
    id: '', 
    user_id: 0, 
    total: 0, 
    status: 'pending',
    items: [] as OrderItem[]
  });
  const [currentItem, setCurrentItem] = useState({ sku: '', quantity: 1, price: 0 });
  const [error, setError] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: inventoryApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      closeModal();
    },
    onError: (error: any) => {
      setError(error.response?.data?.detail || 'Failed to create order');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OrderCreate> }) =>
      ordersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  // Auto-calculate total when items change
  useEffect(() => {
    const total = formData.items.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      return sum + (price * item.quantity);
    }, 0);
    setFormData(prev => ({ ...prev, total }));
  }, [formData.items]);

  const openCreateModal = () => {
    setEditingOrder(null);
    setFormData({ id: '', user_id: 0, total: 0, status: 'pending', items: [] });
    setCurrentItem({ sku: '', quantity: 1, price: 0 });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({ 
      id: order.id, 
      user_id: order.user_id, 
      total: parseFloat(order.total), 
      status: order.status,
      items: order.items || []
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
    setError(null);
  };

  const addItem = () => {
    if (!currentItem.sku || currentItem.quantity <= 0 || currentItem.price <= 0) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...currentItem }]
    }));
    setCurrentItem({ sku: '', quantity: 1, price: 0 });
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (editingOrder) {
      const { id, ...updateData } = formData;
      updateMutation.mutate({ id: editingOrder.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'user_id', label: 'User ID' },
    {
      key: 'items',
      label: 'Items',
      render: (order: Order) => (
        <span className="text-muted">{order.items?.length || 0} item(s)</span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      render: (order: Order) => <span className="font-medium">${order.total}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (order: Order) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            order.status === 'completed'
              ? 'bg-success-bg text-success-fg'
              : order.status === 'pending'
              ? 'bg-warning-bg text-warning-fg'
              : order.status === 'cancelled'
              ? 'bg-error-bg text-error-fg'
              : 'bg-neutral-bg text-onSurface'
          }`}
        >
          {order.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (order: Order) => new Date(order.created_at).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-onSurface">Orders</h2>
          <p className="text-muted mt-1">Manage customer orders and track status</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-medium shadow-sm"
        >
          + Add Order
        </button>
      </div>

      <DataTable
        data={orders || []}
        columns={columns}
        onEdit={openEditModal}
        onDelete={(order) => handleDelete(order.id)}
        searchable={true}
        searchKeys={['id', 'status']}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingOrder ? 'Edit Order' : 'Create Order'}
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {!editingOrder && (
                <div className="mb-4">
                <label className="block text-sm font-medium text-onSurface mb-1">Order ID</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-onSurface mb-1">User</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value={0}>Select a user...</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-onSurface mb-2">Order Items</label>
                <div className="border border-gray-300 rounded-lg p-4 mb-2">
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="col-span-2">
                      <select
                        value={currentItem.sku}
                        onChange={(e) => {
                          const selectedItem = inventory?.find(i => i.sku === e.target.value);
                          setCurrentItem({
                            ...currentItem,
                            sku: e.target.value,
                            price: selectedItem ? 0 : 0
                          });
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Select SKU...</option>
                        {inventory?.map((item) => (
                          <option key={item.id} value={item.sku}>
                            {item.sku} (Stock: {item.qty})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
                      placeholder="Qty"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentItem.price}
                      onChange={(e) => setCurrentItem({ ...currentItem, price: parseFloat(e.target.value) })}
                      placeholder="Price"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!currentItem.sku || currentItem.quantity <= 0 || currentItem.price <= 0}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm px-3 py-1 rounded transition"
                  >
                    Add Item
                  </button>
                </div>

                {formData.items.length > 0 && (
                  <div className="border border-gray-300 rounded-lg p-3">
                  <div className="text-xs font-medium text-muted mb-2">Added Items:</div>
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm mb-1 bg-surface p-2 rounded">
                        <span>
                          {item.sku} × {item.quantity} @ ${typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-onSurface mb-1">Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-surface"
                />
                <p className="text-xs text-muted mt-1">Auto-calculated from items</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-onSurface mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-onSurface/70 hover:text-onSurface">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingOrder ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
