"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { AlertCircle, Clock, Users, Calendar } from "lucide-react";

interface ReceivablesKPIProps {
  totalReceivables: number;
  totalReceivableAmount: number;
  overdueCount: number;
  overdueAmount: number;
  todayDueCount: number;
  isLoading: boolean;
}

export default function ReceivablesKPI({
  totalReceivables,
  totalReceivableAmount,
  overdueCount,
  overdueAmount,
  todayDueCount,
  isLoading,
}: ReceivablesKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL PIUTANG BERJALAN */}
      <CardBox className="p-4 flex items-center justify-between border-amber-300/40 bg-amber-50/15 dark:bg-amber-950/15">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Bon / Piutang Aktif
          </p>
          <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {isLoading ? "..." : `Rp ${totalReceivableAmount.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total tagihan yang belum dilunasi
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 2. JUMLAH PERINTAH KERJA BON */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Jumlah Tagihan Bon
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${totalReceivables} Transaksi`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pelanggan berstatus bon / cicilan
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Users className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 3. JATUH TEMPO / TERLAMBAT */}
      <CardBox className={`p-4 flex items-center justify-between ${overdueCount > 0 ? "border-red-300/40 bg-red-50/20 dark:bg-red-950/20" : ""}`}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Melewati Jatuh Tempo
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${overdueCount > 0 ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
            {isLoading ? "..." : `${overdueCount} Bon`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Nominal: Rp {overdueAmount.toLocaleString("id-ID")}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${overdueCount > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-muted text-muted-foreground"}`}>
          <AlertCircle className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 4. JATUH TEMPO HARI INI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Jatuh Tempo Hari Ini
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${todayDueCount} Pelanggan`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Perlu konfirmasi / pengingat WA
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Calendar className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}
