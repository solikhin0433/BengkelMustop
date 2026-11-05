"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, Plus } from "lucide-react";
import { SparepartCategory } from "@/types/master";

interface InventoryFilterProps {
  activeTab: "stock" | "mutations";
  setActiveTab: (tab: "stock" | "mutations") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // Tab Stock Filters
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  stockStatus: "all" | "in_stock" | "low_stock" | "out_of_stock";
  setStockStatus: (status: "all" | "in_stock" | "low_stock" | "out_of_stock") => void;
  // Tab Mutation Filters
  mutationTypeFilter: string;
  setMutationTypeFilter: (type: string) => void;
  categories: SparepartCategory[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenMutationDialog: () => void;
}

export default function InventoryFilter({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  stockStatus,
  setStockStatus,
  mutationTypeFilter,
  setMutationTypeFilter,
  categories,
  isLoading,
  onRefresh,
  onOpenMutationDialog,
}: InventoryFilterProps) {
  return (
    <CardBox className="p-4 space-y-4">
      {/* 1. TAB SELECTOR & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* Clean Segmented Control for Tabs */}
        <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "stock"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Ketersediaan Stok
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mutations")}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "mutations"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buku Besar Mutasi
          </button>
        </div>

        {/* Action Button */}
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
            onClick={onOpenMutationDialog}
            className="h-9 px-3.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Catat Mutasi Stok</span>
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
              activeTab === "stock"
                ? "Cari nama sparepart, SKU, atau catatan..."
                : "Cari riwayat mutasi, nama part, SKU, atau alasan..."
            }
            className="pl-9 h-9 text-xs sm:text-sm bg-background"
          />
        </div>

        {/* Dropdowns for Stock Tab */}
        {activeTab === "stock" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kategori */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Filter Status Stok */}
            <select
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as any)}
              className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Status Stok</option>
              <option value="in_stock">Stok Aman (&gt; min)</option>
              <option value="low_stock">Menipis (≤ min)</option>
              <option value="out_of_stock">Stok Habis (0)</option>
            </select>
          </div>
        )}

        {/* Dropdowns for Mutation Tab */}
        {activeTab === "mutations" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tipe Mutasi */}
            <select
              value={mutationTypeFilter}
              onChange={(e) => setMutationTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Jenis Mutasi</option>
              <option value="in">Semua Stok Masuk (+)</option>
              <option value="out">Semua Stok Keluar (-)</option>
              <option value="purchase_in">Pembelian Masuk</option>
              <option value="service_out">Pemasangan Servis (PK)</option>
              <option value="adjustment_in">Penyesuaian Masuk</option>
              <option value="adjustment_out">Penyesuaian Keluar</option>
            </select>
          </div>
        )}
      </div>
    </CardBox>
  );
}

