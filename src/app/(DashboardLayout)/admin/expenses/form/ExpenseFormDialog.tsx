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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomLoader } from "@/components/ui/loader";
import { ExpenseCategory } from "@/types/master";
import { toast } from "@/lib/toast";
import { actionMessages } from "@/lib/action-messages";

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  onSuccess: () => void;
}

export default function ExpenseFormDialog({
  open,
  onOpenChange,
  categories,
  onSuccess,
}: ExpenseFormDialogProps) {
  const [expenseDate, setExpenseDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "bank_transfer" | "qris_manual" | "other">("cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setExpenseDate(new Date().toISOString().split("T")[0]);
      if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
      setDescription("");
      setAmount("");
      setPaymentMethod("cash");
      setErrorMessage(null);
    }
  }, [open, categories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!categoryId) {
      setErrorMessage("Silakan pilih kategori pengeluaran.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Deskripsi atau keperluan biaya wajib diisi.");
      return;
    }

    const nominal = Number(amount);
    if (isNaN(nominal) || nominal <= 0) {
      setErrorMessage("Nominal biaya harus berupa angka lebih besar dari Rp 0.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expense_date: expenseDate,
          category_id: categoryId,
          description: description.trim(),
          amount: nominal,
          payment_method: paymentMethod,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mencatat pengeluaran.");
      }

      toast.success(actionMessages.expense.created);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat menyimpan pengeluaran.");
      toast.error(err.message || "Gagal mencatat pengeluaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-base font-semibold text-foreground">
            Catat Pengeluaran Bengkel
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Catat biaya operasional, utilitas, konsumsi mekanik, atau belanja tools bengkel.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* 1. TANGGAL PENGELUARAN */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-date" className="text-xs font-semibold">
              Tanggal Biaya <span className="text-destructive">*</span>
            </Label>
            <Input
              id="exp-date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="h-9 text-xs sm:text-sm font-mono"
            />
          </div>

          {/* 2. KATEGORI */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-category" className="text-xs font-semibold">
              Kategori Pengeluaran <span className="text-destructive">*</span>
            </Label>
            <select
              id="exp-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. DESKRIPSI */}
          <div className="space-y-1.5">
            <Label htmlFor="exp-desc" className="text-xs font-semibold">
              Deskripsi / Keperluan Biaya <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="exp-desc"
              rows={2}
              placeholder="Misal: Beli bensin cuci mesin & majun kain 5 kg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          {/* 4. NOMINAL & METODE KAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount" className="text-xs font-semibold">
                Nominal Biaya (Rp) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exp-amount"
                type="number"
                min="1"
                placeholder="Misal: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 text-xs sm:text-sm font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-method" className="text-xs font-semibold">
                Metode Pembayaran
              </Label>
              <select
                id="exp-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="cash">Kas Tunai</option>
                <option value="bank_transfer">Transfer Bank</option>
                <option value="qris_manual">QRIS</option>
              </select>
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
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground min-w-[130px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <CustomLoader size="sm" />
                  <span>Menyimpan...</span>
                </span>
              ) : (
                "Simpan Biaya"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

