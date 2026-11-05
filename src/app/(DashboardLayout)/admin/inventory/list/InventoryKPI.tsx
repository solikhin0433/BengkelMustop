"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Box, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

interface InventoryKPIProps {
  totalItems: number;
  totalAssetValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  mutationsTodayCount: number;
  itemsInToday: number;
  itemsOutToday: number;
  isLoading: boolean;
}

export default function InventoryKPI({
  totalItems,
  totalAssetValue,
  lowStockCount,
  outOfStockCount,
  mutationsTodayCount,
  itemsInToday,
  itemsOutToday,
  isLoading,
}: InventoryKPIProps) {
  const criticalTotal = lowStockCount + outOfStockCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TOTAL SKU & ITEM */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Suku Cadang
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${totalItems} SKU`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Katalog sparepart aktif
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Box className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 2. NILAI ASET STOK */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Estimasi Nilai Aset
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `Rp ${totalAssetValue.toLocaleString("id-ID")}`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Berdasarkan harga modal stok
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 3. STOK MENIPIS & HABIS */}
      <CardBox className={`p-4 flex items-center justify-between ${criticalTotal > 0 ? "border-amber-300/40 bg-amber-50/20 dark:bg-amber-950/10" : ""}`}>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Stok Perlu Restok
          </p>
          <h3 className={`text-2xl font-bold mt-1 ${criticalTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
            {isLoading ? "..." : `${criticalTotal} Item`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {outOfStockCount > 0 ? `${outOfStockCount} habis, ` : ""}{lowStockCount} menipis (≤ min)
          </p>
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${criticalTotal > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground"}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
      </CardBox>

      {/* 4. MUTASI HARI INI */}
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Mutasi Hari Ini
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {isLoading ? "..." : `${mutationsTodayCount} Transaksi`}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Masuk: <span className="font-semibold text-emerald-600">+{itemsInToday}</span> | Keluar: <span className="font-semibold text-red-500">-{itemsOutToday}</span>
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <TrendingDown className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}

