"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bike,
  Search,
  Plus,
  Phone,
  Calendar,
  User,
  Wrench,
  RefreshCw,
  Loader2,
  Car,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableLoading } from "@/components/ui/loader";

const BCrumb = [
  {
    to: "/admin",
    title: "Dashboard",
  },
  {
    title: "Kendaraan Motor",
  },
];

interface VehicleItem {
  id: string;
  customer_id?: string;
  plate_number: string;
  brand: string;
  model: string;
  production_year?: number;
  customer_name?: string;
  customer_phone?: string;
}

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/work-orders/masters", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const rawVehicles = json.vehicles || [];
        const customers = json.customers || [];
        const customerMap = new Map(customers.map((c: any) => [c.id, c]));

        const mapped: VehicleItem[] = rawVehicles.map((v: any) => {
          const cust: any = customerMap.get(v.customer_id);
          return {
            id: v.id,
            customer_id: v.customer_id,
            plate_number: v.plate_number || "-",
            brand: v.brand || "Motor",
            model: v.model || "-",
            production_year: v.production_year,
            customer_name: cust?.name || "Pelanggan Terdaftar",
            customer_phone: cust?.phone || "-",
          };
        });
        setVehicles(mapped);
      }
    } catch (err) {
      console.warn("Gagal memuat data kendaraan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.customer_name && v.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <BreadcrumbComp title="Data Kendaraan Motor" items={BCrumb} />

      <div className="space-y-6">
        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <CardBox className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Total Motor Terdaftar
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  {vehicles.length} Motor
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Database master bengkel
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lightprimary text-primary">
                <Bike className="h-6 w-6" />
              </div>
            </div>
          </CardBox>

          <CardBox className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Merek Terbanyak
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  Honda & Yamaha
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Matic & Bebek 110-160cc
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lightsuccess text-success">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          </CardBox>

          <CardBox className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Riwayat Servis
                </p>
                <h3 className="text-2xl font-bold text-foreground">
                  Tersinkronisasi
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Terhubung ke Perintah Kerja
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lightwarning text-warning">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardBox>
        </div>

        {/* CONTROLS */}
        <CardBox className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari plat nomor, model motor, atau pemilik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadVehicles}
                disabled={isLoading}
                title="Segarkan data kendaraan"
                className="h-10 px-3 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </Button>

              <Link href="/admin/work-orders">
                <Button className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10">
                  <Plus className="h-4 w-4" />
                  <span>+ Buat Perintah Kerja</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardBox>

        {/* VEHICLES TABLE */}
        <CardBox className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Plat Nomor</th>
                  <th className="py-3 px-4">Model Kendaraan</th>
                  <th className="py-3 px-4">Merek & Tahun</th>
                  <th className="py-3 px-4">Pemilik (Pelanggan)</th>
                  <th className="py-3 px-4">Kontak WhatsApp</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <TableLoading
                    colSpan={6}
                    title="Memuat data kendaraan..."
                    subtitle="Menghubungkan ke database master motor Bengkel_Mustop"
                    size="md"
                  />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Bike className="h-8 w-8 text-muted-foreground/60" />
                        <p className="font-semibold text-foreground text-sm">
                          {vehicles.length === 0 ? "Belum ada data motor terdaftar" : "Tidak ada motor yang cocok"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-foreground">
                        <span className="bg-muted px-2 py-1 rounded">
                          {v.plate_number}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">
                        {v.model}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs">
                        {v.brand} {v.production_year ? `• ${v.production_year}` : ""}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground text-sm">
                          {v.customer_name}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {v.customer_phone && v.customer_phone !== "-" ? (
                          <a
                            href={`https://wa.me/${v.customer_phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>{v.customer_phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Link href="/admin/work-orders">
                          <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1">
                            <Wrench className="h-3.5 w-3.5" />
                            <span>Servis</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBox>
      </div>
    </>
  );
}
