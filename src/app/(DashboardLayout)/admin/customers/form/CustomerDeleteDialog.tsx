"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
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
import { CustomerItem } from "@/types/master";

interface CustomerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerItem | null;
  onDeleteSuccess: () => void;
}

export default function CustomerDeleteDialog({
  open,
  onOpenChange,
  customer,
  onDeleteSuccess,
}: CustomerDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!customer) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onOpenChange(false);
        onDeleteSuccess();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal menghapus pelanggan");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-error text-base">
            <AlertTriangle className="h-5 w-5" />
            <span>Hapus Pelanggan?</span>
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Apakah Anda yakin ingin menghapus data pelanggan{" "}
            <strong className="text-foreground">{customer?.name}</strong>? Data
            kendaraan dan riwayat servis lama tetap aman tersimpan di arsip database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting}
            onClick={handleConfirmDelete}
            className="h-9 text-xs gap-1.5 font-semibold"
          >
            {isDeleting ? (
              <>
                <CustomLoader size="sm" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
