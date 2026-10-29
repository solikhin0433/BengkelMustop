// Tipe data Perintah
export type WorkOrderStatus =
  | "waiting"        // Antri / Menunggu Dikerjakan
  | "in_progress"    // Sedang Dikerjakan Mekanik
  | "waiting_parts"  // Menunggu Suku Cadang
  | "completed"      // Selesai Servis
  | "cancelled";     // Dibatalkan

export type PaymentStatus =
  | "unpaid"   // Belum Bayar
  | "partial"  // Bayar Sebagian (DP / Bon)
  | "paid"     // Lunas
  | "void";    // Batal / Refund

export type PaymentMethod = "cash" | "bank_transfer" | "qris_manual" | "other";

export interface WorkOrderItem {
  id: string;
  work_order_id: string;
  item_type: "service" | "part";
  service_id?: string;
  part_id?: string;
  item_name_snapshot: string;
  sku_snapshot?: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  line_total: number;
}

export interface WorkOrder {
  id: string;
  work_order_number: string;
  invoice_number?: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  vehicle_id: string;
  plate_number: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year?: number;
  current_km?: number;
  received_at: string;
  completed_at?: string;
  status: WorkOrderStatus;
  mechanic: string;
  customer_complaint: string;
  inspection_notes?: string;
  recommendation?: string;
  internal_notes?: string;
  subtotal_service: number;
  subtotal_parts: number;
  discount_amount: number;
  additional_charge: number;
  grand_total: number;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  amount_paid: number;
  due_date?: string;
  payment_promise_date?: string;
  payment_promise_note?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  items: WorkOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface MasterCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
}

export interface MasterVehicle {
  id: string;
  customer_id: string;
  plate_number: string;
  brand: string;
  model: string;
  production_year?: number;
}

export interface MasterService {
  id: string;
  name: string;
  code: string;
  default_price: number;
  description?: string;
}

export interface MasterPart {
  id: string;
  name: string;
  sku: string;
  unit: string;
  selling_price: number;
  stock_quantity: number;
}
