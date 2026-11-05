export interface ServiceItem {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  default_price: number;
  is_public: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SparepartCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface SparepartItem {
  id: string;
  category_id: string | null;
  sku: string | null;
  name: string;
  unit: string;
  selling_price: number;
  average_cost: number;
  stock_quantity: number;
  stock_minimum: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface CustomerVehicle {
  id: string;
  customer_id: string;
  plate_number: string;
  brand: string;
  model: string;
  created_at?: string;
}

export interface CustomerWorkOrderSummary {
  id: string;
  work_order_number: string;
  received_at: string;
  grand_total: number;
  amount_paid: number;
  payment_status: string;
  status: string;
}

export interface VehicleItem {
  id: string;
  customer_id: string;
  plate_number: string;
  plate_number_normalized?: string;
  brand: string;
  model: string;
  created_at: string;
  updated_at?: string;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    phone_normalized?: string | null;
    address?: string | null;
  } | null;
  total_services?: number;
  last_service?: string | null;
  work_orders?: Array<{
    id: string;
    work_order_number: string;
    received_at: string;
    status: string;
    grand_total: number;
    amount_paid?: number;
    payment_status: string;
    customer_complaint?: string;
  }>;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string | null;
  phone_normalized: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles?: CustomerVehicle[];
  total_visits?: number;
  last_visit?: string | null;
  total_unpaid?: number;
  work_orders?: CustomerWorkOrderSummary[];
}
