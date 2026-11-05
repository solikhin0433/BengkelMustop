"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw } from "lucide-react";

interface ReceivablesFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ReceivablesFilter({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isLoading,
  onRefresh,
}: ReceivablesFilterProps) {
  return (
    <CardBox className="p-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pelanggan, nomor WhatsApp, nomor PK, atau nopol motor..."
            className="pl-9 h-9 text-xs sm:text-sm bg-background w-full"
          />
        </div>

        {/* Filter Dropdown & Refresh Button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Status Bon</option>
            <option value="overdue">Terlambat (Lewat Jatuh Tempo)</option>
            <option value="unpaid">Belum Ada Pembayaran (0%)</option>
            <option value="partial">Cicilan Berjalan (Sebagian)</option>
          </select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 px-3 gap-1.5 text-xs font-medium"
            title="Segarkan data piutang"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </Button>
        </div>
      </div>
    </CardBox>
  );
}

