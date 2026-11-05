"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Wallet, TrendingDown, Receipt, Tag } from "lucide-react";

interface ExpensesKPIProps {
  totalExpenseThisMonth: number;
  totalExpenseToday: number;
  transactionCountThisMonth: number;
  topCategoryName: string;
  isLoading: boolean;
}

export default function ExpensesKPI({
  totalExpenseThisMonth,
  totalExpenseToday,
  transactionCountThisMonth,
  topCategoryName,
  isLoading,
}: ExpensesKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. PENGELUARAN BULAN INI */}
      <CardBox className="p-4 flex items-center justify-between border-red-200/40 bg-red-50/15 dark:bg-red-950/15">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Pengeluaran Bulan Ini
          </p>
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {isLoading ? "..." : `Rp ${totalExpenseThisMonth.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total biaya operasional bengkel
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
          <TrendingDown className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 2. PENGELUARAN HARI INI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Pengeluaran Hari Ini
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `Rp ${totalExpenseToday.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Biaya operasional & belanja harian
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Wallet className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 3. JUMLAH TRANSAKSI BULAN INI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Transaksi Biaya
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${transactionCountThisMonth} Transaksi`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Nota & kuitansi operasional
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Receipt className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 4. KATEGORI PENGELUARAN TERBESAR */}
      <CardBox className="p-4 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Kategori Terbesar
          </p>
          <h3 className="text-lg font-bold text-foreground mt-1 truncate" title={topCategoryName}>
            {isLoading ? "..." : topCategoryName}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pos alokasi biaya utama bulan ini
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <Tag className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}

