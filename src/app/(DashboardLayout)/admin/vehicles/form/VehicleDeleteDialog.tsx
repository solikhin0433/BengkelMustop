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
import { CustomLoader } from "@/components/ui/loader";
import { VehicleItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface VehicleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleItem | null;
  onDeleteSuccess: () => void;
}

export default function VehicleDeleteDialog({
  open,
  onOpenChange,
  vehicle,
  onDeleteSuccess,
}: VehicleDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!vehicle) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onOpenChange(false);
        toast.success(actionMessages.vehicle.deleted);
        onDeleteSuccess();
      } else {
        const json = await res.json();
        toast.error(json.error || actionMessages.error.delete("Kendaraan"));
      }
    } catch (err: any) {
      toast.error(err.message || actionMessages.error.delete("Kendaraan"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Hapus Kendaraan Motor?
          </DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Apakah Anda yakin ingin menghapus data kendaraan{" "}
            <strong className="text-foreground">
              {vehicle?.plate_number} ({vehicle?.brand} {vehicle?.model})
            </strong>
            ? Riwayat nota dan pengerjaan servis lama tetap aman tersimpan di arsip database.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-4">
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
            className="h-9 text-xs font-semibold"
          >
            {isDeleting ? (
              <>
                <CustomLoader size="sm" />
                <span className="ml-1.5">Menghapus...</span>
              </>
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

