"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Printer,
  Phone,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  DollarSign,
  Calendar,
  User,
  Car,
  FileText,
  CreditCard,
  Ban,
  ArrowRight,
} from "lucide-react";
import { CustomLoader } from "@/components/ui/loader";
import { WorkOrder, WorkOrderStatus, PaymentMethod } from "../types";
import { WorkOrderStore } from "../work-order-store";

interface WorkOrderDetailDialogProps {
  order: WorkOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (order: WorkOrder) => void;
  onCancelRequest: (order: WorkOrder) => void;
  onPrintRequest: (order: WorkOrder) => void;
  onOrderUpdated: (order?: WorkOrder) => void;
}

export default function WorkOrderDetailDialog({
  order,
  open,
  onOpenChange,
  onEdit,
  onCancelRequest,
  onPrintRequest,
  onOrderUpdated,
}: WorkOrderDetailDialogProps) {
  if (!order) return null;

  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>("cash");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const sisaBayar = Math.max(0, order.grand_total - (order.amount_paid || 0));

  // Status mapping
  const statusLabels: Record<
    WorkOrderStatus,
    { label: string; variant: "warning" | "success" | "error" | "default" | "secondary" | "outline" }
  > = {
    waiting: { label: "Antri", variant: "secondary" },
    in_progress: { label: "Sedang Dikerjakan", variant: "warning" },
    waiting_parts: { label: "Menunggu Sparepart", variant: "error" },
    completed: { label: "Selesai", variant: "success" },
    cancelled: { label: "Dibatalkan", variant: "outline" },
  };

  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    if (order.status === newStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const res = await WorkOrderStore.updateStatus(order.id, newStatus);
      if (res.success) {
        onOrderUpdated();
      } else {
        setActionError(res.error || "Gagal mengubah status pengerjaan");
      }
    } catch (e: any) {
      setActionError(e.message || "Gagal mengubah status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0 || isSubmittingPayment) return;
    setIsSubmittingPayment(true);
    setActionError(null);
    try {
      const res = await WorkOrderStore.recordPayment(order.id, payAmount, payMethod);
      if (res.success) {
        onOrderUpdated();
        setIsRecordingPayment(false);
        setPayAmount(0);
      } else {
        setActionError(res.error || "Gagal mencatat pembayaran");
      }
    } catch (e: any) {
      setActionError(e.message || "Gagal mencatat pembayaran");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // WhatsApp formatted message
  const waMessage = encodeURIComponent(
    `Halo Bpk/Ibu ${order.customer_name},\n` +
      `Update servis motor Anda di Bengkel_Mustop:\n` +
      `No. PK: ${order.work_order_number}\n` +
      `Kendaraan: ${order.vehicle_brand} ${order.vehicle_model} (${order.plate_number})\n` +
      `Status Pengerjaan: ${statusLabels[order.status].label}\n` +
      `Mekanik: ${order.mechanic}\n` +
      `Total Biaya: Rp ${order.grand_total.toLocaleString("id-ID")}\n` +
      (order.payment_status === "paid"
        ? `Status Pembayaran: LUNAS ✅\n`
        : `Sisa Tagihan: Rp ${sisaBayar.toLocaleString("id-ID")}\n`) +
      `\nTerima kasih atas kepercayaan Anda di Bengkel_Mustop!`
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20 sticky top-0 z-20 backdrop-blur-md">
          <DialogTitle className="sr-only">Detail Perintah Kerja</DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-primary">
                  {order.work_order_number}
                </span>
                <Badge
                  variant={statusLabels[order.status].variant}
                  className="text-xs font-bold"
                >
                  {statusLabels[order.status].label}
                </Badge>
                <Badge
                  variant={
                    order.payment_status === "paid"
                      ? "success"
                      : order.payment_status === "partial"
                      ? "warning"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {order.payment_status === "paid"
                    ? "LUNAS"
                    : order.payment_status === "partial"
                    ? `DP (Rp ${order.amount_paid.toLocaleString("id-ID")})`
                    : "BELUM BAYAR"}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Waktu Masuk: {order.received_at}
                {order.completed_at && ` • Selesai: ${order.completed_at}`}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintRequest(order)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Nota / Perintah Kerja</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                asChild
              >
                <a
                  href={`https://wa.me/${order.customer_phone}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                  <span>Kirim WhatsApp</span>
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 text-sm">
          {actionError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* QUICK STATUS SWITCHER */}
          {order.status !== "cancelled" && (
            <div className="bg-muted/30 border border-border p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>Ubah Cepat Status Pengerjaan:</span>
                {isUpdatingStatus && <CustomLoader size="sm" />}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "waiting" as const, label: "Antri" },
                  { key: "in_progress" as const, label: "Sedang Dikerjakan" },
                  { key: "waiting_parts" as const, label: "Menunggu Sparepart" },
                  { key: "completed" as const, label: "Tandai Selesai" },
                ].map((st) => (
                  <Button
                    key={st.key}
                    type="button"
                    size="sm"
                    disabled={isUpdatingStatus}
                    variant={order.status === st.key ? "default" : "outline"}
                    onClick={() => handleStatusChange(st.key)}
                    className="h-8 text-xs font-semibold"
                  >
                    {st.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* CANCELLATION NOTICE IF CANCELLED */}
          {order.status === "cancelled" && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive flex items-start gap-3">
              <Ban className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Perintah Kerja Telah Dibatalkan</p>
                <p className="text-xs mt-0.5">
                  Alasan Pembatalan:{" "}
                  <span className="font-medium underline">
                    {order.cancellation_reason || "Tidak ada keterangan"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* CUSTOMER & VEHICLE INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>Pelanggan</span>
              </h4>
              <p className="font-bold text-foreground text-base">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600" />
                <span>{order.customer_phone}</span>
              </p>
              {order.customer_address && (
                <p className="text-xs text-muted-foreground">{order.customer_address}</p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Car className="h-3.5 w-3.5 text-primary" />
                <span>Kendaraan Motor & Mekanik</span>
              </h4>
              <div className="flex items-center gap-2">
                <span className="bg-muted px-2 py-0.5 rounded font-mono font-bold text-sm text-foreground">
                  {order.plate_number}
                </span>
                <span className="font-semibold text-sm">
                  {order.vehicle_brand} {order.vehicle_model} ({order.vehicle_year || 2023})
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Mekanik Penanggung Jawab:{" "}
                <span className="font-semibold text-foreground">{order.mechanic}</span>
              </p>
              {order.current_km && (
                <p className="text-xs text-muted-foreground">
                  Odometer / KM Masuk:{" "}
                  <span className="font-mono">{order.current_km.toLocaleString("id-ID")} KM</span>
                </p>
              )}
            </div>
          </div>

          {/* COMPLAINTS & NOTES */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div>
              <span className="text-xs font-bold text-foreground block">
                Keluhan Pelanggan:
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 bg-muted/20 p-2.5 rounded-lg border border-border">
                {order.customer_complaint}
              </p>
            </div>
            {order.inspection_notes && (
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Hasil Pemeriksaan / Diagnosa Mekanik:
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.inspection_notes}
                </p>
              </div>
            )}
            {order.recommendation && (
              <div>
                <span className="text-xs font-bold text-foreground block">
                  Rekomendasi Pekerjaan:
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* ITEMS BREAKDOWN */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-primary" />
              <span>Rincian Jasa & Sparepart Terpasang</span>
            </h4>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Pekerjaan / Suku Cadang</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Harga Satuan</th>
                    <th className="py-2 px-3 text-right">Diskon</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-2 px-3">
                        <Badge
                          variant={item.item_type === "service" ? "default" : "secondary"}
                          className="text-[9px] uppercase font-bold"
                        >
                          {item.item_type === "service" ? "Jasa" : "Part"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 font-medium text-foreground">
                        {item.item_name_snapshot}
                        {item.sku_snapshot && (
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            SKU: {item.sku_snapshot}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono text-muted-foreground">
                        Rp {item.unit_price.toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-destructive">
                        {(item.discount_amount ?? 0) > 0
                          ? `- Rp ${(item.discount_amount ?? 0).toLocaleString("id-ID")}`
                          : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold font-mono text-foreground">
                        Rp {item.line_total.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Metode Bayar:{" "}
                  <span className="font-semibold text-foreground uppercase">
                    {order.payment_method || "Tunai"}
                  </span>
                </p>
                {order.due_date && (
                  <p className="text-warning font-semibold">
                    Jatuh Tempo Bon: {order.due_date}
                  </p>
                )}
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs bg-muted/20 p-3 rounded-lg border border-border">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Jasa:</span>
                  <span className="font-mono">
                    Rp {order.subtotal_service.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal Sparepart:</span>
                  <span className="font-mono">
                    Rp {order.subtotal_parts.toLocaleString("id-ID")}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-destructive font-medium">
                    <span>Diskon Tambahan:</span>
                    <span className="font-mono">
                      - Rp {order.discount_amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                {order.additional_charge > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Biaya Tambahan:</span>
                    <span className="font-mono">
                      + Rp {order.additional_charge.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="border-t border-border pt-1 flex justify-between font-bold text-sm text-foreground">
                  <span>Grand Total:</span>
                  <span className="font-mono text-primary font-extrabold">
                    Rp {order.grand_total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold pt-0.5">
                  <span>Sudah Dibayar:</span>
                  <span className="font-mono">
                    Rp {(order.amount_paid || 0).toLocaleString("id-ID")}
                  </span>
                </div>
                {sisaBayar > 0 && (
                  <div className="flex justify-between text-warning font-bold border-t border-dashed border-border pt-1">
                    <span>Sisa Tagihan / Bon:</span>
                    <span className="font-mono">Rp {sisaBayar.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PAYMENT INPUT FORM ACCORDION */}
          {sisaBayar > 0 && order.status !== "cancelled" && (
            <div className="bg-lightprimary/20 border border-primary/20 rounded-xl p-4">
              {!isRecordingPayment ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-foreground text-sm">
                      Pencatatan Pembayaran / Pelunasan
                    </h5>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sisa tagihan motor ini: Rp {sisaBayar.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPayAmount(sisaBayar);
                      setIsRecordingPayment(true);
                    }}
                    className="gap-1.5 bg-primary text-white font-semibold"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>+ Catat Pembayaran</span>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleRecordPayment} className="space-y-3">
                  <h5 className="font-bold text-foreground text-sm">
                    Form Pelunasan / Cicilan Bon
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium">Nominal Bayar (Rp) *</Label>
                      <Input
                        type="number"
                        min="1000"
                        max={sisaBayar}
                        value={payAmount}
                        onChange={(e) => setPayAmount(Number(e.target.value))}
                        className="h-9 text-sm font-mono mt-1 font-bold"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Metode Pembayaran</Label>
                      <select
                        value={payMethod}
                        onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                        className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm font-medium mt-1"
                      >
                        <option value="cash">Tunai (Cash Kasir)</option>
                        <option value="qris_manual">QRIS Bengkel</option>
                        <option value="bank_transfer">Transfer Bank (BCA / Mandiri)</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        type="submit"
                        disabled={isSubmittingPayment}
                        className="h-9 w-full bg-success hover:bg-success/90 text-white font-bold gap-1.5"
                      >
                        {isSubmittingPayment ? (
                          <>
                            <CustomLoader size="sm" />
                            <span>Menyimpan...</span>
                          </>
                        ) : (
                          "Konfirmasi Bayar"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={isSubmittingPayment}
                        onClick={() => setIsRecordingPayment(false)}
                        className="h-9 text-xs"
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t border-border bg-muted/20 sticky bottom-0 z-20 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
          <div>
            {order.status !== "cancelled" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onCancelRequest(order)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Batalkan PK</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
              className="gap-1.5 text-xs font-semibold"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Perintah Kerja</span>
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-semibold"
            >
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
