"use client";

import React, { useState, useEffect, useMemo } from "react";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import ServicesKPI from "./list/ServicesKPI";
import ServicesFilter from "./list/ServicesFilter";
import ServicesTable from "./list/ServicesTable";
import ServiceFormDialog from "./form/ServiceFormDialog";
import ServiceDeleteDialog from "./form/ServiceDeleteDialog";
import { ServiceItem } from "@/types/master";

const BCrumb = [
  { to: "/admin", title: "Dashboard" },
  { title: "Jasa & Tarif Servis" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Dialog State: Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Dialog State: Delete Confirmation
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // Fetch Services from API
  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/services", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setServices(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered Services
  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchSearch =
        (srv.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (srv.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (srv.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && srv.is_active) ||
        (filterStatus === "inactive" && !srv.is_active);

      return matchSearch && matchStatus;
    });
  }, [services, searchTerm, filterStatus]);

  // KPI Calculations
  const totalCount = services.length;
  const activeCount = services.filter((s) => s.is_active).length;
  const publicCount = services.filter((s) => s.is_public && s.is_active).length;
  const avgPrice =
    totalCount > 0
      ? Math.round(services.reduce((acc, s) => acc + (s.default_price || 0), 0) / totalCount)
      : 0;

  // Handlers
  const handleOpenCreate = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (service: ServiceItem) => {
    setServiceToDelete(service);
    setIsDeleteOpen(true);
  };

  return (
    <>
      <BreadcrumbComp title="Master Jasa & Tarif Servis" items={BCrumb} />

      <div className="space-y-6">
        {/* LIST: KPI METRICS */}
        <ServicesKPI
          totalCount={totalCount}
          activeCount={activeCount}
          avgPrice={avgPrice}
          publicCount={publicCount}
        />

        {/* LIST: SEARCH & FILTER BAR */}
        <ServicesFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          onRefresh={fetchServices}
          isLoading={isLoading}
          onOpenCreate={handleOpenCreate}
        />

        {/* LIST: DATA TABLE */}
        <ServicesTable
          services={filteredServices}
          allCount={totalCount}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onOpenCreate={handleOpenCreate}
        />
      </div>

      {/* FORM: CREATE / EDIT MODAL */}
      <ServiceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingService={editingService}
        defaultSortOrder={totalCount + 1}
        onSaveSuccess={fetchServices}
      />

      {/* FORM: DELETE CONFIRMATION MODAL */}
      <ServiceDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        service={serviceToDelete}
        onDeleteSuccess={fetchServices}
      />
    </>
  );
}
