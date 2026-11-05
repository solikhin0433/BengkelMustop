"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentTransactionItem } from "@/types/master";
import { Printer, X } from "lucide-react";

interface PaymentReceiptPrintModalProps {
  payment: PaymentTransactionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentReceiptPrintModal({
  payment,
  open,
  onOpenChange,
}: PaymentReceiptPrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payment) return null;

  const wo = payment.work_order;
  const customer = wo?.customer;
  const vehicle = wo?.vehicle;
  const amount = Number(payment.amount) || 0;
  const grandTotal = Number(wo?.grand_total) || 0;

  const dateObj = new Date(payment.paid_at || payment.created_at);
  const dateFormatted = dateObj.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeFormatted = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "TUNAI (CASH)";
      case "qris_manual":
        return "QRIS KASIR";
      case "bank_transfer":
        return "TRANSFER BANK";
      default:
        return method.toUpperCase();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-background">
        <DialogHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-foreground">
            Kuitansi Pembayaran Kasir
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handlePrint}
              className="h-8 px-3 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk</span>
            </Button>
          </div>
        </DialogHeader>

        {/* PRINTABLE RECEIPT CONTAINER (THERMAL 80MM STYLE) */}
        <div
          ref={printRef}
          className="p-5 bg-card border border-border rounded-xl font-mono text-xs text-foreground space-y-4 shadow-sm"
        >
          {/* HEADER TOKO */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-base tracking-wider text-foreground">
              BENGKEL_MUSTOP
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Servis & Perawatan Sepeda Motor • Suku Cadang Resmi
            </p>
            <p className="text-[10px] text-muted-foreground">
              WhatsApp: 0812-3456-7890
            </p>
          </div>

          <div className="border-t border-dashed border-border" />

          {/* META TRANSAKSI */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Kuitansi</span>
              <span className="font-bold">{payment.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu Bayar</span>
              <span>{dateFormatted} {timeFormatted} WIB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">No. Perintah Kerja</span>
              <span className="font-semibold text-primary">{wo?.work_order_number || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan</span>
              <span>{customer?.name || "Pelanggan Umum"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sepeda Motor</span>
              <span className="font-bold">{vehicle?.plate_number || "-"}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-border" />

          {/* RINCIAN PEMBAYARAN */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan PK</span>
              <span>Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Pembayaran</span>
              <span className="font-bold">{getMethodLabel(payment.payment_method)}</span>
            </div>
            {payment.reference_number && (
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">No. Referensi</span>
                <span>{payment.reference_number}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 text-emerald-600 dark:text-emerald-400">
              <span>JUMLAH DIBAYAR</span>
              <span>Rp {amount.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {payment.notes && (
            <div className="p-2 bg-muted/40 rounded text-[11px] text-muted-foreground">
              Catatan: {payment.notes}
            </div>
          )}

          <div className="border-t border-dashed border-border" />

          {/* FOOTER UCAPAN */}
          <div className="text-center text-[10px] text-muted-foreground space-y-0.5 pt-1">
            <p className="font-medium text-foreground">Terima kasih atas kunjungan Anda!</p>
            <p>Garansi servis berlaku 7 hari kerja.</p>
            <p className="text-[9px]">Kuitansi ini adalah bukti pembayaran yang sah.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

