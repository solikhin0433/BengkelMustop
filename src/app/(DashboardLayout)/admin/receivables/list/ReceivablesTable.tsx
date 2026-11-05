"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { CustomerReceivableItem } from "@/types/master";
import { CheckCircle2, MessageSquare, CreditCard } from "lucide-react";

interface ReceivablesTableProps {
  receivables: CustomerReceivableItem[];
  allCount: number;
  isLoading: boolean;
  onPayBon: (item: CustomerReceivableItem) => void;
  onRemindBon: (item: CustomerReceivableItem) => void;
}

export default function ReceivablesTable({
  receivables,
  allCount,
  isLoading,
  onPayBon,
  onRemindBon,
}: ReceivablesTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">Pelanggan & Kendaraan</th>
              <th className="py-3 px-4">No. Perintah Kerja</th>
              <th className="py-3 px-4 text-right">Total Biaya</th>
              <th className="py-3 px-4 text-right">Sudah Dibayar</th>
              <th className="py-3 px-4 text-right">Sisa Bon</th>
              <th className="py-3 px-4">Jatuh Tempo & Umur</th>
              <th className="py-3 px-4 text-center">Aksi Kasir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={7}
                title="Memeriksa data..."
                subtitle="Memuat daftar piutang dan bon pelanggan"
                size="md"
              />
            ) : receivables.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
                    <p className="font-semibold text-foreground text-sm">
                      {allCount === 0
                        ? "Tidak ada piutang atau bon pelanggan"
                        : "Tidak ada data bon yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allCount === 0
                        ? "Seluruh pelanggan telah melunasi tagihan servis mereka."
                        : "Coba sesuaikan kata kunci pencarian atau ganti filter status bon."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              receivables.map((r) => {
                const total = Number(r.total_tagihan) || 0;
                const paid = Number(r.jumlah_dibayar_bersih) || 0;
                const balance = Number(r.jumlah_bon) || 0;
                const lateDays = Number(r.terlambat_hari) || 0;
                const isOverdue = lateDays > 0;

                const dueDateFormatted = r.due_date
                  ? new Date(r.due_date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Belum diatur";

                return (
                  <tr key={r.work_order_id} className="hover:bg-muted/30 transition-colors">
                    {/* 1. PELANGGAN & MOTOR */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-xs sm:text-sm">
                          {r.customer_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {r.customer_phone ? (
                            <span className="font-mono">{r.customer_phone}</span>
                          ) : (
                            <span className="italic">Tidak ada no. WA</span>
                          )}
                          {" • "}
                          <span className="font-mono font-medium text-foreground">
                            {r.plate_number}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* 2. NO. PK */}
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <p className="font-semibold text-primary">
                        {r.work_order_number}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Umur bon: {r.umur_bon_hari} hari
                      </p>
                    </td>

                    {/* 3. TOTAL BIAYA */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                      Rp {total.toLocaleString("id-ID")}
                    </td>

                    {/* 4. SUDAH DIBAYAR */}
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Rp {paid.toLocaleString("id-ID")}
                    </td>

                    {/* 5. SISA BON */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                      Rp {balance.toLocaleString("id-ID")}
                    </td>

                    {/* 6. JATUH TEMPO & STATUS BADGE */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-xs font-mono text-foreground font-medium">
                          {dueDateFormatted}
                        </p>
                        <div className="mt-1">
                          {isOverdue ? (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400">
                              Terlambat {lateDays} hari
                            </Badge>
                          ) : r.payment_status === "partial" ? (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400">
                              Cicilan Berjalan
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300">
                              Belum Dibayar
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 7. AKSI */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol WhatsApp Pengingat */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onRemindBon(r)}
                          className="h-8 px-2.5 gap-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          title="Kirim pengingat WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </Button>

                        {/* Tombol Bayar Bon */}
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onPayBon(r)}
                          className="h-8 px-2.5 gap-1 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                          title="Catat pembayaran pelunasan atau cicilan"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
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

