"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { CreditCard, Wallet, Banknote, Clock } from "lucide-react";

interface PaymentsKPIProps {
  incomeToday: number;
  totalTransactionsToday: number;
  cashIncomeToday: number;
  nonCashIncomeToday: number;
  pendingOrdersCount: number;
  totalPendingAmount: number;
  isLoading: boolean;
}

export default function PaymentsKPI({
  incomeToday,
  totalTransactionsToday,
  cashIncomeToday,
  nonCashIncomeToday,
  pendingOrdersCount,
  totalPendingAmount,
  isLoading,
}: PaymentsKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. KAS MASUK HARI INI */}
      <CardBox className="p-4 flex items-center justify-between border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Kas Masuk Hari Ini
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {isLoading ? "..." : `Rp ${incomeToday.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total penerimaan kasir hari ini
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Wallet className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 2. JUMLAH TRANSAKSI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Transaksi Kasir
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${totalTransactionsToday} Nota`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pembayaran lunas & cicilan
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Banknote className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 3. METODE NON-TUNAI VS TUNAI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            QRIS & Transfer Bank
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `Rp ${nonCashIncomeToday.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tunai: Rp {cashIncomeToday.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <CreditCard className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 4. BELUM LUNAS / MENUNGGU KASIR */}
      <CardBox className={`p-4 flex items-center justify-between ${pendingOrdersCount > 0 ? "border-amber-300/40 bg-amber-50/20 dark:bg-amber-950/10" : ""}`}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Menunggu Pelunasan
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${pendingOrdersCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
            {isLoading ? "..." : `Rp ${totalPendingAmount.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Dari {pendingOrdersCount} Perintah Kerja aktif
          </p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${pendingOrdersCount > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
          <Clock className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}

