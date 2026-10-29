import {
  WorkOrder,
  WorkOrderStatus,
  PaymentStatus,
  PaymentMethod,
  MasterCustomer,
  MasterVehicle,
  MasterService,
  MasterPart,
  WorkOrderItem,
} from "./types";

export const WorkOrderStore = {
  // ==================== WORK ORDERS ====================
  async getOrders(): Promise<WorkOrder[]> {
    try {
      const res = await fetch("/api/work-orders", { cache: "no-store" });
      if (!res.ok) {
        console.warn("Peringatan: Gagal mengambil data perintah kerja:", res.statusText);
        return [];
      }
      const json = await res.json();
      return json.data || [];
    } catch (e: any) {
      console.warn("WorkOrderStore.getOrders warning:", e?.message || e);
      return [];
    }
  },

  async createOrder(data: {
    customer_id?: string;
    is_new_customer?: boolean;
    new_customer_name?: string;
    new_customer_phone?: string;
    new_customer_address?: string;
    vehicle_id?: string;
    is_new_vehicle?: boolean;
    new_plate?: string;
    new_brand?: string;
    new_model?: string;
    new_year?: number;
    current_km?: number;
    mechanic: string;
    customer_complaint: string;
    inspection_notes?: string;
    recommendation?: string;
    internal_notes?: string;
    items: Omit<WorkOrderItem, "id" | "work_order_id">[];
    discount_amount?: number;
    additional_charge?: number;
    payment_status?: PaymentStatus;
    payment_method?: PaymentMethod;
    amount_paid?: number;
    due_date?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Gagal membuat perintah kerja" };
      }
      return { success: true, data: json.data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateOrder(
    id: string,
    updates: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Gagal memperbarui data" };
      }
      return { success: true, data: json.data };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async updateStatus(
    id: string,
    status: WorkOrderStatus
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/work-orders/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Gagal mengubah status" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async recordPayment(
    id: string,
    amount: number,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/work-orders/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, payment_method: paymentMethod }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Gagal mencatat pembayaran" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async cancelOrder(
    id: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/work-orders/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || "Gagal membatalkan perintah kerja" };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/work-orders/${id}`, {
        method: "DELETE",
      });
      return res.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // ==================== MASTERS (Pelanggan, Kendaraan, Jasa, Sparepart) ====================
  async getMasters(): Promise<{
    customers: MasterCustomer[];
    vehicles: MasterVehicle[];
    services: MasterService[];
    parts: MasterPart[];
  }> {
    try {
      const res = await fetch("/api/work-orders/masters", { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal mengambil master data dari database");
      return await res.json();
    } catch (e) {
      console.error("WorkOrderStore.getMasters error:", e);
      return { customers: [], vehicles: [], services: [], parts: [] };
    }
  },
};
