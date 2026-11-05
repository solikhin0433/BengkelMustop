"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { TableLoading } from "@/components/ui/loader";
import { StockMutationItem } from "@/types/master";
import { History } from "lucide-react";

interface InventoryMutationTableProps {
  mutations: StockMutationItem[];
  allCount: number;
  isLoading: boolean;
}

export default function InventoryMutationTable({
  mutations,
  allCount,
  isLoading,
}: InventoryMutationTableProps) {
  const getMovementBadge = (type: string, delta: number) => {
    switch (type) {
      case "purchase_in":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400">
            Pembelian Masuk
          </Badge>
        );
      case "service_out":
        return (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400">
            Servis Motor (PK)
          </Badge>
        );
      case "adjustment_in":
        return (
          <Badge variant="outline" className="text-[10px] bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400">
            Koreksi Masuk
          </Badge>
        );
      case "adjustment_out":
        return (
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
            Koreksi Keluar
          </Badge>
        );
      case "return_in":
        return (
          <Badge variant="outline" className="text-[10px] bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400">
            Retur Barang
          </Badge>
        );
      case "reversal_out":
      case "reversal_in":
        return (
          <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
            Koreksi Sistem
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {delta > 0 ? "Stok Masuk" : "Stok Keluar"}
          </Badge>
        );
    }
  };

  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">Waktu Transaksi</th>
              <th className="py-3 px-4">Suku Cadang & SKU</th>
              <th className="py-3 px-4">Jenis Mutasi</th>
              <th className="py-3 px-4 text-center">Perubahan (Delta)</th>
              <th className="py-3 px-4">Referensi / Sumber</th>
              <th className="py-3 px-4">Alasan / Catatan Mutasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={6}
                title="Memeriksa data..."
                subtitle="Memuat riwayat buku besar mutasi stok"
                size="md"
              />
            ) : mutations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <History className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada riwayat mutasi stok"
                        : "Tidak ada data mutasi yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Setiap perubahan stok dari pembelian, pengerjaan servis, atau penyesuaian akan tercatat di sini."
                        : "Coba sesuaikan kata kunci pencarian atau ganti filter jenis mutasi."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              mutations.map((m) => {
                const delta = Number(m.quantity_delta) || 0;
                const isPositive = delta > 0;
                const dateObj = new Date(m.created_at);
                const dateFormatted = dateObj.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const timeFormatted = dateObj.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. WAKTU */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs">
                        <p className="font-semibold text-foreground">{dateFormatted}</p>
                        <p className="text-[11px] text-muted-foreground">{timeFormatted} WIB</p>
                      </div>
                    </td>

                    {/* 2. NAMA PART & SKU */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {m.part?.name || "Sparepart Tidak Ditemukan"}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {m.part?.sku || "-"}
                        </p>
                      </div>
                    </td>

                    {/* 3. JENIS MUTASI */}
                    <td className="py-3.5 px-4">
                      {getMovementBadge(m.movement_type, delta)}
                    </td>

                    {/* 4. PERUBAHAN QTY */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-xs sm:text-sm">
                      <span
                        className={
                          isPositive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {isPositive ? `+${delta}` : delta} {m.part?.unit || "pcs"}
                      </span>
                    </td>

                    {/* 5. REFERENSI */}
                    <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                      {m.reference_type === "service_work_order"
                        ? "Perintah Kerja Servis"
                        : m.reference_type === "manual_adjustment"
                        ? "Penyesuaian Manual"
                        : m.reference_type}
                    </td>

                    {/* 6. ALASAN */}
                    <td className="py-3.5 px-4 text-xs text-foreground/90 max-w-xs">
                      {m.reason}
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

