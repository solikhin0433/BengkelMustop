"use client";

import React from "react";
import { Box, AlertTriangle, Archive, TrendingUp } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";

interface PartsKPIProps {
  totalItemCount: number;
  criticalCount: number;
  totalCostValue: number;
  totalSellingValue: number;
}

export default function PartsKPI({
  totalItemCount,
  criticalCount,
  totalCostValue,
  totalSellingValue,
}: PartsKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Sparepart
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {totalItemCount} Item
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Katalog suku cadang aktif
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightprimary flex items-center justify-center text-primary">
          <Box className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Stok Menipis / Kritis
          </p>
          <h3 className="text-2xl font-bold text-error mt-1">
            {criticalCount} Item
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Jumlah stok di bawah batas aman
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lighterror flex items-center justify-center text-error">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Nilai Modal Stok
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            Rp {totalCostValue.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total modal tersimpan di rak
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightwarning flex items-center justify-center text-warning">
          <Archive className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Estimasi Nilai Jual
          </p>
          <h3 className="text-2xl font-bold text-success mt-1">
            Rp {totalSellingValue.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Potensi pendapatan kasir
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightsuccess flex items-center justify-center text-success">
          <TrendingUp className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}
