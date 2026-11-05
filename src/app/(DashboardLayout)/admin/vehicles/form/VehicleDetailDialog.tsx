"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomLoader } from "@/components/ui/loader";
import { VehicleItem } from "@/types/master";

interface VehicleDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId: string | null;
  onEditRequest: (vehicle: VehicleItem) => void;
}

export default function VehicleDetailDialog({
  open,
  onOpenChange,
  vehicleId,
  onEditRequest,
}: VehicleDetailDialogProps) {
  const [vehicle, setVehicle] = useState<VehicleItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && vehicleId) {
      setIsLoading(true);
      fetch(`/api/vehicles/${vehicleId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setVehicle(json.data);
        })
        .catch((err) => console.error("Error loading vehicle detail:", err))
        .finally(() => setIsLoading(false));
    } else {
      setVehicle(null);
    }
  }, [open, vehicleId]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Rincian Data & Riwayat Kendaraan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Spesifikasi motor, identitas pemilik, serta riwayat pekerjaan servis yang pernah dilakukan.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <CustomLoader size="md" />
            <p className="text-xs text-muted-foreground">Memeriksa data kendaraan...</p>
          </div>
        ) : !vehicle ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Data kendaraan tidak ditemukan.
          </p>
        ) : (
          <div className="space-y-5 py-2">
            {/* SPESIFIKASI MOTOR CARD */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-muted border border-border px-2 py-0.5 font-mono font-bold text-sm text-foreground">
                      {vehicle.plate_number}
                    </span>
                    <span className="font-bold text-foreground text-base">
                      {vehicle.brand} {vehicle.model}
                    </span>
                  </div>
                </div>

                <Link href="/admin/work-orders">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primaryemphasis text-white text-xs font-semibold h-8"
                  >
                    + Buat Perintah Kerja
                  </Button>
                </Link>
              </div>
            </div>

            {/* DATA PEMILIK */}
            <div className="p-4 bg-muted/20 border border-border rounded-lg space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Informasi Pemilik (Pelanggan)
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {vehicle.customer?.name || "Pelanggan Belum Terhubung"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {vehicle.customer?.address || "Alamat tidak dicantumkan"}
                  </p>
                </div>

                {vehicle.customer?.phone && (
                  <a
                    href={`https://wa.me/${vehicle.customer.phone_normalized || vehicle.customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-auto shadow-xs"
                  >
                    <span>WhatsApp ({vehicle.customer.phone})</span>
                  </a>
                )}
              </div>
            </div>

            {/* RIWAYAT SERVIS MOTOR INI */}
            <div className="space-y-2.5">
              <h4 className="text-sm font-semibold text-foreground">
                Riwayat Servis Kendaraan Ini ({vehicle.work_orders?.length || 0})
              </h4>

              {!vehicle.work_orders || vehicle.work_orders.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 border border-border rounded-md">
                  Belum ada catatan servis atau perintah kerja untuk kendaraan ini.
                </p>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {vehicle.work_orders.map((wo: any) => (
                    <div
                      key={wo.id}
                      className="p-3 bg-card hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-primary">
                          {wo.work_order_number}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(wo.received_at).toLocaleDateString("id-ID")}
                        </span>
                        {wo.customer_complaint && (
                          <p className="text-muted-foreground line-clamp-1">
                            Keluhan: {wo.customer_complaint}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-bold text-foreground font-mono">
                            Rp {Number(wo.grand_total || 0).toLocaleString("id-ID")}
                          </span>
                          <span className="block text-[10px]">
                            {wo.payment_status === "paid" ? (
                              <span className="text-success font-bold">LUNAS</span>
                            ) : (
                              <span className="text-warning font-bold">
                                {wo.payment_status?.toUpperCase() || "BELUM LUNAS"}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-4">
          {vehicle && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEditRequest(vehicle);
              }}
              className="h-9 text-xs"
            >
              Edit Kendaraan
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

