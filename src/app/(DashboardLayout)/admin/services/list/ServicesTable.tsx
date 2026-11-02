"use client";

import React from "react";
import { Wrench, Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { ServiceItem } from "@/types/master";

interface ServicesTableProps {
  services: ServiceItem[];
  allCount: number;
  isLoading: boolean;
  onEdit: (service: ServiceItem) => void;
  onDelete: (service: ServiceItem) => void;
  onOpenCreate?: () => void;
}

export default function ServicesTable({
  services,
  allCount,
  isLoading,
  onEdit,
  onDelete,
}: ServicesTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4">Kode & Nama Jasa Servis</th>
              <th className="py-3.5 px-4">Rincian / Deskripsi</th>
              <th className="py-3.5 px-4">Tarif Dasar</th>
              <th className="py-3.5 px-4 text-center">Urutan</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Web Publik</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={8}
                title="Memuat Master Jasa Servis..."
                subtitle="Menghubungkan ke database Bengkel_Mustop"
                size="md"
              />
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Wrench className="h-9 w-9 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada master jasa servis"
                        : "Tidak ada jasa yang sesuai filter pencarian"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Klik tombol 'Tambah Jasa Servis' di pojok kanan atas untuk membuat katalog jasa baru."
                        : "Coba ubah kata kunci atau ganti filter status."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              services.map((srv, index) => (
                <tr
                  key={srv.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                    {index + 1}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {srv.code ? (
                        <span className="font-mono text-xs bg-muted border border-border px-1.5 py-0.5 rounded font-bold text-foreground">
                          {srv.code}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          -
                        </span>
                      )}
                      <span className="font-semibold text-foreground text-sm">
                        {srv.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {srv.description || "-"}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-primary text-sm">
                      Rp {srv.default_price.toLocaleString("id-ID")}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                    {srv.sort_order ?? 0}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {srv.is_active ? (
                      <Badge
                        variant="lightSuccess"
                        className="text-[11px] font-semibold gap-1 inline-flex items-center"
                      >
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span>Aktif</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-medium gap-1 inline-flex items-center text-muted-foreground"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Nonaktif</span>
                      </Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {srv.is_public ? (
                      <span
                        title="Tampil di Web Publik"
                        className="inline-flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Publik</span>
                      </span>
                    ) : (
                      <span
                        title="Hanya untuk kasir & mekanik internal"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                      >
                        <EyeOff className="w-3 h-3" />
                        <span>Internal</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(srv)}
                        className="h-8 px-2.5 text-xs gap-1 font-medium hover:bg-primary/10 hover:text-primary"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(srv)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-error hover:bg-lighterror"
                        title="Hapus / Arsipkan"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </CardBox>
  );
}
