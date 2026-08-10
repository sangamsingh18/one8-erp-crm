export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  gst_number?: string;
  customer_type: 'retail' | 'wholesale' | 'distributor';
  address?: string;
  status: 'lead' | 'active' | 'inactive';
  follow_up_date?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  warehouse_loc?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  quantity: number;
  movement_type: 'IN' | 'OUT';
  reason?: string;
  reference_id?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
}

export interface ChallanItem {
  id: string;
  challan_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Challan {
  id: string;
  challan_number: string;
  customer_id: string;
  customer_name?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  total_quantity: number;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  confirmed_at?: string;
  updated_at: string;
  items?: ChallanItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}
