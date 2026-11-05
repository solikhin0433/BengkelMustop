"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface ReportsKPIProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  isLoading: boolean;
}

export default function ReportsKPI({
  totalRevenue,
  totalExpenses,
  netProfit,
  profitMargin,
  isLoading,
}: ReportsKPIProps) {
  const isNetPositive = netProfit >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL PENDAPATAN */}
      <CardBox className="p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-50/15 dark:bg-emerald-950/15">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Kas Masuk
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {isLoading ? "..." : `Rp ${totalRevenue.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Penerimaan kasir pada periode
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 2. TOTAL PENGELUARAN */}
      <CardBox className="p-4 flex items-center justify-between border-red-500/20 bg-red-50/15 dark:bg-red-950/15">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Biaya Keluar
          </p>
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {isLoading ? "..." : `Rp ${totalExpenses.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Biaya operasional pada periode
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
          <TrendingDown className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 3. LABA BERSIH */}
      <CardBox className={`p-4 flex items-center justify-between ${isNetPositive ? "border-primary/20 bg-primary/5" : "border-amber-300/40 bg-amber-50/20"}`}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Estimasi Laba Bersih
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${isNetPositive ? "text-primary" : "text-amber-600 dark:text-amber-400"}`}>
            {isLoading ? "..." : `Rp ${netProfit.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pendapatan dikurangi pengeluaran
          </p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${isNetPositive ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"}`}>
          <DollarSign className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 4. MARGIN LABA */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Margin Keuntungan
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${profitMargin}%`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Rasio laba dari total penerimaan
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Percent className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}

