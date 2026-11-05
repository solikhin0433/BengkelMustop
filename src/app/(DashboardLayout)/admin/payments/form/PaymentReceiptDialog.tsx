"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomLoader } from "@/components/ui/loader";
import { PendingWorkOrderItem, PaymentTransactionItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingOrders: PendingWorkOrderItem[];
  selectedOrder: PendingWorkOrderItem | null;
  onSuccess: (savedPayment?: PaymentTransactionItem) => void;
}

export default function PaymentReceiptDialog({
  open,
  onOpenChange,
  pendingOrders,
  selectedOrder,
  onSuccess,
}: PaymentReceiptDialogProps) {
  const [orderId, setOrderId] = useState("");
  const [payAmount, setPayAmount] = useState<string>("");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris_manual" | "bank_transfer" | "other">("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync saat selectedOrder berubah atau modal dibuka
  useEffect(() => {
    if (selectedOrder) {
      setOrderId(selectedOrder.id);
      setPayAmount(String(selectedOrder.remaining_balance));
      setCashTendered(String(selectedOrder.remaining_balance));
    } else if (pendingOrders.length > 0 && !orderId) {
      setOrderId(pendingOrders[0].id);
      setPayAmount(String(pendingOrders[0].remaining_balance));
      setCashTendered(String(pendingOrders[0].remaining_balance));
    }
  }, [selectedOrder, pendingOrders, open]);

  const activeOrder = pendingOrders.find((o) => o.id === orderId);
  const grandTotal = Number(activeOrder?.grand_total) || 0;
  const amountPaid = Number(activeOrder?.amount_paid) || 0;
  const remaining = Number(activeOrder?.remaining_balance) || 0;

  const currentPay = Number(payAmount) || 0;
  const tendered = Number(cashTendered) || 0;
  const changeAmount = tendered - currentPay;

  const handleOrderChange = (newId: string) => {
    setOrderId(newId);
    const ord = pendingOrders.find((o) => o.id === newId);
    if (ord) {
      setPayAmount(String(ord.remaining_balance));
      setCashTendered(String(ord.remaining_balance));
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
      setReferenceNumber("");
      setNotes("");
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!orderId) {
      setErrorMessage("Silakan pilih Perintah Kerja yang akan dibayar.");
      return;
    }

    if (currentPay <= 0) {
      setErrorMessage("Nominal pembayaran harus lebih besar dari Rp 0.");
      return;
    }

    if (currentPay > remaining) {
      setErrorMessage(
        `Nominal pembayaran (Rp ${currentPay.toLocaleString("id-ID")}) melebihi sisa tagihan (Rp ${remaining.toLocaleString("id-ID")}).`
      );
      return;
    }

    if (paymentMethod === "cash" && tendered < currentPay) {
      setErrorMessage("Uang tunai yang diterima kurang dari nominal tagihan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_order_id: orderId,
          amount: currentPay,
          payment_method: paymentMethod,
          reference_number: referenceNumber.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memproses pembayaran kasir.");
      }

      toast.success(
        actionMessages.payment.recorded(
          json.data?.receipt_number || "Kuitansi",
          currentPay
        )
      );

      onSuccess(json.data);
      handleDialogChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pembayaran.");
      toast.error(err.message || "Gagal memproses pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Terima Pembayaran Kasir
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Proses pelunasan tagihan pengerjaan servis atau pencatatan cicilan bon pelanggan.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. PILIH PERINTAH KERJA */}
          <div className="space-y-1.5">
            <Label htmlFor="order-select" className="text-xs font-semibold">
              Pilih Perintah Kerja <span className="text-destructive">*</span>
            </Label>
            <select
              id="order-select"
              value={orderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {pendingOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.work_order_number} - {o.customer_name} ({o.plate_number}) [Sisa: Rp {o.remaining_balance.toLocaleString("id-ID")}]
                </option>
              ))}
            </select>
          </div>

          {/* 2. CARD RINGKASAN TAGIHAN */}
          {activeOrder && (
            <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total Tagihan Servis:</span>
                <span className="font-mono font-semibold text-foreground">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Sudah Dibayar Sebelumnya:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  Rp {amountPaid.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm border-t border-border/80 pt-2 font-bold">
                <span className="text-foreground">Sisa Tagihan yang Harus Dibayar:</span>
                <span className="font-mono text-primary text-base">
                  Rp {remaining.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {/* 3. METODE PEMBAYARAN */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Metode Pembayaran <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  paymentMethod === "cash"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                Tunai (Cash)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("qris_manual")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  paymentMethod === "qris_manual"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-700 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                QRIS Kasir
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-700 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                Transfer Bank
              </button>
            </div>
          </div>

          {/* 4. NOMINAL PEMBAYARAN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pay-amount" className="text-xs font-semibold">
                  Nominal Dibayar (Rp) <span className="text-destructive">*</span>
                </Label>
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(String(remaining));
                    setCashTendered(String(remaining));
                  }}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Bayar Pas
                </button>
              </div>
              <Input
                id="pay-amount"
                type="number"
                min="1"
                max={remaining}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="h-9 text-xs sm:text-sm font-mono font-bold"
              />
            </div>

            {/* UANG DITERIMA (KHUSUS CASH) */}
            {paymentMethod === "cash" ? (
              <div className="space-y-1.5">
                <Label htmlFor="cash-tendered" className="text-xs font-semibold">
                  Uang Tunai Diterima (Rp)
                </Label>
                <Input
                  id="cash-tendered"
                  type="number"
                  min="0"
                  placeholder="Misal: 100000"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="h-9 text-xs sm:text-sm font-mono"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="ref-num" className="text-xs font-semibold">
                  No. Referensi / Transaksi <span className="text-muted-foreground text-[10px] font-normal">(Opsional)</span>
                </Label>
                <Input
                  id="ref-num"
                  placeholder="Misal: QR-928172 atau No. Ref BCA"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="h-9 text-xs sm:text-sm font-mono"
                />
              </div>
            )}
          </div>

          {/* KEMBALIAN BOX (KHUSUS CASH) */}
          {paymentMethod === "cash" && tendered > 0 && (
            <div className={`p-3 rounded-lg border flex items-center justify-between text-xs sm:text-sm ${
              changeAmount >= 0
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
            }`}>
              <span className="font-medium">
                {changeAmount >= 0 ? "Uang Kembalian Pelanggan:" : "Kekurangan Uang Tunai:"}
              </span>
              <span className="font-mono font-bold text-base">
                Rp {Math.abs(changeAmount).toLocaleString("id-ID")}
              </span>
            </div>
          )}

          {/* 5. CATATAN KASIR */}
          <div className="space-y-1.5">
            <Label htmlFor="pay-notes" className="text-xs font-semibold">
              Catatan Kasir <span className="text-muted-foreground text-[10px] font-normal">(Opsional)</span>
            </Label>
            <Textarea
              id="pay-notes"
              rows={2}
              placeholder="Misal: Pembayaran lunas via kasir depan, pelanggan bawa uang pas."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDialogChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <CustomLoader size="sm" />
                  <span>Memproses...</span>
                </span>
              ) : (
                "Simpan Pembayaran"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

