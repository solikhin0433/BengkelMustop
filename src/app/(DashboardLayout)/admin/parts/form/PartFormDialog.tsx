"use client";

import React, { useState, useEffect } from "react";
import { Box, Save, X, AlertTriangle, FolderPlus } from "lucide-react";
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
import { SparepartItem, SparepartCategory } from "@/types/master";

interface PartFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPart: SparepartItem | null;
  categories: SparepartCategory[];
  onOpenCategoryCreator: () => void;
  onSaveSuccess: () => void;
}

export default function PartFormDialog({
  open,
  onOpenChange,
  editingPart,
  categories,
  onOpenCategoryCreator,
  onSaveSuccess,
}: PartFormDialogProps) {
  const [formSku, setFormSku] = useState("");
  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formUnit, setFormUnit] = useState("pcs");
  const [formSellingPrice, setFormSellingPrice] = useState<number | string>(0);
  const [formAverageCost, setFormAverageCost] = useState<number | string>(0);
  const [formStockQuantity, setFormStockQuantity] = useState<number | string>(0);
  const [formStockMinimum, setFormStockMinimum] = useState<number | string>(2);
  const [formNotes, setFormNotes] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingPart) {
      setFormSku(editingPart.sku || "");
      setFormName(editingPart.name);
      setFormCategoryId(editingPart.category_id || "");
      setFormUnit(editingPart.unit || "pcs");
      setFormSellingPrice(editingPart.selling_price);
      setFormAverageCost(editingPart.average_cost);
      setFormStockQuantity(editingPart.stock_quantity);
      setFormStockMinimum(editingPart.stock_minimum);
      setFormNotes(editingPart.notes || "");
      setFormIsActive(editingPart.is_active);
    } else {
      setFormSku("");
      setFormName("");
      setFormCategoryId(categories[0]?.id || "");
      setFormUnit("pcs");
      setFormSellingPrice(0);
      setFormAverageCost(0);
      setFormStockQuantity(0);
      setFormStockMinimum(2);
      setFormNotes("");
      setFormIsActive(true);
    }
    setFormError("");
  }, [editingPart, categories, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Nama sparepart wajib diisi");
      return;
    }

    const sellPrice = Number(formSellingPrice);
    const costPrice = Number(formAverageCost);
    const stockQty = Number(formStockQuantity);
    const minQty = Number(formStockMinimum);

    if (sellPrice < 0 || costPrice < 0) {
      setFormError("Harga tidak boleh bernilai negatif");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const payload = {
        sku: formSku.trim() || null,
        name: formName.trim(),
        category_id: formCategoryId || null,
        unit: formUnit.trim() || "pcs",
        selling_price: sellPrice,
        average_cost: costPrice,
        stock_quantity: stockQty,
        stock_minimum: minQty,
        notes: formNotes.trim() || null,
        is_active: formIsActive,
      };

      let res: Response;
      if (editingPart) {
        res = await fetch(`/api/parts/${editingPart.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/parts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menyimpan sparepart");
        return;
      }

      onOpenChange(false);
      onSaveSuccess();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Box className="w-5 h-5" />
            </div>
            <span>
              {editingPart ? "Edit Master Sparepart" : "Tambah Sparepart Baru"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editingPart
              ? "Perbarui informasi suku cadang, harga modal, harga jual, dan spesifikasinya."
              : "Tambahkan suku cadang baru ke master data inventori Bengkel_Mustop."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 text-xs bg-lighterror text-error rounded-md flex items-center gap-2 border border-error/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="part-sku" className="text-xs font-semibold">
                SKU / Kode Part
              </Label>
              <Input
                id="part-sku"
                placeholder="Misal: AHM-MPX2-08"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                className="h-9 font-mono uppercase text-xs"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="part-name" className="text-xs font-semibold">
                Nama Sparepart <span className="text-error">*</span>
              </Label>
              <Input
                id="part-name"
                placeholder="Misal: Oli AHM MPX 2 Matic 0.8L"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="h-9 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="part-category" className="text-xs font-semibold">
                  Kategori Suku Cadang
                </Label>
                <button
                  type="button"
                  onClick={onOpenCategoryCreator}
                  className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-0.5"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Kategori Baru</span>
                </button>
              </div>
              <select
                id="part-category"
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="part-unit" className="text-xs font-semibold">
                Satuan
              </Label>
              <Input
                id="part-unit"
                placeholder="Misal: pcs, botol, liter, set"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="part-cost" className="text-xs font-semibold">
                Harga Beli / Modal (Rp)
              </Label>
              <Input
                id="part-cost"
                type="number"
                min={0}
                step={1000}
                placeholder="0"
                value={formAverageCost}
                onChange={(e) => setFormAverageCost(e.target.value)}
                className="h-9 text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="part-price" className="text-xs font-semibold">
                Harga Jual ke Konsumen (Rp) <span className="text-error">*</span>
              </Label>
              <Input
                id="part-price"
                type="number"
                min={0}
                step={1000}
                placeholder="0"
                value={formSellingPrice}
                onChange={(e) => setFormSellingPrice(e.target.value)}
                required
                className="h-9 font-bold text-primary text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="part-stock" className="text-xs font-semibold">
                {editingPart ? "Jumlah Stok Saat Ini" : "Jumlah Stok Awal"}
              </Label>
              <Input
                id="part-stock"
                type="number"
                min={0}
                value={formStockQuantity}
                onChange={(e) => setFormStockQuantity(e.target.value)}
                disabled={Boolean(editingPart)}
                title={editingPart ? "Gunakan tombol 'Stok' di tabel untuk penyesuaian stok" : ""}
                className={`h-9 font-mono text-xs ${editingPart ? "bg-muted cursor-not-allowed" : ""}`}
              />
              {editingPart && (
                <p className="text-[10px] text-muted-foreground">
                  *Gunakan tombol &apos;Stok&apos; pada tabel untuk menambah/mengurangi stok.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="part-min" className="text-xs font-semibold">
                Batas Stok Minimum (Peringatan Kritis)
              </Label>
              <Input
                id="part-min"
                type="number"
                min={0}
                value={formStockMinimum}
                onChange={(e) => setFormStockMinimum(e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="part-notes" className="text-xs font-semibold">
              Lokasi Rak / Catatan Motor Cocok
            </Label>
            <textarea
              id="part-notes"
              rows={2}
              placeholder="Misal: Rak A-02, Cocok untuk Honda Vario 125/150, Beat FI..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="p-3 bg-muted/30 border border-border rounded-md">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <span>Aktif (Dapat dipilih dan digunakan di Perintah Kerja)</span>
            </label>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 bg-primary hover:bg-primaryemphasis text-white font-semibold text-xs gap-1.5"
            >
              {isSaving ? (
                <>
                  <CustomLoader size="sm" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>{editingPart ? "Simpan Perubahan" : "Tambah Sparepart"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
