"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { PendingWorkOrderItem } from "@/types/master";
import { CheckCircle2, CreditCard } from "lucide-react";

interface PendingPaymentTableProps {
  pendingOrders: PendingWorkOrderItem[];
  allCount: number;
  isLoading: boolean;
  onProcessPayment: (order: PendingWorkOrderItem) => void;
}

export default function PendingPaymentTable({
  pendingOrders,
  allCount,
  isLoading,
  onProcessPayment,
}: PendingPaymentTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            Servis Selesai
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            Dikerjakan
          </Badge>
        );
      case "waiting_parts":
        return (
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
            Menunggu Part
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">No. Perintah Kerja & Tanggal</th>
              <th className="py-3 px-4">Pelanggan & Motor</th>
              <th className="py-3 px-4">Status Servis</th>
              <th className="py-3 px-4 text-right">Total Biaya</th>
              <th className="py-3 px-4 text-right">Sudah Dibayar</th>
              <th className="py-3 px-4 text-right">Sisa Tagihan</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={7}
                title="Memeriksa data..."
                subtitle="Memuat antrean tagihan servis belum lunas"
                size="md"
              />
            ) : pendingOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
                    <p className="font-semibold text-foreground text-sm">
                      Semua Tagihan Servis Lunas!
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Tidak ada Perintah Kerja aktif yang memiliki tunggakan pembayaran.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pendingOrders.map((order) => {
                const dateObj = new Date(order.received_at);
                const dateFormatted = dateObj.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. NO. PK & TANGGAL */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-mono font-bold text-xs sm:text-sm text-foreground">
                          {order.work_order_number}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {dateFormatted}
                        </p>
                      </div>
                    </td>

                    {/* 2. PELANGGAN & MOTOR */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {order.customer_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {order.plate_number} {order.motor_info ? `• ${order.motor_info}` : ""}
                        </p>
                      </div>
                    </td>

                    {/* 3. STATUS */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* 4. TOTAL BIAYA */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                      Rp {order.grand_total.toLocaleString("id-ID")}
                    </td>

                    {/* 5. SUDAH DIBAYAR */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Rp {order.amount_paid.toLocaleString("id-ID")}
                    </td>

                    {/* 6. SISA TAGIHAN */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      Rp {order.remaining_balance.toLocaleString("id-ID")}
                    </td>

                    {/* 7. AKSI: BAYAR */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onProcessPayment(order)}
                        className="h-8 px-3 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Bayar Kasir</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CardBox>
  );
}

