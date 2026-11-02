"use client";

import React, { useState, useEffect, useMemo } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import PartsKPI from "./list/PartsKPI";
import PartsFilter from "./list/PartsFilter";
import PartsTable from "./list/PartsTable";
import PartFormDialog from "./form/PartFormDialog";
import PartCategoryDialog from "./form/PartCategoryDialog";
import PartStockAdjustDialog from "./form/PartStockAdjustDialog";
import PartDeleteDialog from "./form/PartDeleteDialog";
import { SparepartItem, SparepartCategory } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Sparepart & Suku Cadang" },
];

export default function PartsPage() {
  const [parts, setParts] = useState<SparepartItem[]>([]);
  const [categories, setCategories] = useState<SparepartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");

  // Form Dialog: Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparepartItem | null>(null);

  // Category Dialog
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // Stock Adjust Dialog
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [partToAdjust, setPartToAdjust] = useState<SparepartItem | null>(null);

  // Delete Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<SparepartItem | null>(null);

  // Fetch Parts & Categories
  const fetchParts = async () => {
    setIsLoading(true);
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
      console.error("Error fetching parts data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchSearch =
        (part.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.notes || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategory === "all" || part.category_id === selectedCategory;

      let matchStock = true;
      const stock = Number(part.stock_quantity) || 0;
      const minStock = Number(part.stock_minimum) || 0;

      if (stockFilter === "out_of_stock") {
        matchStock = stock <= 0;
      } else if (stockFilter === "low_stock") {
        matchStock = stock > 0 && stock <= minStock;
      } else if (stockFilter === "in_stock") {
        matchStock = stock > minStock;
      }

      return matchSearch && matchCategory && matchStock;
    });
  }, [parts, searchTerm, selectedCategory, stockFilter]);

  // KPI Calculations
  const totalItemCount = parts.length;
  const criticalCount = parts.filter(
    (p) => Number(p.stock_quantity) <= Number(p.stock_minimum)
  ).length;

  const totalCostValue = parts.reduce(
    (sum, p) => sum + (Number(p.stock_quantity) || 0) * (Number(p.average_cost) || 0),
    0
  );

  const totalSellingValue = parts.reduce(
    (sum, p) => sum + (Number(p.stock_quantity) || 0) * (Number(p.selling_price) || 0),
    0
  );

  // Handlers
  const handleOpenCreate = () => {
    setEditingPart(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (part: SparepartItem) => {
    setEditingPart(part);
    setIsFormOpen(true);
  };

  const handleOpenAdjust = (part: SparepartItem) => {
    setPartToAdjust(part);
    setIsAdjustOpen(true);
  };

  const handleOpenDelete = (part: SparepartItem) => {
    setPartToDelete(part);
    setIsDeleteOpen(true);
  };

  const handleCategoryCreated = (newCategory: SparepartCategory) => {
    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <>
      <BreadcrumbComp title="Master Sparepart & Suku Cadang" items={BCrumb} />

      <div className="space-y-6">
        {/* LIST: KPI METRICS */}
        <PartsKPI
          totalItemCount={totalItemCount}
          criticalCount={criticalCount}
          totalCostValue={totalCostValue}
          totalSellingValue={totalSellingValue}
        />

        {/* LIST: FILTERS & SEARCH */}
        <PartsFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          onRefresh={fetchParts}
          isLoading={isLoading}
          onOpenCreate={handleOpenCreate}
        />

        {/* LIST: DATA TABLE */}
        <PartsTable
          parts={filteredParts}
          allCount={totalItemCount}
          isLoading={isLoading}
          onAdjustStock={handleOpenAdjust}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onOpenCreate={handleOpenCreate}
        />
      </div>

      {/* FORM: CREATE / EDIT SPAREPART MODAL */}
      <PartFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingPart={editingPart}
        categories={categories}
        onOpenCategoryCreator={() => setIsCategoryOpen(true)}
        onSaveSuccess={fetchParts}
      />

      {/* FORM: QUICK CATEGORY CREATOR MODAL */}
      <PartCategoryDialog
        open={isCategoryOpen}
        onOpenChange={setIsCategoryOpen}
        onCategoryCreated={handleCategoryCreated}
      />

      {/* FORM: QUICK STOCK ADJUSTMENT MODAL */}
      <PartStockAdjustDialog
        open={isAdjustOpen}
        onOpenChange={setIsAdjustOpen}
        part={partToAdjust}
        onAdjustSuccess={fetchParts}
      />

      {/* FORM: DELETE CONFIRMATION MODAL */}
      <PartDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        part={partToDelete}
        onDeleteSuccess={fetchParts}
      />
    </>
  );
}
