"use client";

import React from "react";
import Link from "next/link";
import { Bike, Phone, Wrench, Edit2, Trash2, Eye } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { VehicleItem } from "@/types/master";

interface VehiclesTableProps {
  vehicles: VehicleItem[];
  allCount: number;
  isLoading: boolean;
  onViewDetail: (vehicle: VehicleItem) => void;
  onEdit: (vehicle: VehicleItem) => void;
  onDelete: (vehicle: VehicleItem) => void;
}

export default function VehiclesTable({
  vehicles,
  allCount,
  isLoading,
  onViewDetail,
  onEdit,
  onDelete,
}: VehiclesTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4">Plat Nomor</th>
              <th className="py-3.5 px-4">Model Kendaraan</th>
              <th className="py-3.5 px-4">Merek Motor</th>
              <th className="py-3.5 px-4">Pemilik (Pelanggan)</th>
              <th className="py-3.5 px-4">Kontak WhatsApp</th>
              <th className="py-3.5 px-4">Riwayat Servis</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={8}
                title="Memeriksa data..."
                subtitle="Memuat data kendaraan motor"
                size="md"
              />
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Bike className="h-9 w-9 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada data motor terdaftar"
                        : "Tidak ada kendaraan yang cocok dengan pencarian"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Klik tombol 'Tambah Kendaraan' di atas untuk mendaftarkan motor pelanggan baru."
                        : "Coba ubah kata kunci pencarian atau sesuaikan filter merek motor."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              vehicles.map((v, index) => {
                const cust = v.customer;
                const totalServices = v.total_services || 0;

                return (
                  <tr
                    key={v.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onViewDetail(v)}
                        className="inline-block text-left"
                      >
                        <span className="rounded bg-muted border border-border px-2 py-1 font-mono font-bold text-xs text-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                          {v.plate_number}
                        </span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-foreground text-sm">
                        {v.model}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-foreground">
                      {v.brand}
                    </td>

                    <td className="py-3.5 px-4">
                      {cust ? (
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {cust.name}
                          </p>
                          {cust.address && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {cust.address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Pelanggan Tidak Ditemukan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {cust?.phone && cust.phone !== "-" ? (
                        <a
                          href={`https://wa.me/${cust.phone_normalized || cust.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                          title="Hubungi Pelanggan via WhatsApp"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{cust.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-foreground">
                        {totalServices}x Servis
                      </span>
                      {v.last_service && (
                        <span className="block text-muted-foreground text-[11px] mt-0.5">
                          Terakhir: {new Date(v.last_service).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/admin/work-orders`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs gap-1 font-medium hover:bg-primary/10 hover:text-primary"
                            title="Buat Perintah Kerja untuk Motor Ini"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">Servis</span>
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetail(v)}
                          className="h-8 px-2 text-xs gap-1 font-medium hover:bg-muted"
                          title="Lihat Rincian & Riwayat"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Detail</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(v)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Data Motor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(v)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-error hover:bg-lighterror"
                          title="Hapus / Arsipkan"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CardBox>
  );
}

