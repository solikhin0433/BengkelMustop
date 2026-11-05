"use client";

import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCw, Printer } from "lucide-react";

interface ReportsFilterProps {
  preset: string;
  setPreset: (preset: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onPrintReport: () => void;
}

export default function ReportsFilter({
  preset,
  setPreset,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  isLoading,
  onRefresh,
  onPrintReport,
}: ReportsFilterProps) {
  const presets = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "7 Hari Terakhir" },
    { key: "month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
    { key: "custom", label: "Kustom" },
  ];

  return (
    <CardBox className="p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                preset === p.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
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
            onClick={onPrintReport}
            className="h-9 px-3.5 gap-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Rekap Laporan</span>
          </Button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Dari Tanggal:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 text-xs font-mono w-36"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Sampai:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 text-xs font-mono w-36"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={onRefresh}
            className="h-8 text-xs px-3"
          >
            Terapkan Filter
          </Button>
        </div>
      )}
    </CardBox>
  );
}

