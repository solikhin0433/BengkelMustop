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
import { ExpenseItem } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface ExpenseDeleteDialogProps {
  expense: ExpenseItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ExpenseDeleteDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: ExpenseDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expense) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus pengeluaran.");
      }

      toast.success(actionMessages.expense.deleted);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pengeluaran.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-semibold text-foreground">
            Hapus Catatan Pengeluaran
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Apakah Anda yakin ingin menghapus catatan pengeluaran{" "}
            <span className="font-semibold text-foreground">&quot;{expense.description}&quot;</span>{" "}
            senilai{" "}
            <span className="font-mono font-bold text-red-600 dark:text-red-400">
              Rp {Number(expense.amount).toLocaleString("id-ID")}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-xs"
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-semibold bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
          >
            {isDeleting ? (
              <span className="flex items-center gap-1.5">
                <CustomLoader size="sm" />
                <span>Menghapus...</span>
              </span>
            ) : (
              "Ya, Hapus"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

