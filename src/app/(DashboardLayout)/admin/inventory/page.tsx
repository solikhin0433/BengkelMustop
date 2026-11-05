"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import InventoryKPI from "./list/InventoryKPI";
import InventoryFilter from "./list/InventoryFilter";
import InventoryStockTable from "./list/InventoryStockTable";
import InventoryMutationTable from "./list/InventoryMutationTable";
import StockMutationDialog from "./form/StockMutationDialog";
import { SparepartItem, SparepartCategory, StockMutationItem, InventorySummary } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Stok & Mutasi" },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"stock" | "mutations">("stock");

  // Data states
  const [parts, setParts] = useState<SparepartItem[]>([]);
  const [categories, setCategories] = useState<SparepartCategory[]>([]);
  const [mutations, setMutations] = useState<StockMutationItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalItems: 0,
    totalAssetValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    mutationsTodayCount: 0,
    itemsInToday: 0,
    itemsOutToday: 0,
  });

  const [isLoadingParts, setIsLoadingParts] = useState(true);
  const [isLoadingMutations, setIsLoadingMutations] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [mutationTypeFilter, setMutationTypeFilter] = useState("all");

  // Mutation Dialog
  const [isMutationDialogOpen, setIsMutationDialogOpen] = useState(false);
  const [selectedPartForMutation, setSelectedPartForMutation] = useState<SparepartItem | null>(null);

  // 1. Fetch Parts & Categories
  const fetchParts = useCallback(async () => {
    setIsLoadingParts(true);
    try {
      const [partsRes, catsRes] = await Promise.all([
        fetch("/api/parts", { cache: "no-store" }),
        fetch("/api/parts/categories", { cache: "no-store" }),
      ]);

      const partsJson = await partsRes.json();
      const catsJson = await catsRes.json();

      if (partsRes.ok) setParts(partsJson.data || []);
      if (catsRes.ok) setCategories(catsJson.data || []);
    } catch (err) {
      console.error("Error fetching parts for inventory:", err);
    } finally {
      setIsLoadingParts(false);
    }
  }, []);

  // 2. Fetch Mutations
  const fetchMutations = useCallback(async () => {
    setIsLoadingMutations(true);
    try {
      const res = await fetch("/api/inventory/mutations?limit=100", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) setMutations(json.data || []);
    } catch (err) {
      console.error("Error fetching mutations:", err);
    } finally {
      setIsLoadingMutations(false);
    }
  }, []);

  // 3. Fetch KPI Summary
  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    try {
      const res = await fetch("/api/inventory/summary", { cache: "no-store" });
      const json = await res.json();
      if (res.ok && json.data) setSummary(json.data);
    } catch (err) {
      console.error("Error fetching inventory summary:", err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchParts();
    fetchMutations();
    fetchSummary();
  }, [fetchParts, fetchMutations, fetchSummary]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Client-side filtering for Stock Table
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (part.name || "").toLowerCase().includes(q) ||
        (part.sku || "").toLowerCase().includes(q) ||
        (part.notes || "").toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === "all" || part.category_id === selectedCategory;

      let matchStock = true;
      const stock = Number(part.stock_quantity) || 0;
      const minStock = Number(part.stock_minimum) || 0;

      if (stockStatus === "out_of_stock") {
        matchStock = stock <= 0;
      } else if (stockStatus === "low_stock") {
        matchStock = stock > 0 && stock <= minStock;
      } else if (stockStatus === "in_stock") {
        matchStock = stock > minStock;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [parts, searchTerm, selectedCategory, stockStatus]);

  // Client-side filtering for Mutations Table
  const filteredMutations = useMemo(() => {
    return mutations.filter((m) => {
      const q = searchTerm.toLowerCase();
      const partName = (m.part?.name || "").toLowerCase();
      const partSku = (m.part?.sku || "").toLowerCase();
      const reason = (m.reason || "").toLowerCase();

      const matchSearch =
        partName.includes(q) || partSku.includes(q) || reason.includes(q);

      let matchType = true;
      if (mutationTypeFilter === "in") {
        matchType = ["purchase_in", "adjustment_in", "return_in", "reversal_in"].includes(m.movement_type);
      } else if (mutationTypeFilter === "out") {
        matchType = ["service_out", "adjustment_out", "reversal_out"].includes(m.movement_type);
      } else if (mutationTypeFilter !== "all") {
        matchType = m.movement_type === mutationTypeFilter;
      }

      return matchSearch && matchType;
    });
  }, [mutations, searchTerm, mutationTypeFilter]);

  const handleMutatePart = (part: SparepartItem) => {
    setSelectedPartForMutation(part);
    setIsMutationDialogOpen(true);
  };

  const handleOpenGeneralMutation = () => {
    setSelectedPartForMutation(null);
    setIsMutationDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <BreadcrumbComp title="Stok & Mutasi Suku Cadang" items={BCrumb} />

      {/* KPI STATS */}
      <InventoryKPI
        totalItems={summary.totalItems}
        totalAssetValue={summary.totalAssetValue}
        lowStockCount={summary.lowStockCount}
        outOfStockCount={summary.outOfStockCount}
        mutationsTodayCount={summary.mutationsTodayCount}
        itemsInToday={summary.itemsInToday}
        itemsOutToday={summary.itemsOutToday}
        isLoading={isLoadingSummary}
      />

      {/* FILTER & TABS */}
      <InventoryFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        stockStatus={stockStatus}
        setStockStatus={setStockStatus}
        mutationTypeFilter={mutationTypeFilter}
        setMutationTypeFilter={setMutationTypeFilter}
        categories={categories}
        isLoading={isLoadingParts || isLoadingMutations}
        onRefresh={refreshAll}
        onOpenMutationDialog={handleOpenGeneralMutation}
      />

      {/* TAB CONTENT: STOCK AVAILABILITY TABLE */}
      {activeTab === "stock" && (
        <InventoryStockTable
          parts={filteredParts}
          allCount={parts.length}
          isLoading={isLoadingParts}
          onMutatePart={handleMutatePart}
        />
      )}

      {/* TAB CONTENT: MUTATION LEDGER TABLE */}
      {activeTab === "mutations" && (
        <InventoryMutationTable
          mutations={filteredMutations}
          allCount={mutations.length}
          isLoading={isLoadingMutations}
        />
      )}

      {/* MUTATION DIALOG FORM */}
      <StockMutationDialog
        open={isMutationDialogOpen}
        onOpenChange={setIsMutationDialogOpen}
        parts={parts}
        selectedPart={selectedPartForMutation}
        onSuccess={refreshAll}
      />
    </div>
  );
}
