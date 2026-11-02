"use client";

import React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SparepartCategory } from "@/types/master";

interface PartsFilterProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  categories: SparepartCategory[];
  stockFilter: "all" | "in_stock" | "low_stock" | "out_of_stock";
  onStockFilterChange: (val: "all" | "in_stock" | "low_stock" | "out_of_stock") => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCreate: () => void;
}

export default function PartsFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  stockFilter,
  onStockFilterChange,
  onRefresh,
  isLoading,
  onOpenCreate,
}: PartsFilterProps) {
  return (
    <CardBox className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari SKU, nama part, atau lokasi rak..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 text-xs sm:text-sm"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => onStockFilterChange(e.target.value as any)}
            className="h-10 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Status Stok</option>
            <option value="in_stock">Stok Aman</option>
            <option value="low_stock">Stok Menipis (Kritis)</option>
            <option value="out_of_stock">Stok Habis (0)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
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

          <Button
            onClick={onOpenCreate}
            className="gap-2 bg-primary hover:bg-primaryemphasis text-white h-10 font-semibold text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Sparepart</span>
          </Button>
        </div>
      </div>
    </CardBox>
  );
}
