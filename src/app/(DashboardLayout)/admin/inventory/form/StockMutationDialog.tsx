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
import { SparepartItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface StockMutationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parts: SparepartItem[];
  selectedPart: SparepartItem | null;
  onSuccess: () => void;
}

export default function StockMutationDialog({
  open,
  onOpenChange,
  parts,
  selectedPart,
  onSuccess,
}: StockMutationDialogProps) {
  const [partId, setPartId] = useState("");
  const [mutationMode, setMutationMode] = useState<"in" | "out" | "set">("in");
  const [quantity, setQuantity] = useState<string>("");
  const [unitCost, setUnitCost] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync saat selectedPart berubah atau modal dibuka
  useEffect(() => {
    if (selectedPart) {
      setPartId(selectedPart.id);
      setUnitCost(selectedPart.average_cost ? String(selectedPart.average_cost) : "");
    } else if (parts.length > 0 && !partId) {
      setPartId(parts[0].id);
    }
  }, [selectedPart, parts, open]);

  // Reset form saat modal ditutup
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setErrorMessage(null);
      setQuantity("");
      setReason("");
      setMutationMode("in");
    }
    onOpenChange(isOpen);
  };

  const activePart = parts.find((p) => p.id === partId);
  const currentStock = Number(activePart?.stock_quantity) || 0;
  const unit = activePart?.unit || "pcs";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!partId) {
      setErrorMessage("Silakan pilih suku cadang yang akan dimutasi.");
      return;
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage("Kuantitas harus berupa angka lebih besar dari 0.");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("Alasan / keterangan mutasi wajib diisi.");
      return;
    }

    // Tentukan jenis mutasi dan quantityDelta yang dikirim
    let movementType = "adjustment_in";
    let submitQty = qty;

    if (mutationMode === "in") {
      movementType = "adjustment_in";
      submitQty = qty;
    } else if (mutationMode === "out") {
      if (currentStock < qty) {
        setErrorMessage(
          `Stok tidak mencukupi. Sisa stok saat ini hanya ${currentStock} ${unit}.`
        );
        return;
      }
      movementType = "adjustment_out";
      submitQty = qty;
    } else if (mutationMode === "set") {
      // Hitung selisih untuk mencapai angka target
      const delta = qty - currentStock;
      if (delta === 0) {
        setErrorMessage("Angka stok opname sama dengan stok saat ini (tidak ada perubahan).");
        return;
      }
      movementType = delta > 0 ? "adjustment_in" : "adjustment_out";
      submitQty = Math.abs(delta);
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inventory/mutations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_id: partId,
          movement_type: movementType,
          quantity: submitQty,
          unit_cost: mutationMode === "in" && unitCost ? Number(unitCost) : null,
          reason: reason.trim(),
          reference_type: mutationMode === "set" ? "stock_opname" : "manual_adjustment",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mencatat mutasi stok.");
      }

      toast.success(
        actionMessages.inventory.mutationRecorded(
          activePart?.name || "Sparepart",
          movementType === "adjustment_in" ? submitQty : -submitQty,
          unit
        )
      );

      onSuccess();
      handleDialogChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan mutasi.");
      toast.error(err.message || "Gagal mencatat mutasi stok.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Catat Mutasi Stok Sparepart
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Pencatatan resmi barang masuk, pengurangan stok keluar, atau penyesuaian opname fisik.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. PILIH SPAREPART */}
          <div className="space-y-1.5">
            <Label htmlFor="part-select" className="text-xs font-semibold">
              Pilih Suku Cadang / Sparepart <span className="text-destructive">*</span>
            </Label>
            <select
              id="part-select"
              value={partId}
              onChange={(e) => {
                setPartId(e.target.value);
                const selected = parts.find((p) => p.id === e.target.value);
                if (selected?.average_cost) {
                  setUnitCost(String(selected.average_cost));
                }
              }}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock_quantity} {p.unit || "pcs"}) {p.sku ? `- SKU: ${p.sku}` : ""}
                </option>
              ))}
            </select>
            {activePart && (
              <p className="text-[11px] text-muted-foreground">
                Sisa stok tercatat saat ini:{" "}
                <span className="font-semibold text-foreground">
                  {currentStock} {unit}
                </span>
              </p>
            )}
          </div>

          {/* 2. MODE MUTASI (CLEAN SEGMENTED CONTROL) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Jenis Mutasi <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMutationMode("in")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  mutationMode === "in"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                + Masuk (Restok)
              </button>
              <button
                type="button"
                onClick={() => setMutationMode("out")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  mutationMode === "out"
                    ? "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-700 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                - Keluar (Rusak)
              </button>
              <button
                type="button"
                onClick={() => setMutationMode("set")}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                  mutationMode === "set"
                    ? "bg-primary/10 text-primary border-primary/30 shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                = Opname Fisik
              </button>
            </div>
          </div>

          {/* 3. KUANTITAS */}
          <div className="space-y-1.5">
            <Label htmlFor="mutation-qty" className="text-xs font-semibold">
              {mutationMode === "in"
                ? `Jumlah Stok Masuk (${unit})`
                : mutationMode === "out"
                ? `Jumlah Stok Keluar (${unit})`
                : `Total Jumlah Fisik Riil di Rak (${unit})`}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mutation-qty"
              type="number"
              min="0"
              step="any"
              placeholder={mutationMode === "set" ? `Contoh: ${currentStock}` : "Misal: 5"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-9 text-xs sm:text-sm font-mono"
            />
          </div>

          {/* 4. HARGA MODAL JIKA STOK MASUK */}
          {mutationMode === "in" && (
            <div className="space-y-1.5">
              <Label htmlFor="mutation-cost" className="text-xs font-semibold">
                Harga Modal per Unit (Rp) <span className="text-muted-foreground text-[10px] font-normal">(Opsional)</span>
              </Label>
              <Input
                id="mutation-cost"
                type="number"
                min="0"
                placeholder="Misal: 45000"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="h-9 text-xs sm:text-sm font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Jika diisi, rata-rata biaya modal sparepart akan diperbarui secara otomatis.
              </p>
            </div>
          )}

          {/* 5. ALASAN & KETERANGAN */}
          <div className="space-y-1.5">
            <Label htmlFor="mutation-reason" className="text-xs font-semibold">
              Alasan & Catatan Mutasi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="mutation-reason"
              rows={2}
              placeholder={
                mutationMode === "in"
                  ? "Misal: Restok belanja toko grosir / distributor"
                  : mutationMode === "out"
                  ? "Misal: Barang cacat, pecah saat bongkar, atau pemakaian bengkel"
                  : "Misal: Hasil stok opname fisik mingguan"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
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
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <CustomLoader size="sm" />
                  <span>Menyimpan...</span>
                </span>
              ) : (
                "Simpan Mutasi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

