"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkshopSettings } from "@/types/master";
import {
  Store,
  Phone,
  Clock,
  Save,
  RotateCw,
  Info,
} from "lucide-react";

interface SettingsFormProps {
  formData: WorkshopSettings;
  setFormData: React.Dispatch<React.SetStateAction<WorkshopSettings>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  onReset: () => void;
  saving: boolean;
}

export default function SettingsForm({
  formData,
  setFormData,
  onSave,
  onReset,
  saving,
}: SettingsFormProps) {
  return (
    <form onSubmit={onSave} className="space-y-6 max-w-5xl">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Profil & Identitas Bengkel
          </h2>
          <p className="text-xs text-muted-foreground">
            Informasi ini akan tertera pada nota cetak kasir, pesan WhatsApp bon, dan landing page publik.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={saving}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={saving}
            className="gap-2 bg-primary text-primary-foreground font-semibold"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
          </Button>
        </div>
      </div>

      {/* 1. Identitas Utama */}
      <CardBox className="p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border">
          <Store className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Informasi Utama Bengkel
            </h3>
            <p className="text-xs text-muted-foreground">
              Nama resmi usaha bengkel dan deskripsi pelayanan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Nama Bengkel <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Contoh: Bengkel Mustop"
              value={formData.shop_name}
              onChange={(e) =>
                setFormData({ ...formData, shop_name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Slogan / Tagline
            </label>
            <Input
              placeholder="Contoh: Spesialis Servis Motor Matic & Manual Terpercaya"
              value={formData.tagline || ""}
              onChange={(e) =>
                setFormData({ ...formData, tagline: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Deskripsi Singkat Bengkel
            </label>
            <Textarea
              rows={3}
              placeholder="Tuliskan ringkasan spesialisasi, fasilitas, atau keunggulan bengkel..."
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </div>
      </CardBox>

      {/* 2. Kontak & Lokasi */}
      <CardBox className="p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border">
          <Phone className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Kontak & Alamat Bengkel
            </h3>
            <p className="text-xs text-muted-foreground">
              Digunakan untuk kontak konfirmasi pelanggan dan lokasi bengkel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nomor WhatsApp Resmi
            </label>
            <div className="relative">
              <Input
                placeholder="081234567890"
                value={formData.whatsapp_number}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp_number: e.target.value })
                }
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Format nomor aktif dengan awalan 08 atau 62 untuk pengiriman otomatis pesan reminder bon.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email Bengkel (Opsional)
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="kontak@bengkelmustop.com"
                value={formData.public_email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, public_email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Alamat Fisik Bengkel
            </label>
            <Textarea
              rows={2}
              placeholder="Jl. Raya Utama No. 45, Kelurahan..."
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Link Google Maps
            </label>
            <Input
              placeholder="https://maps.app.goo.gl/..."
              value={formData.maps_url || ""}
              onChange={(e) =>
                setFormData({ ...formData, maps_url: e.target.value })
              }
            />
          </div>
        </div>
      </CardBox>

      {/* 3. Jam Operasional */}
      <CardBox className="p-6">
        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-border">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground text-sm">
              Jam Operasional
            </h3>
            <p className="text-xs text-muted-foreground">
              Jadwal buka dan tutup bengkel untuk informasi pelanggan.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Senin - Jumat
            </label>
            <Input
              placeholder="08:00 - 17:00"
              value={formData.opening_hours?.senin_jumat || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opening_hours: {
                    ...formData.opening_hours,
                    senin_jumat: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Sabtu
            </label>
            <Input
              placeholder="08:00 - 16:00"
              value={formData.opening_hours?.sabtu || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opening_hours: {
                    ...formData.opening_hours,
                    sabtu: e.target.value,
                  },
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Minggu / Hari Libur
            </label>
            <Input
              placeholder="Tutup / Sesuai Janji"
              value={formData.opening_hours?.minggu || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opening_hours: {
                    ...formData.opening_hours,
                    minggu: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </CardBox>

      {/* Petunjuk Tambahan */}
      <div className="flex items-start gap-3 p-4 bg-muted/40 border border-border rounded-xl">
        <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">
            Catatan Sinkronisasi Sistem
          </p>
          <p>
            Data profil ini otomatis tersambung ke lembar cetak struk kasir, invoice PDF, template WhatsApp notifikasi servis, dan informasi profil pada halaman utama pelanggan.
          </p>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="gap-2 bg-primary text-primary-foreground font-semibold px-6"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </Button>
      </div>
    </form>
  );
}

