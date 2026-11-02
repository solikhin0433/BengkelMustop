"use client";

import React from "react";
import { Wrench, CheckCircle2, DollarSign, Sparkles } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";

interface ServicesKPIProps {
  totalCount: number;
  activeCount: number;
  avgPrice: number;
  publicCount: number;
}

export default function ServicesKPI({
  totalCount,
  activeCount,
  avgPrice,
  publicCount,
}: ServicesKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Jasa Servis
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {totalCount} Layanan
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Katalog master bengkel
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightprimary flex items-center justify-center text-primary">
          <Wrench className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Jasa Aktif
          </p>
          <h3 className="text-2xl font-bold text-success mt-1">
            {activeCount} Layanan
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Siap dipilih di Perintah Kerja
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightsuccess flex items-center justify-center text-success">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Rata-rata Tarif
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            Rp {avgPrice.toLocaleString("id-ID")}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Standar tarif dasar jasa
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightwarning flex items-center justify-center text-warning">
          <DollarSign className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Katalog Web Publik
          </p>
          <h3 className="text-2xl font-bold text-primary mt-1">
            {publicCount} Layanan
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tampil di Landing Page
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Sparkles className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}
