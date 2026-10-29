"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { WorkOrder } from "../types";
import { WorkOrderStore } from "../work-order-store";

interface WorkOrderCancelDialogProps {
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled: (order: WorkOrder) => void;
  onDeleted?: (id: string) => void;
}

export default function WorkOrderCancelDialog({
  order,
  open,
  onOpenChange,
  onCancelled,
  onDeleted,
}: WorkOrderCancelDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const handleConfirmCancel = async () => {
    if (!reason.trim()) {
      setError("Alasan pembatalan wajib dicatat sesuai aturan sistem.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await WorkOrderStore.cancelOrder(order.id, reason.trim());
      if (res.success) {
        onCancelled(order);
        onOpenChange(false);
        setReason("");
      } else {
        setError(res.error || "Gagal membatalkan perintah kerja");
      }
    } catch (e: any) {
      setError(e.message || "Gagal membatalkan perintah kerja");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermanent = async () => {
    if (
      confirm(
        `Yakin ingin menghapus permanen Perintah Kerja ${order.work_order_number}? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      setIsSubmitting(true);
      try {
        const ok = await WorkOrderStore.deleteOrder(order.id);
        if (ok) {
          if (onDeleted) onDeleted(order.id);
          onOpenChange(false);
        } else {
          setError("Gagal menghapus data dari database.");
        }
      } catch (e: any) {
        setError(e.message || "Gagal menghapus");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2 text-destructive">
            <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Batalkan Perintah Kerja
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Nomor: <span className="font-mono font-bold text-foreground">{order.work_order_number}</span> ({order.customer_name})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-xs text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Sesuai aturan Bengkel_Mustop, pembatalan servis akan mencatat riwayat pembatalan serta alasan pembatalan untuk jejak audit operasional bengkel.
            </span>
          </div>

          <div>
            <Label className="text-xs font-bold text-foreground">
              Alasan Pembatalan *
            </Label>
            <Textarea
              placeholder="Contoh: Pelanggan tidak setuju estimasi biaya, sparepart kosong dan pelanggan ingin servis di tempat lain, dsb..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              className="mt-1 text-sm resize-none"
              required
            />
            {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
          </div>

          {order.status === "waiting" && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1.5">
                Atau bila ini adalah kesalahan input saat antri:
              </p>
              <button
                type="button"
                onClick={handleDeletePermanent}
                className="text-xs text-muted-foreground hover:text-destructive underline"
              >
                Hapus permanen dari database
              </button>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
            className="gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Ban className="h-4 w-4" />
                <span>Konfirmasi Batalkan</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
