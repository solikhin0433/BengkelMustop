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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CustomerReceivableItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";
import { MessageSquare, ExternalLink } from "lucide-react";

interface ReceivableReminderModalProps {
  item: CustomerReceivableItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ReceivableReminderModal({
  item,
  open,
  onOpenChange,
  onSuccess,
}: ReceivableReminderModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (item) {
      const balanceStr = Number(item.jumlah_bon).toLocaleString("id-ID");
      const dueDateStr = item.due_date
        ? new Date(item.due_date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "segera";

      const defaultMsg =
        `Halo Bpk/Ibu ${item.customer_name},\n\n` +
        `Kami dari *Bengkel_Mustop* menginfokan mengenai sisa tagihan/bon servis untuk motor *${item.plate_number}* (No. PK: ${item.work_order_number}).\n\n` +
        `Sisa pembayaran: *Rp ${balanceStr}*\n` +
        `Batas waktu pembayaran: ${dueDateStr}\n\n` +
        `Pembayaran dapat dilakukan langsung secara tunai di bengkel atau melalui transfer / QRIS kasir kami.\n\n` +
        `Jika sudah melakukan pembayaran, mohon konfirmasi ke nomor ini ya. Terima kasih banyak atas kerjasamanya! 🙏`;

      setMessage(defaultMsg);
    }
  }, [item, open]);

  if (!item) return null;

  const handleSendWhatsApp = async () => {
    if (!item.customer_phone) {
      toast.error("Nomor WhatsApp pelanggan belum terdaftar pada data pelanggan.");
      return;
    }

    // Format phone to international format (62...)
    let phoneClean = item.customer_phone.replace(/\D/g, "");
    if (phoneClean.startsWith("0")) {
      phoneClean = "62" + phoneClean.slice(1);
    } else if (phoneClean.startsWith("8")) {
      phoneClean = "62" + phoneClean;
    }

    setIsSubmitting(true);

    try {
      // 1. Simpan log pengingat ke database tr_pengingat_bon
      await fetch("/api/receivables/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_order_id: item.work_order_id,
          customer_id: item.customer_id,
          message_snapshot: message,
          balance_snapshot: item.jumlah_bon,
        }),
      });

      // 2. Buka link WhatsApp Web / App
      const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      toast.success(actionMessages.receivable.reminderSent(item.customer_name));
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Gagal mencatat riwayat pengingat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Kirim Pengingat Tagihan WhatsApp
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Kirim pesan konfirmasi ramah kepada pelanggan terkait sisa bon servis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* INFO CARD */}
          <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penerima:</span>
              <span className="font-semibold text-foreground">{item.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor WhatsApp:</span>
              <span className="font-mono font-medium text-foreground">
                {item.customer_phone || "(Belum terisi)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sisa Bon:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                Rp {Number(item.jumlah_bon).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          {/* DRAFT PESAN WHATSAPP */}
          <div className="space-y-1.5">
            <Label htmlFor="wa-message" className="text-xs font-semibold">
              Isi Pesan WhatsApp (Dapat Diedit)
            </Label>
            <Textarea
              id="wa-message"
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs font-mono leading-relaxed resize-none bg-background"
            />
            <p className="text-[10px] text-muted-foreground">
              Pesan ini akan otomatis terbuka di aplikasi WhatsApp untuk siap dikirim langsung ke pelanggan.
            </p>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-xs"
          >
            Tutup
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSendWhatsApp}
            disabled={isSubmitting || !item.customer_phone}
            className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 min-w-[150px]"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kirim WhatsApp</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

