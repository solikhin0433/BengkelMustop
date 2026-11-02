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
import { SparepartItem } from "@/types/master";

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
        onDeleteSuccess();
      } else {
        const json = await res.json();
        alert(json.error || "Gagal menghapus sparepart");
      }
    } catch (err) {
      console.error("Error deleting part:", err);
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
            <span>Hapus Sparepart?</span>
          </DialogTitle>
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
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Ya, Hapus Part</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
