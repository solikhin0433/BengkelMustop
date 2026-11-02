"use client";

import React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WorkOrderFilterProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterStatus: string;
  onStatusChange: (val: string) => void;
  filterPayment: string;
  onPaymentChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCreate: () => void;
}

export default function WorkOrderFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterPayment,
  onPaymentChange,
  onRefresh,
  isLoading,
  onOpenCreate,
}: WorkOrderFilterProps) {
  return (
    <CardBox className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari No. Perintah Kerja, Nopol, Pelanggan, Keluhan, Mekanik..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 text-xs sm:text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* STATUS FILTER PILLS */}
          <div className="flex rounded-md border border-border p-1 bg-muted/40">
            {[
              { label: "Semua", value: "semua" },
              { label: "Antri", value: "waiting" },
              { label: "Dikerjakan", value: "in_progress" },
              { label: "Menunggu Part", value: "waiting_parts" },
              { label: "Selesai", value: "completed" },
              { label: "Batal", value: "cancelled" },
            ].map((st) => (
              <button
                key={st.value}
                onClick={() => onStatusChange(st.value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterStatus === st.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* PAYMENT FILTER */}
          <select
            value={filterPayment}
            onChange={(e) => onPaymentChange(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="semua">Semua Pembayaran</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="partial">Bayar Sebagian / DP</option>
            <option value="paid">Lunas</option>
          </select>

          {/* REFRESH BUTTON */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            title="Segarkan data dari database"
            className="h-10 px-3 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`}
            />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>

          {/* CREATE WORK ORDER BUTTON */}
          <Button
            onClick={onOpenCreate}
            className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10 shadow-sm font-semibold text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Perintah Kerja</span>
          </Button>
        </div>
      </div>
    </CardBox>
  );
}
