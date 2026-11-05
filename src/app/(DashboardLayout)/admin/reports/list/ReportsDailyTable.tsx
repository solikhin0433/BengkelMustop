"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { TableLoading } from "@/components/ui/loader";
import { FinancialReportData } from "@/types/master";
import { Calendar } from "lucide-react";

interface ReportsDailyTableProps {
  dailyTransactions: FinancialReportData["dailyTransactions"];
  isLoading: boolean;
}

export default function ReportsDailyTable({
  dailyTransactions,
  isLoading,
}: ReportsDailyTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="p-4 border-b border-border bg-muted/20">
        <h4 className="text-sm font-bold text-foreground">
          Rincian Arus Kas & Laba Harian
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Rekap harian kas masuk, pengeluaran, dan margin laba bersih
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">Tanggal Transaksi</th>
              <th className="py-3 px-4 text-center">Motor Diservis</th>
              <th className="py-3 px-4 text-right">Kas Masuk (Pendapatan)</th>
              <th className="py-3 px-4 text-right">Pengeluaran (Biaya)</th>
              <th className="py-3 px-4 text-right">Laba Bersih Harian</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={6}
                title="Memeriksa data..."
                subtitle="Menghitung rekapitulasi laporan keuangan"
                size="md"
              />
            ) : dailyTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Calendar className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      Belum ada transaksi pada periode ini
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Coba pilih rentang waktu yang lebih luas pada filter di atas.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              dailyTransactions.map((day) => {
                const dateObj = new Date(day.date);
                const dateFormatted = dateObj.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const isProfit = day.net >= 0;

                return (
                  <tr key={day.date} className="hover:bg-muted/30 transition-colors">
                    {/* 1. TANGGAL */}
                    <td className="py-3 px-4 font-mono text-xs">
                      <p className="font-semibold text-foreground">{dateFormatted}</p>
                    </td>

                    {/* 2. MOTOR DISERVIS */}
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {day.workOrdersCount > 0 ? (
                        <span className="font-semibold text-foreground">
                          {day.workOrdersCount} Motor
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* 3. PENDAPATAN */}
                    <td className="py-3 px-4 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      {day.revenue > 0 ? `+Rp ${day.revenue.toLocaleString("id-ID")}` : "Rp 0"}
                    </td>

                    {/* 4. BIAYA */}
                    <td className="py-3 px-4 text-right font-mono text-xs text-red-500 font-medium">
                      {day.expenses > 0 ? `-Rp ${day.expenses.toLocaleString("id-ID")}` : "Rp 0"}
                    </td>

                    {/* 5. NET PROFIT */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-xs sm:text-sm">
                      <span className={isProfit ? "text-primary" : "text-red-600 dark:text-red-400"}>
                        {isProfit ? "+" : ""}Rp {day.net.toLocaleString("id-ID")}
                      </span>
                    </td>

                    {/* 6. STATUS */}
                    <td className="py-3 px-4 text-center">
                      {isProfit ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Surplus
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400">
                          Defisit
                        </Badge>
                      )}
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

