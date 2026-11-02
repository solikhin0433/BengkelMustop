"use client";

import React, { useState, useEffect } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import WorkOrderKPI from "./list/WorkOrderKPI";
import WorkOrderFilter from "./list/WorkOrderFilter";
import WorkOrderTable from "./list/WorkOrderTable";
import {
  WorkOrderFormDialog,
  WorkOrderDetailDialog,
  WorkOrderCancelDialog,
  WorkOrderPrintModal,
} from "./form";
import { WorkOrder, WorkOrderStatus } from "@/features/work-orders/types";
import { WorkOrderStore } from "@/features/work-orders/work-order-store";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Perintah Kerja" },
];

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [filterPayment, setFilterPayment] = useState<string>("semua");
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [lowStockSubtitle, setLowStockSubtitle] = useState<string>("Memeriksa database...");

  // Modal / Dialog States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<WorkOrder | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<WorkOrder | null>(null);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<WorkOrder | null>(null);

  // Status mapping
  const statusMeta: Record<
    WorkOrderStatus,
    { label: string; variant: "warning" | "success" | "error" | "default" | "secondary" | "outline" }
  > = {
    waiting: { label: "Antri", variant: "secondary" },
    in_progress: { label: "Dikerjakan", variant: "warning" },
    waiting_parts: { label: "Menunggu Sparepart", variant: "error" },
    completed: { label: "Selesai", variant: "success" },
    cancelled: { label: "Dibatalkan", variant: "outline" },
  };

  // Load Work Orders from Supabase
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await WorkOrderStore.getOrders();
      setOrders(data);
    } catch (e) {
      console.error("Gagal memuat perintah kerja:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Fetch live low stock count from master sparepart
    WorkOrderStore.getMasters()
      .then((m) => {
        const parts = m.parts || [];
        const low = parts.filter((p: any) => (p.stock_quantity ?? 0) < 5);
        setLowStockCount(low.length);
        if (low.length > 0) {
          const names = low.slice(0, 2).map((p: any) => p.name).join(", ");
          setLowStockSubtitle(`${names}${low.length > 2 ? "..." : ""}`);
        } else {
          setLowStockSubtitle("Semua stok suku cadang aman");
        }
      })
      .catch(() => {
        setLowStockSubtitle("Suku cadang aman");
      });
  }, []);

  // Filter Orders
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.work_order_number.toLowerCase().includes(term) ||
      order.customer_name.toLowerCase().includes(term) ||
      order.plate_number.toLowerCase().includes(term) ||
      order.customer_complaint.toLowerCase().includes(term) ||
      order.mechanic.toLowerCase().includes(term);

    const matchesStatus =
      filterStatus === "semua" || order.status === filterStatus;

    const matchesPayment =
      filterPayment === "semua" || order.payment_status === filterPayment;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // KPI Calculations
  const totalPK = orders.length;
  const inProgressPK = orders.filter((o) => o.status === "in_progress").length;
  const waitingPartsPK = orders.filter((o) => o.status === "waiting_parts").length;
  const waitingPK = orders.filter((o) => o.status === "waiting").length;
  const completedPK = orders.filter((o) => o.status === "completed").length;
  const totalPendapatan = orders.reduce((sum, o) => sum + (o.amount_paid || 0), 0);

  const unpaidOrders = orders.filter(
    (o) => o.status !== "cancelled" && (o.payment_status === "unpaid" || o.payment_status === "partial")
  );
  const totalPiutang = unpaidOrders.reduce(
    (sum, o) => sum + Math.max(0, o.grand_total - (o.amount_paid || 0)),
    0
  );

  const kpis = [
    {
      title: "Perintah Kerja Hari Ini",
      value: `${totalPK} Motor`,
      sub: `${completedPK} Selesai • ${inProgressPK} Dikerjakan • ${waitingPK} Antri`,
      icon: "solar:scooter-bold-duotone",
      bg: "bg-lightprimary",
      text: "text-primary",
    },
    {
      title: "Pendapatan Hari Ini",
      value: `Rp ${totalPendapatan.toLocaleString("id-ID")}`,
      sub: "Tunai & QRIS Kasir",
      icon: "solar:wallet-money-bold-duotone",
      bg: "bg-lightsuccess",
      text: "text-success",
    },
    {
      title: "Stok Menipis (< 5 pcs)",
      value: `${lowStockCount} Item`,
      sub: lowStockSubtitle,
      icon: "solar:box-minimalistic-bold-duotone",
      bg: "bg-lighterror",
      text: "text-error",
    },
    {
      title: "Piutang / Bon Aktif",
      value: `Rp ${totalPiutang.toLocaleString("id-ID")}`,
      sub: `${unpaidOrders.length} Pelanggan • Siap kirim WA`,
      icon: "solar:bill-list-bold-duotone",
      bg: "bg-lightwarning",
      text: "text-warning",
    },
  ];

  // Action Handlers
  const handleOpenCreate = () => {
    setOrderToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (order: WorkOrder) => {
    setDetailDialogOpen(false);
    setOrderToEdit(order);
    setFormDialogOpen(true);
  };

  const handleOpenDetail = (order: WorkOrder) => {
    setOrderToView(order);
    setDetailDialogOpen(true);
  };

  const handleOpenCancel = (order: WorkOrder) => {
    setDetailDialogOpen(false);
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handleOpenPrint = (order: WorkOrder) => {
    setOrderToPrint(order);
    setPrintModalOpen(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Hapus perintah kerja ini secara permanen dari database?")) {
      await WorkOrderStore.deleteOrder(orderId);
      await loadOrders();
    }
  };

  return (
    <>
      <BreadcrumbComp title="Perintah Kerja" items={BCrumb} />

      <div className="space-y-6">
        {/* LIST: KPI METRICS */}
        <WorkOrderKPI kpis={kpis} />

        {/* LIST: CONTROL BAR (SEARCH & FILTERS) */}
        <WorkOrderFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPayment={filterPayment}
          onPaymentChange={setFilterPayment}
          onRefresh={loadOrders}
          isLoading={isLoading}
          onOpenCreate={handleOpenCreate}
        />

        {/* LIST: DATA TABLE */}
        <WorkOrderTable
          orders={filteredOrders}
          allOrdersCount={totalPK}
          isLoading={isLoading}
          statusMeta={statusMeta}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEdit}
          onOpenPrint={handleOpenPrint}
          onOpenCancel={handleOpenCancel}
          onDeleteOrder={handleDeleteOrder}
        />
      </div>

      {/* FORM: CREATE & EDIT DIALOG */}
      <WorkOrderFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        orderToEdit={orderToEdit}
        onSaveSuccess={() => loadOrders()}
      />

      {/* FORM: DETAIL DIALOG */}
      <WorkOrderDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        order={orderToView}
        onEdit={handleOpenEdit}
        onCancelRequest={handleOpenCancel}
        onPrintRequest={handleOpenPrint}
        onOrderUpdated={() => loadOrders()}
      />

      {/* FORM: CANCEL WORK ORDER DIALOG */}
      <WorkOrderCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        order={orderToCancel}
        onCancelled={() => loadOrders()}
      />

      {/* FORM: PRINT MODAL */}
      <WorkOrderPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        order={orderToPrint}
      />
    </>
  );
}
