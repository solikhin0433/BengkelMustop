"use client";

import React, { useState, useEffect } from "react";
import { Bike, Save, X, AlertTriangle } from "lucide-react";
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
import { CustomerItem } from "@/types/master";

interface CustomerVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerItem | null;
  onSaveSuccess: () => void;
}

export default function CustomerVehicleDialog({
  open,
  onOpenChange,
  customer,
  onSaveSuccess,
}: CustomerVehicleDialogProps) {
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("Honda");
  const [model, setModel] = useState("");
  const [productionYear, setProductionYear] = useState<number | string>("");
  const [engineCapacity, setEngineCapacity] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPlateNumber("");
      setBrand("Honda");
      setModel("");
      setProductionYear("");
      setEngineCapacity("");
      setNotes("");
      setFormError("");
    }
  }, [open, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    if (!plateNumber.trim()) {
      setFormError("Nomor plat motor wajib diisi");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const res = await fetch(`/api/customers/${customer.id}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate_number: plateNumber.trim().toUpperCase(),
          brand: brand.trim() || "Lainnya",
          model: model.trim() || "Motor",
          production_year: Number(productionYear) || null,
          engine_capacity: engineCapacity.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menambahkan motor");
        return;
      }

      onOpenChange(false);
      onSaveSuccess();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="p-2 rounded-lg bg-success/10 text-success">
              <Bike className="w-5 h-5" />
            </div>
            <span>Tambah Motor Pelanggan</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Daftarkan motor baru untuk pemilik:{" "}
            <strong className="text-foreground">{customer?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 text-xs bg-lighterror text-error rounded-md flex items-center gap-2 border border-error/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="veh-plate" className="text-xs font-semibold">
                Nomor Plat Motor <span className="text-error">*</span>
              </Label>
              <Input
                id="veh-plate"
                placeholder="Misal: B 1234 ABC"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                required
                className="h-9 font-mono uppercase text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="veh-brand" className="text-xs font-semibold">
                Merk Motor
              </Label>
              <select
                id="veh-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Honda">Honda</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Suzuki">Suzuki</option>
                <option value="Kawasaki">Kawasaki</option>
                <option value="Vespa">Vespa</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="veh-model" className="text-xs font-semibold">
                Tipe / Model Motor
              </Label>
              <Input
                id="veh-model"
                placeholder="Misal: Vario 160, NMAX"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="veh-year" className="text-xs font-semibold">
                Tahun Produksi
              </Label>
              <Input
                id="veh-year"
                type="number"
                placeholder="Misal: 2023"
                value={productionYear}
                onChange={(e) => setProductionYear(e.target.value)}
                className="h-9 font-mono text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="veh-notes" className="text-xs font-semibold">
              Keterangan / Warna Motor
            </Label>
            <Input
              id="veh-notes"
              placeholder="Misal: Warna hitam doff, ban tubeless"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
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
                  <span>Daftarkan Motor</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
