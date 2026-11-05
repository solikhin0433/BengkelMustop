"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomLoader } from "@/components/ui/loader";
import { SparepartCategory } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface PartCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (category: SparepartCategory) => void;
}

export default function PartCategoryDialog({
  open,
  onOpenChange,
  onCategoryCreated,
}: PartCategoryDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSavingCategory(true);
    try {
      const res = await fetch("/api/parts/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        onCategoryCreated(json.data);
        toast.success(actionMessages.part.categoryCreated(newCategoryName.trim()));
        onOpenChange(false);
        setNewCategoryName("");
      } else {
        toast.error(json.error || "Gagal membuat kategori baru");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat kategori baru");
    } finally {
      setIsSavingCategory(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Tambah Kategori Sparepart</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveCategory} className="space-y-3 pt-2">
          <div className="space-y-1">
            <Label className="text-xs">Nama Kategori</Label>
            <Input
              placeholder="Misal: Oli & Cairan"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              className="h-9 text-xs"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSavingCategory}
              className="h-8 bg-primary text-white text-xs font-semibold"
            >
              {isSavingCategory ? <CustomLoader size="sm" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
