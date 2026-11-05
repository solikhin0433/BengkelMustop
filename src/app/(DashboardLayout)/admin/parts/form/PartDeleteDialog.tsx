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
import { SparepartItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface PartDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: SparepartItem | null;
  onDeleteSuccess: () => void;
}

export default function PartDeleteDialog({
  open,
  onOpenChange,
  part,
  onDeleteSuccess,
}: PartDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!part) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/parts/${part.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onOpenChange(false);
        toast.success(actionMessages.part.deleted);
        onDeleteSuccess();
      } else {
        const json = await res.json();
        toast.error(json.error || actionMessages.error.delete("Sparepart"));
      }
    } catch (err: any) {
      toast.error(err.message || actionMessages.error.delete("Sparepart"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Hapus Sparepart?</DialogTitle>
          <DialogDescription className="text-xs pt-1">
            Apakah Anda yakin ingin menghapus suku cadang{" "}
            <strong className="text-foreground">{part?.name}</strong>? Riwayat
            transaksi dan nota lama tetap aman (tersimpan secara arsip).
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
              <span>Ya, Hapus</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
