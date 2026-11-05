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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomLoader } from "@/components/ui/loader";
import { ExpenseCategory } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface ExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  onSuccess: () => void;
}

export default function ExpenseCategoryDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: ExpenseCategoryDialogProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Nama kategori tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/expenses/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menambahkan kategori.");
      }

      toast.success(actionMessages.expense.categoryCreated(name.trim()));
      setName("");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menambahkan kategori.");
      toast.error(err.message || "Gagal menambahkan kategori.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Kelola Kategori Pengeluaran
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Daftar pos biaya operasional untuk mengelompokkan pengeluaran bengkel.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* DAFTAR KATEGORI SAAT INI */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">
              Kategori Terdaftar ({categories.length})
            </Label>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-muted/30 border border-border rounded-lg text-xs">
              {categories.map((c) => (
                <div key={c.id} className="py-1 px-2 bg-background rounded border border-border/60 text-foreground">
                  {c.name}
                </div>
              ))}
            </div>
          </div>

          {/* FORM TAMBAH KATEGORI BARU */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-border">
            <div className="space-y-1.5">
              <Label htmlFor="new-cat-name" className="text-xs font-semibold">
                Tambah Kategori Baru <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-cat-name"
                placeholder="Misal: Perawatan Kompresor & Mesin Dyno"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs sm:text-sm"
              />
            </div>

            <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="text-xs"
              >
                Tutup
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSaving}
                className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1.5">
                    <CustomLoader size="sm" />
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  "Tambah Kategori"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

