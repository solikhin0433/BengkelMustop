"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { FinancialReportData } from "@/types/master";

interface ReportsBreakdownProps {
  revenueBreakdown: FinancialReportData["revenueBreakdown"];
  expenseBreakdown: FinancialReportData["expenseBreakdown"];
  totalWorkOrders: number;
}

export default function ReportsBreakdown({
  revenueBreakdown,
  expenseBreakdown,
  totalWorkOrders,
}: ReportsBreakdownProps) {
  const totalRevMethods =
    revenueBreakdown.cashTotal +
    revenueBreakdown.qrisTotal +
    revenueBreakdown.transferTotal;

  const cashPct = totalRevMethods > 0 ? Math.round((revenueBreakdown.cashTotal / totalRevMethods) * 100) : 0;
  const qrisPct = totalRevMethods > 0 ? Math.round((revenueBreakdown.qrisTotal / totalRevMethods) * 100) : 0;
  const transferPct = totalRevMethods > 0 ? Math.round((revenueBreakdown.transferTotal / totalRevMethods) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. BREAKDOWN PENDAPATAN & METODE BAYAR */}
      <CardBox className="p-5 space-y-4">
        <div className="border-b border-border pb-2">
          <h4 className="text-sm font-bold text-foreground">
            Komposisi Pembayaran Kasir
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Berdasarkan metode pelunasan dan jenis layanan
          </p>
        </div>

        {/* METODE PEMBAYARAN BARS */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-foreground">Kas Tunai (Cash)</span>
              <span className="font-mono text-muted-foreground">
                Rp {revenueBreakdown.cashTotal.toLocaleString("id-ID")} ({cashPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cashPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-foreground">QRIS Kasir</span>
              <span className="font-mono text-muted-foreground">
                Rp {revenueBreakdown.qrisTotal.toLocaleString("id-ID")} ({qrisPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${qrisPct}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium text-foreground">Transfer Bank</span>
              <span className="font-mono text-muted-foreground">
                Rp {revenueBreakdown.transferTotal.toLocaleString("id-ID")} ({transferPct}%)
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${transferPct}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total Perintah Kerja Diselesaikan:</span>
          <span className="font-bold font-mono text-foreground">{totalWorkOrders} Motor</span>
        </div>
      </CardBox>

      {/* 2. BREAKDOWN PENGELUARAN BIAYA */}
      <CardBox className="p-5 space-y-4">
        <div className="border-b border-border pb-2">
          <h4 className="text-sm font-bold text-foreground">
            Alokasi Biaya Pengeluaran
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pengelompokan biaya operasional berdasarkan kategori
          </p>
        </div>

        {expenseBreakdown.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Tidak ada data pengeluaran pada periode ini.
          </p>
        ) : (
          <div className="space-y-3">
            {expenseBreakdown.slice(0, 5).map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-foreground truncate max-w-[200px]" title={exp.categoryName}>
                    {exp.categoryName}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    Rp {exp.amount.toLocaleString("id-ID")} ({exp.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${exp.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBox>
    </div>
  );
}

