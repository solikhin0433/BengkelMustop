"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  Phone,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Ban,
  Car,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableLoading } from "@/components/ui/loader";

import { WorkOrder, WorkOrderStatus, PaymentStatus } from "@/features/work-orders/types";
import { WorkOrderStore } from "@/features/work-orders/work-order-store";
import WorkOrderFormDialog from "@/features/work-orders/components/WorkOrderFormDialog";
import WorkOrderDetailDialog from "@/features/work-orders/components/WorkOrderDetailDialog";
import WorkOrderCancelDialog from "@/features/work-orders/components/WorkOrderCancelDialog";
import WorkOrderPrintModal from "@/features/work-orders/components/WorkOrderPrintModal";

const BCrumb = [
  {
    to: "/admin",
    title: "Dashboard",
  },
  {
    title: "Perintah Kerja",
  },
];

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [filterPayment, setFilterPayment] = useState<string>("semua");

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<WorkOrder | null>(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [orderToView, setOrderToView] = useState<WorkOrder | null>(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<WorkOrder | null>(null);

  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<WorkOrder | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [lowStockCount, setLowStockCount] = useState<number>(6);
  const [lowStockSubtitle, setLowStockSubtitle] = useState<string>("Oli Yamalube, Busi Denso, dll.");

  // Load orders and masters directly from database
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const [data, masters] = await Promise.all([
        WorkOrderStore.getOrders(),
        WorkOrderStore.getMasters().catch(() => ({ customers: [], vehicles: [], services: [], parts: [] })),
      ]);
      setOrders(data);
      if (orderToView) {
        const found = data.find((o) => o.id === orderToView.id);
        if (found) setOrderToView(found);
      }
      if (masters?.parts && masters.parts.length > 0) {
        const lowStock = masters.parts.filter((p: any) => Number(p.stock_quantity) < 5);
        if (lowStock.length > 0) {
          setLowStockCount(lowStock.length);
          const sampleNames = lowStock.slice(0, 2).map((p: any) => p.name).join(", ") + ", dll.";
          setLowStockSubtitle(sampleNames);
        } else {
          setLowStockCount(0);
          setLowStockSubtitle("Semua stok sparepart aman");
        }
      }
    } catch (err) {
      console.error("Gagal memuat data perintah kerja:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      order.work_order_number.toLowerCase().includes(q) ||
      order.customer_name.toLowerCase().includes(q) ||
      order.plate_number.toLowerCase().includes(q) ||
      order.vehicle_model.toLowerCase().includes(q) ||
      order.customer_complaint.toLowerCase().includes(q) ||
      order.mechanic.toLowerCase().includes(q);

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

  // Total Pendapatan yang sudah diterima kasir (tunai / qris)
  const totalPendapatan = orders.reduce((sum, o) => sum + (o.amount_paid || 0), 0);

  // Total Piutang / Bon aktif (PK yang belum lunas)
  const unpaidOrders = orders.filter(
    (o) => o.status !== "cancelled" && (o.payment_status === "unpaid" || o.payment_status === "partial")
  );
  const totalPiutang = unpaidOrders.reduce(
    (sum, o) => sum + Math.max(0, o.grand_total - (o.amount_paid || 0)),
    0
  );
  const unpaidCustomersCount = unpaidOrders.length;

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
      sub: `${unpaidCustomersCount} Pelanggan • Siap kirim WA`,
      icon: "solar:bill-list-bold-duotone",
      bg: "bg-lightwarning",
      text: "text-warning",
    },
  ];

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

  // Handlers
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
    setPrintDialogOpen(true);
  };

  const handleOrderSaved = async () => {
    await loadOrders();
  };

  const handleOrderCancelled = async () => {
    await loadOrders();
  };

  const handleOrderDeleted = async (id: string) => {
    await loadOrders();
    if (orderToView?.id === id) {
      setDetailDialogOpen(false);
      setOrderToView(null);
    }
  };

  return (
    <>
      <BreadcrumbComp title="Perintah Kerja" items={BCrumb} />

      <div className="space-y-6">
        {/* ==================== KPI STATS CARDS ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => (
            <CardBox key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.sub}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${kpi.bg} ${kpi.text}`}
                >
                  <Icon icon={kpi.icon} className="h-6 w-6" />
                </div>
              </div>
            </CardBox>
          ))}
        </div>

        {/* TOP CONTROL BAR: SEARCH, FILTERS & ACTION */}
        <CardBox className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari No. Perintah Kerja, Nopol, Pelanggan, Keluhan, Mekanik..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* STATUS FILTER PILLS */}
              <div className="flex rounded-lg border border-border p-1 bg-muted/40">
                {[
                  { label: "Semua", value: "semua" },
                  { label: "Antri", value: "waiting" },
                  { label: "Dikerjakan", value: "in_progress" },
                  { label: "Menunggu Part", value: "waiting_parts" },
                  { label: "Selesai", value: "completed" },
                  { label: "Batal", value: "cancelled" },
                ].map((st) => (
                  <button
                    key={st.value}
                    onClick={() => setFilterStatus(st.value)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                      filterStatus === st.value
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* PAYMENT FILTER */}
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="semua">Semua Pembayaran</option>
                <option value="unpaid">Belum Bayar</option>
                <option value="partial">Bayar Sebagian / DP</option>
                <option value="paid">Lunas</option>
              </select>

              {/* REFRESH BUTTON */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadOrders}
                disabled={isLoading}
                title="Segarkan data dari database"
                className="h-10 px-3 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </Button>

              {/* CREATE WORK ORDER BUTTON */}
              <Button
                onClick={handleOpenCreate}
                className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10 shadow-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Perintah Kerja</span>
              </Button>
            </div>
          </div>
        </CardBox>

        {/* WORK ORDERS TABLE */}
        <CardBox className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">No. Perintah Kerja & Waktu</th>
                  <th className="py-3 px-4">Pelanggan & Nopol</th>
                  <th className="py-3 px-4">Keluhan & Jasa Servis</th>
                  <th className="py-3 px-4">Mekanik</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Biaya & Kasir</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <TableLoading
                    colSpan={7}
                    title="Menghubungkan ke Database Supabase..."
                    subtitle="Memuat data Perintah Kerja terkini"
                    size="md"
                  />
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-14 text-center text-muted-foreground text-sm"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <Wrench className="h-8 w-8 text-muted-foreground/60" />
                        <p className="font-semibold text-foreground">
                          {orders.length === 0
                            ? "Belum ada Perintah Kerja di Database"
                            : "Tidak ada data yang cocok dengan filter"}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          {orders.length === 0
                            ? "Klik tombol 'Buat Perintah Kerja' di atas untuk membuat perintah kerja baru."
                            : "Coba ubah kata kunci pencarian atau sesuaikan filter status dan pembayaran."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const servicesSummary = order.items
                      .filter((i) => i.item_type === "service")
                      .map((i) => i.item_name_snapshot)
                      .join(", ");

                    const sisa = Math.max(0, order.grand_total - (order.amount_paid || 0));

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* NO PK */}
                        <td className="py-4 px-4 font-mono font-medium text-primary text-xs">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(order)}
                            className="font-bold hover:underline text-left"
                          >
                            {order.work_order_number}
                          </button>
                          <span className="block text-[11px] text-muted-foreground font-sans mt-0.5">
                            {order.received_at}
                          </span>
                        </td>

                        {/* PELANGGAN & NOPOL */}
                        <td className="py-4 px-4">
                          <p className="font-semibold text-foreground text-sm">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                              {order.plate_number}
                            </span>
                            <span>• {order.vehicle_model}</span>
                          </p>
                        </td>

                        {/* KELUHAN & JASA */}
                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {servicesSummary || "Servis Reguler"}
                          </p>
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            Keluhan: {order.customer_complaint}
                          </p>
                        </td>

                        {/* MEKANIK */}
                        <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                          {order.mechanic.split(" ")[0]} {order.mechanic.split(" ")[1] || ""}
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4">
                          <Badge
                            variant={statusMeta[order.status]?.variant || "secondary"}
                            className="text-xs font-semibold"
                          >
                            {statusMeta[order.status]?.label || order.status}
                          </Badge>
                        </td>

                        {/* BIAYA & STATUS KASIR */}
                        <td className="py-4 px-4">
                          <p className="font-semibold text-foreground text-xs font-mono">
                            Rp {order.grand_total.toLocaleString("id-ID")}
                          </p>
                          <span
                            className={`text-[10px] font-semibold block mt-0.5 ${
                              order.payment_status === "paid"
                                ? "text-success font-bold"
                                : order.payment_status === "partial"
                                ? "text-warning font-bold"
                                : "text-muted-foreground"
                            }`}
                          >
                            {order.payment_status === "paid"
                              ? "LUNAS ✅"
                              : order.payment_status === "partial"
                              ? `DP (Sisa Rp ${sisa.toLocaleString("id-ID")})`
                              : "BELUM BAYAR"}
                          </span>
                        </td>

                        {/* AKSI */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Lihat Detail"
                              onClick={() => handleOpenDetail(order)}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Edit Perintah Kerja"
                              onClick={() => handleOpenEdit(order)}
                            >
                              <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                              title="Kirim Update WA"
                              asChild
                            >
                              <a
                                href={`https://wa.me/${order.customer_phone}?text=${encodeURIComponent(
                                  `Halo Bpk/Ibu ${order.customer_name}, update pengerjaan servis motor ${order.plate_number} di Bengkel_Mustop saat ini berstatus: ${statusMeta[order.status].label}. Total: Rp ${order.grand_total.toLocaleString("id-ID")}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              title="Cetak Nota / Perintah Kerja"
                              onClick={() => handleOpenPrint(order)}
                            >
                              <Printer className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            {order.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Batalkan Perintah Kerja"
                                onClick={() => handleOpenCancel(order)}
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>

      {/* ==================== MODALS ==================== */}
      {/* 1. Form Dialog (Create & Edit) */}
      <WorkOrderFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        orderToEdit={orderToEdit}
        onSaveSuccess={handleOrderSaved}
      />

      {/* 2. Detail Dialog */}
      <WorkOrderDetailDialog
        order={orderToView}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onEdit={handleOpenEdit}
        onCancelRequest={handleOpenCancel}
        onPrintRequest={handleOpenPrint}
        onOrderUpdated={handleOrderSaved}
      />

      {/* 3. Cancel Dialog */}
      <WorkOrderCancelDialog
        order={orderToCancel}
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onCancelled={handleOrderCancelled}
        onDeleted={handleOrderDeleted}
      />

      {/* 4. Print Modal */}
      <WorkOrderPrintModal
        order={orderToPrint}
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
      />
    </>
  );
}
