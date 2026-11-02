"use client";

import React from "react";
import {
  Users,
  Phone,
  Bike,
  Plus,
  History,
  Edit2,
  Trash2,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { CustomerItem } from "@/types/master";

interface CustomersTableProps {
  customers: CustomerItem[];
  allCount: number;
  isLoading: boolean;
  onViewDetail: (customer: CustomerItem) => void;
  onEdit: (customer: CustomerItem) => void;
  onAddVehicle: (customer: CustomerItem) => void;
  onDelete: (customer: CustomerItem) => void;
}

export default function CustomersTable({
  customers,
  allCount,
  isLoading,
  onViewDetail,
  onEdit,
  onAddVehicle,
  onDelete,
}: CustomersTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4">Nama Pelanggan & Alamat</th>
              <th className="py-3.5 px-4">Kontak WhatsApp</th>
              <th className="py-3.5 px-4">Motor Terdaftar</th>
              <th className="py-3.5 px-4">Riwayat Servis</th>
              <th className="py-3.5 px-4">Status Bon / Piutang</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={7}
                title="Memuat Master Data Pelanggan..."
                subtitle="Menghubungkan ke database Supabase Bengkel_Mustop"
                size="md"
              />
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Users className="h-9 w-9 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada data pelanggan di database"
                        : "Tidak ada pelanggan yang cocok dengan pencarian"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Klik tombol 'Tambah Pelanggan' di pojok kanan atas untuk menambahkan pelanggan baru."
                        : "Coba ubah kata kunci pencarian atau sesuaikan filter status bon."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((c, index) => {
                const unpaid = c.total_unpaid || 0;
                const visits = c.total_visits || 0;
                const vehicles = c.vehicles || [];

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => onViewDetail(c)}
                          className="font-semibold text-foreground text-sm hover:text-primary hover:underline text-left"
                        >
                          {c.name}
                        </button>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {c.address || "-"}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {c.phone ? (
                        <a
                          href={`https://wa.me/${c.phone_normalized || c.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
                          title="Kirim pesan WhatsApp"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{c.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {vehicles.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            Belum ada motor
                          </span>
                        ) : (
                          vehicles.slice(0, 2).map((v) => (
                            <div key={v.id} className="flex items-center gap-1.5 text-xs">
                              <span className="rounded bg-muted border border-border px-1.5 py-0.5 font-mono font-bold text-foreground">
                                {v.plate_number}
                              </span>
                              <span className="text-muted-foreground text-[11px] truncate max-w-[130px]">
                                {v.model}
                              </span>
                            </div>
                          ))
                        )}
                        {vehicles.length > 2 && (
                          <span className="text-[11px] text-primary font-medium">
                            +{vehicles.length - 2} motor lainnya
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-foreground">
                        {visits}x Servis
                      </span>
                      {c.last_visit && (
                        <span className="block text-muted-foreground text-[11px] mt-0.5">
                          Terakhir: {new Date(c.last_visit).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {unpaid > 0 ? (
                        <Badge variant="warning" className="text-xs font-semibold">
                          Bon: Rp {unpaid.toLocaleString("id-ID")}
                        </Badge>
                      ) : (
                        <Badge variant="lightSuccess" className="text-xs font-medium">
                          Lancar
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetail(c)}
                          className="h-8 px-2 text-xs gap-1 font-medium hover:bg-primary/10 hover:text-primary"
                          title="Lihat Riwayat & Detail"
                        >
                          <History className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Riwayat</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddVehicle(c)}
                          className="h-8 px-2 text-xs gap-1 font-medium hover:bg-success/10 hover:text-success"
                          title="Tambah Motor Baru untuk Pelanggan Ini"
                        >
                          <Bike className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">+Motor</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEdit(c)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Edit Pelanggan"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(c)}
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
