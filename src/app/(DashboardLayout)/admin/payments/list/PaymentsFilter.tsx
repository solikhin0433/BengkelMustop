"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, Plus } from "lucide-react";

interface PaymentsFilterProps {
  activeTab: "history" | "pending";
  setActiveTab: (tab: "history" | "pending") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  pendingCount: number;
  isLoading: boolean;
  onRefresh: () => void;
  onOpenPaymentDialog: () => void;
}

export default function PaymentsFilter({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  paymentMethod,
  setPaymentMethod,
  pendingCount,
  isLoading,
  onRefresh,
  onOpenPaymentDialog,
}: PaymentsFilterProps) {
  return (
    <CardBox className="p-4 space-y-4">
      {/* 1. TAB SELECTOR & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* Clean Segmented Control for Tabs */}
        <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Riwayat Pembayaran Kasir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Antrean Belum Lunas</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 px-3 gap-1.5 text-xs font-medium"
            title="Segarkan data"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>

          <Button
            type="button"
            onClick={onOpenPaymentDialog}
            className="h-9 px-3.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Terima Pembayaran</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & DYNAMIC FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === "history"
                ? "Cari no. kuitansi, nomor PK, nama pelanggan, nopol, referensi..."
                : "Cari nomor PK, nama pelanggan, nomor plat motor..."
            }
            className="pl-9 h-9 text-xs sm:text-sm bg-background"
          />
        </div>

        {/* Filter Metode Bayar (Khusus Tab Riwayat) */}
        {activeTab === "history" && (
          <div className="flex items-center gap-2">
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Metode Pembayaran</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris_manual">QRIS Kasir</option>
              <option value="bank_transfer">Transfer Bank</option>
              <option value="other">Metode Lainnya</option>
            </select>
          </div>
        )}
      </div>
    </CardBox>
  );
}

