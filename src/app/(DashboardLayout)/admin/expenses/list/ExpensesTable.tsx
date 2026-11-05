"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { ExpenseItem } from "@/types/master";
import { Wallet, Trash2 } from "lucide-react";

interface ExpensesTableProps {
  expenses: ExpenseItem[];
  allCount: number;
  isLoading: boolean;
  onDeleteExpense: (expense: ExpenseItem) => void;
}

export default function ExpensesTable({
  expenses,
  allCount,
  isLoading,
  onDeleteExpense,
}: ExpensesTableProps) {
  const getMethodBadge = (method: string) => {
    switch (method) {
      case "cash":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            Kas Tunai
          </Badge>
        );
      case "bank_transfer":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            Transfer Bank
          </Badge>
        );
      case "qris_manual":
        return (
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400">
            QRIS
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[10px]">{method}</Badge>;
    }
  };

  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">Tanggal Biaya</th>
              <th className="py-3 px-4">Kategori Pengeluaran</th>
              <th className="py-3 px-4">Keterangan / Keperluan</th>
              <th className="py-3 px-4">Metode Kas</th>
              <th className="py-3 px-4 text-right">Nominal Biaya</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={6}
                title="Memeriksa data..."
                subtitle="Memuat riwayat pengeluaran operasional bengkel"
                size="md"
              />
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Wallet className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada catatan pengeluaran bengkel"
                        : "Tidak ada pengeluaran yang sesuai dengan filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Klik tombol 'Catat Pengeluaran Baru' di atas untuk mencatat biaya operasional."
                        : "Coba sesuaikan kata kunci pencarian atau ubah filter kategori."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((exp) => {
                const amount = Number(exp.amount) || 0;
                const dateObj = new Date(exp.expense_date);
                const dateFormatted = dateObj.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. TANGGAL */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <p className="font-semibold text-foreground">{dateFormatted}</p>
                    </td>

                    {/* 2. KATEGORI */}
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
                        {exp.category?.name || "Umum"}
                      </span>
                    </td>

                    {/* 3. DESKRIPSI */}
                    <td className="py-3.5 px-4 text-xs text-foreground/90 max-w-sm">
                      <p className="font-medium text-foreground">{exp.description}</p>
                    </td>

                    {/* 4. METODE */}
                    <td className="py-3.5 px-4">
                      {getMethodBadge(exp.payment_method)}
                    </td>

                    {/* 5. JUMLAH NOMINAL */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs sm:text-sm text-red-600 dark:text-red-400">
                      -Rp {amount.toLocaleString("id-ID")}
                    </td>

                    {/* 6. AKSI: HAPUS */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteExpense(exp)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Hapus catatan pengeluaran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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

