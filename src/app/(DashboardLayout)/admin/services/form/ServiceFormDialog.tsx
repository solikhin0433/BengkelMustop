"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Save, X, AlertTriangle } from "lucide-react";
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
import { ServiceItem } from "@/types/master";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: ServiceItem | null;
  defaultSortOrder?: number;
  onSaveSuccess: () => void;
}

export default function ServiceFormDialog({
  open,
  onOpenChange,
  editingService,
  defaultSortOrder = 0,
  onSaveSuccess,
}: ServiceFormDialogProps) {
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number | string>(0);
  const [formSortOrder, setFormSortOrder] = useState<number | string>(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPublic, setFormIsPublic] = useState(true);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingService) {
      setFormCode(editingService.code || "");
      setFormName(editingService.name);
      setFormDescription(editingService.description || "");
      setFormPrice(editingService.default_price);
      setFormSortOrder(editingService.sort_order ?? 0);
      setFormIsActive(editingService.is_active);
      setFormIsPublic(editingService.is_public);
    } else {
      setFormCode("");
      setFormName("");
      setFormDescription("");
      setFormPrice(0);
      setFormSortOrder(defaultSortOrder);
      setFormIsActive(true);
      setFormIsPublic(true);
    }
    setFormError("");
  }, [editingService, defaultSortOrder, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Nama jasa servis wajib diisi");
      return;
    }

    const priceNum = Number(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError("Tarif jasa tidak valid");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const payload = {
        code: formCode.trim() || null,
        name: formName.trim(),
        description: formDescription.trim() || null,
        default_price: priceNum,
        sort_order: Number(formSortOrder) || 0,
        is_active: formIsActive,
        is_public: formIsPublic,
      };

      let res: Response;
      if (editingService) {
        res = await fetch(`/api/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menyimpan data jasa");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="w-5 h-5" />
            </div>
            <span>
              {editingService ? "Edit Master Jasa Servis" : "Tambah Jasa Servis Baru"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editingService
              ? "Perbarui tarif atau rincian layanan jasa servis ini."
              : "Tambahkan jenis jasa servis baru beserta tarif standarnya."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 text-xs bg-lighterror text-error rounded-md flex items-center gap-2 border border-error/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-1">
              <Label htmlFor="service-code" className="text-xs font-semibold">
                Kode Jasa
              </Label>
              <Input
                id="service-code"
                placeholder="Misal: JS-01"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                className="h-9 font-mono uppercase text-xs"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="service-name" className="text-xs font-semibold">
                Nama Jasa Servis <span className="text-error">*</span>
              </Label>
              <Input
                id="service-name"
                placeholder="Misal: Servis CVT Lengkap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="h-9 text-xs sm:text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="service-price" className="text-xs font-semibold">
                Tarif Dasar (Rp) <span className="text-error">*</span>
              </Label>
              <Input
                id="service-price"
                type="number"
                min={0}
                step={1000}
                placeholder="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                required
                className="h-9 font-bold text-primary text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-sort" className="text-xs font-semibold">
                Urutan Tampilan
              </Label>
              <Input
                id="service-sort"
                type="number"
                min={0}
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-desc" className="text-xs font-semibold">
              Deskripsi / Rincian Pengerjaan
            </Label>
            <textarea
              id="service-desc"
              rows={3}
              placeholder="Rincian bagian yang dicek, disetel, atau dibersihkan..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* TOGGLES: STATUS & PUBLIC */}
          <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <span>Aktif (Dapat dipilih saat membuat Perintah Kerja)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
              <input
                type="checkbox"
                checked={formIsPublic}
                onChange={(e) => setFormIsPublic(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
              />
              <span>Tampilkan di Landing Page Web Publik</span>
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
                  <span>{editingService ? "Simpan Perubahan" : "Tambah Jasa"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
