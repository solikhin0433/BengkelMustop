"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { SparepartItem } from "@/types/master";
import { Box, ArrowUpDown } from "lucide-react";

interface InventoryStockTableProps {
  parts: SparepartItem[];
  allCount: number;
  isLoading: boolean;
  onMutatePart: (part: SparepartItem) => void;
}

export default function InventoryStockTable({
  parts,
  allCount,
  isLoading,
  onMutatePart,
}: InventoryStockTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">SKU & Nama Suku Cadang</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4 text-center">Jumlah Stok</th>
              <th className="py-3 px-4 text-center">Batas Min</th>
              <th className="py-3 px-4">Status Ketersediaan</th>
              <th className="py-3 px-4 text-right">Harga Modal</th>
              <th className="py-3 px-4 text-right">Harga Jual</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={8}
                title="Memeriksa data..."
                subtitle="Memuat ketersediaan stok suku cadang"
                size="md"
              />
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Box className="h-8 w-8 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada data suku cadang"
                        : "Tidak ada suku cadang yang sesuai filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Tambahkan sparepart pada menu master katalog suku cadang."
                        : "Coba sesuaikan kata kunci pencarian atau ganti filter status stok."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((p) => {
                const stock = Number(p.stock_quantity) || 0;
                const min = Number(p.stock_minimum) || 0;
                const isOutOfStock = stock <= 0;
                const isLowStock = !isOutOfStock && stock <= min;

                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. NAMA & SKU */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {p.name}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {p.sku || "-"}
                        </p>
                      </div>
                    </td>

                    {/* 2. KATEGORI */}
                    <td className="py-3.5 px-4 text-xs text-muted-foreground">
                      {p.category?.name || "Umum"}
                    </td>

                    {/* 3. STOK */}
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-xs sm:text-sm">
                      <span
                        className={
                          isOutOfStock
                            ? "text-red-600 dark:text-red-400"
                            : isLowStock
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }
                      >
                        {stock} {p.unit || "pcs"}
                      </span>
                    </td>

                    {/* 4. MIN */}
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                      {min} {p.unit || "pcs"}
                    </td>

                    {/* 5. STATUS BADGE */}
                    <td className="py-3.5 px-4">
                      {isOutOfStock ? (
                        <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                          Stok Habis
                        </Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                          Menipis (≤ min)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                          Tersedia
                        </Badge>
                      )}
                    </td>

                    {/* 6. MODAL */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                      Rp {(Number(p.average_cost) || 0).toLocaleString("id-ID")}
                    </td>

                    {/* 7. JUAL */}
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-xs text-foreground">
                      Rp {(Number(p.selling_price) || 0).toLocaleString("id-ID")}
                    </td>

                    {/* 8. AKSI */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onMutatePart(p)}
                        className="h-8 px-2.5 gap-1.5 text-xs font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        <span>Mutasi</span>
                      </Button>
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

