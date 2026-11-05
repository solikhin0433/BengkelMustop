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
import { CustomerReceivableItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface ReceivablePayDialogProps {
  item: CustomerReceivableItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ReceivablePayDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: ReceivablePayDialogProps) {
  const [payAmount, setPayAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris_manual" | "bank_transfer" | "other">("cash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setPayAmount(String(item.jumlah_bon));
      setReferenceNumber("");
      setNotes("");
    }
  }, [item, open]);

  if (!item) return null;

  const currentPay = Number(payAmount) || 0;
  const balance = Number(item.jumlah_bon) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currentPay <= 0) {
      setErrorMessage("Nominal pembayaran harus lebih besar dari Rp 0.");
      return;
    }

    if (currentPay > balance) {
      setErrorMessage(
        `Nominal pembayaran (Rp ${currentPay.toLocaleString("id-ID")}) melebihi sisa tagihan bon (Rp ${balance.toLocaleString("id-ID")}).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_order_id: item.work_order_id,
          amount: currentPay,
          payment_method: paymentMethod,
          reference_number: referenceNumber.trim() || null,
          notes: notes.trim() || `Pelunasan/cicilan bon oleh ${item.customer_name}`,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mencatat pembayaran bon.");
      }

      toast.success(
        actionMessages.receivable.paymentRecorded(item.work_order_number, currentPay)
      );

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses pembayaran.");
      toast.error(err.message || "Gagal mencatat pembayaran bon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Catat Pembayaran Bon
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Pelunasan atau pembayaran cicilan untuk Perintah Kerja {item.work_order_number}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* INFO CARD */}
          <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan:</span>
              <span className="font-semibold text-foreground">{item.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sepeda Motor:</span>
              <span className="font-mono">{item.plate_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tagihan:</span>
              <span className="font-mono">Rp {Number(item.total_tagihan).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-bold">
              <span className="text-foreground">Sisa Tagihan Bon:</span>
              <span className="font-mono text-primary text-sm">
                Rp {balance.toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* METODE PEMBAYARAN */}
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

          {/* NOMINAL BAYAR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="bon-pay-amount" className="text-xs font-semibold">
                Nominal Dibayar (Rp) <span className="text-destructive">*</span>
              </Label>
              <button
                type="button"
                onClick={() => setPayAmount(String(balance))}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                Bayar Lunas (Semua Sisa)
              </button>
            </div>
            <Input
              id="bon-pay-amount"
              type="number"
              min="1"
              max={balance}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="h-9 text-xs sm:text-sm font-mono font-bold"
            />
          </div>

          {/* CATATAN */}
          <div className="space-y-1.5">
            <Label htmlFor="bon-notes" className="text-xs font-semibold">
              Catatan Pembayaran <span className="text-muted-foreground text-[10px] font-normal">(Opsional)</span>
            </Label>
            <Textarea
              id="bon-notes"
              rows={2}
              placeholder="Misal: Cicilan ke-1 tunai via kasir bengkel"
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[130px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <CustomLoader size="sm" />
                  <span>Menyimpan...</span>
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

