"use client";

import React from "react";
import { Users, Bike, AlertCircle, Wrench } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";

interface CustomersKPIProps {
  totalCustomers: number;
  totalVehicles: number;
  debtCustomersCount: number;
  totalVisits: number;
}

export default function CustomersKPI({
  totalCustomers,
  totalVehicles,
  debtCustomersCount,
  totalVisits,
}: CustomersKPIProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Total Pelanggan
          </p>
          <h3 className="text-2xl font-bold text-foreground mt-1">
            {totalCustomers} Orang
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Database pelanggan bengkel
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightprimary flex items-center justify-center text-primary">
          <Users className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Motor Terdaftar
          </p>
          <h3 className="text-2xl font-bold text-success mt-1">
            {totalVehicles} Unit
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Kendaraan motor pelanggan
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightsuccess flex items-center justify-center text-success">
          <Bike className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Memiliki Bon / Piutang
          </p>
          <h3 className="text-2xl font-bold text-warning mt-1">
            {debtCustomersCount} Orang
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pelanggan belum lunas
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-lightwarning flex items-center justify-center text-warning">
          <AlertCircle className="w-5 h-5" />
        </div>
      </CardBox>

      <CardBox className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Riwayat Servis
          </p>
          <h3 className="text-2xl font-bold text-primary mt-1">
            {totalVisits} Kali
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total pekerjaan diselesaikan
          </p>
        </div>
        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Wrench className="w-5 h-5" />
        </div>
      </CardBox>
    </div>
  );
}
