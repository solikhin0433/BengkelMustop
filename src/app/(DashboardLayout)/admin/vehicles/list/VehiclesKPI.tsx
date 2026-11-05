"use client";

import React from "react";
import { Bike, Wrench, Calendar, Award } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";

interface VehiclesKPIProps {
  totalVehicles: number;
  topBrand: string;
  totalServices: number;
  activeCount: number;
}

export default function VehiclesKPI({
  totalVehicles,
  topBrand,
  totalServices,
  activeCount,
}: VehiclesKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Motor Terdaftar
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {totalVehicles} Unit
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Database master motor
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightprimary flex items-center justify-center text-primary">
          <Bike className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Merek Terbanyak
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {topBrand || "Belum Ada"}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Populasi kendaraan tertinggi
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightsuccess flex items-center justify-center text-success">
          <Award className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Riwayat Servis
          </p>
          <h3 className="text-2xl font-bold text-primary mt-1">
            {totalServices} Kali
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pekerjaan servis tercatat
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Wrench className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Pernah Servis
          </p>
          <h3 className="text-2xl font-bold text-success mt-1">
            {activeCount} Motor
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Minimal 1x riwayat PK
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightwarning flex items-center justify-center text-warning">
          <Calendar className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}

