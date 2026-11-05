"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ArrowRight, Eye, RefreshCw, AlertCircle, Wrench } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SalesOverview from "@/app/components/dashboard/SalesOverview";
import { YearlyBreakup } from "@/app/components/dashboard/YearlyBreakup";
import { MonthlyEarning } from "@/app/components/dashboard/MonthlyEarning";
import BreadcrumbComp from "../layout/shared/breadcrumb/BreadcrumbComp";
import { PageLoading } from "@/components/ui/loader";
import { DashboardOverviewData } from "@/types/master";

const BCrumb = [
  {
    to: "/admin",
    title: "Dashboard",
  },
  {
    title: "Ringkasan Operasional",
  },
];

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardOverviewData>({
    todayWorkOrdersCount: 0,
    todayCompletedCount: 0,
    todayInProgressCount: 0,
    todayPendingCount: 0,
    todayIncome: 0,
    lowStockCount: 0,
    lowStockItemsSummary: "Semua stok aman",
    activeReceivablesAmount: 0,
    activeReceivablesCount: 0,
    activeWorkOrders: [],
  });

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/overview");
      const json = await res.json();
      if (res.ok && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat overview dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return <Badge variant="success" className="text-xs">Selesai</Badge>;
      case "dikerjakan":
        return <Badge variant="warning" className="text-xs">Dikerjakan</Badge>;
      case "menunggu_part":
        return <Badge variant="error" className="text-xs">Menunggu Part</Badge>;
      case "antri":
        return <Badge variant="info" className="text-xs">Antri</Badge>;
      case "batal":
        return <Badge variant="outline" className="text-xs">Batal</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const kpis = [
    {
      title: "PK Masuk Hari Ini",
      value: `${data.todayWorkOrdersCount} Motor`,
      sub: `${data.todayCompletedCount} Selesai • ${data.todayInProgressCount} Dikerjakan • ${data.todayPendingCount} Antri`,
      icon: "solar:scooter-bold-duotone",
      bg: "bg-lightprimary",
      text: "text-primary",
      link: "/admin/work-orders",
    },
    {
      title: "Pendapatan Hari Ini",
      value: `Rp ${data.todayIncome.toLocaleString("id-ID")}`,
      sub: "Tunai & QRIS Kasir",
      icon: "solar:wallet-money-bold-duotone",
      bg: "bg-lightsuccess",
      text: "text-success",
      link: "/admin/payments",
    },
    {
      title: "Stok Menipis (<= Min)",
      value: `${data.lowStockCount} Item`,
      sub: data.lowStockItemsSummary,
      icon: "solar:box-minimalistic-bold-duotone",
      bg: "bg-lighterror",
      text: "text-error",
      link: "/admin/inventory",
    },
    {
      title: "Piutang / Bon Aktif",
      value: `Rp ${data.activeReceivablesAmount.toLocaleString("id-ID")}`,
      sub: `${data.activeReceivablesCount} Pelanggan • Siap kirim WA`,
      icon: "solar:bill-list-bold-duotone",
      bg: "bg-lightwarning",
      text: "text-warning",
      link: "/admin/receivables",
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <BreadcrumbComp title="Selamat Datang" items={BCrumb} />
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOverview}
          disabled={loading}
          className="gap-2 self-start sm:self-center"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Segarkan</span>
        </Button>
      </div>

      {loading ? (
        <PageLoading
          title="Memeriksa data..."
          subtitle="Memuat ringkasan operasional terkini"
        />
      ) : (
        <div className="space-y-6">
          {/* ==================== KPI STATS CARDS ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, idx) => (
              <Link key={idx} href={kpi.link} className="block transition-transform hover:-translate-y-0.5">
                <CardBox className="p-5 h-full hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {kpi.title}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground">
                        {kpi.value}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
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
              </Link>
            ))}
          </div>

          {/* ==================== ACTIVE WORK ORDERS TABLE ==================== */}
          <CardBox className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Perintah Kerja Terbaru & Aktif
                </h3>
                <p className="text-xs text-muted-foreground">
                  Status antrean pengerjaan montir dan estimasi biaya servis.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/admin/work-orders">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <span>Kelola Semua Perintah Kerja</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4">No. Perintah Kerja</th>
                    <th className="py-3 px-4">Pelanggan & Motor</th>
                    <th className="py-3 px-4">Layanan / Keluhan</th>
                    <th className="py-3 px-4">Mekanik</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Estimasi / Biaya</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.activeWorkOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Wrench className="h-10 w-10 stroke-1 mb-2 text-muted-foreground/50" />
                          <p className="font-medium text-foreground text-sm">
                            Belum ada data perintah kerja
                          </p>
                          <p className="text-xs mt-1">
                            Klik menu Perintah Kerja untuk mulai mencatat antrean servis motor.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.activeWorkOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-primary text-xs">
                          {order.work_order_number}
                          <span className="block text-[10px] text-muted-foreground font-sans">
                            {order.received_at
                              ? new Date(order.received_at).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }) + " WIB"
                              : "-"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground text-sm">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.vehicle_model} •{" "}
                            <span className="font-mono font-medium text-foreground">
                              {order.plate_number}
                            </span>
                          </p>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-xs text-foreground">
                          {order.complaint}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground">
                          {order.assigned_mechanic}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-foreground text-xs">
                          Rp {order.grand_total.toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link href={`/admin/work-orders`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBox>

          {/* ==================== ANALYTICS & CHARTS SECTION ==================== */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8">
              <SalesOverview />
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <YearlyBreakup />
              <MonthlyEarning />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
