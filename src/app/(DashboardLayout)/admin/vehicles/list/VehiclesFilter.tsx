"use client";

import React from "react";
import { Search, RefreshCw, Plus } from "lucide-react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VehiclesFilterProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  brandFilter: string;
  onBrandFilterChange: (val: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onOpenCreate: () => void;
}

export default function VehiclesFilter({
  searchTerm,
  onSearchChange,
  brandFilter,
  onBrandFilterChange,
  onRefresh,
  isLoading,
  onOpenCreate,
}: VehiclesFilterProps) {
  return (
    <CardBox className="p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari plat nomor, model motor, atau pemilik..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-10 text-xs sm:text-sm"
            />
          </div>

          <select
            value={brandFilter}
            onChange={(e) => onBrandFilterChange(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Merek Motor</option>
            <option value="Honda">Honda</option>
            <option value="Yamaha">Yamaha</option>
            <option value="Suzuki">Suzuki</option>
            <option value="Kawasaki">Kawasaki</option>
            <option value="Vespa">Vespa</option>
            <option value="Lainnya">Merek Lainnya</option>
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
            <span>Tambah Kendaraan</span>
          </Button>
        </div>
      </div>
    </CardBox>
  );
}

