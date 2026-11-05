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
import { CustomLoader } from "@/components/ui/loader";
import { WorkOrder } from "../types";
import { WorkOrderStore } from "../work-order-store";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

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
        toast.success(actionMessages.workOrder.cancelled(order.work_order_number));
        onCancelled(order);
        onOpenChange(false);
        setReason("");
      } else {
        const msg = res.error || "Gagal membatalkan perintah kerja";
        toast.error(msg);
        setError(msg);
      }
    } catch (e: any) {
      const msg = e.message || "Gagal membatalkan perintah kerja";
      toast.error(msg);
      setError(msg);
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
          toast.success(actionMessages.success.delete(`Perintah Kerja ${order.work_order_number}`));
          if (onDeleted) onDeleted(order.id);
          onOpenChange(false);
        } else {
          toast.error("Gagal menghapus data.");
          setError("Gagal menghapus data.");
        }
      } catch (e: any) {
        toast.error(e.message || "Gagal menghapus");
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
          <DialogTitle className="text-base font-semibold text-foreground">
            Batalkan Perintah Kerja
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-0.5">
            Nomor: <span className="font-mono font-bold text-foreground">{order.work_order_number}</span> ({order.customer_name})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
            Sesuai aturan operasional, pembatalan servis akan mencatat riwayat dan alasan pembatalan untuk jejak audit bengkel.
          </div>

          <div>
            <Label className="text-xs font-semibold text-foreground">
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
            {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
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
            className="h-9 text-sm"
          >
            Kembali
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            onClick={handleConfirmCancel}
            className="h-9 text-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <CustomLoader size="sm" />
                <span className="ml-1.5">Memproses...</span>
              </>
            ) : (
              "Konfirmasi Batalkan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
