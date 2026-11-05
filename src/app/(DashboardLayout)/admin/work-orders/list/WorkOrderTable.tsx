"use client";

import React from "react";
import { Wrench, Eye, Edit, Phone, Printer, Ban, Trash2 } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableLoading } from "@/components/ui/loader";
import { WorkOrder, WorkOrderStatus } from "@/features/work-orders/types";

interface WorkOrderTableProps {
  orders: WorkOrder[];
  allOrdersCount: number;
  isLoading: boolean;
  statusMeta: Record<
    WorkOrderStatus,
    { label: string; variant: "warning" | "success" | "error" | "default" | "secondary" | "outline" }
  >;
  onOpenDetail: (order: WorkOrder) => void;
  onOpenEdit: (order: WorkOrder) => void;
  onOpenPrint: (order: WorkOrder) => void;
  onOpenCancel: (order: WorkOrder) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function WorkOrderTable({
  orders,
  allOrdersCount,
  isLoading,
  statusMeta,
  onOpenDetail,
  onOpenEdit,
  onOpenPrint,
  onOpenCancel,
  onDeleteOrder,
}: WorkOrderTableProps) {
  return (
    <CardBox className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
            <tr>
              <th className="py-3 px-4">No. Perintah Kerja & Waktu</th>
              <th className="py-3 px-4">Pelanggan & Nopol</th>
              <th className="py-3 px-4">Keluhan & Jasa Servis</th>
              <th className="py-3 px-4">Mekanik</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Biaya & Kasir</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <TableLoading
                colSpan={7}
                title="Memeriksa data..."
                subtitle="Memuat data Perintah Kerja terkini"
                size="md"
              />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-14 text-center text-muted-foreground text-sm"
                >
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <Wrench className="h-8 w-8 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">
                      {allOrdersCount === 0
                        ? "Belum ada data perintah kerja"
                        : "Tidak ada data yang cocok dengan filter"}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      {allOrdersCount === 0
                        ? "Klik tombol 'Buat Perintah Kerja' di atas untuk membuat perintah kerja baru."
                        : "Coba ubah kata kunci pencarian atau sesuaikan filter status dan pembayaran."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const servicesSummary = order.items
                  .filter((i) => i.item_type === "service")
                  .map((i) => i.item_name_snapshot)
                  .join(", ");

                const sisa = Math.max(0, order.grand_total - (order.amount_paid || 0));

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* NO PK */}
                    <td className="py-4 px-4 font-mono font-medium text-primary text-xs">
                      <button
                        type="button"
                        onClick={() => onOpenDetail(order)}
                        className="font-bold hover:underline text-left"
                      >
                        {order.work_order_number}
                      </button>
                      <span className="block text-[11px] text-muted-foreground font-sans mt-0.5">
                        {order.received_at}
                      </span>
                    </td>

                    {/* PELANGGAN & NOPOL */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground text-sm">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold text-foreground">
                          {order.plate_number}
                        </span>
                        <span>• {order.vehicle_model}</span>
                      </p>
                    </td>

                    {/* KELUHAN & JASA */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {servicesSummary || "Servis Reguler"}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        Keluhan: {order.customer_complaint}
                      </p>
                    </td>

                    {/* MEKANIK */}
                    <td className="py-4 px-4 text-xs font-medium text-muted-foreground">
                      {order.mechanic.split(" ")[0]} {order.mechanic.split(" ")[1] || ""}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4">
                      <Badge
                        variant={statusMeta[order.status]?.variant || "secondary"}
                        className="text-xs font-semibold"
                      >
                        {statusMeta[order.status]?.label || order.status}
                      </Badge>
                    </td>

                    {/* BIAYA & STATUS KASIR */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-foreground text-xs font-mono">
                        Rp {order.grand_total.toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`text-[10px] font-semibold block mt-0.5 ${
                          order.payment_status === "paid"
                            ? "text-success font-bold"
                            : order.payment_status === "partial"
                            ? "text-warning font-bold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {order.payment_status === "paid"
                          ? "LUNAS ✅"
                          : order.payment_status === "partial"
                          ? `DP (Sisa Rp ${sisa.toLocaleString("id-ID")})`
                          : "BELUM BAYAR"}
                      </span>
                    </td>

                    {/* AKSI */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Lihat Detail"
                          onClick={() => onOpenDetail(order)}
                        >
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Edit Perintah Kerja"
                          onClick={() => onOpenEdit(order)}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700"
                          title="Kirim Update WA"
                          asChild
                        >
                          <a
                            href={`https://wa.me/${order.customer_phone}?text=${encodeURIComponent(
                              `Halo Bpk/Ibu ${order.customer_name}, update pengerjaan servis motor ${order.plate_number} di Bengkel_Mustop saat ini berstatus: ${statusMeta[order.status]?.label || order.status}. Total: Rp ${order.grand_total.toLocaleString("id-ID")}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Cetak SPK / Nota"
                          onClick={() => onOpenPrint(order)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {order.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-warning"
                            title="Batalkan Perintah Kerja"
                            onClick={() => onOpenCancel(order)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Hapus Data"
                          onClick={() => onDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
