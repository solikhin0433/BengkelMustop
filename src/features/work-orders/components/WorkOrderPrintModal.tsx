"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X, Wrench } from "lucide-react";
import { WorkOrder } from "../types";

interface WorkOrderPrintModalProps {
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WorkOrderPrintModal({
  order,
  open,
  onOpenChange,
}: WorkOrderPrintModalProps) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const sisa = Math.max(0, order.grand_total - (order.amount_paid || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="p-4 border-b border-border bg-muted/20 flex flex-row items-center justify-between print:hidden">
          <div>
            <DialogTitle className="text-sm font-bold text-foreground">
              Pratinjau Cetak — Surat Perintah Kerja
            </DialogTitle>
            <DialogDescription className="sr-only">
              Pratinjau cetak surat perintah kerja dan nota pembayaran
            </DialogDescription>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-primary text-white font-semibold h-8 text-xs shadow"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Print Sekarang</span>
          </Button>
        </DialogHeader>

        {/* PRINTABLE NOTA CONTAINER */}
        <div id="printable-spk" className="p-8 space-y-6 bg-white text-black font-sans">
          {/* Header Bengkel */}
          <div className="flex items-start justify-between border-b-2 border-black pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="h-6 w-6 text-black" />
                <h2 className="text-xl font-extrabold tracking-tight">BENGKEL_MUSTOP MOTOR</h2>
              </div>
              <p className="text-xs text-gray-700 mt-1">
                Layanan Servis Motor, Tune Up Injeksi, CVT & Suku Cadang Terpercaya
              </p>
              <p className="text-xs text-gray-600">
                Jl. Operasional Bengkel No. 1 • WA/Telp: 0812-3456-7890
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase">
                {order.payment_status === "paid" ? "NOTA LUNAS" : "SURAT PERINTAH KERJA"}
              </span>
              <p className="font-mono text-sm font-extrabold mt-1">{order.work_order_number}</p>
              <p className="text-xs text-gray-600">Tgl: {order.received_at}</p>
            </div>
          </div>

          {/* Customer & Vehicle Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-gray-300 p-3 rounded">
            <div>
              <p className="text-gray-500 uppercase font-semibold">Data Pelanggan:</p>
              <p className="font-bold text-sm text-black">{order.customer_name}</p>
              <p className="text-gray-700">No. HP: {order.customer_phone}</p>
              {order.customer_address && (
                <p className="text-gray-700 text-[11px]">{order.customer_address}</p>
              )}
            </div>

            <div>
              <p className="text-gray-500 uppercase font-semibold">Data Kendaraan:</p>
              <p className="font-mono font-bold text-sm text-black">{order.plate_number}</p>
              <p className="text-gray-700">
                Motor: {order.vehicle_brand} {order.vehicle_model} ({order.vehicle_year || 2023})
              </p>
              <p className="text-gray-700">
                Mekanik: <span className="font-semibold">{order.mechanic}</span>
                {order.current_km && ` • ${order.current_km} KM`}
              </p>
            </div>
          </div>

          {/* Keluhan & Catatan Servis */}
          <div className="text-xs space-y-1 bg-gray-50 p-2.5 rounded border border-gray-200">
            <p>
              <span className="font-bold">Keluhan:</span> {order.customer_complaint}
            </p>
            {order.inspection_notes && (
              <p>
                <span className="font-bold">Diagnosa Mekanik:</span> {order.inspection_notes}
              </p>
            )}
          </div>

          {/* Rincian Pekerjaan & Suku Cadang Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black text-gray-700 font-bold uppercase">
                  <th className="py-2 text-center w-8">No</th>
                  <th className="py-2">Item Pekerjaan / Suku Cadang</th>
                  <th className="py-2 text-center w-12">Tipe</th>
                  <th className="py-2 text-center w-12">Qty</th>
                  <th className="py-2 text-right w-24">Harga</th>
                  <th className="py-2 text-right w-24">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1.5 text-center text-gray-500 font-mono">{idx + 1}</td>
                    <td className="py-1.5 font-medium">
                      {item.item_name_snapshot}
                      {(item.discount_amount ?? 0) > 0 && (
                        <span className="text-[10px] text-red-600 block">
                          Diskon: - Rp {(item.discount_amount ?? 0).toLocaleString("id-ID")}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 text-center uppercase text-[10px] text-gray-600">
                      {item.item_type === "service" ? "Jasa" : "Part"}
                    </td>
                    <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono">
                      Rp {item.unit_price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-1.5 text-right font-mono font-semibold">
                      Rp {item.line_total.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="flex justify-between items-start pt-2 border-t border-black text-xs">
            <div className="w-1/2 space-y-1">
              <p className="text-[11px] text-gray-600">
                Catatan: Garansi servis 7 hari kerja atau 500 KM (mana tercapai lebih dahulu) dengan menyertakan nota ini.
              </p>
              <p className="font-semibold text-gray-800">
                Status Pembayaran:{" "}
                <span className="uppercase">
                  {order.payment_status === "paid"
                    ? "LUNAS ✅"
                    : order.payment_status === "partial"
                    ? "BAYAR SEBAGIAN / DP"
                    : "BELUM LUNAS"}
                </span>
              </p>
              {order.due_date && (
                <p className="text-red-700 font-semibold">Jatuh Tempo: {order.due_date}</p>
              )}
            </div>

            <div className="w-60 space-y-1 text-right font-mono">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Jasa:</span>
                <span>Rp {order.subtotal_service.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Sparepart:</span>
                <span>Rp {order.subtotal_parts.toLocaleString("id-ID")}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Diskon:</span>
                  <span>- Rp {order.discount_amount.toLocaleString("id-ID")}</span>
                </div>
              )}
              {order.additional_charge > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Tambahan:</span>
                  <span>+ Rp {order.additional_charge.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t border-black pt-1 flex justify-between font-bold text-sm">
                <span>Grand Total:</span>
                <span>Rp {order.grand_total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Dibayar:</span>
                <span>Rp {(order.amount_paid || 0).toLocaleString("id-ID")}</span>
              </div>
              {sisa > 0 && (
                <div className="flex justify-between text-red-600 font-bold border-t border-dashed border-gray-300 pt-1">
                  <span>Sisa Tagihan / Bon:</span>
                  <span>Rp {sisa.toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 text-center text-xs pt-8 border-t border-gray-300">
            <div>
              <p className="text-gray-500">Mekanik Bengkel</p>
              <div className="h-14" />
              <p className="font-bold underline">({order.mechanic.split(" ")[0]})</p>
            </div>
            <div>
              <p className="text-gray-500">Pelanggan</p>
              <div className="h-14" />
              <p className="font-bold underline">({order.customer_name})</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 print:hidden flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            Tutup
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-primary text-white font-semibold"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Dokumen</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
