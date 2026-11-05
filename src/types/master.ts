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

export type StockMovementType =
  | "purchase_in"
  | "service_out"
  | "adjustment_in"
  | "adjustment_out"
  | "return_in"
  | "reversal_in"
  | "reversal_out";

export interface StockMutationItem {
  id: string;
  part_id: string;
  movement_type: StockMovementType;
  quantity_delta: number;
  unit_cost: number | null;
  reference_type: string;
  reference_id: string | null;
  idempotency_key?: string | null;
  reason: string;
  created_at: string;
  part?: {
    id: string;
    name: string;
    sku: string | null;
    unit: string;
    stock_quantity: number;
    selling_price: number;
    category?: {
      id: string;
      name: string;
    } | null;
  } | null;
}

export interface InventorySummary {
  totalItems: number;
  totalAssetValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  mutationsTodayCount: number;
  itemsOutToday: number;
  itemsInToday: number;
}

export type PaymentMethodType = "cash" | "bank_transfer" | "qris_manual" | "other";

export interface PaymentTransactionItem {
  id: string;
  receipt_number: string;
  work_order_id: string;
  payment_type: "payment" | "refund";
  paid_at: string;
  amount: number;
  payment_method: PaymentMethodType;
  reference_number: string | null;
  notes: string | null;
  status: "valid" | "void";
  receipt_issued_at?: string | null;
  created_at: string;
  work_order?: {
    id: string;
    work_order_number: string;
    grand_total: number;
    payment_status: string;
    status: string;
    customer?: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
    vehicle?: {
      id: string;
      plate_number: string;
      brand: string;
      model: string;
    } | null;
  } | null;
}

export interface PendingWorkOrderItem {
  id: string;
  work_order_number: string;
  received_at: string;
  customer_name: string;
  customer_phone: string | null;
  plate_number: string;
  motor_info: string;
  status: string;
  payment_status: string;
  grand_total: number;
  amount_paid: number;
  remaining_balance: number;
}

export interface PaymentSummary {
  incomeToday: number;
  totalTransactionsToday: number;
  cashIncomeToday: number;
  nonCashIncomeToday: number;
  pendingOrdersCount: number;
  totalPendingAmount: number;
}

export interface CustomerReceivableItem {
  work_order_id: string;
  work_order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  vehicle_id: string;
  plate_number: string;
  vehicle_brand: string;
  vehicle_model: string;
  received_at: string;
  due_date: string | null;
  total_tagihan: number;
  jumlah_dibayar_bersih: number;
  jumlah_bon: number;
  umur_bon_hari: number;
  terlambat_hari: number | null;
  payment_status: string;
}

export interface ReceivableSummary {
  totalReceivables: number;
  totalReceivableAmount: number;
  overdueCount: number;
  overdueAmount: number;
  todayDueCount: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
}

export interface ExpenseItem {
  id: string;
  expense_date: string;
  category_id: string;
  description: string;
  amount: number;
  payment_method: string;
  supplier_id: string | null;
  receipt_path: string | null;
  status: "valid" | "void";
  created_at: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface ExpenseSummary {
  totalExpenseThisMonth: number;
  totalExpenseToday: number;
  transactionCountThisMonth: number;
  topCategoryName: string;
}

export interface FinancialReportData {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalWorkOrders: number;
    totalPartsSold: number;
  };
  revenueBreakdown: {
    servicesTotal: number;
    partsTotal: number;
    cashTotal: number;
    qrisTotal: number;
    transferTotal: number;
  };
  expenseBreakdown: Array<{
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  dailyTransactions: Array<{
    date: string;
    revenue: number;
    expenses: number;
    net: number;
    workOrdersCount: number;
  }>;
}

export interface WorkshopSettings {
  id?: string;
  shop_name: string;
  tagline?: string | null;
  description?: string | null;
  whatsapp_number: string;
  address?: string | null;
  maps_url?: string | null;
  opening_hours?: Record<string, string>;
  public_email?: string | null;
  logo_path?: string | null;
  updated_at?: string;
}

export interface DashboardOverviewData {
  todayWorkOrdersCount: number;
  todayCompletedCount: number;
  todayInProgressCount: number;
  todayPendingCount: number;
  todayIncome: number;
  lowStockCount: number;
  lowStockItemsSummary: string;
  activeReceivablesAmount: number;
  activeReceivablesCount: number;
  activeWorkOrders: Array<{
    id: string;
    work_order_number: string;
    customer_name: string;
    plate_number: string;
    vehicle_model: string;
    complaint: string;
    assigned_mechanic: string | null;
    status: string;
    grand_total: number;
    received_at: string;
  }>;
}
