"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Phone,
  Bike,
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomLoader } from "@/components/ui/loader";
import { CustomerItem } from "@/types/master";

interface CustomerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  onAddVehicleRequest: (customer: CustomerItem) => void;
  onEditRequest: (customer: CustomerItem) => void;
}

export default function CustomerDetailDialog({
  open,
  onOpenChange,
  customerId,
  onAddVehicleRequest,
  onEditRequest,
}: CustomerDetailDialogProps) {
  const [customer, setCustomer] = useState<CustomerItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      setIsLoading(true);
      fetch(`/api/customers/${customerId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setCustomer(json.data);
        })
        .catch((err) => console.error("Error loading customer detail:", err))
        .finally(() => setIsLoading(false));
    } else {
      setCustomer(null);
    }
  }, [open, customerId]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <span>Profil & Riwayat Pelanggan</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Rincian kontak, kendaraan motor terdaftar, dan riwayat pengerjaan servis.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <CustomLoader size="md" />
            <p className="text-xs text-muted-foreground">Memuat data pelanggan...</p>
          </div>
        ) : !customer ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Data pelanggan tidak ditemukan.
          </p>
        ) : (
          <div className="space-y-5 py-2">
            {/* DATA DIRI CARD */}
            <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {customer.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {customer.address || "Alamat belum dicatat"}
                  </p>
                </div>

                {customer.phone && (
                  <a
                    href={`https://wa.me/${customer.phone_normalized || customer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-auto shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp ({customer.phone})</span>
                  </a>
                )}
              </div>

              {customer.notes && (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Catatan: </span>
                  {customer.notes}
                </div>
              )}
            </div>

            {/* DAFTAR MOTOR TERDAFTAR */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-primary" />
                  <span>Motor Terdaftar ({customer.vehicles?.length || 0})</span>
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddVehicleRequest(customer)}
                  className="h-7 text-[11px] gap-1 font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Motor Baru</span>
                </Button>
              </div>

              {(!customer.vehicles || customer.vehicles.length === 0) ? (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 border border-border rounded-md">
                  Belum ada motor terdaftar untuk pelanggan ini.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {customer.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-card border border-border rounded-lg flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="rounded bg-muted border border-border px-1.5 py-0.5 font-mono font-bold text-xs text-foreground">
                          {v.plate_number}
                        </span>
                        <p className="text-xs font-semibold text-foreground pt-1">
                          {v.brand} {v.model}
                        </p>
                        {v.production_year && (
                          <p className="text-[11px] text-muted-foreground">
                            Tahun: {v.production_year}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIWAYAT SERVIS / WORK ORDERS */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                <span>Riwayat Perintah Kerja Servis ({customer.work_orders?.length || 0})</span>
              </h4>

              {(!customer.work_orders || customer.work_orders.length === 0) ? (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 border border-border rounded-md">
                  Belum ada riwayat servis untuk pelanggan ini.
                </p>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                  {customer.work_orders.map((wo: any) => {
                    const sisa = Math.max(0, (wo.grand_total || 0) - (wo.amount_paid || 0));
                    return (
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
                                  Sisa: Rp {sisa.toLocaleString("id-ID")}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          {customer && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEditRequest(customer);
              }}
              className="h-9 text-xs"
            >
              Edit Profil
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
