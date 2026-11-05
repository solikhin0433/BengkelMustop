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
import { VehicleItem, CustomerItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVehicle: VehicleItem | null;
  onSaveSuccess: () => void;
}

export default function VehicleFormDialog({
  open,
  onOpenChange,
  editingVehicle,
  onSaveSuccess,
}: VehicleFormDialogProps) {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("Honda");
  const [model, setModel] = useState("");

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load customers for selection dropdown
  useEffect(() => {
    if (open) {
      setIsLoadingCustomers(true);
      fetch("/api/customers")
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setCustomers(json.data);
        })
        .catch((err) => console.error("Error loading customers:", err))
        .finally(() => setIsLoadingCustomers(false));
    }
  }, [open]);

  useEffect(() => {
    if (editingVehicle) {
      setCustomerId(editingVehicle.customer_id || "");
      setPlateNumber(editingVehicle.plate_number || "");
      setBrand(editingVehicle.brand || "Honda");
      setModel(editingVehicle.model || "");
    } else {
      setCustomerId("");
      setPlateNumber("");
      setBrand("Honda");
      setModel("");
    }
    setFormError("");
  }, [editingVehicle, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      setFormError("Pilih pemilik (pelanggan) kendaraan terlebih dahulu");
      return;
    }

    if (!plateNumber.trim()) {
      setFormError("Nomor plat kendaraan wajib diisi");
      return;
    }

    if (!model.trim()) {
      setFormError("Tipe / Model motor wajib diisi");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      const payload = {
        customer_id: customerId,
        plate_number: plateNumber.trim().toUpperCase(),
        brand: brand.trim() || "Lainnya",
        model: model.trim(),
      };

      let res: Response;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menyimpan data kendaraan");
        return;
      }

      onOpenChange(false);
      toast.success(editingVehicle ? actionMessages.vehicle.updated : actionMessages.vehicle.created);
      onSaveSuccess();
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {editingVehicle ? "Edit Data Kendaraan Motor" : "Tambah Kendaraan Motor Baru"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingVehicle
              ? "Perbarui rincian kendaraan motor, nomor plat, atau data pemilik."
              : "Daftarkan kendaraan motor pelanggan ke master data Bengkel_Mustop."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          {/* PILIH PEMILIK (PELANGGAN) */}
          <div className="space-y-1.5">
            <Label htmlFor="veh-customer" className="text-xs font-semibold">
              Pemilik (Pelanggan) <span className="text-error">*</span>
            </Label>
            <select
              id="veh-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              disabled={isLoadingCustomers}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">
                {isLoadingCustomers ? "Memuat pelanggan..." : "Pilih Pelanggan..."}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Kendaraan akan dihubungkan ke riwayat transaksi pelanggan ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="h-9 font-mono uppercase text-xs sm:text-sm font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="veh-brand" className="text-xs font-semibold">
                Merek Motor <span className="text-error">*</span>
              </Label>
              <select
                id="veh-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
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

          <div className="space-y-1.5">
            <Label htmlFor="veh-model" className="text-xs font-semibold">
              Model / Tipe Motor <span className="text-error">*</span>
            </Label>
            <Input
              id="veh-model"
              placeholder="Misal: Vario 160, NMAX, Beat FI"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              required
              className="h-9 text-xs sm:text-sm"
            />
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
              className="h-9 text-sm"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 bg-primary hover:bg-primaryemphasis text-white font-semibold text-sm"
            >
              {isSaving ? (
                <>
                  <CustomLoader size="sm" />
                  <span className="ml-1.5">Menyimpan...</span>
                </>
              ) : (
                <span>{editingVehicle ? "Simpan Perubahan" : "Daftarkan Kendaraan"}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
