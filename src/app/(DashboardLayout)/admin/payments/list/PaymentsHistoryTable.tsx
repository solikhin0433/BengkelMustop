"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { PaymentTransactionItem } from "@/types/master";
import { Receipt, Printer } from "lucide-react";

interface PaymentsHistoryTableProps {
  payments: PaymentTransactionItem[];
  allCount: number;
  isLoading: boolean;
  onPrintReceipt: (payment: PaymentTransactionItem) => void;
}

export default function PaymentsHistoryTable({
  payments,
  allCount,
  isLoading,
  onPrintReceipt,
}: PaymentsHistoryTableProps) {
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            Tunai (Cash)
          </Badge>
        );
      case "qris_manual":
        return (
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400">
            QRIS Kasir
          </Badge>
        );
      case "bank_transfer":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            Transfer Bank
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {method}
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
              <th className="py-3 px-4">No. Kuitansi & Waktu</th>
              <th className="py-3 px-4">Perintah Kerja</th>
              <th className="py-3 px-4">Pelanggan & Kendaraan</th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 px-4 text-right">Jumlah Dibayar</th>
              <th className="py-3 px-4">Catatan / Referensi</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={7}
                title="Memeriksa data..."
                subtitle="Memuat riwayat transaksi pembayaran kasir"
                size="md"
              />
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Receipt className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada transaksi pembayaran kasir"
                        : "Tidak ada transaksi pembayaran yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Setiap pelunasan atau cicilan dari Perintah Kerja akan tercatat di sini."
                        : "Coba sesuaikan kata kunci pencarian atau ganti filter metode pembayaran."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const amount = Number(p.amount) || 0;
                const isPayment = p.payment_type === "payment";
                const dateObj = new Date(p.paid_at || p.created_at);
                const dateFormatted = dateObj.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const timeFormatted = dateObj.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const wo = p.work_order;
                const customer = wo?.customer;
                const vehicle = wo?.vehicle;

                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. NO. KUITANSI & WAKTU */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-mono font-bold text-xs sm:text-sm text-foreground">
                          {p.receipt_number}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {dateFormatted} • {timeFormatted} WIB
                        </p>
                      </div>
                    </td>

                    {/* 2. PERINTAH KERJA */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <p className="font-semibold text-primary">
                        {wo?.work_order_number || "-"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Total PK: Rp {(Number(wo?.grand_total) || 0).toLocaleString("id-ID")}
                      </p>
                    </td>

                    {/* 3. PELANGGAN & KENDARAAN */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {customer?.name || "Pelanggan Umum"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                          {vehicle?.plate_number || "-"} {vehicle?.model ? `(${vehicle.model})` : ""}
                        </p>
                      </div>
                    </td>

                    {/* 4. METODE */}
                    <td className="py-3.5 px-4">
                      {getMethodBadge(p.payment_method)}
                    </td>

                    {/* 5. NOMINAL DITERIMA */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs sm:text-sm">
                      <span className={isPayment ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                        {isPayment ? "+" : "-"}Rp {amount.toLocaleString("id-ID")}
                      </span>
                    </td>

                    {/* 6. CATATAN / REF */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs">
                      {p.reference_number && (
                        <p className="font-mono text-[11px] text-foreground">
                          Ref: {p.reference_number}
                        </p>
                      )}
                      <p className="truncate">{p.notes || "-"}</p>
                    </td>

                    {/* 7. AKSI: CETAK KUITANSI */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onPrintReceipt(p)}
                        className="h-8 px-2.5 gap-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                        title="Cetak Kuitansi / Struk Pembayaran"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
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

