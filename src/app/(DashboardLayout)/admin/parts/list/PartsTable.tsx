"use client";

import React from "react";
import {
  Box,
  Plus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Tag,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { SparepartItem } from "@/types/master";

interface PartsTableProps {
  parts: SparepartItem[];
  allCount: number;
  isLoading: boolean;
  onAdjustStock: (part: SparepartItem) => void;
  onEdit: (part: SparepartItem) => void;
  onDelete: (part: SparepartItem) => void;
  onOpenCreate?: () => void;
}

export default function PartsTable({
  parts,
  allCount,
  isLoading,
  onAdjustStock,
  onEdit,
  onDelete,
}: PartsTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">No</th>
              <th className="py-3.5 px-4">SKU / Nama Sparepart</th>
              <th className="py-3.5 px-4">Kategori</th>
              <th className="py-3.5 px-4">Harga Modal</th>
              <th className="py-3.5 px-4">Harga Jual</th>
              <th className="py-3.5 px-4">Margin</th>
              <th className="py-3.5 px-4 text-center">Status & Jumlah Stok</th>
              <th className="py-3.5 px-4">Lokasi Rak</th>
              <th className="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={9}
                title="Memeriksa data..."
                subtitle="Memuat data sparepart & stok"
                size="md"
              />
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Box className="h-9 w-9 text-muted-foreground/50" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Belum ada data sparepart"
                        : "Tidak ada suku cadang yang sesuai filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Klik tombol 'Tambah Sparepart' di pojok kanan atas untuk menambahkan suku cadang baru."
                        : "Coba ubah kata kunci atau sesuaikan filter kategori dan status stok."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              parts.map((part, index) => {
                const stock = Number(part.stock_quantity) || 0;
                const minStock = Number(part.stock_minimum) || 0;
                const cost = Number(part.average_cost) || 0;
                const sell = Number(part.selling_price) || 0;
                const margin =
                  cost > 0 ? Math.round(((sell - cost) / cost) * 100) : 0;

                const isOutOfStock = stock <= 0;
                const isLowStock = stock > 0 && stock <= minStock;

                return (
                  <tr
                    key={part.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {part.sku ? (
                            <span className="font-mono text-xs bg-muted border border-border px-1.5 py-0.5 rounded font-bold text-foreground">
                              {part.sku}
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              No SKU
                            </span>
                          )}
                          <span className="font-semibold text-foreground text-sm">
                            {part.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          Satuan: {part.unit}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {part.category?.name ? (
                        <Badge variant="outline" className="text-[11px] font-medium">
                          <Tag className="w-3 h-3 mr-1 text-primary" />
                          <span>{part.category.name}</span>
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs font-medium text-muted-foreground">
                        Rp {cost.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-foreground text-sm">
                        Rp {sell.toLocaleString("id-ID")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {margin > 0 ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full inline-block">
                          +{margin}%
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isOutOfStock ? (
                        <Badge
                          variant="destructive"
                          className="text-[11px] font-semibold gap-1 inline-flex items-center"
                        >
                          <AlertCircle className="w-3 h-3" />
                          <span>Habis (0 {part.unit})</span>
                        </Badge>
                      ) : isLowStock ? (
                        <Badge
                          variant="warning"
                          className="text-[11px] font-semibold gap-1 inline-flex items-center"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>
                            {stock} {part.unit} (Min: {minStock})
                          </span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="lightSuccess"
                          className="text-[11px] font-semibold gap-1 inline-flex items-center"
                        >
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span>
                            {stock} {part.unit}
                          </span>
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {part.notes ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="line-clamp-1">{part.notes}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAdjustStock(part)}
                          title="Penyesuaian Stok Cepat"
                          className="h-8 px-2 text-xs gap-1 font-medium hover:bg-warning/10 hover:text-warning"
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Stok</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(part)}
                          className="h-8 px-2 text-xs gap-1 font-medium hover:bg-primary/10 hover:text-primary"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(part)}
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
