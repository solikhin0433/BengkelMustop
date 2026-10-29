"use client";

import React, { useState } from "react";
import {
  Search,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Send,
  Calendar,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BCrumb = [
  {
    to: "/admin",
    title: "Dashboard",
  },
  {
    title: "Piutang & Bon Pelanggan",
  },
];

export default function ReceivablesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [receivables] = useState([
    {
      id: "BON-001",
      workOrderId: "PK-20261018-009",
      customer: "Pak RT Sunarto",
      phone: "6281233445566",
      plate: "B 1234 ABC",
      motor: "Honda Supra X 125",
      totalBill: 350000,
      paidAmount: 200000,
      remainingAmount: 150000,
      dueDate: "30 Okt 2026",
      serviceDate: "18 Okt 2026",
      notes: "Janji lunasi akhir bulan pas gajian.",
    },
    {
      id: "BON-002",
      workOrderId: "PK-20261020-003",
      customer: "Mas Joko Bengkel Las",
      phone: "6285677889900",
      plate: "B 9912 WXY",
      motor: "Yamaha Mio M3",
      totalBill: 280000,
      paidAmount: 100000,
      remainingAmount: 180000,
      dueDate: "27 Okt 2026",
      serviceDate: "20 Okt 2026",
      notes: "Sisa ganti kampas ganda CVT.",
    },
    {
      id: "BON-003",
      workOrderId: "PK-20261022-005",
      customer: "Doni Prasetyo",
      phone: "628991234567",
      plate: "B 4410 ZZZ",
      motor: "Honda CB150R",
      totalBill: 420000,
      paidAmount: 300000,
      remainingAmount: 120000,
      dueDate: "01 Nov 2026",
      serviceDate: "22 Okt 2026",
      notes: "DP ganti rantai gir set SSS.",
    },
  ]);

  const totalRemaining = receivables.reduce(
    (acc, cur) => acc + cur.remainingAmount,
    0
  );

  const getWaReminderUrl = (bon: (typeof receivables)[0]) => {
    const text = `Halo Yth. Bpk/Ibu ${bon.customer},\n\nSemoga sehat selalu. Dari Bengkel_Mustop kami mengonfirmasi catatan servis motor ${bon.motor} (${bon.plate}) dengan rincian sisa tagihan/bon sebesar Rp ${bon.remainingAmount.toLocaleString("id-ID")}.\n\nPembayaran dapat dilakukan secara tunai di bengkel atau transfer/QRIS. Terima kasih banyak atas kepercayaan Anda kepada Bengkel_Mustop 🙏`;
    return `https://wa.me/${bon.phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <>
      <BreadcrumbComp title="Pengelolaan Bon & Piutang Pelanggan" items={BCrumb} />

      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CardBox className="p-5 border-warning/30 bg-lightwarning/10">
            <p className="text-xs font-semibold text-warning mb-1">
              Total Piutang / Bon Aktif
            </p>
            <h3 className="text-2xl font-bold text-foreground">
              Rp {totalRemaining.toLocaleString("id-ID")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {receivables.length} Pelanggan belum lunas
            </p>
          </CardBox>

          <CardBox className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Sudah Terbayar / DP
            </p>
            <h3 className="text-2xl font-bold text-success">Rp 600.000</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tercatat masuk ke kas
            </p>
          </CardBox>

          <CardBox className="p-5">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Pengingat WhatsApp
            </p>
            <h3 className="text-2xl font-bold text-primary">Manual Review</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Tinjau & kirim santun via WA
            </p>
          </CardBox>
        </div>

        {/* Search */}
        <CardBox className="p-5">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pelanggan bon, nopol, no PK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
          </div>
        </CardBox>

        {/* Receivables Table */}
        <CardBox className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Pelanggan & Nopol</th>
                  <th className="py-3 px-4">No. PK & Tgl Servis</th>
                  <th className="py-3 px-4">Total Biaya</th>
                  <th className="py-3 px-4">Sudah Dibayar</th>
                  <th className="py-3 px-4">Sisa Bon</th>
                  <th className="py-3 px-4">Jatuh Tempo / Catatan</th>
                  <th className="py-3 px-4 text-center">Aksi Pelunasan & WA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {receivables.map((bon) => (
                  <tr key={bon.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground text-sm">
                        {bon.customer}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-foreground">
                          {bon.plate}
                        </span>
                        <span>• {bon.motor}</span>
                      </p>
                    </td>

                    <td className="py-4 px-4 font-mono text-xs">
                      <span className="text-primary font-medium block">
                        {bon.workOrderId}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        {bon.serviceDate}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs font-medium text-foreground">
                      Rp {bon.totalBill.toLocaleString("id-ID")}
                    </td>

                    <td className="py-4 px-4 text-xs text-success font-medium">
                      Rp {bon.paidAmount.toLocaleString("id-ID")}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-sm font-bold text-warning block">
                        Rp {bon.remainingAmount.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <p className="font-medium text-foreground">
                        {bon.dueDate}
                      </p>
                      <p className="text-[11px] text-muted-foreground italic line-clamp-1">
                        {bon.notes}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={getWaReminderUrl(bon)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            <Send className="h-3.5 w-3.5" />
                            <span>Kirim WA</span>
                          </Button>
                        </a>

                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1 bg-success hover:bg-success/90 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Pelunasan</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>
    </>
  );
}
