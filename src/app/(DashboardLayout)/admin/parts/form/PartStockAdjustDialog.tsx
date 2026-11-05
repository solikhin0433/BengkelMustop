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
import { CustomLoader } from "@/components/ui/loader";
import { SparepartItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface PartStockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: SparepartItem | null;
  onAdjustSuccess: () => void;
}

export default function PartStockAdjustDialog({
  open,
  onOpenChange,
  part,
  onAdjustSuccess,
}: PartStockAdjustDialogProps) {
  const [adjustType, setAdjustType] = useState<"add" | "subtract" | "set">("add");
  const [adjustQty, setAdjustQty] = useState<number | string>(1);
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  useEffect(() => {
    if (open) {
      setAdjustType("add");
      setAdjustQty(1);
      setAdjustReason("Penambahan stok suku cadang");
      setAdjustError("");
    }
  }, [open, part]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;

    const qty = Number(adjustQty);
    if (isNaN(qty) || qty <= 0) {
      setAdjustError("Jumlah penyesuaian harus lebih dari 0");
      return;
    }

    setIsAdjusting(true);
    setAdjustError("");

    try {
      const res = await fetch(`/api/parts/${part.id}/adjust-stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: adjustType,
          quantity: qty,
          reason: adjustReason.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setAdjustError(json.error || "Gagal menyesuaikan stok");
        return;
      }

      onOpenChange(false);
      toast.success(actionMessages.part.stockAdjusted(part.name, qty, part.unit));
      onAdjustSuccess();
    } catch (err: any) {
      setAdjustError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Penyesuaian Stok Sparepart</DialogTitle>
          <DialogDescription className="text-xs">
            Ubah stok fisik untuk:{" "}
            <strong className="text-foreground">{part?.name}</strong>{" "}
            (Stok saat ini:{" "}
            <span className="font-bold text-primary">
              {part?.stock_quantity} {part?.unit}
            </span>
            )
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {adjustError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{adjustError}</div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipe Penyesuaian</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType("add")}
                className={`p-2.5 rounded-md border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  adjustType === "add"
                    ? "border-success bg-lightsuccess text-success"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm font-bold">+ Tambah</span>
                <span className="text-[10px]">Barang Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType("subtract")}
                className={`p-2.5 rounded-md border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  adjustType === "subtract"
                    ? "border-error bg-lighterror text-error"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm font-bold">- Kurangi</span>
                <span className="text-[10px]">Rusak / Hilang</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustType("set")}
                className={`p-2.5 rounded-md border text-xs font-semibold flex flex-col items-center gap-1 transition-colors ${
                  adjustType === "set"
                    ? "border-primary bg-lightprimary text-primary"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-sm font-bold">= Koreksi</span>
                <span className="text-[10px]">Stok Opname</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-qty" className="text-xs font-semibold">
              {adjustType === "set"
                ? `Total Stok Fisik Hasil Opname (${part?.unit})`
                : `Jumlah yang disesuaikan (${part?.unit})`}
            </Label>
            <Input
              id="adjust-qty"
              type="number"
              min={0}
              step={1}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              required
              className="h-10 font-bold text-primary text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adjust-reason" className="text-xs font-semibold">
              Keterangan / Alasan Penyesuaian
            </Label>
            <Input
              id="adjust-reason"
              placeholder="Misal: Pembelian tambahan stok dari supplier"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isAdjusting}
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isAdjusting}
              className="h-9 bg-primary hover:bg-primaryemphasis text-white font-semibold text-xs gap-1.5"
            >
              {isAdjusting ? (
                <>
                  <CustomLoader size="sm" />
                  <span>Menyesuaikan...</span>
                </>
              ) : (
                <span>Konfirmasi Perubahan Stok</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
