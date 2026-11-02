"use client";

import React, { useState, useEffect } from "react";
import { Users, Save, X, AlertTriangle, Bike } from "lucide-react";
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

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCustomer: CustomerItem | null;
  onSaveSuccess: () => void;
}

export default function CustomerFormDialog({
  open,
  onOpenChange,
  editingCustomer,
  onSaveSuccess,
}: CustomerFormDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Optional initial vehicle (hanya untuk tambah pelanggan baru)
  const [hasVehicle, setHasVehicle] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("Honda");
  const [model, setModel] = useState("");
  const [productionYear, setProductionYear] = useState<number | string>("");

  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingCustomer) {
      setName(editingCustomer.name);
      setPhone(editingCustomer.phone || "");
      setAddress(editingCustomer.address || "");
      setNotes(editingCustomer.notes || "");
      setHasVehicle(false);
    } else {
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setHasVehicle(false);
      setPlateNumber("");
      setBrand("Honda");
      setModel("");
      setProductionYear("");
    }
    setFormError("");
  }, [editingCustomer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Nama pelanggan wajib diisi");
      return;
    }

    if (hasVehicle && !editingCustomer) {
      if (!plateNumber.trim()) {
        setFormError("Nomor plat motor wajib diisi jika mendaftarkan kendaraan");
        return;
      }
    }

    setIsSaving(true);
    setFormError("");

    try {
      const payload: Record<string, any> = {
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      };

      if (!editingCustomer && hasVehicle) {
        payload.has_vehicle = true;
        payload.plate_number = plateNumber.trim().toUpperCase();
        payload.brand = brand.trim() || "Lainnya";
        payload.model = model.trim() || "Motor";
        payload.production_year = Number(productionYear) || null;
      }

      let res: Response;
      if (editingCustomer) {
        res = await fetch(`/api/customers/${editingCustomer.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || "Gagal menyimpan data pelanggan");
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <span>
              {editingCustomer ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            {editingCustomer
              ? "Perbarui kontak, alamat, atau catatan pelanggan ini."
              : "Masukkan informasi data diri pelanggan ke master data Bengkel_Mustop."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {formError && (
            <div className="p-3 text-xs bg-lighterror text-error rounded-md flex items-center gap-2 border border-error/20">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="cust-name" className="text-xs font-semibold">
              Nama Lengkap Pelanggan <span className="text-error">*</span>
            </Label>
            <Input
              id="cust-name"
              placeholder="Misal: Hendra Wijaya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-9 text-xs sm:text-sm font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-phone" className="text-xs font-semibold">
              Nomor WhatsApp / HP
            </Label>
            <Input
              id="cust-phone"
              placeholder="Misal: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9 font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">
              Digunakan untuk notifikasi pengerjaan servis & reminder jatuh tempo bon.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-address" className="text-xs font-semibold">
              Alamat Domisili
            </Label>
            <textarea
              id="cust-address"
              rows={2}
              placeholder="Misal: Jl. Mawar No. 12, RT 03/RW 02..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-notes" className="text-xs font-semibold">
              Catatan Khusus Pelanggan
            </Label>
            <Input
              id="cust-notes"
              placeholder="Misal: Pelanggan langganan setia, pemilik warung dekat bengkel..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* OPSI REGISTRASI KENDARAAN AWAL (Hanya Saat Tambah Baru) */}
          {!editingCustomer && (
            <div className="p-3.5 bg-muted/30 border border-border rounded-lg space-y-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={hasVehicle}
                  onChange={(e) => setHasVehicle(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                />
                <span className="flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-primary" />
                  <span>Daftarkan motor pertama pelanggan sekarang juga</span>
                </span>
              </label>

              {hasVehicle && (
                <div className="space-y-3 pt-1 border-t border-border">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="init-plate" className="text-[11px] font-semibold">
                        Nomor Plat Motor <span className="text-error">*</span>
                      </Label>
                      <Input
                        id="init-plate"
                        placeholder="Misal: B 1234 ABC"
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        required={hasVehicle}
                        className="h-9 font-mono uppercase text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="init-brand" className="text-[11px] font-semibold">
                        Merk Kendaraan
                      </Label>
                      <select
                        id="init-brand"
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
                    <div className="space-y-1">
                      <Label htmlFor="init-model" className="text-[11px] font-semibold">
                        Model / Tipe Motor
                      </Label>
                      <Input
                        id="init-model"
                        placeholder="Misal: Vario 160, Beat FI, NMAX"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="init-year" className="text-[11px] font-semibold">
                        Tahun Produksi
                      </Label>
                      <Input
                        id="init-year"
                        type="number"
                        placeholder="Misal: 2022"
                        value={productionYear}
                        onChange={(e) => setProductionYear(e.target.value)}
                        className="h-9 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                  <span>{editingCustomer ? "Simpan Perubahan" : "Tambah Pelanggan"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
