"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ArrowRight, Eye } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SalesOverview from "@/app/components/dashboard/SalesOverview";
import { YearlyBreakup } from "@/app/components/dashboard/YearlyBreakup";
import { MonthlyEarning } from "@/app/components/dashboard/MonthlyEarning";
import BreadcrumbComp from "../layout/shared/breadcrumb/BreadcrumbComp";

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
  // Sample realistic Bengkel_Mustop active work orders
  const [activeWorkOrders] = useState([
    {
      id: "PK-20261024-001",
      customer: "Hendra Wijaya",
      phone: "081299887766",
      plate: "B 4521 TZA",
      motor: "Honda Vario 160 (2023)",
      serviceType: "Servis CVT + Ganti Oli MPX2",
      mechanic: "Mas Slamet",
      status: "Dikerjakan",
      statusVariant: "warning" as const,
      estimatedCost: 145000,
      timeIn: "08:30 WIB",
    },
    {
      id: "PK-20261024-002",
      customer: "Dedi Supriyanto",
      phone: "085711223344",
      plate: "B 6102 PQR",
      motor: "Yamaha NMAX 155 (2022)",
      serviceType: "Tune Up Injeksi + Kampas Rem Depan",
      mechanic: "Agus Santoso",
      status: "Selesai",
      statusVariant: "success" as const,
      estimatedCost: 185000,
      timeIn: "09:15 WIB",
    },
    {
      id: "PK-20261024-003",
      customer: "Ahmad Fauzi",
      phone: "087855667788",
      plate: "B 3890 SXZ",
      motor: "Honda Beat Deluxe (2021)",
      serviceType: "Ganti Busi + Servis Ringan",
      mechanic: "Mas Slamet",
      status: "Antri",
      statusVariant: "info" as const,
      estimatedCost: 85000,
      timeIn: "10:00 WIB",
    },
    {
      id: "PK-20261024-004",
      customer: "Siti Rahmawati",
      phone: "081344556677",
      plate: "B 5420 UTR",
      motor: "Honda Scoopy eSP (2020)",
      serviceType: "Ganti V-Belt + Roller (Gredek)",
      mechanic: "Agus Santoso",
      status: "Menunggu Sparepart",
      statusVariant: "error" as const,
      estimatedCost: 220000,
      timeIn: "10:45 WIB",
    },
  ]);

  const kpis = [
    {
      title: "PK Masuk Hari Ini",
      value: "14 Motor",
      sub: "8 Selesai • 4 Dikerjakan • 2 Antri",
      icon: "solar:scooter-bold-duotone",
      bg: "bg-lightprimary",
      text: "text-primary",
    },
    {
      title: "Pendapatan Hari Ini",
      value: "Rp 1.845.000",
      sub: "Tunai & QRIS Kasir",
      icon: "solar:wallet-money-bold-duotone",
      bg: "bg-lightsuccess",
      text: "text-success",
    },
    {
      title: "Stok Menipis (< 5 pcs)",
      value: "6 Item",
      sub: "Oli Yamalube, Busi Denso, dll.",
      icon: "solar:box-minimalistic-bold-duotone",
      bg: "bg-lighterror",
      text: "text-error",
    },
    {
      title: "Piutang / Bon Aktif",
      value: "Rp 450.000",
      sub: "3 Pelanggan • Siap kirim WA",
      icon: "solar:bill-list-bold-duotone",
      bg: "bg-lightwarning",
      text: "text-warning",
    },
  ];

  return (
    <>
      <BreadcrumbComp title="Selamat Datang" items={BCrumb} />

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

      {/* ==================== ACTIVE WORK ORDERS TABLE ==================== */}
      <CardBox className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Perintah Kerja Hari Ini
            </h3>
            <p className="text-xs text-muted-foreground">
              Status antrean, pengerjaan montir, dan estimasi biaya perbaikan kendaraan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/work-orders">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <span>Lihat Semua Perintah Kerja</span>
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
                <th className="py-3 px-4">Estimasi</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeWorkOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-primary text-xs">
                    {order.id}
                    <span className="block text-[10px] text-muted-foreground font-sans">
                      Masuk: {order.timeIn}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-foreground text-sm">
                      {order.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.motor} •{" "}
                      <span className="font-mono font-medium text-foreground">
                        {order.plate}
                      </span>
                    </p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs truncate text-xs text-foreground">
                    {order.serviceType}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground">
                    {order.mechanic}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={order.statusVariant} className="text-xs">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground text-xs">
                    Rp {order.estimatedCost.toLocaleString("id-ID")}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Link href={`/admin/work-orders`}>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
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
  </>
);
}
