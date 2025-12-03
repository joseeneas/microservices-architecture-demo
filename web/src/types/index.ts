export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
}

export interface Order {
  id: string;
  user_id: number;
  total: string;
  status: string;
  created_at: string;
}

export interface OrderCreate {
  id: string;
  user_id: number;
  total: number;
  status?: string;
}

export interface OrderUpdate {
  user_id?: number;
  total?: number;
  status?: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  qty: number;
  created_at: string;
}

export interface InventoryItemCreate {
  sku: string;
  qty: number;
}

export interface InventoryItemUpdate {
  sku?: string;
  qty?: number;
}
