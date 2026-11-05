"use client";

import React, { useState, useEffect, useMemo } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import VehiclesKPI from "./list/VehiclesKPI";
import VehiclesFilter from "./list/VehiclesFilter";
import VehiclesTable from "./list/VehiclesTable";
import VehicleFormDialog from "./form/VehicleFormDialog";
import VehicleDetailDialog from "./form/VehicleDetailDialog";
import VehicleDeleteDialog from "./form/VehicleDeleteDialog";
import { VehicleItem } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Kendaraan Motor" },
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleItem | null>(null);

  // Fetch vehicles
  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vehicles", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setVehicles(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const term = searchTerm.toLowerCase().trim();
      const termNorm = term.replace(/\s+/g, "");

      const matchSearch =
        !term ||
        (v.plate_number || "").toLowerCase().includes(term) ||
        (v.plate_number_normalized || "").toLowerCase().includes(termNorm) ||
        (v.model || "").toLowerCase().includes(term) ||
        (v.brand || "").toLowerCase().includes(term) ||
        (v.customer?.name || "").toLowerCase().includes(term) ||
        (v.customer?.phone || "").includes(term);

      const matchBrand =
        brandFilter === "all" ||
        (v.brand || "").toLowerCase() === brandFilter.toLowerCase();

      return matchSearch && matchBrand;
    });
  }, [vehicles, searchTerm, brandFilter]);

  // KPI Calculations
  const totalVehicles = vehicles.length;

  const topBrand = useMemo(() => {
    if (vehicles.length === 0) return "Belum Ada";
    const brandCounts: Record<string, number> = {};
    vehicles.forEach((v) => {
      const b = v.brand || "Lainnya";
      brandCounts[b] = (brandCounts[b] || 0) + 1;
    });
    const sorted = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]} unit)` : "Honda";
  }, [vehicles]);

  const totalServices = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (v.total_services || 0), 0);
  }, [vehicles]);

  const activeCount = useMemo(() => {
    return vehicles.filter((v) => (v.total_services || 0) > 0).length;
  }, [vehicles]);

  // Action handlers
  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (vehicle: VehicleItem) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (vehicle: VehicleItem) => {
    setDetailVehicleId(vehicle.id);
    setIsDetailOpen(true);
  };

  const handleOpenDelete = (vehicle: VehicleItem) => {
    setVehicleToDelete(vehicle);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <BreadcrumbComp title="Data Kendaraan Motor" items={BCrumb} />

      <div className="space-y-6">
        {/* KPI CARDS */}
        <VehiclesKPI
          totalVehicles={totalVehicles}
          topBrand={topBrand}
          totalServices={totalServices}
          activeCount={activeCount}
        />

        {/* SEARCH & FILTERS */}
        <VehiclesFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          brandFilter={brandFilter}
          onBrandFilterChange={setBrandFilter}
          onRefresh={fetchVehicles}
          isLoading={isLoading}
          onOpenCreate={handleOpenCreate}
        />

        {/* DATA TABLE */}
        <VehiclesTable
          vehicles={filteredVehicles}
          allCount={totalVehicles}
          isLoading={isLoading}
          onViewDetail={handleOpenDetail}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      </div>

      {/* CREATE & EDIT MODAL */}
      <VehicleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingVehicle={editingVehicle}
        onSaveSuccess={fetchVehicles}
      />

      {/* DETAIL & HISTORY MODAL */}
      <VehicleDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        vehicleId={detailVehicleId}
        onEditRequest={(v) => {
          setIsDetailOpen(false);
          handleOpenEdit(v);
        }}
      />

      {/* DELETE MODAL */}
      <VehicleDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        vehicle={vehicleToDelete}
        onDeleteSuccess={fetchVehicles}
      />
    </>
  );
}
