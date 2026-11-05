"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCw, Plus, FolderPlus } from "lucide-react";
import { ExpenseCategory } from "@/types/master";

interface ExpensesFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  categories: ExpenseCategory[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenExpenseDialog: () => void;
  onOpenCategoryDialog: () => void;
}

export default function ExpensesFilter({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  isLoading,
  onRefresh,
  onOpenExpenseDialog,
  onOpenCategoryDialog,
}: ExpensesFilterProps) {
  return (
    <CardBox className="p-4 space-y-3">
      {/* 1. PRIMARY ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
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
            variant="outline"
            size="sm"
            onClick={onOpenCategoryDialog}
            className="h-9 px-3 gap-1.5 text-xs font-medium"
          >
            <FolderPlus className="w-3.5 h-3.5 text-muted-foreground" />
            <span>+ Kategori Biaya</span>
          </Button>
        </div>

        <Button
          type="button"
          onClick={onOpenExpenseDialog}
          className="h-9 px-3.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Pengeluaran Baru</span>
        </Button>
      </div>

      {/* 2. SEARCH & CATEGORY FILTER */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari deskripsi pengeluaran atau kategori..."
            className="pl-9 h-9 text-xs sm:text-sm bg-background"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">Semua Kategori Biaya</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </CardBox>
  );
}

